"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";
import { validateEmail } from "@/lib/validation";
import { recalculateProductRating } from "@/lib/reviews";
import { text, type FormState } from "@/lib/form";
import { requireAdmin } from "@/lib/admin-auth";

export async function submitReviewAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  if (text(formData, "website")) {
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  const productId = text(formData, "productId");
  const rating = Number(text(formData, "rating"));
  const title = text(formData, "title").slice(0, 120);
  const body = text(formData, "body").slice(0, 1200);

  const errors: Record<string, string> = {};
  if (!productId) errors.rating = "Choose a product to review.";
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = "Choose a rating from 1 to 5 stars.";
  }
  if (title.length < 3) errors.title = "Add a short headline.";
  if (body.length < 12) errors.body = "Tell us a little more (at least 12 characters).";

  const product = productId
    ? await prisma.product.findUnique({ where: { id: productId } })
    : null;
  if (!product) {
    return { status: "error", message: "That piece could not be found." };
  }

  const ip = await clientIp();
  const limit = rateLimit(`review:${ip}`, 6, 60 * 60_000);
  if (!limit.ok) {
    return { status: "error", message: "Too many reviews from this connection. Try again later." };
  }

  const user = await getCurrentUser();
  let name = user ? `${user.firstName} ${user.lastName}`.trim() : text(formData, "name").slice(0, 60);
  let email = user?.email ?? "";
  let verified = false;

  if (!user) {
    if (name.length < 2) errors.name = "Add your name.";
    const check = await validateEmail(text(formData, "email"));
    if (!check.ok) {
      errors.email = check.message ?? "Use a valid email address.";
    } else {
      email = check.normalized;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Fix the highlighted fields.", fieldErrors: errors };
  }

  const purchase = await prisma.orderItem.findFirst({
    where: {
      productId: product.id,
      order: user ? { userId: user.id } : { email },
    },
    select: { id: true },
  });
  verified = Boolean(purchase);

  const duplicate = await prisma.review.findFirst({
    where: {
      productId: product.id,
      email,
      status: { in: ["PENDING", "APPROVED"] },
    },
  });
  if (duplicate) {
    return {
      status: "error",
      message: "You have already reviewed this piece. Thank you for the feedback.",
    };
  }

  const approved = verified;
  await prisma.review.create({
    data: {
      productId: product.id,
      userId: user?.id ?? null,
      name,
      email,
      rating,
      title,
      body,
      verified,
      status: approved ? "APPROVED" : "PENDING",
      approvedAt: approved ? new Date() : null,
    },
  });

  if (approved) {
    await recalculateProductRating(product.id);
  }

  resetRateLimit(`review:${ip}`);
  revalidatePath(`/product/${product.slug}`);
  revalidatePath("/admin/reviews");
  return {
    status: "success",
    message: approved
      ? "Thank you — your verified review is live."
      : "Thank you. Your review is with the studio for a quick check.",
  };
}

export async function setReviewStatusAction(
  id: string,
  status: "APPROVED" | "REJECTED",
): Promise<void> {
  await requireAdmin();
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return;

  await prisma.review.update({
    where: { id },
    data: {
      status,
      approvedAt: status === "APPROVED" ? new Date() : null,
    },
  });
  await recalculateProductRating(review.productId);
  revalidatePath("/admin/reviews");
  revalidatePath("/account");
}

export async function deleteReviewAction(id: string): Promise<void> {
  await requireAdmin();
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) return;
  await prisma.review.delete({ where: { id } });
  await recalculateProductRating(review.productId);
  revalidatePath("/admin/reviews");
}
