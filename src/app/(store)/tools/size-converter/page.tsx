import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Info, Ruler } from "lucide-react";
import { SizeConverter } from "@/components/tools/size-converter";

export const metadata: Metadata = {
  title: "Size converter",
  description:
    "Convert women's and men's clothing, shoe and ring sizes between SA, UK, EU and US sizing, with body measurements in centimetres and millimetres.",
};

const INCLUDED = [
  "Women's clothing, SA 30–44",
  "Men's clothing, SA 34–46",
  "Shoes for women and men",
  "Ring sizes F–Z",
];

export default function SizeConverterPage() {
  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-lux py-10 sm:py-14">
          <nav
            aria-label="Breadcrumb"
            className="text-[9px] uppercase tracking-[0.16em] text-stone"
          >
            <Link href="/" className="transition-colors hover:text-oxblood">
              Home
            </Link>
            <span className="mx-2 text-champagne">/</span>
            <Link href="/tools" className="transition-colors hover:text-oxblood">
              Tools
            </Link>
            <span className="mx-2 text-champagne">/</span>
            <span className="text-ink">Size converter</span>
          </nav>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="eyebrow flex items-center gap-2 text-champagne-dark">
                <Ruler className="size-3.5" aria-hidden />
                Studio tools
              </p>
              <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.9rem,6.5vw,5.4rem)] leading-[0.94]">
                Your size,
                <br className="hidden sm:block" />{" "}
                <span className="italic text-oxblood">everywhere.</span>
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-stone">
                Pick the size you normally buy and read it in South African, UK,
                European and US terms — with the body measurements behind each
                chart. No account, no guesswork, nothing leaves your browser.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="grid-badge">
                  <Check className="size-3" aria-hidden />
                  SA · UK · EU · US
                </span>
                <span className="grid-badge">
                  <Ruler className="size-3" aria-hidden />
                  Measurements in cm
                </span>
                <span className="grid-badge">
                  <Check className="size-3" aria-hidden />
                  Works offline
                </span>
              </div>
            </div>

            <aside className="border border-line bg-ivory p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <p className="eyebrow text-champagne-dark">Inside the converter</p>
                <span className="grid-badge">4 categories</span>
              </div>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {INCLUDED.map((item, index) => (
                  <li key={item} className="flex items-center gap-3 py-3">
                    <span className="text-[9px] uppercase tracking-[0.14em] text-champagne-dark">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[11px] text-ink-soft">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[10px] leading-relaxed text-stone">
                Measurements are body measurements, not garment dimensions.
                Choose the closest match and read the fit note before sizing up
                or down.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <div className="container-lux py-8 sm:py-12">
        <div className="surface-card p-4 sm:p-6 lg:p-8">
          <SizeConverter />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="flex gap-3 border border-line bg-cream p-5">
            <Info className="mt-0.5 size-4 shrink-0 text-champagne-dark" aria-hidden />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink">
                A guide, not a guarantee
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-stone">
                Size charts vary between makers, fabrics and cuts. Use this as a
                starting point and check the product page for fit notes, model
                measurements and care details before ordering.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border border-line bg-cream p-5">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink">
                Need a hand?
              </p>
              <p className="mt-1.5 max-w-xs text-[11px] leading-relaxed text-stone">
                The studio will happily check a size against the piece you have
                in mind.
              </p>
            </div>
            <Link href="/contact" className="btn-outline min-h-10 px-4 text-[9px]">
              Contact the studio
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <div>
            <p className="eyebrow text-stone">More from the toolkit</p>
            <p className="mt-1 font-display text-2xl">Need a date, not a size?</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/tools" className="btn-outline min-h-10 px-4 text-[9px]">
              All tools
            </Link>
            <Link
              href="/tools/delivery-estimator"
              className="btn-primary min-h-10 px-4 text-[9px]"
            >
              Delivery estimator
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
