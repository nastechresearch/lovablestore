import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import {
  productInclude,
  toStoreProduct,
  type ProductWithRelations,
} from "@/lib/products";
import { promoIsLive } from "@/lib/promos";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { CategoryRail } from "@/components/home/category-rail";
import { SectionHeading } from "@/components/home/section-heading";
import { RecipientCards } from "@/components/home/recipient-cards";
import { ProductGrid } from "@/components/product/product-grid";
import { PromoStrip } from "@/components/promo/promo-strip";
import { SourceStrip } from "@/components/home/source-strip";
import { MarketplaceShowcase } from "@/components/home/marketplace-showcase";
import { BrandFilm } from "@/components/home/brand-film";
import { ValentinesBanner } from "@/components/home/valentines-banner";
import { CategoryGrid } from "@/components/home/category-grid";
import { Promises } from "@/components/home/promises";
import { SupplierSpotlight } from "@/components/home/supplier-spotlight";
import { BulkQuoteCta } from "@/components/home/bulk-quote-cta";
import { GiftFinderCta } from "@/components/home/gift-finder-cta";
import { MzansiMoments } from "@/components/home/mzansi-moments";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Lovable Store — Where magic gift starts from" },
  description:
    "Watches, fragrance, fashion, shoes and keepsakes for her, for him and for couples. Locally sourced in South Africa, wrapped by hand and delivered nationwide.",
};

function curate(products: ProductWithRelations[]): ProductWithRelations[] {
  const picks: ProductWithRelations[] = [];
  const perCategory = new Map<string, number>();

  for (const product of products) {
    const count = perCategory.get(product.category) ?? 0;
    if (count < 2) {
      picks.push(product);
      perCategory.set(product.category, count + 1);
    }
  }
  for (const product of products) {
    if (picks.length >= 8) break;
    if (!picks.includes(product)) picks.push(product);
  }
  return picks.slice(0, 8);
}

export default async function HomePage() {
  const [featured, promoRecords] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true, status: "ACTIVE" },
      include: productInclude,
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    }),
    prisma.promo.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
      take: 6,
    }),
  ]);

  const bestsellers = curate(featured).map(toStoreProduct);
  const heroProducts = bestsellers.slice(0, 4);
  const promos = promoRecords.filter((promo) => promoIsLive(promo)).slice(0, 3);

  return (
    <>
      <Hero products={heroProducts} />
      <Marquee />
      <CategoryRail />

      <section className="container-lux py-12 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow="The gifting edit"
          title={
            <>
              Who are we shopping for?
            </>
          }
          description="Three edits, one standard. Pieces chosen to be worn, used and kept — not just unwrapped."
          href="/shop"
          linkLabel="Shop everything"
        />
        <div className="mt-9 lg:mt-12">
          <RecipientCards />
        </div>
      </section>

      <section className="bg-ivory-deep/40">
        <div className="container-lux py-12 sm:py-20 lg:py-24">
          <SectionHeading
            eyebrow="Most gifted"
            title={
              <>
                The pieces that keep
                <br className="hidden sm:block" /> leaving the studio.
              </>
            }
            description="Our most-reordered gifts, from quiet everyday watches to the fragrance everyone asks about."
            href="/collections/bestsellers"
            linkLabel="All bestsellers"
          />
          {promos.length > 0 ? (
            <div className="mt-8">
              <PromoStrip promos={promos} />
            </div>
          ) : null}
          <div className="mt-9 lg:mt-12">
            <ProductGrid products={bestsellers} priorityCount={2} />
          </div>
        </div>
      </section>

      <section className="container-lux py-12 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow="Where it comes from"
          title="Local first. Global when it's worth the wait."
          description="Two sources, clearly labelled on every product. You always know where it ships from and how long it will take."
        />
        <div className="mt-9 lg:mt-12">
          <SourceStrip />
        </div>
      </section>

      <MarketplaceShowcase />

      <BrandFilm />

      <MzansiMoments />

      <section className="container-lux pb-12 sm:pb-20 lg:pb-24">
        <ValentinesBanner />
      </section>

      <section className="container-lux pb-12 sm:pb-20 lg:pb-24">
        <SectionHeading
          eyebrow="The full wardrobe"
          title="Every corner, considered."
          description="From the watch on his wrist to the scent she keeps on the dresser. Browse the whole house."
          href="/shop"
          linkLabel="Shop all categories"
        />
        <div className="mt-9 lg:mt-12">
          <CategoryGrid />
        </div>
      </section>

      <section className="container-lux pb-12 sm:pb-20 lg:pb-24">
        <Promises />
      </section>

      <SupplierSpotlight />

      <BulkQuoteCta />

      <section className="container-lux pb-12 sm:pb-20 lg:pb-24">
        <GiftFinderCta />
      </section>
    </>
  );
}
