import { createHash } from "crypto";
import type { Order, OrderItem } from "@prisma/client";
import { STORE_URL } from "@/lib/constants";

export type PayfastFieldMap = Record<string, string>;

export function isPayfastConfigured(): boolean {
  return Boolean(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_MERCHANT_KEY);
}

export function isDemoCheckout(): boolean {
  return !isPayfastConfigured();
}

export function payfastProcessUrl(): string {
  return process.env.PAYFAST_SANDBOX === "false"
    ? "https://www.payfast.co.za/eng/process"
    : "https://sandbox.payfast.co.za/eng/process";
}

function encodeValue(value: string): string {
  return encodeURIComponent(value.trim()).replace(/%20/g, "+");
}

export function signPayfastFields(fields: PayfastFieldMap): string {
  const passphrase = process.env.PAYFAST_PASSPHRASE || "";
  const pairs = Object.entries(fields)
    .filter(([key, value]) => key !== "signature" && value !== undefined && value !== null && String(value).trim() !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${encodeValue(String(value))}`);

  if (passphrase) {
    pairs.push(`passphrase=${encodeValue(passphrase)}`);
  }

  return createHash("md5").update(pairs.join("&")).digest("hex");
}

export function verifyPayfastSignature(fields: PayfastFieldMap): boolean {
  if (!fields.signature) return false;
  return signPayfastFields(fields) === fields.signature;
}

export function buildPayfastFields(order: Order, items: OrderItem[]): PayfastFieldMap {
  const fields: PayfastFieldMap = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID || "",
    merchant_key: process.env.PAYFAST_MERCHANT_KEY || "",
    return_url: `${STORE_URL}/order/${order.number}?email=${encodeURIComponent(order.email)}&new=1`,
    cancel_url: `${STORE_URL}/checkout?cancelled=1`,
    notify_url: `${STORE_URL}/api/payfast/notify`,
    name_first: order.firstName,
    name_last: order.lastName,
    email_address: order.email,
    m_payment_id: order.number,
    amount: (order.total / 100).toFixed(2),
    item_name: `Lovable Store ${order.number}`,
    item_description: items.map((item) => `${item.quantity} × ${item.name}`).join(", ").slice(0, 255),
    custom_str1: order.number,
  };

  fields.signature = signPayfastFields(fields);
  return fields;
}
