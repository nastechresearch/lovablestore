"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import type { FormState } from "@/lib/form";
import type { Order, OrderItem } from "@prisma/client";

type Action = (previous: FormState, formData: FormData) => Promise<FormState>;
const initial: FormState = { status: "idle", message: "" };

const ORDER_STATUS_OPTIONS = [
  ["PENDING", "Awaiting payment"],
  ["PAID", "Payment received"],
  ["PACKED", "Packed with care"],
  ["SHIPPED", "On its way"],
  ["DELIVERED", "Delivered"],
  ["CANCELLED", "Cancelled"],
];

const PAYMENT_STATUS_OPTIONS = [
  ["unpaid", "Unpaid"],
  ["paid", "Paid"],
  ["refunded", "Refunded"],
  ["failed", "Failed"],
];

const FULFILMENT_OPTIONS = ["PENDING", "ORDERED", "IN_TRANSIT", "RECEIVED", "PACKED", "SHIPPED"];

export function OrderStatusForm({ action, order }: { action: Action; order: Order }) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="label">Order status</span>
          <select name="status" defaultValue={order.status} className="field">
            {ORDER_STATUS_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="label">Payment status</span>
          <select name="paymentStatus" defaultValue={order.paymentStatus} className="field">
            {PAYMENT_STATUS_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <span className="label">Courier</span>
          <input name="courier" defaultValue={order.courier ?? ""} className="field" placeholder="The Courier Guy" />
        </div>
        <div>
          <span className="label">Tracking number</span>
          <input name="trackingNumber" defaultValue={order.trackingNumber ?? ""} className="field" placeholder="TCG123456789" />
        </div>
      </div>

      {state.status !== "idle" ? (
        <p
          className={`text-[11px] ${state.status === "error" ? "text-oxblood" : "text-champagne-dark"}`}
        >
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary min-h-10 px-5 text-[9px] disabled:opacity-60">
        {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : null}
        {pending ? "Saving…" : "Update order"}
      </button>
    </form>
  );
}

export function FulfilmentForm({ action, item }: { action: Action; item: OrderItem }) {
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <div className="min-w-[9rem] flex-1">
        <span className="label">Line status</span>
        <select name="fulfilmentStatus" defaultValue={item.fulfilmentStatus} className="field min-h-9 py-1.5 text-[11px]">
          {FULFILMENT_OPTIONS.map((value) => (
            <option key={value} value={value}>{value.replaceAll("_", " ")}</option>
          ))}
        </select>
      </div>
      <div className="min-w-[10rem] flex-1">
        <span className="label">Supplier order ref</span>
        <input
          name="supplierOrderRef"
          defaultValue={item.supplierOrderRef ?? ""}
          className="field min-h-9 py-1.5 text-[11px]"
          placeholder="CJ / local PO"
        />
      </div>
      <button type="submit" disabled={pending} className="btn-outline min-h-9 px-3 text-[9px] disabled:opacity-60">
        {pending ? "…" : "Save"}
      </button>
      {state.status === "error" ? (
        <p className="w-full text-[10px] text-oxblood">{state.message}</p>
      ) : state.status === "success" ? (
        <p className="w-full text-[10px] text-champagne-dark">{state.message}</p>
      ) : null}
    </form>
  );
}

export function CancelOrderButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Cancel this order? Stock will be returned and any promo use released.")) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="border border-oxblood/40 px-4 py-2 text-[9px] uppercase tracking-[0.14em] text-oxblood transition-colors hover:bg-oxblood hover:text-ivory"
      >
        Cancel order
      </button>
    </form>
  );
}
