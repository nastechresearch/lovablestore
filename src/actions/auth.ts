"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  createUserSession,
  destroyCurrentSession,
  getCurrentSession,
  getCurrentUser,
  hashPassword,
  requireUser,
  safeNextPath,
  verifyPassword,
} from "@/lib/auth";
import { clientIp, minutesLabel, rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { generateAccountId } from "@/lib/ids";
import { PROVINCES } from "@/lib/constants";
import { normalizeSaPhone, passwordStrength, validateEmail } from "@/lib/validation";
import { text, type FormState } from "@/lib/form";

async function requestMeta() {
  const store = await headers();
  return {
    ip: await clientIp(),
    userAgent: store.get("user-agent"),
  };
}

export async function registerAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const { ip, userAgent } = await requestMeta();
  const limit = rateLimit(`register:${ip}`, 5, 15 * 60_000);
  if (!limit.ok) {
    return {
      status: "error",
      message: `Too many accounts from this connection. Try again in ${minutesLabel(limit.retryAfterSeconds)}.`,
    };
  }

  if (text(formData, "website")) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  const firstName = text(formData, "firstName").slice(0, 60);
  const lastName = text(formData, "lastName").slice(0, 60);
  const rawEmail = text(formData, "email");
  const rawPhone = text(formData, "phone");
  const password = text(formData, "password");
  const confirm = text(formData, "confirmPassword");
  const terms = text(formData, "terms");
  const newsletter = text(formData, "newsletter");

  const errors: Record<string, string> = {};
  if (firstName.length < 2) errors.firstName = "Enter your first name.";
  if (lastName.length < 2) errors.lastName = "Enter your last name.";

  const email = await validateEmail(rawEmail);
  if (!email.ok && email.message) errors.email = email.message;

  let phone: string | null = null;
  if (rawPhone) {
    phone = normalizeSaPhone(rawPhone);
    if (!phone) errors.phone = "Use a valid South African mobile number (e.g. 082 123 4567).";
  }

  const strength = passwordStrength(password, [
    firstName,
    lastName,
    rawEmail.split("@")[0] ?? "",
  ]);
  if (strength.score < 3) {
    errors.password = strength.issues[0] ?? "Choose a stronger password.";
  }
  if (password !== confirm) errors.confirmPassword = "The passwords do not match.";
  if (!terms) errors.terms = "Please accept the terms and privacy policy.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", fieldErrors: errors };
  }

  const existing = await prisma.user.findUnique({ where: { email: email.normalized } });
  if (existing) {
    return {
      status: "error",
      message: "An account with that email already exists. Sign in instead.",
      fieldErrors: { email: "This email is already registered." },
    };
  }

  const user = await prisma.user.create({
    data: {
      accountId: generateAccountId(),
      email: email.normalized,
      passwordHash: await hashPassword(password),
      firstName,
      lastName,
      phone,
      lastLoginAt: new Date(),
    },
  });

  if (newsletter === "on") {
    await prisma.subscriber
      .upsert({
        where: { email: email.normalized },
        update: {},
        create: { email: email.normalized },
      })
      .catch(() => undefined);
  }

  await createUserSession(user.id, { ip, userAgent });
  redirect("/account?welcome=1");
}

export async function loginAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const { ip, userAgent } = await requestMeta();
  const email = await validateEmail(text(formData, "email"));
  const password = text(formData, "password");
  const next = safeNextPath(text(formData, "next"));

  const byIp = rateLimit(`login-ip:${ip}`, 12, 15 * 60_000);
  if (!byIp.ok) {
    return {
      status: "error",
      message: `Too many sign-in attempts. Try again in ${minutesLabel(byIp.retryAfterSeconds)}.`,
    };
  }

  if (!email.ok) {
    return {
      status: "error",
      message: "Email or password is incorrect.",
      fieldErrors: { email: "Enter the email on your account." },
    };
  }

  const byEmail = rateLimit(`login-email:${email.normalized}`, 8, 15 * 60_000);
  if (!byEmail.ok) {
    return {
      status: "error",
      message: `Too many attempts for this account. Try again in ${minutesLabel(byEmail.retryAfterSeconds)}.`,
    };
  }

  const user = await prisma.user.findUnique({ where: { email: email.normalized } });
  if (!user) {
    return {
      status: "error",
      message: "Email or password is incorrect.",
      fieldErrors: { password: "Check your email and password." },
    };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return {
      status: "error",
      message: "This account is temporarily locked after several failed attempts. Try again shortly.",
    };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    const attempts = user.failedLoginAttempts + 1;
    const lock = attempts >= 5 ? new Date(Date.now() + 15 * 60_000) : null;
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: lock ? 0 : attempts,
        lockedUntil: lock,
      },
    });
    return {
      status: "error",
      message: lock
        ? "Too many failed attempts. This account is locked for 15 minutes."
        : "Email or password is incorrect.",
      fieldErrors: { password: "Check your email and password." },
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
    },
  });
  resetRateLimit(`login-email:${email.normalized}`);
  await createUserSession(user.id, { ip, userAgent });
  redirect(next === "/account" ? "/account?signedin=1" : next);
}

