import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { validateEmail } from "@/lib/validation";
import { clientIp, rateLimit, minutesLabel } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MESSAGE = 2000;

function clean(value: unknown, max = MAX_MESSAGE): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function serialise(conversation: {
  ref: string;
  subject: string;
  status: string;
  createdAt: Date;
  messages: { id: string; sender: string; body: string; createdAt: Date }[];
}) {
  return {
    ref: conversation.ref,
    subject: conversation.subject,
    status: conversation.status,
    createdAt: conversation.createdAt.toISOString(),
    messages: conversation.messages.map((message) => ({
      id: message.id,
      sender: message.sender,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    })),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref")?.trim();
  if (!ref) {
    return NextResponse.json({ error: "Missing conversation reference." }, { status: 400 });
  }

  const conversation = await prisma.supportConversation.findUnique({
    where: { ref },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 100 } },
  });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  await prisma.supportMessage.updateMany({
    where: { conversationId: conversation.id, sender: "AGENT", readByCustomer: false },
    data: { readByCustomer: true },
  });

  return NextResponse.json({ conversation: serialise(conversation) });
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const action = clean(payload.action, 24);
  const ip = await clientIp();
  const user = await getCurrentUser();

  if (action === "start") {
    const limit = rateLimit(`support-start:${ip}`, 6, 60 * 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: `Too many chats started. Try again in ${minutesLabel(limit.retryAfterSeconds)}.` },
        { status: 429 },
      );
    }

    if (clean(payload.website)) {
      return NextResponse.json({ error: "Something went wrong." }, { status: 400 });
    }

    const name = user ? `${user.firstName} ${user.lastName}`.trim() : clean(payload.name, 60);
    const email = user?.email ?? clean(payload.email, 160).toLowerCase();
    const subject = clean(payload.subject, 80) || "Live chat";
    const body = clean(payload.message);

    if (name.length < 2) {
      return NextResponse.json({ error: "Add your name so we know who we're helping." }, { status: 400 });
    }
    if (!user) {
      const check = await validateEmail(email);
      if (!check.ok) {
        return NextResponse.json(
          { error: check.message ?? "Use a valid email address." },
          { status: 400 },
        );
      }
    }
    if (body.length < 2) {
      return NextResponse.json({ error: "Add a short message." }, { status: 400 });
    }

    if (user) {
      const open = await prisma.supportConversation.findFirst({
        where: { userId: user.id, status: "OPEN" },
        orderBy: { lastMessageAt: "desc" },
      });
      if (open) {
        return NextResponse.json({ conversation: null, ref: open.ref, existing: true });
      }
    }

    const ref = `LS-${randomBytes(4).toString("hex").toUpperCase()}`;
    const conversation = await prisma.supportConversation.create({
      data: {
        ref,
        userId: user?.id ?? null,
        name,
        email,
        subject,
        status: "OPEN",
        messages: {
          create: [
            { sender: "CUSTOMER", body, readByCustomer: true },
            {
              sender: "SYSTEM",
              body: "Thanks for reaching out. A stylist from the Johannesburg studio will reply here during trading hours (Mon–Sat, 09:00–18:00 SAST). You can leave extra details below.",
              readByCustomer: false,
            },
          ],
        },
      },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    return NextResponse.json({ conversation: serialise(conversation) });
  }

  if (action === "message") {
    const ref = clean(payload.ref, 40);
    const body = clean(payload.message);
    if (!ref || body.length < 1) {
      return NextResponse.json({ error: "Write a message first." }, { status: 400 });
    }

    const limit = rateLimit(`support-message:${ip}`, 40, 10 * 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: `Slow down a moment. Try again in ${minutesLabel(limit.retryAfterSeconds)}.` },
        { status: 429 },
      );
    }

    const conversation = await prisma.supportConversation.findUnique({ where: { ref } });
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    await prisma.supportMessage.create({
      data: {
        conversationId: conversation.id,
        sender: "CUSTOMER",
        body,
        readByCustomer: true,
      },
    });
    await prisma.supportConversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date(), status: "OPEN" },
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
