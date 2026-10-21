import type { Order, OrderItem } from "@prisma/client";
import { formatDate } from "@/lib/format";
import type { StoreSettings } from "@/lib/settings";
import { Barcode } from "@/components/shipping/barcode";

type LabelOrder = Order & { items: OrderItem[] };

export function ShippingLabel({
  order,
  settings,
}: {
  order: LabelOrder;
  settings: StoreSettings;
}) {
  const pieces = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const tracking = order.trackingNumber?.trim();
  const carrier = order.courier?.trim() || "Courier to be assigned";
  const barcodeValue = (tracking || order.number).replace(/\s+/g, "").toUpperCase();

  return (
    <article className="print-sheet mx-auto w-full max-w-[480px] border-2 border-ink bg-white p-5 text-ink">
      <header className="flex items-start justify-between gap-4 border-b-2 border-ink pb-3">
        <div>
          <p className="font-display text-2xl leading-none">
            LOVABLE<span className="text-oxblood">·</span>STORE
          </p>
          <p className="mt-1 text-[8px] uppercase tracking-[0.2em] text-stone">
            Fulfilment · Johannesburg
          </p>
        </div>
        <div className="text-right">
          <p className="text-[8px] uppercase tracking-[0.16em] text-stone">Nationwide</p>
          <p className="text-[15px] font-semibold uppercase tracking-[0.06em]">Standard</p>
          <p className="text-[8px] uppercase tracking-[0.12em] text-stone">Signed delivery</p>
        </div>
      </header>

      <section className="flex items-start justify-between gap-3 border-b border-ink/40 py-3 text-[8.5px] leading-relaxed">
        <div>
          <p className="text-[7.5px] uppercase tracking-[0.16em] text-stone">From</p>
          <p className="mt-1 font-semibold">{settings.companyName} Fulfilment</p>
          <p>{settings.companyAddress}</p>
          <p>{settings.companyPhone}</p>
        </div>
        <div className="text-right">
          <p className="text-[7.5px] uppercase tracking-[0.16em] text-stone">Order</p>
          <p className="mt-1 font-mono text-[10px] font-semibold">{order.number}</p>
          <p>{formatDate(order.createdAt)}</p>
          <p>{pieces} {pieces === 1 ? "piece" : "pieces"}</p>
        </div>
      </section>

      <section className="border-b-2 border-ink py-3">
        <p className="text-[7.5px] uppercase tracking-[0.16em] text-stone">Deliver to</p>
        <p className="mt-1 text-[19px] font-semibold uppercase leading-tight tracking-[0.02em]">
          {order.firstName} {order.lastName}
        </p>
        <address className="mt-1 space-y-0.5 text-[12px] not-italic font-medium leading-snug">
          <p>{order.address}</p>
          <p className="text-[14px] uppercase">
            {order.city}, {order.province}
          </p>
          <p className="text-[14px] font-semibold tracking-[0.06em]">{order.postalCode}</p>
          <p className="mt-1 text-[11px] font-normal">Tel {order.phone}</p>
        </address>
      </section>

      <section className="py-3">
        <Barcode value={barcodeValue} height={62} moduleWidth={1.9} className="text-ink" />
        {tracking ? (
          <p className="mt-2 text-center text-[9px] uppercase tracking-[0.12em]">
            <span className="text-stone">Tracking</span>{" "}
            <span className="font-mono font-semibold">{tracking}</span>
          </p>
        ) : (
          <p className="mt-2 text-center text-[9px] uppercase tracking-[0.14em] text-oxblood">
            Awaiting courier scan · barcode holds order number
          </p>
        )}
        <p className="mt-1 text-center text-[8.5px] uppercase tracking-[0.12em] text-stone">
          {carrier}
        </p>
      </section>

      <footer className="grid grid-cols-3 gap-2 border-t-2 border-ink pt-3 text-center">
        <div>
          <p className="text-[7px] uppercase tracking-[0.14em] text-stone">Gift</p>
          <p className="text-[10px] font-semibold">{order.giftNote ? "Yes · card" : "No"}</p>
        </div>
        <div>
          <p className="text-[7px] uppercase tracking-[0.14em] text-stone">Handling</p>
          <p className="text-[10px] font-semibold">FRAGILE</p>
        </div>
        <div>
          <p className="text-[7px] uppercase tracking-[0.14em] text-stone">Contact</p>
          <p className="text-[10px] font-semibold">{settings.companyPhone}</p>
        </div>
      </footer>

      <p className="mt-3 border-t border-ink/30 pt-2 text-center text-[7.5px] uppercase tracking-[0.1em] text-stone">
        Deliver to door · obtain signature · do not leave unattended
      </p>
    </article>
  );
}
