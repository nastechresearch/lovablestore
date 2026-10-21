"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { normalizeSaPhone, validateEmail } from "@/lib/validation";
import { text, type FormState } from "@/lib/form";
import { requireAdmin } from "@/lib/admin-auth";

const GARMENTS = ["Tee", "Hoodie", "Shirt", "Dress", "Cap", "Tote"];
const PRINT_STYLES = ["None", "Chest print", "Back print", "Embroidery", "All-over print"];
const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

export async function submitCustomRequestAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (text(formData, "website")) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  const ip = await clientIp();
  const limit = rateLimit(`custom-request:${ip}`, 4, 60 * 60_000);
  if (!limit.ok) {
    return { status: "error", message: "Too many requests from this connection. Try again later." };
  }

  const user = await getCurrentUser();
  const name = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : text(formData, "name").slice(0, 60);
  const rawEmail = user?.email ?? text(formData, "email");
  const rawPhone = text(formData, "phone");
  const garment = text(formData, "garment");
  const colour = text(formData, "colour").slice(0, 40);
  const size = text(formData, "size");
  const quantity = Number(text(formData, "quantity"));
  const printStyle = text(formData, "printStyle");
  const monogram = text(formData, "monogram").slice(0, 16);
  const notes = text(formData, "notes").slice(0, 1200);
  const connectionId = text(formData, "connectionId");
  const productId = text(formData, "productId");

  const errors: Record<string, string> = {};
  if (name.length < 2) errors.name = "Add your name.";
  let email = "";
  const emailCheck = await validateEmail(rawEmail);
  if (!emailCheck.ok) {
    errors.email = emailCheck.message ?? "Use a valid email address.";
  } else {
    email = emailCheck.normalized;
  }

  let phone: string | null = null;
  if (rawPhone) {
    phone = normalizeSaPhone(rawPhone);
    if (!phone) errors.phone = "Use a valid South African mobile number.";
  }

  if (!GARMENTS.includes(garment)) errors.garment = "Choose a garment.";
  if (colour.length < 2) errors.colour = "Choose a colour.";
  if (!SIZES.includes(size)) errors.size = "Choose a size.";
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 150) {
    errors.quantity = "Choose between 1 and 150 pieces.";
  }
  if (!PRINT_STYLES.includes(printStyle)) errors.printStyle = "Choose a finish.";
  if (monogram.length > 12) errors.monogram = "Keep the monogram to 12 characters.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", fieldErrors: errors };
  }

  const connection = connectionId
    ? await prisma.supplierConnection.findFirst({
        where: { id: connectionId, enabled: true },
        select: { id: true },
      })
    : null;

  const product = productId
    ? await prisma.product.findUnique({ where: { id: productId }, select: { id: true } })
    : null;

  const ref = `CUS-${randomBytes(4).toString("hex").toUpperCase()}`;
  await prisma.customRequest.create({
    data: {
      ref,
      userId: user?.id ?? null,
      productId: product?.id ?? null,
      connectionId: connection?.id ?? null,
      name,
      email,
      phone,
      garment,
      colour,
      size,
      quantity,
      printStyle,
      monogram: monogram || null,
      notes: notes || null,
      status: "NEW",
    },
  });

  revalidatePath("/admin/studio");
  return {
    status: "success",
    message: `Request ${ref} is with the studio. We'll confirm the maker, fabric and quote by email within one to two business days.`,
  };
}

export async function updateCustomRequestAction(
  id: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const status = text(formData, "status");
  const quoteRaw = text(formData, "quote");
  const quoteNumber = quoteRaw ? Number(quoteRaw.replace(/[^0-9.]/g, "")) : null;
  const quote =
    quoteNumber && Number.isFinite(quoteNumber) ? Math.round(quoteNumber * 100) : null;
  const allowed = ["NEW", "QUOTED", "IN_PRODUCTION", "COMPLETED", "DECLINED"];

  const request = await prisma.customRequest.findUnique({ where: { id } });
  if (!request) return;

  await prisma.customRequest.update({
    where: { id: request.id },
    data: {
      status: allowed.includes(status) ? status : request.status,
      quote: quote ?? request.quote,
    },
  });
  revalidatePath("/admin/studio");
}
