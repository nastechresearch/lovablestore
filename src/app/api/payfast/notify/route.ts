import { prisma } from "@/lib/prisma";
import { verifyPayfastSignature } from "@/lib/payfast";

export async function POST(request: Request) {
  let fields: Record<string, string> = {};
  try {
    const form = await request.formData();
    fields = Object.fromEntries(
      [...form.entries()].map(([key, value]) => [key, String(value)]),
    );
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  if (!verifyPayfastSignature(fields)) {
    return new Response("Invalid signature", { status: 400 });
  }

  if (
    process.env.PAYFAST_MERCHANT_ID &&
    fields.merchant_id !== process.env.PAYFAST_MERCHANT_ID
  ) {
    return new Response("Unknown merchant", { status: 400 });
  }

  if (fields.payment_status !== "COMPLETE") {
    return new Response("Ignored", { status: 200 });
  }

  const order = await prisma.order.findUnique({
    where: { number: fields.m_payment_id || "" },
  });
  if (!order) {
    return new Response("Unknown order", { status: 404 });
  }

  const amount = Number(fields.amount_gross);
  if (!Number.isFinite(amount) || Math.round(amount * 100) !== order.total) {
    return new Response("Amount mismatch", { status: 400 });
  }

  if (order.paymentStatus !== "paid") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paymentStatus: "paid",
        paymentProvider: "payfast",
        paymentRef: fields.pf_payment_id || order.paymentRef,
      },
    });
  }

  return new Response("OK", { status: 200 });
}
