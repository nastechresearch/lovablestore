import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clock3,
  Compass,
  Sparkles,
  Truck,
} from "lucide-react";
import { GUIDES, GUIDE_CATEGORIES } from "@/lib/guides";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Practical South African gifting guides: rand budgets, sizing conversions, watch and fragrance care, delivery timing, VAT invoices and corporate gifting.",
  alternates: {
    canonical: "/guides",
  },
  openGraph: {
    type: "website",
    url: "/guides",
    title: "Guides",
    description:
      "Six working guides to gifting in South Africa, written by the studio in Johannesburg.",
  },
};

export default function GuidesPage() {
  const latest = GUIDES.reduce(
    (newest, guide) => (guide.updated > newest ? guide.updated : newest),
    GUIDES[0].updated,
  );
  const categoryLabels = GUIDE_CATEGORIES.map((category) => category.label).join(" · ");

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line bg-cream">
        <div className="surface-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div className="container-lux relative py-10 sm:py-14 lg:py-18">
          <nav
            className="text-[9px] uppercase tracking-[0.16em] text-stone"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-oxblood">
              Home
            </Link>
            <span className="mx-2 text-champagne">/</span>
            <span className="text-ink">Guides</span>
          </nav>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_310px] lg:items-end lg:gap-14">
            <div>
              <p className="eyebrow flex items-center gap-3 text-champagne-dark">
                <span className="h-px w-7 bg-champagne-dark" aria-hidden />
                Notes from the studio
              </p>
              <h1 className="mt-4 max-w-[12ch] font-display text-[clamp(3rem,7vw,5.8rem)] leading-[0.92]">
                Gift well,
                <br />
                <span className="italic text-oxblood">on purpose.</span>
              </h1>
              <p className="mt-5 max-w-xl text-[13px] leading-relaxed text-stone text-pretty sm:text-sm">
                Six working guides to the questions we answer every week: what to
                spend, which size to choose, how to keep a watch or fragrance,
                when a parcel will land and how to get the paperwork right. No
                filler, no generic advice — just the South African context.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9.5px] uppercase tracking-[0.14em] text-stone">
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="size-3.5 text-champagne-dark" aria-hidden />
                  {GUIDES.length} guides
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5 text-champagne-dark" aria-hidden />
                  6–9 minute reads
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-champagne-dark" aria-hidden />
                  Reviewed {formatDate(latest)}
                </span>
              </div>
            </div>

            <aside className="surface-card surface-grid relative p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-champagne-dark">The index</p>
                  <p className="mt-2 font-display text-2xl leading-tight">
                    Six guides, one standard.
                  </p>
                </div>
                <span className="font-display text-5xl italic leading-none text-champagne-dark/60">
                  06
                </span>
              </div>
              <p className="mt-4 text-[11px] leading-relaxed text-stone">
                Practical advice from the people who pack, post and answer the
                questions after checkout.
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4">
                <div>
                  <dt className="text-[8.5px] uppercase tracking-[0.16em] text-stone">
                    Themes
                  </dt>
                  <dd className="mt-1 text-[11px] text-ink-soft">
                    {GUIDE_CATEGORIES.length} covered
                  </dd>
                </div>
                <div>
                  <dt className="text-[8.5px] uppercase tracking-[0.16em] text-stone">
                    Studio
                  </dt>
                  <dd className="mt-1 text-[11px] text-ink-soft">
                    Johannesburg, SAST
                  </dd>
                </div>
              </dl>
              <p className="mt-4 border-t border-line pt-4 text-[9px] uppercase leading-relaxed tracking-[0.12em] text-stone">
                {categoryLabels}
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-ivory-deep/30">
        <div className="container-lux py-4">
          <div className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-ivory text-champagne-dark">
                <Compass className="size-4" aria-hidden />
              </span>
              <div>
                <p className="eyebrow text-stone">Tools</p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
                  Skip the manual maths: estimate a delivery date or browse the
                  studio tools.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/tools"
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line bg-ivory px-4 text-[9px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-oxblood hover:text-oxblood"
              >
                All tools
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
              <Link
                href="/tools/delivery-estimator"
                className="inline-flex min-h-9 items-center gap-2 rounded-full bg-oxblood px-4 text-[9px] uppercase tracking-[0.14em] text-ivory transition-colors hover:bg-oxblood-deep"
              >
                <Truck className="size-3.5" aria-hidden />
                Delivery estimator
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container-lux py-12 sm:py-16 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="eyebrow text-champagne-dark">The library</p>
            <h2 className="mt-2 font-display text-[clamp(2rem,4vw,3.2rem)] leading-tight">
              Read before you wrap.
            </h2>
          </div>
          <p className="max-w-xs text-[10px] leading-relaxed text-stone sm:text-right">
            Every guide is written for South African rand, delivery windows and
            consumer realities.
          </p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {GUIDES.map((guide, index) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-cream p-6 transition-all duration-500 hover:-translate-y-1 hover:border-champagne-dark sm:p-7"
            >
              <span
                className="pointer-events-none absolute right-5 top-3 font-display text-6xl italic leading-none text-champagne-dark/15"
                aria-hidden
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="relative flex flex-wrap items-center gap-2">
                <span className="grid-badge">{guide.category}</span>
                <span className="inline-flex items-center gap-1.5 text-[8.5px] uppercase tracking-[0.14em] text-stone">
                  <Clock3 className="size-3 text-champagne-dark" aria-hidden />
                  {guide.readingMinutes} min read
                </span>
              </div>

              <h3 className="relative mt-7 max-w-[19ch] font-display text-[1.7rem] leading-[1.05] text-ink">
                {guide.title}
              </h3>
              <p className="relative mt-3 flex-1 text-[11.5px] leading-relaxed text-stone">
                {guide.excerpt}
              </p>

              <span className="relative mt-7 flex items-center justify-between gap-4 border-t border-line pt-4 text-[9px] uppercase tracking-[0.16em] text-ink">
                Read guide
                <ArrowRight
                  className="size-3.5 text-champagne-dark transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-lux pb-16 sm:pb-20">
        <div className="night-panel relative overflow-hidden rounded-[var(--radius-card)] border border-line p-7 text-ivory sm:p-10">
          <div
            className="surface-grid pointer-events-none absolute inset-0 opacity-30"
            aria-hidden
          />
          <div className="relative grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12">
            <div>
              <p className="eyebrow text-champagne">Still deciding?</p>
              <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,4vw,3.3rem)] leading-[1.02]">
                The right gift is easier with a second opinion.
              </h2>
              <p className="mt-3 max-w-xl text-[11.5px] leading-relaxed text-ivory/65">
                Answer three quick questions, or tell the studio who the gift is
                for and when it needs to arrive. We will do the narrowing.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <Link href="/gift-finder" className="btn-primary whitespace-nowrap">
                Find a gift
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-ivory/30 px-6 text-[9px] uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-ivory hover:text-ink"
              >
                Ask the studio
                <ArrowUpRight className="size-3.5" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
