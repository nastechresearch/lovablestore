import type { Order, OrderItem } from "@prisma/client";
import { formatDate } from "@/lib/format";
import type { StoreSettings } from "@/lib/settings";
import { Barcode } from "@/components/shipping/barcode";

type PackingOrder = Order & { items: OrderItem[] };

export function PackingSlip({
  order,
  settings,
}: {
  order: PackingOrder;
  settings: StoreSettings;
}) {
  const pieces = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <article className="print-sheet mx-auto max-w-3xl border border-line bg-cream p-6 text-ink sm:p-10">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-6">
        <div>
          <p className="font-display text-3xl leading-none tracking-[0.01em]">
            LOVABLE<span className="text-oxblood">·</span>STORE
          </p>
          <p className="mt-2 text-[9px] uppercase tracking-[0.18em] text-stone">
            Packing slip · Not a tax invoice
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-oxblood">
            {order.number}
          </p>
          <dl className="mt-2 space-y-1 text-[10px] text-stone">
            <div className="flex justify-end gap-3">
              <dt>Placed</dt>
              <dd className="text-ink">{formatDate(order.createdAt)}</dd>
            </div>
            <div className="flex justify-end gap-3">
              <dt>Pieces</dt>
              <dd className="text-ink">{pieces}</dd>
            </div>
            <div className="flex justify-end gap-3">
              <dt>Status</dt>
              <dd className="text-ink">{order.status}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="grid gap-6 py-6 sm:grid-cols-2">
        <div>
          <p className="text-[9px] uppercase tracking-[0.16em] text-stone">Ship to</p>
          <address className="mt-2 space-y-0.5 text-[11px] not-italic leading-relaxed">
            <p className="text-[12px] font-medium">{order.firstName} {order.lastName}</p>
            <p>{order.address}</p>
            <p>{order.city}, {order.province}, {order.postalCode}</p>
            <p>{order.phone}</p>
            <p>{order.email}</p>
          </address>
        </div>
        <div className="sm:text-right">
          <p className="text-[9px] uppercase tracking-[0.16em] text-stone">From</p>
          <address className="mt-2 space-y-0.5 text-[11px] not-italic leading-relaxed">
            <p className="font-medium">Lovable Store Fulfilment</p>
            <p>{settings.companyAddress}</p>
            <p>{settings.companyPhone}</p>
          </address>
        </div>
      </section>

      <Barcode value={order.number} height={38} className="border-y border-line py-3 text-ink" showValue={false} />

      <table className="mt-6 w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line text-[9px] uppercase tracking-[0.12em] text-stone">
            <th className="w-8 py-2 font-medium">✓</th>
            <th className="py-2 pr-3 font-medium">Item</th>
            <th className="px-3 py-2 text-center font-medium">Size</th>
            <th className="px-3 py-2 text-center font-medium">Qty</th>
            <th className="py-2 pl-3 text-right font-medium">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/70">
          {order.items.map((item) => (
            <tr key={item.id} className="align-top text-[11px]">
              <td className="py-3">
                <span className="inline-block size-3.5 border border-ink/50" aria-hidden />
              </td>
              <td className="py-3 pr-3">
                <p className="font-medium">{item.name}</p>
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.08em] text-stone">
                  {item.sku ?? "—"}
                </p>
              </td>
              <td className="px-3 py-3 text-center">{item.size || "—"}</td>
              <td className="px-3 py-3 text-center font-medium tabular-nums">{item.quantity}</td>
              <td className="py-3 pl-3 text-right text-[10px] text-stone">
                {item.supplierName ?? "Studio stock"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {order.giftNote ? (
        <p className="mt-6 border border-champagne/60 bg-champagne/10 p-3 font-display text-base italic leading-snug text-ink-soft">
          Gift note to include: “{order.giftNote}”
        </p>
      ) : (
        <p className="mt-6 text-[10px] text-stone">
          No gift note on this order — wrap in house tissue and seal with the BM monogram.
        </p>
      )}

      {order.notes ? (
        <p className="mt-3 border border-line bg-ivory p-3 text-[10px] leading-relaxed text-stone">
          <span className="font-medium text-ink">Customer delivery note:</span> {order.notes}
        </p>
      ) : null}

      <section className="mt-8 grid gap-4 border-t border-line pt-5 text-[10px] sm:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.14em] text-ink">Packed by</p>
            <div className="mt-4 h-px w-40 bg-ink/30" />
            <p className="mt-1 text-[9px] text-stone">Name · signature</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.14em] text-ink">Checked by</p>
            <div className="mt-4 h-px w-40 bg-ink/30" />
            <p className="mt-1 text-[9px] text-stone">Name · signature</p>
          </div>
        </div>
        <div className="space-y-2 sm:text-right">
          <p className="text-[9px] uppercase tracking-[0.14em] text-ink">Packing checklist</p>
          <p>☐ Quantities match this slip</p>
          <p>☐ Quality checked, no marks</p>
          <p>☐ Gift wrapped · card included</p>
          <p>☐ Courier label attached to outer box</p>
          <p className="pt-2 text-[9px] text-stone">Prices are intentionally omitted from packing slips.</p>
        </div>
      </section>

      <footer className="mt-8 border-t border-line pt-4 text-[9px] uppercase tracking-[0.12em] text-stone">
        <p>{settings.companyName} · {settings.companyEmail} · {settings.supportHours}</p>
      </footer>
    </article>
  );
}
