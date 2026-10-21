import type { Order, OrderItem } from "@prisma/client";
import { formatDate, formatZAR } from "@/lib/format";
import { invoiceNumber, vatBreakdown } from "@/lib/invoice";
import type { StoreSettings } from "@/lib/settings";

type InvoiceOrder = Order & { items: OrderItem[] };

export function InvoiceDocument({
  order,
  settings,
}: {
  order: InvoiceOrder;
  settings: StoreSettings;
}) {
  const vat = vatBreakdown(order.total);
  const number = invoiceNumber(order);
  const paid = order.paymentStatus === "paid";

  return (
    <article className="print-sheet mx-auto max-w-3xl border border-line bg-cream p-6 text-ink sm:p-10">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="font-display text-3xl leading-none tracking-[0.01em]">
            LOVABLE<span className="text-oxblood">·</span>STORE
          </p>
          <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-stone">
            Where magic gift starts from
          </p>
          <address className="mt-4 space-y-0.5 text-[10px] not-italic leading-relaxed text-stone">
            <p>{settings.companyAddress}</p>
            <p>{settings.companyEmail} · {settings.companyPhone}</p>
            <p>Reg. {settings.registration} · VAT {settings.vatNumber}</p>
          </address>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-oxblood">
            Tax invoice
          </p>
          <p className="mt-2 font-mono text-[11px] text-ink">{number}</p>
          <dl className="mt-3 space-y-1 text-[10px] text-stone">
            <div className="flex justify-end gap-3">
              <dt>Issued</dt>
              <dd className="text-ink">{formatDate(order.createdAt)}</dd>
            </div>
            <div className="flex justify-end gap-3">
              <dt>Order</dt>
              <dd className="font-mono text-ink">{order.number}</dd>
            </div>
            <div className="flex justify-end gap-3">
              <dt>Payment</dt>
              <dd className={paid ? "text-champagne-dark" : "text-oxblood"}>
                {order.paymentStatus.toUpperCase()}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="grid gap-6 py-6 sm:grid-cols-2">
        <div>
          <p className="text-[9px] uppercase tracking-[0.16em] text-stone">Invoice to</p>
          <address className="mt-2 space-y-0.5 text-[11px] not-italic leading-relaxed">
            <p className="font-medium">{order.firstName} {order.lastName}</p>
            <p>{order.email}</p>
            <p>{order.phone}</p>
            <p>{order.address}</p>
            <p>{order.city}, {order.province}, {order.postalCode}</p>
          </address>
        </div>
        <div className="sm:text-right">
          <p className="text-[9px] uppercase tracking-[0.16em] text-stone">Deliver to</p>
          <address className="mt-2 space-y-0.5 text-[11px] not-italic leading-relaxed">
            <p className="font-medium">{order.firstName} {order.lastName}</p>
            <p>{order.address}</p>
            <p>{order.city}, {order.province}, {order.postalCode}</p>
            {order.notes ? <p className="text-stone">Note: {order.notes}</p> : null}
          </address>
        </div>
      </section>

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-y border-line text-[9px] uppercase tracking-[0.12em] text-stone">
            <th className="py-3 pr-4 font-medium">Description</th>
            <th className="px-3 py-3 text-right font-medium">Qty</th>
            <th className="px-3 py-3 text-right font-medium">Unit</th>
            <th className="py-3 pl-3 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">
          {order.items.map((item) => (
            <tr key={item.id} className="align-top text-[11px]">
              <td className="py-3 pr-4">
                <p className="font-medium">{item.name}</p>
                <p className="mt-0.5 text-[9px] uppercase tracking-[0.1em] text-stone">
                  {item.sku ?? "—"}
                  {item.size ? ` · Size ${item.size}` : ""}
                </p>
              </td>
              <td className="px-3 py-3 text-right tabular-nums">{item.quantity}</td>
              <td className="px-3 py-3 text-right tabular-nums">{formatZAR(item.price)}</td>
              <td className="py-3 pl-3 text-right tabular-nums">
                {formatZAR(item.price * item.quantity)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="mt-6 flex justify-end">
        <dl className="w-full max-w-xs space-y-2 text-[11px]">
          <div className="flex justify-between gap-4">
            <dt className="text-stone">Subtotal (incl. VAT)</dt>
            <dd className="tabular-nums">{formatZAR(order.subtotal)}</dd>
          </div>
          {order.discount > 0 ? (
            <div className="flex justify-between gap-4 text-oxblood">
              <dt>Discount{order.discountCode ? ` (${order.discountCode})` : ""}</dt>
              <dd className="tabular-nums">−{formatZAR(order.discount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-stone">Delivery</dt>
            <dd className="tabular-nums">
              {order.shipping === 0 ? "Complimentary" : formatZAR(order.shipping)}
            </dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-line pt-2 text-[12px] font-medium">
            <dt>Total (incl. VAT)</dt>
            <dd className="tabular-nums">{formatZAR(order.total)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-stone">
            <dt>VAT @ {(vat.rate * 100).toFixed(0)}%</dt>
            <dd className="tabular-nums">{formatZAR(vat.vat)}</dd>
          </div>
          <div className="flex justify-between gap-4 text-stone">
            <dt>Total excluding VAT</dt>
            <dd className="tabular-nums">{formatZAR(vat.totalExcluding)}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-8 grid gap-4 border-t border-line pt-5 text-[10px] leading-relaxed text-stone sm:grid-cols-2">
        <div>
          <p className="text-[9px] uppercase tracking-[0.14em] text-ink">Payment</p>
          <p className="mt-1">
            {order.paymentProvider === "demo"
              ? "Demo checkout — no funds were collected."
              : `PayFast · ${order.paymentRef ?? "reference pending"}`}
          </p>
          <p className="mt-1">Payment status: {order.paymentStatus}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-[0.14em] text-ink">Need help?</p>
          <p className="mt-1">
            {settings.companyEmail} · {settings.supportHours}
          </p>
          <p className="mt-1">Quote your invoice number or order number.</p>
        </div>
      </section>

      {order.giftNote ? (
        <p className="mt-5 border border-champagne/50 bg-champagne/10 p-3 font-display text-base italic leading-snug text-ink-soft">
          Gift note: “{order.giftNote}”
        </p>
      ) : null}

      <footer className="mt-8 flex flex-wrap items-end justify-between gap-3 border-t border-line pt-4 text-[9px] uppercase tracking-[0.12em] text-stone">
        <p>Thank you for shopping Lovable Store.</p>
        <p>Prices in ZAR · VAT included where shown</p>
      </footer>
    </article>
  );
}
