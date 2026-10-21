import type { Metadata } from "next";
import { ReceiptText, Truck, ShieldCheck } from "lucide-react";
import { getStoreSettings } from "@/lib/settings";
import { AdminHeading } from "@/components/admin/admin-ui";
import { StoreSettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Store settings",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="space-y-6">
      <AdminHeading
        eyebrow="Operations"
        title="Store settings"
        description="Company details, dispatch rules and delivery windows. Saved settings feed every invoice, label and delivery estimate."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: ReceiptText,
            title: "Invoices & labels",
            body: "VAT number, registered address and invoice email print on every document.",
          },
          {
            icon: Truck,
            title: "Delivery estimates",
            body: "Cut-off and lead times power the animated bike, car and plane estimates.",
          },
          {
            icon: ShieldCheck,
            title: "Customer trust",
            body: "Accurate windows and support hours reduce “where is my order?” tickets.",
          },
        ].map((item) => (
          <div key={item.title} className="border border-line bg-cream p-4">
            <item.icon className="size-4 text-champagne-dark" aria-hidden />
            <p className="mt-2 text-[11px] font-medium">{item.title}</p>
            <p className="mt-1 text-[10px] leading-relaxed text-stone">{item.body}</p>
          </div>
        ))}
      </div>

      <StoreSettingsForm settings={settings} />
    </div>
  );
}
