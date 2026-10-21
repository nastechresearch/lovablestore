import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, FileText, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { findAuthorisedOrder, orderExists } from "@/lib/order-access";
import { getStoreSettings } from "@/lib/settings";
import { InvoiceDocument } from "@/components/invoice/invoice-document";
import { PrintButton } from "@/components/invoice/print-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tax invoice",
  robots: { index: false, follow: false },
};

type Params = Promise<{ number: string }>;
type SearchParams = Promise<{ email?: string; key?: string }>;

export default async function OrderInvoicePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { number } = await params;
  const query = await searchParams;
  const key = query.key ?? query.email ?? null;
  const order = await findAuthorisedOrder(number, key);
  if (!order) {
    if (!(await orderExists(number))) notFound();

    return (
      <div className="container-lux flex min-h-[60vh] items-center justify-center py-16">
        <div className="w-full max-w-md border border-line bg-cream p-8">
          <p className="eyebrow text-champagne-dark">Invoice lookup</p>
          <h1 className="mt-3 font-display text-4xl leading-tight">
            Confirm it&apos;s you.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone">
            Enter the email or account ID used for order{" "}
            <span className="font-medium text-ink">{number}</span>. Signed-in
            customers can open this page without a key.
          </p>
          <form method="get" className="mt-6 space-y-3">
            <div>
              <label htmlFor="key" className="label">Email or account ID</label>
              <input
                id="key"
                name="key"
                required
                autoComplete="email"
                className="field"
                placeholder="you@example.co.za or LS-12345678"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              View invoice
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </form>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-stone">
            <ShieldCheck className="size-3" aria-hidden />
            For your privacy we never list invoices publicly.
          </p>
        </div>
      </div>
    );
  }

  const settings = await getStoreSettings();

  return (
    <div className="container-lux py-8 sm:py-12">
      <div className="mx-auto mb-5 flex max-w-3xl flex-wrap items-center justify-between gap-3" data-print-hide>
        <Link
          href={`/order/${order.number}?email=${encodeURIComponent(order.email)}`}
          className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-stone transition-colors hover:text-oxblood"
        >
          <ArrowLeft className="size-3" aria-hidden />
          Back to order
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.12em] text-stone">
            <FileText className="size-3.5" aria-hidden />
            Tax invoice
          </span>
          <PrintButton label="Print / save PDF" className="btn-outline min-h-10 px-4 text-[9px]" />
        </div>
      </div>
      <InvoiceDocument order={order} settings={settings} />
      <p className="mx-auto mt-4 max-w-3xl text-center text-[9px] uppercase tracking-[0.1em] text-stone" data-print-hide>
        Use “Print / save PDF” and choose “Save as PDF” to keep a copy.
      </p>
    </div>
  );
}
