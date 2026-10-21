import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Sparkles, Tag as TagIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPromoValue, promoIsLive } from "@/lib/promos";
import { formatDate, formatZAR } from "@/lib/format";
import { PromoCodeChip } from "@/components/promo/promo-code-chip";
import { Reveal } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Offers & promo codes",
  description:
    "Live Lovable Store offers — local-maker promos, global sourcing deals and seasonal codes for gifts delivered across South Africa.",
};

function scopeLabel(promo: {
  scope: string;
  scopeValue: string | null;
  supplierConnection: { name: string; kind: string } | null;
}): string {
  switch (promo.scope) {
    case "CATEGORY":
      return `On ${promo.scopeValue ?? "selected categories"}`;
    case "TAG":
      return `On the ${promo.scopeValue ?? "selected"} edit`;
    case "SUPPLIER":
      return promo.supplierConnection
        ? `On pieces from ${promo.supplierConnection.name}`
        : "On selected suppliers";
    case "SUPPLIER_KIND":
      return promo.scopeValue === "LOCAL"
        ? "On locally sourced pieces"
        : "On globally sourced pieces";
    case "PRODUCT":
      return "On selected pieces";
    default:
      return "On everything";
  }
}

export default async function PromosPage() {
  const now = new Date();
  const records = await prisma.promo.findMany({
    include: { supplierConnection: true },
    orderBy: { createdAt: "desc" },
  });
  const live = records.filter((promo) => promoIsLive(promo, now));
  const upcoming = records.filter(
    (promo) => promo.active && !promoIsLive(promo, now) && promo.startsAt && promo.startsAt > now,
  );
  const localPromos = live.filter(
    (promo) => promo.scope === "SUPPLIER_KIND" && promo.scopeValue === "LOCAL",
  );
  const globalPromos = live.filter(
    (promo) => promo.scope === "SUPPLIER_KIND" && promo.scopeValue === "CHINA",
  );

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-cream">
        <div className="container-lux py-14 sm:py-20">
          <Reveal className="max-w-3xl">
            <p className="eyebrow text-champagne-dark">The offers edit</p>
            <h1 className="mt-4 font-display text-[clamp(3rem,7.5vw,6rem)] leading-[0.92]">
              More love,
              <br />
              <span className="italic text-oxblood">less spend.</span>
            </h1>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-stone">
              Live codes across the atelier, plus dedicated savings for pieces
              sourced from South African makers. Copy a code and apply it in your
              bag.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <div className="border border-line bg-ivory p-5">
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-champagne-dark">
                <MapPin className="size-3.5" aria-hidden />
                Local makers
              </p>
              <p className="mt-2 text-sm leading-relaxed text-stone">
                {localPromos.length > 0
                  ? `${localPromos.length} live offer${localPromos.length === 1 ? "" : "s"} on South African sourced pieces.`
                  : "Local-maker offers rotate monthly. Join the list to hear first."}
              </p>
            </div>
            <div className="border border-line bg-ivory p-5">
              <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-champagne-dark">
                <Sparkles className="size-3.5" aria-hidden />
                Global atelier
              </p>
              <p className="mt-2 text-sm leading-relaxed text-stone">
                {globalPromos.length > 0
                  ? `${globalPromos.length} live offer${globalPromos.length === 1 ? "" : "s"} on globally sourced pieces, with tracked delivery.`
                  : "Global sourcing offers appear here when a batch lands."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-lux py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-stone">Available now</p>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">
              Live <span className="italic text-oxblood">codes</span>
            </h2>
          </div>
          <Link href="/shop" className="btn-quiet hidden sm:inline-flex">
            Shop the store
          </Link>
        </div>

        {live.length === 0 ? (
          <div className="mt-8 border border-line bg-cream p-10 text-center">
            <p className="font-display text-3xl">The next offer is being wrapped.</p>
            <p className="mt-2 text-sm text-stone">
              Join the newsletter and we&apos;ll send it before it goes public.
            </p>
            <Link href="/shop" className="btn-primary mt-6">
              Shop in the meantime
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {live.map((promo, index) => (
              <Reveal key={promo.id} delay={index * 0.05}>
                <article className="group flex h-full flex-col justify-between border border-line bg-cream p-6 transition-colors hover:border-champagne">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <p className="eyebrow text-champagne-dark">
                        {promo.type === "FREE_SHIPPING" ? "Delivery on us" : formatPromoValue(promo)}
                      </p>
                      <TagIcon className="size-4 text-champagne" aria-hidden />
                    </div>
                    <h3 className="mt-4 font-display text-3xl leading-tight">
                      {promo.label}
                    </h3>
                    <p className="mt-2 min-h-[3rem] text-[13px] leading-relaxed text-stone">
                      {promo.description ?? scopeLabel(promo)}
                    </p>
                    <dl className="mt-4 space-y-1.5 text-[11px] text-stone">
                      <div className="flex justify-between gap-4">
                        <dt>Applies to</dt>
                        <dd className="text-right text-ink">{scopeLabel(promo)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt>Minimum spend</dt>
                        <dd className="text-ink">
                          {promo.minSubtotal > 0 ? formatZAR(promo.minSubtotal) : "None"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt>Ends</dt>
                        <dd className="text-ink">
                          {promo.endsAt ? formatDate(promo.endsAt) : "While stock lasts"}
                        </dd>
                      </div>
                      {promo.maxUses ? (
                        <div className="flex justify-between gap-4">
                          <dt>Uses left</dt>
                          <dd className="text-ink">
                            {Math.max(0, promo.maxUses - promo.usedCount)}
                          </dd>
                        </div>
                      ) : null}
                    </dl>
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
                    <PromoCodeChip code={promo.code} />
                    <Link
                      href={
                        promo.scope === "SUPPLIER_KIND" && promo.scopeValue === "LOCAL"
                          ? "/collections/local"
                          : promo.scope === "SUPPLIER_KIND"
                            ? "/collections/global"
                            : "/shop"
                      }
                      className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-oxblood transition-colors hover:text-oxblood-deep"
                    >
                      Shop
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        {upcoming.length > 0 ? (
          <div className="mt-12">
            <p className="eyebrow text-stone">Coming soon</p>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {upcoming.map((promo) => (
                <li key={promo.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div>
                    <p className="font-display text-xl">{promo.label}</p>
                    <p className="text-[11px] text-stone">
                      Starts {promo.startsAt ? formatDate(promo.startsAt) : "soon"} ·{" "}
                      {scopeLabel(promo)}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-stone">
                    {formatPromoValue(promo)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-12 border border-line bg-ivory-deep/40 p-6 text-[11px] leading-relaxed text-stone">
          <p className="font-medium uppercase tracking-[0.14em] text-ink-soft">
            The fine print
          </p>
          <p className="mt-2 max-w-3xl">
            One promotional code per order. Codes cannot be combined with other
            offers, gift cards or already-reduced final-sale pieces. Minimum spend
            is calculated on the value of eligible items before delivery. We may
            end or amend an offer at any time; the code must be valid when the
            order is placed.
          </p>
        </div>
      </section>
    </>
  );
}
