"use server";

import { redirect } from "next/navigation";
import {
  createAdminSession,
  destroyAdminSession,
  verifyAdminPassword,
} from "@/lib/admin-auth";
import { clientIp, minutesLabel, rateLimit } from "@/lib/rate-limit";
import type { FormState } from "@/lib/form";
import { text } from "@/lib/form";

export async function loginAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const ip = await clientIp();
  const limit = rateLimit(`admin-login:${ip}`, 8, 15 * 60_000);
  if (!limit.ok) {
    return {
      status: "error",
      message: `Too many attempts. Try again in ${minutesLabel(limit.retryAfterSeconds)}.`,
    };
  }

  const password = text(formData, "password");
  if (!password) {
    return { status: "error", message: "Enter your admin password." };
  }
  if (!verifyAdminPassword(password)) {
    return { status: "error", message: "That password is not correct." };
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}
