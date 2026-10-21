import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Tag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { ShippingLabel } from "@/components/shipping/shipping-label";
import { PrintButton } from "@/components/invoice/print-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shipping label · Admin",
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;

export default async function AdminShippingLabelPage({ params }: { params: Params }) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
    getStoreSettings(),
  ]);
  if (!order) notFound();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3" data-print-hide>
        <div>
          <Link
            href={`/admin/orders/${order.id}`}
            className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-stone transition-colors hover:text-oxblood"
          >
            <ArrowLeft className="size-3" aria-hidden />
            Back to order
          </Link>
          <p className="mt-2 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-stone">
            <Tag className="size-3.5" aria-hidden />
            Courier label · {order.courier ?? "carrier pending"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/orders/${order.id}/invoice`} className="btn-outline min-h-10 px-3 text-[9px]">
            Tax invoice
          </Link>
          <Link href={`/admin/orders/${order.id}/packing-slip`} className="btn-outline min-h-10 px-3 text-[9px]">
            Packing slip
          </Link>
          <PrintButton label="Print label" className="btn-primary min-h-10 px-4 text-[9px]" />
        </div>
      </div>
      <ShippingLabel order={order} settings={settings} />
      <p
        className="mx-auto mt-4 max-w-[480px] text-center text-[9px] leading-relaxed text-stone"
        data-print-hide
      >
        Print at 100% on A6 or a 4×6 thermal label. Add a courier tracking number
        on the order before printing so the barcode carries the live reference.
      </p>
    </div>
  );
}
