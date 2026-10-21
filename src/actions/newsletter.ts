"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { NewsletterState } from "@/lib/newsletter-types";

export async function subscribeToNewsletter(
  _previous: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
    };
  }

  try {
    await prisma.subscriber.upsert({
      where: { email: parsed.data },
      update: {},
      create: { email: parsed.data },
    });
  } catch {
    return {
      status: "error",
      message: "Something went wrong. Please try again in a moment.",
    };
  }

  return {
    status: "success",
    message: "You're on the list. First looks and thoughtful gift ideas are on the way.",
  };
}
