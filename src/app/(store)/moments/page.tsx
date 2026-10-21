import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Sparkles, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  getMomentCalendar,
  TONE_CLASSES,
  type Moment,
} from "@/lib/moments";
import { productInclude, toStoreProduct } from "@/lib/products";
import { ProductGrid } from "@/components/product/product-grid";
import { MomentCountdown } from "@/components/moments/countdown";
import { Reveal } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mzansi moments",
  description:
    "The South African gifting calendar: Heritage Day, Women's Day, Youth Day, payday, Diwali, Black Friday and every moment in between.",
};

function MomentCard({ moment }: { moment: Moment }) {
  const tone = TONE_CLASSES[moment.tone];
  return (
    <Link
      href={`/tag/${moment.tag}`}
      className={`group relative flex h-full flex-col justify-between overflow-hidden border p-5 transition-transform duration-500 hover:-translate-y-1 ${tone.surface} ${tone.ink} ${tone.line}`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[8px] uppercase tracking-[0.16em] ${tone.chip}`}>
            {moment.live ? (
              <>
                <span className="size-1.5 animate-pulse rounded-full bg-current" aria-hidden />
                On now
              </>
            ) : (
              <>
                <CalendarDays className="size-2.5" aria-hidden />
                {moment.dateLabel}
              </>
            )}
          </span>
          <ArrowRight className="size-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
        </div>
        <h3 className="mt-4 font-display text-[1.55rem] leading-tight">{moment.name}</h3>
        <p className="mt-2 text-[10.5px] leading-relaxed opacity-75">{moment.blurb}</p>
      </div>
      <div className="mt-4 border-t border-current/15 pt-3">
        <p className="text-[9px] uppercase tracking-[0.12em] opacity-60">{moment.windowLabel}</p>
        <p className="mt-1.5 text-[10px] leading-relaxed opacity-85">{moment.idea}</p>
      </div>
    </Link>
  );
}

export default async function MomentsPage() {
  const { live, upcoming, all } = getMomentCalendar();
  const hero = live[0] ?? upcoming[0] ?? null;
  const heroTone = hero ? TONE_CLASSES[hero.tone] : TONE_CLASSES.gold;

  const heroProducts = hero
    ? (
        await prisma.product.findMany({
          where: { status: "ACTIVE", tags: { some: { slug: hero.tag } } },
          include: productInclude,
          orderBy: [{ featured: "desc" }, { rating: "desc" }],
          take: 4,
        })
      ).map(toStoreProduct)
    : [];

  return (
    <div>
      <section className={`relative overflow-hidden ${heroTone.surface} ${heroTone.ink}`}>
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, currentColor 0, transparent 45%), radial-gradient(circle at 80% 70%, currentColor 0, transparent 40%)",
          }}
          aria-hidden
        />
        <div className="container-lux relative py-14 sm:py-18 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] opacity-80">
                <Sparkles className="size-3.5" aria-hidden />
                The Mzansi gifting calendar
              </p>
              <h1 className="mt-4 font-display text-[2.7rem] leading-[1.02] sm:text-[3.6rem] lg:text-[4.2rem]">
                Every South African
                <br />
                moment, considered.
              </h1>
              <p className="mt-5 max-w-xl text-[12px] leading-relaxed opacity-75">
                Heritage braais, Women&rsquo;s Day, Youth Day, payday Fridays, Diwali, Black Friday
                and the long December table. We plan the edit so the gift lands before the day.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[9.5px] uppercase tracking-[0.12em] opacity-70">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="size-3.5" aria-hidden />
                  Local pieces in 2–5 days
                </span>
                <span>Gift wrap included</span>
                <span>Nationwide delivery</span>
              </div>
            </div>

            {hero ? (
              <div className={`border p-6 ${heroTone.line} bg-black/10`}>
                <p className="text-[9px] uppercase tracking-[0.18em] opacity-70">
                  {hero.live ? "Happening now" : "Next on the calendar"}
                </p>
                <h2 className="mt-2 font-display text-[2rem] leading-tight">{hero.name}</h2>
                <p className="mt-1 text-[10.5px] uppercase tracking-[0.1em] opacity-65">
                  {hero.dateLabel} · {hero.windowLabel}
                </p>
                <p className="mt-3 text-[11px] leading-relaxed opacity-80">{hero.idea}</p>
                <div className="mt-5">
                  <p className="mb-2 text-[8.5px] uppercase tracking-[0.16em] opacity-60">
                    {hero.live ? "Gift window closes in" : "Gift window opens in"}
                  </p>
                  <MomentCountdown end={hero.live ? hero.end : hero.start} />
                </div>
                <Link
                  href={`/tag/${hero.tag}`}
                  className="mt-5 inline-flex items-center gap-2 border border-current/30 px-4 py-2.5 text-[9px] uppercase tracking-[0.14em] transition-colors hover:bg-current/10"
                >
                  Shop the {hero.name} edit
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {heroProducts.length > 0 ? (
        <section className="container-lux py-12 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow text-champagne-dark">
                {hero?.live ? "Live now" : "Plan ahead"}
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl">
                The {hero?.name} edit.
              </h2>
            </div>
            <Link
              href={`/tag/${hero?.tag}`}
              className="text-[9px] uppercase tracking-[0.12em] text-stone hover:text-oxblood"
            >
              See all pieces
            </Link>
          </div>
          <div className="mt-7">
            <ProductGrid products={heroProducts} priorityCount={2} />
          </div>
        </section>
      ) : null}

      <section className="container-lux pb-16 sm:pb-20">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="eyebrow text-champagne-dark">The full calendar</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">Dates worth planning for.</h2>
          </div>
          <p className="max-w-xs text-right text-[9.5px] leading-relaxed text-stone">
            Windows include a lead time for hand wrapping and nationwide courier.
          </p>
        </div>
        <Reveal>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {all.map((moment) => (
              <MomentCard key={moment.slug} moment={moment} />
            ))}
          </div>
        </Reveal>
      </section>

      <section className="container-lux pb-16 sm:pb-20">
        <div className="grid gap-6 border border-line bg-cream p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow text-champagne-dark">Can&rsquo;t decide?</p>
            <h2 className="mt-2 font-display text-3xl">Let the gift finder do the thinking.</h2>
            <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-stone">
              Answer three quick questions and we&rsquo;ll narrow the house down to pieces that
              suit the person, the moment and your budget.
            </p>
          </div>
          <Link href="/gift-finder" className="btn-primary whitespace-nowrap">
            Find a gift
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
