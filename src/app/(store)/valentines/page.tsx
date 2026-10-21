import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, Heart, Sparkles, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { productInclude, toStoreProduct } from "@/lib/products";
import { promoIsLive } from "@/lib/promos";
import { ProductGrid } from "@/components/product/product-grid";
import { PromoCodeChip } from "@/components/promo/promo-code-chip";
import { ValentinesCountdown } from "@/components/valentines/valentines-countdown";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeadline } from "@/components/motion/split-headline";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Valentine's gifts",
  description:
    "Valentine's gifts for him, her and couples — watches, fragrance, jewellery and ready-to-give edits delivered across South Africa with complimentary gift wrap.",
};

const RECIPIENTS = [
  {
    title: "For her",
    copy: "Gold-tone watches, silk slips and scents she'll wear long after the day.",
    href: "/shop?tag=valentines&recipient=For+Her",
    image: "/images/editorial/hero-woman.jpg",
  },
  {
    title: "For him",
    copy: "Chronographs, leather and fragrance with quiet confidence.",
    href: "/shop?tag=valentines&recipient=For+Him",
    image: "/images/editorial/editorial-watch.jpg",
  },
  {
    title: "For couples",
    copy: "Matching pieces and shared rituals for the two of you.",
    href: "/shop?tag=valentines&recipient=For+Couples",
    image: "/images/editorial/editorial-couple.jpg",
  },
];

export default async function ValentinesPage() {
  const now = new Date();
  const [products, promos] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ tags: { some: { slug: "valentines" } } }, { occasion: "Valentine's" }],
      },
      include: productInclude,
      orderBy: [{ featured: "desc" }, { rating: "desc" }],
      take: 8,
    }),
    prisma.promo.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const live = promos.filter((promo) => promoIsLive(promo, now)).slice(0, 2);

  return (
    <>
      <section className="relative overflow-hidden bg-oxblood-deep text-ivory">
        <div className="absolute inset-0">
          <Image
            src="/images/editorial/hero-gifts.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-oxblood-deep via-oxblood-deep/92 to-oxblood/40" />
        </div>
        <div className="container-lux relative py-14 sm:py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="eyebrow flex items-center gap-2 text-champagne">
                <Heart className="size-3.5 fill-champagne" aria-hidden />
                14 February · The love edit
              </p>
              <h1 className="mt-5 font-display text-[clamp(3.2rem,8vw,6.4rem)] leading-[0.9]">
                <SplitHeadline text="Say it with" />
                <br />
                <span className="italic text-champagne">
                  <SplitHeadline text="something they keep." />
                </span>
              </h1>
              <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/70">
                Watches, fragrance, silk and small tokens of devotion — wrapped
                by hand, delivered across South Africa with a note in your words.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#edit"
                  className="inline-flex min-h-12 items-center gap-2 border border-champagne px-7 text-[10px] font-medium uppercase tracking-[0.18em] text-champagne transition-colors hover:bg-champagne hover:text-ink"
                >
                  Shop the love edit
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
                <Link
                  href="/gift-finder"
                  className="inline-flex min-h-12 items-center gap-2 border border-ivory/25 px-7 text-[10px] font-medium uppercase tracking-[0.18em] text-ivory/80 transition-colors hover:border-ivory hover:text-ivory"
                >
                  <Sparkles className="size-3.5" aria-hidden />
                  Find their gift
                </Link>
              </div>
            </div>

            <div className="lg:justify-self-end">
              <ValentinesCountdown />
              {live.length > 0 ? (
                <div className="mt-6">
                  <p className="text-[9px] uppercase tracking-[0.18em] text-ivory/50">
                    Use a code at checkout
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {live.map((promo) => (
                      <PromoCodeChip key={promo.id} code={promo.code} tone="dark" />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-cream">
        <div className="container-lux grid gap-4 py-8 sm:grid-cols-3">
          {[
            { icon: Gift, title: "Complimentary gift wrap", copy: "Ribbon, ivory box and a handwritten note." },
            { icon: Heart, title: "Hidden prices", copy: "Packing slips never show what you spent." },
            { icon: Truck, title: "Delivered on time", copy: "Order by 10 Feb for standard nationwide delivery." },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <item.icon className="mt-0.5 size-4 shrink-0 text-champagne-dark" aria-hidden />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.14em]">{item.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-stone">{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="edit" className="container-lux scroll-mt-24 py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow text-champagne-dark">The Valentine&apos;s edit</p>
            <h2 className="mt-2 font-display text-[clamp(2.4rem,5vw,4rem)] leading-[0.98]">
              Gifts with a <span className="italic text-oxblood">heartbeat</span>
            </h2>
          </div>
          <Link href="/shop?tag=valentines" className="btn-quiet">
            View all love gifts
          </Link>
        </div>
        <div className="mt-8">
          {products.length > 0 ? (
            <ProductGrid products={products.map(toStoreProduct)} priorityCount={4} />
          ) : (
            <p className="border border-line bg-cream p-8 text-sm text-stone">
              The love edit is being restyled. Browse{" "}
              <Link href="/collections/gifts" className="text-oxblood underline underline-offset-2">
                all gifts
              </Link>{" "}
              in the meantime.
            </p>
          )}
        </div>
      </section>

      <section className="container-lux pb-12 sm:pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {RECIPIENTS.map((card, index) => (
            <Reveal key={card.title} delay={index * 0.06}>
              <Link href={card.href} className="group relative block aspect-[4/5] overflow-hidden bg-ivory-deep md:aspect-[3/4]">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="font-display text-3xl">{card.title}</p>
                  <p className="mt-2 max-w-[28ch] text-[11px] leading-relaxed text-white/70">
                    {card.copy}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-champagne">
                    Shop the edit
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-cream">
        <div className="container-lux flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow text-champagne-dark">Not sure what to choose?</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">
              Let the gift finder decide.
            </h2>
          </div>
          <Link href="/gift-finder" className="btn-primary">
            Answer three questions
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
