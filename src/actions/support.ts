"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { text } from "@/lib/form";

export async function replySupportAction(
  conversationId: string,
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const body = text(formData, "body").slice(0, 2000);
  if (body.length < 1) return;

  const conversation = await prisma.supportConversation.findUnique({
    where: { id: conversationId },
  });
  if (!conversation) return;

  await prisma.supportMessage.create({
    data: {
      conversationId: conversation.id,
      sender: "AGENT",
      body,
      readByAgent: true,
    },
  });
  await prisma.supportConversation.update({
    where: { id: conversation.id },
    data: { status: "OPEN", lastMessageAt: new Date() },
  });
  revalidatePath("/admin/support");
}

export async function setSupportStatusAction(
  conversationId: string,
  status: "OPEN" | "CLOSED",
): Promise<void> {
  await requireAdmin();
  await prisma.supportConversation.update({
    where: { id: conversationId },
    data: { status },
  });
  revalidatePath("/admin/support");
}
