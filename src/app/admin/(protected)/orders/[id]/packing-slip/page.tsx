import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { PackingSlip } from "@/components/shipping/packing-slip";
import { PrintButton } from "@/components/invoice/print-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Packing slip · Admin",
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;

export default async function AdminPackingSlipPage({ params }: { params: Params }) {
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
            <PackageCheck className="size-3.5" aria-hidden />
            Packing slip · {order.number}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/orders/${order.id}/invoice`} className="btn-outline min-h-10 px-3 text-[9px]">
            Tax invoice
          </Link>
          <Link href={`/admin/orders/${order.id}/label`} className="btn-outline min-h-10 px-3 text-[9px]">
            Shipping label
          </Link>
          <PrintButton label="Print / save PDF" className="btn-primary min-h-10 px-4 text-[9px]" />
        </div>
      </div>
      <PackingSlip order={order} settings={settings} />
    </div>
  );
}
