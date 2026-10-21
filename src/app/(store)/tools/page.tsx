import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Gift,
  Package,
  ReceiptText,
  Ruler,
  Sparkles,
  Truck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Studio tools",
  description:
    "Practical Lovable Store tools: convert sizes across SA, UK, EU and US charts, estimate delivery, find a gift, track an order, retrieve a tax invoice and read the studio guides.",
};

const TOOLS = [
  {
    href: "/tools/size-converter",
    title: "Size converter",
    kicker: "Fit, decoded",
    description:
      "Translate the size you normally buy between SA, UK, EU and US charts, with bust, waist, hip, chest, foot and ring measurements.",
    icon: Ruler,
  },
  {
    href: "/tools/delivery-estimator",
    title: "Delivery estimator",
    kicker: "Timing, not guesswork",
    description:
      "Choose a destination and a piece to see a realistic arrival window — from the 14:00 dispatch cutoff to customs clearance.",
    icon: Truck,
  },
  {
    href: "/gift-finder",
    title: "Gift finder",
    kicker: "Gifts, considered",
    description:
      "Answer three quick questions about the person, the moment and your budget. We'll curate a shortlist worth giving.",
    icon: Gift,
  },
  {
    href: "/track",
    title: "Order tracking",
    kicker: "Parcel status",
    description:
      "Follow an order from the packing table to the doorstep, with live status and courier details. All you need is your order number and email.",
    icon: Package,
  },
  {
    href: "/track",
    title: "Tax invoice lookup",
    kicker: "Paperwork, sorted",
    description:
      "Find the VAT-ready invoice for a completed order. Open tracking, verify with the email used at checkout, then print or save a copy.",
    icon: ReceiptText,
  },
  {
    href: "/guides",
    title: "Guides",
    kicker: "The fine print",
    description:
      "Practical notes on materials, care, gifting etiquette and measuring properly — written by the studio, not a search engine.",
    icon: BookOpen,
  },
];

const ESTIMATE_NOTES = [
  {
    step: "01",
    title: "Business days only",
    body: "Our windows count Monday to Friday. Weekends and South African public holidays are skipped, so a 2–5 day estimate can span a weekend or a long weekend.",
  },
  {
    step: "02",
    title: "14:00 SAST cutoff",
    body: "Orders paid before 14:00 SAST on a business day are picked, packed and handed to the courier that day. Later orders start on the next business day.",
  },
  {
    step: "03",
    title: "Local vs imported",
    body: "Local South African stock usually arrives in 2–5 business days, with no customs. Imported atelier pieces take 10–18 business days, including the flight and clearance. Mixed orders may travel as two parcels.",
  },
];

export default function ToolsPage() {
  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-lux py-12 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="eyebrow flex items-center gap-2 text-champagne-dark">
                <Sparkles className="size-3.5" aria-hidden />
                Studio tools
              </p>
              <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.9rem,6.5vw,5.4rem)] leading-[0.93]">
                A little less
                <br />
                <span className="italic text-oxblood">guesswork.</span>
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-stone">
                Sizing, timing, gifting, tracking and paperwork — the practical
                details, handled. Six considered tools, most of them without an
                account.
              </p>
              <div className="mt-7 flex flex-wrap gap-2">
                <span className="grid-badge">
                  <Ruler className="size-3" aria-hidden />
                  Measurements in cm
                </span>
                <span className="grid-badge">
                  <Clock className="size-3" aria-hidden />
                  SAST windows
                </span>
                <span className="grid-badge">
                  <Check className="size-3" aria-hidden />
                  No data stored
                </span>
              </div>
            </div>

            <aside className="border border-line bg-ivory p-5 sm:p-6 lg:ml-auto lg:w-full lg:max-w-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow text-stone">Start here</p>
                <span className="grid-badge">Most used</span>
              </div>
              <Link
                href="/tools/size-converter"
                className="group mt-4 flex items-center justify-between gap-4 border border-line bg-cream p-4 transition-colors hover:border-ink"
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ivory-deep text-oxblood">
                    <Ruler className="size-4" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-display text-xl leading-tight">Find your size</span>
                    <span className="mt-0.5 block text-[9px] uppercase tracking-[0.12em] text-stone">
                      SA · UK · EU · US
                    </span>
                  </span>
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-stone transition-transform group-hover:translate-x-1 group-hover:text-oxblood"
                  aria-hidden
                />
              </Link>
              <div className="mt-4 flex items-start gap-2 border-t border-line pt-4 text-[10px] leading-relaxed text-stone">
                <Clock className="mt-0.5 size-3.5 shrink-0 text-champagne-dark" aria-hidden />
                <p>
                  Paid before 14:00 SAST on a business day? We pack and hand over
                  to the courier the same day.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="container-lux py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-champagne-dark">The toolkit</p>
            <h2 className="mt-2 font-display text-[clamp(2.2rem,4.5vw,3.6rem)] leading-none">
              Six quiet <span className="italic text-oxblood">shortcuts.</span>
            </h2>
          </div>
          <p className="max-w-xs text-[11px] leading-relaxed text-stone">
            Most work without an account. None of them store your measurements
            or personal details.
          </p>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {TOOLS.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Link
                key={`${tool.href}-${tool.title}`}
                href={tool.href}
                className="group flex flex-col border border-line bg-cream p-5 transition-all duration-300 hover:-translate-y-1 hover:border-ink hover:shadow-soft sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-11 items-center justify-center rounded-full border border-line bg-ivory-deep/60 text-oxblood transition-colors group-hover:border-oxblood/40">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="font-display text-2xl leading-none text-stone/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-5 text-[9px] uppercase tracking-[0.16em] text-champagne-dark">
                  {tool.kicker}
                </p>
                <h3 className="mt-1.5 font-display text-2xl leading-tight">{tool.title}</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-stone">
                  {tool.description}
                </p>
                <span className="mt-auto flex items-center gap-1.5 pt-6 text-[9px] uppercase tracking-[0.14em] text-ink-soft transition-colors group-hover:text-oxblood">
                  Open tool
                  <ArrowRight
                    className="size-3 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-lux pb-12 sm:pb-16">
        <div className="surface-card surface-grid">
          <div className="border-b border-line bg-cream/80 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-champagne-dark">No black boxes</p>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl">
                  How our estimates <span className="italic text-oxblood">work.</span>
                </h2>
                <p className="mt-3 max-w-2xl text-[12px] leading-relaxed text-stone">
                  Every arrival window we quote is built from the same three
                  rules. If a date moves, it&apos;s almost always one of these at
                  play.
                </p>
              </div>
              <Link href="/delivery-and-returns" className="btn-quiet text-[9px]">
                Delivery &amp; returns
              </Link>
            </div>
          </div>

          <div className="grid divide-y divide-line bg-cream/40 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {ESTIMATE_NOTES.map((note) => (
              <div key={note.step} className="p-6 sm:p-7">
                <span className="grid-badge">{note.step}</span>
                <h3 className="mt-4 font-display text-2xl">{note.title}</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-stone">{note.body}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-ivory-deep/40 px-6 py-4 sm:px-7">
            <p className="flex max-w-2xl items-start gap-2 text-[10px] leading-relaxed text-stone">
              <Clock className="mt-0.5 size-3 shrink-0 text-champagne-dark" aria-hidden />
              Estimates are typical, not guaranteed. Peak season, remote routes
              and customs can add a day; live tracking is the source of truth.
            </p>
            <Link
              href="/tools/delivery-estimator"
              className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-oxblood underline-offset-4 hover:underline"
            >
              Try the estimator
              <ArrowRight className="size-3" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
