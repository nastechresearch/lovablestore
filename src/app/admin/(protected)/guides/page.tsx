import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Boxes,
  CircleAlert,
  ClipboardCheck,
  Info,
  Package,
  ReceiptText,
  Scissors,
  Settings2,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { AdminHeading } from "@/components/admin/admin-ui";
import { PrintButton } from "@/components/invoice/print-button";
import { STAFF_GUIDES, type StaffGuideOwner } from "@/lib/staff-guides";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Staff guides",
  robots: { index: false, follow: false },
};

const OWNER_META: Record<
  StaffGuideOwner,
  { icon: typeof Scissors; chip: string }
> = {
  Studio: {
    icon: Scissors,
    chip: "bg-champagne/20 text-champagne-dark",
  },
  Fulfilment: {
    icon: Truck,
    chip: "bg-oxblood/10 text-oxblood",
  },
  Finance: {
    icon: ReceiptText,
    chip: "bg-ink/8 text-ink",
  },
};

const QUICK_LINKS = [
  {
    href: "/admin/orders",
    label: "Orders",
    copy: "Paid queue, packing, labels and tracking.",
    icon: ShoppingBag,
  },
  {
    href: "/admin/settings",
    label: "Store settings",
    copy: "VAT, registration, cut-off and lead times.",
    icon: Settings2,
  },
  {
    href: "/admin/suppliers",
    label: "Suppliers",
    copy: "Imported lines, connections and lead times.",
    icon: Boxes,
  },
  {
    href: "/admin/products",
    label: "Products",
    copy: "SKUs, stock and supplier links.",
    icon: Package,
  },
] as const;

const NEW_STARTER_CHECKS = [
  "Shadow one complete pack cycle and one courier handover before working alone.",
  "Print a training label and confirm the barcode scans at 100%.",
  "Find the dispatch cut-off, delivery windows and VAT details in Store settings.",
  "Read all five guides, especially fraud and disputes and the R5 000 threshold.",
  "Complete one supplier order and record the supplier reference on the line.",
  "Know the escalation owner for each guide and where pack photos are stored.",
] as const;

export default function AdminStaffGuidesPage() {
  return (
    <div className="space-y-8">
      <AdminHeading
        eyebrow="Staff desk"
        title="Staff guides"
        description="The store's operating playbook: paid orders, courier handover, VAT paperwork, imported stock and dispute evidence. Print a guide for the bench or keep this page as the team reference."
        action={
          <PrintButton
            label="Print all guides"
            className="btn-primary min-h-10 px-4 text-[9px]"
          />
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.45fr_0.55fr]">
        <section aria-labelledby="quick-links" data-print-hide>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2
              id="quick-links"
              className="eyebrow text-champagne-dark"
            >
              Quick links
            </h2>
            <p className="text-[9px] uppercase tracking-[0.14em] text-stone">
              5 guides · Studio · Fulfilment · Finance
            </p>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="surface-card group flex items-start gap-3 p-4 transition-colors hover:border-champagne"
              >
                <span className="flex size-9 shrink-0 items-center justify-center bg-ink text-ivory">
                  <link.icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.12em] group-hover:text-oxblood">
                    {link.label}
                    <ArrowUpRight className="size-3" aria-hidden />
                  </span>
                  <span className="mt-1 block text-[10px] leading-relaxed text-stone">
                    {link.copy}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="new-staff" className="surface-card p-5">
          <h2 id="new-staff" className="flex items-center gap-2 font-display text-2xl">
            <ClipboardCheck className="size-4 text-champagne-dark" aria-hidden />
            New staff checklist
          </h2>
          <p className="mt-1 text-[10px] leading-relaxed text-stone">
            Work through these before handling the paid queue alone. Print this
            page and initial each line on the paper copy.
          </p>
          <ul className="mt-4 space-y-2.5">
            {NEW_STARTER_CHECKS.map((item) => (
              <li key={item} className="flex gap-2.5 text-[10.5px] leading-relaxed">
                <span
                  className="mt-0.5 size-3.5 shrink-0 border border-line bg-ivory"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="space-y-6">
        {STAFF_GUIDES.map((guide, index) => {
          const owner = OWNER_META[guide.owner];
          const OwnerIcon = owner.icon;

          return (
            <section key={guide.slug} id={guide.slug} className="surface-card scroll-mt-6">
              <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-5 sm:p-6">
                <div className="flex min-w-0 items-start gap-4">
                  <span
                    className="font-display text-xl leading-none text-stone tabular-nums"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-[clamp(1.7rem,3vw,2.4rem)] leading-[1.02]">
                      {guide.title}
                    </h2>
                    <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-stone">
                      {guide.summary}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 text-[8.5px] font-medium uppercase tracking-[0.14em] ${owner.chip}`}
                >
                  <OwnerIcon className="size-3.5" aria-hidden />
                  Owner · {guide.owner}
                </span>
              </header>

              <ol className="divide-y divide-line">
                {guide.steps.map((step, stepIndex) => (
                  <li
                    key={step.title}
                    className="flex gap-3 px-5 py-4 sm:gap-4 sm:px-6"
                  >
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center border border-line bg-ivory font-display text-base leading-none text-champagne-dark tabular-nums">
                      {String(stepIndex + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-[12px] font-medium">{step.title}</h3>
                      <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
                        {step.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="grid border-t border-line sm:grid-cols-2">
                <div className="border-b border-line bg-ivory/50 p-5 sm:border-b-0 sm:border-r sm:p-6">
                  <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-champagne-dark">
                    <Info className="size-3.5" aria-hidden />
                    Why this matters
                  </p>
                  <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">
                    {guide.why}
                  </p>
                </div>
                <div className="bg-champagne/10 p-5 sm:p-6">
                  <p className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-oxblood">
                    <CircleAlert className="size-3.5" aria-hidden />
                    Escalate if
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {guide.escalateIf.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-[11px] leading-relaxed text-ink-soft"
                      >
                        <span
                          className="mt-[0.45rem] size-1 shrink-0 bg-oxblood"
                          aria-hidden
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
