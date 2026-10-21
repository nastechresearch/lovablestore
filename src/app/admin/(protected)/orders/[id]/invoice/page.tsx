import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { InvoiceDocument } from "@/components/invoice/invoice-document";
import { PrintButton } from "@/components/invoice/print-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tax invoice · Admin",
  robots: { index: false, follow: false },
};

type Params = Promise<{ id: string }>;

export default async function AdminInvoicePage({ params }: { params: Params }) {
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
            <FileText className="size-3.5" aria-hidden />
            Tax invoice · {order.number}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/orders/${order.id}/packing-slip`} className="btn-outline min-h-10 px-3 text-[9px]">
            Packing slip
          </Link>
          <Link href={`/admin/orders/${order.id}/label`} className="btn-outline min-h-10 px-3 text-[9px]">
            Shipping label
          </Link>
          <PrintButton label="Print / save PDF" className="btn-primary min-h-10 px-4 text-[9px]" />
        </div>
      </div>
      <InvoiceDocument order={order} settings={settings} />
    </div>
  );
}