export async function logoutAction(): Promise<void> {
  await destroyCurrentSession();
  redirect("/");
}

export async function updateProfileAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/account");
  const firstName = text(formData, "firstName").slice(0, 60);
  const lastName = text(formData, "lastName").slice(0, 60);
  const rawPhone = text(formData, "phone");
  const errors: Record<string, string> = {};

  if (firstName.length < 2) errors.firstName = "Enter your first name.";
  if (lastName.length < 2) errors.lastName = "Enter your last name.";
  let phone: string | null = null;
  if (rawPhone) {
    phone = normalizeSaPhone(rawPhone);
    if (!phone) errors.phone = "Use a valid South African mobile number.";
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", fieldErrors: errors };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { firstName, lastName, phone },
  });
  revalidatePath("/account");
  return { status: "success", message: "Profile updated." };
}

export async function updateAccountSettingsAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/account/settings");
  const firstName = text(formData, "firstName").slice(0, 60);
  const lastName = text(formData, "lastName").slice(0, 60);
  const rawPhone = text(formData, "phone");
  const defaultAddress = text(formData, "defaultAddress").slice(0, 200);
  const defaultCity = text(formData, "defaultCity").slice(0, 80);
  const defaultProvince = text(formData, "defaultProvince");
  const defaultPostalCode = text(formData, "defaultPostalCode");

  const errors: Record<string, string> = {};
  if (firstName.length < 2) errors.firstName = "Enter your first name.";
  if (lastName.length < 2) errors.lastName = "Enter your last name.";

  let phone: string | null = null;
  if (rawPhone) {
    phone = normalizeSaPhone(rawPhone);
    if (!phone) errors.phone = "Use a valid South African mobile number.";
  }

  const hasAddress = Boolean(defaultAddress || defaultCity || defaultProvince || defaultPostalCode);
  if (hasAddress) {
    if (defaultAddress.length < 6) errors.defaultAddress = "Enter your street address.";
    if (defaultCity.length < 2) errors.defaultCity = "Enter your city or suburb.";
    if (!PROVINCES.includes(defaultProvince as (typeof PROVINCES)[number])) {
      errors.defaultProvince = "Choose your province.";
    }
    if (!/^\d{4}$/.test(defaultPostalCode)) {
      errors.defaultPostalCode = "South African postal codes have four digits.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", fieldErrors: errors };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName,
      lastName,
      phone,
      defaultAddress: hasAddress ? defaultAddress : null,
      defaultCity: hasAddress ? defaultCity : null,
      defaultProvince: hasAddress ? defaultProvince : null,
      defaultPostalCode: hasAddress ? defaultPostalCode : null,
      marketingEmail: formData.get("marketingEmail") === "on",
      marketingWhatsapp: formData.get("marketingWhatsapp") === "on",
    },
  });
  revalidatePath("/account");
  revalidatePath("/account/settings");
  return { status: "success", message: "Account settings updated." };
}

export async function changePasswordAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser("/account/security");
  const current = text(formData, "currentPassword");
  const next = text(formData, "newPassword");
  const confirm = text(formData, "confirmPassword");

  const valid = await verifyPassword(current, user.passwordHash);
  if (!valid) {
    return {
      status: "error",
      message: "Your current password is incorrect.",
      fieldErrors: { currentPassword: "Check your current password." },
    };
  }

  const strength = passwordStrength(next, [user.firstName, user.lastName, user.email]);
  if (strength.score < 3) {
    return {
      status: "error",
      message: "Choose a stronger password.",
      fieldErrors: { newPassword: strength.issues[0] ?? "Choose a stronger password." },
    };
  }
  if (next !== confirm) {
    return {
      status: "error",
      message: "The new passwords do not match.",
      fieldErrors: { confirmPassword: "The passwords do not match." },
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next) },
  });

  const session = await getCurrentSession();
  if (session) {
    await prisma.session.deleteMany({
      where: { userId: user.id, id: { not: session.id } },
    });
  }
  return { status: "success", message: "Password changed. Other devices have been signed out." };
}

export async function revokeSessionAction(id: string): Promise<void> {  const user = await requireUser("/account/security");
  const session = await getCurrentSession();
  const target = await prisma.session.findFirst({
    where: { id, userId: user.id },
  });
  if (!target) return;
  await prisma.session.delete({ where: { id: target.id } });
  if (session?.id === target.id) {
    redirect("/account/login");
  }
  revalidatePath("/account/security");
}

export async function deletePasskeyAction(id: string): Promise<void> {
  const user = await requireUser("/account/security");
  await prisma.passkey.deleteMany({ where: { id, userId: user.id } });
  revalidatePath("/account/security");
}

export async function toggleWishlistAccountAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "error", message: "Sign in to save pieces to your account." };
  }
  const productId = text(formData, "productId");
  if (!productId) return { status: "error", message: "Choose a piece first." };
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    await prisma.wishlistItem.create({ data: { userId: user.id, productId } });
  }
  revalidatePath("/account");
  return { status: "success", message: existing ? "Removed from your wishlist." : "Saved to your wishlist." };
}
