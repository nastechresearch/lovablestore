import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import {
  deliveryLabel,
  imageFor,
  parseReviews,
  productInclude,
  toStoreProduct,
} from "@/lib/products";
import { promoIsLive, evaluatePromo } from "@/lib/promos";
import { buildDeliveryPlan, deliveryModeFromKinds } from "@/lib/delivery";
import { getStoreSettings } from "@/lib/settings";
import { formatDate } from "@/lib/format";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchase } from "@/components/product/product-purchase";
import { ProductAccordion } from "@/components/product/product-accordion";
import { ProductGrid } from "@/components/product/product-grid";
import { Stars } from "@/components/product/stars";
import { ReviewForm } from "@/components/product/review-form";
import { ProductStage } from "@/components/product/product-stage";
import { ArPreview } from "@/components/product/ar-preview";
import { Reveal } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: productInclude,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Piece not found" };
  const image = imageFor({
    images: (() => {
      try {
        const parsed = JSON.parse(product.images);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })(),
    slug: product.slug,
  });
  return {
    title: product.name,
    description: product.tagline ?? product.description.slice(0, 155),
    openGraph: {
      title: `${product.name} — Lovable Store`,
      description: product.tagline ?? product.description.slice(0, 155),
      images: [{ url: image }],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const record = await getProduct(slug);
  if (!record) notFound();

  const product = toStoreProduct(record);
  const primaryImage = imageFor(product);
  const legacyReviews = parseReviews(record.reviews);

  const [viewer, approvedReviews] = await Promise.all([
    getCurrentUser(),
    prisma.review.findMany({
      where: { productId: record.id, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  const displayReviews =
    approvedReviews.length > 0
      ? approvedReviews.map((review) => ({
          id: review.id,
          name: review.name,
          rating: review.rating,
          title: review.title,
          text: review.body,
          date: review.createdAt as Date | string,
          verified: review.verified,
        }))
      : legacyReviews.map((review, index) => ({
          id: `legacy-${index}`,
          name: review.name,
          rating: review.rating,
          title: review.title,
          text: review.text,
          date: review.date as Date | string,
          verified: true,
        }));

  const displayRating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / approvedReviews.length
      : product.rating;
  const displayCount = approvedReviews.length || product.reviewCount || legacyReviews.length;

  const now = new Date();
  const promoRecords = await prisma.promo.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });
  const promos = promoRecords
    .filter((promo) => promoIsLive(promo, now))
    .filter((promo) => {
      const result = evaluatePromo(
        promo,
        [
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            quantity: 1,
            category: product.category,
            tagSlugs: product.tagDetails.map((tag) => tag.slug),
            supplierConnectionId: product.supplierConnectionId,
            supplierKind: product.supplierKind,
          },
        ],
        product.price,
        0,
        now,
      );
      return result.ok;
    })
    .slice(0, 3)
    .map((promo) => ({
      code: promo.code,
      label: promo.label,
      description: promo.description,
    }));

  const settings = await getStoreSettings();
  const deliveryPlan = buildDeliveryPlan({
    mode: deliveryModeFromKinds([product.supplierKind]),
    leadTimeMin: product.leadTimeMin,
    leadTimeMax: product.leadTimeMax,
    cutoffHour: settings.dispatchCutoffHour,
    origin: product.shipsFrom,
  });

  const related = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      id: { not: product.id },
      OR: [
        { category: product.category },
        { recipient: product.recipient },
      ],
    },
    include: productInclude,
    orderBy: [{ featured: "desc" }, { rating: "desc" }],
    take: 4,
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    ...(product.barcode ? { gtin13: product.barcode } : {}),
    image: [primaryImage],
    brand: { "@type": "Brand", name: "Lovable Store" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: displayRating,
      reviewCount: displayCount,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "ZAR",
      price: (product.price / 100).toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/product/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-lux pb-24 pt-6 lg:pb-16">
        <nav
          className="text-[9px] uppercase tracking-[0.16em] text-stone"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="transition-colors hover:text-oxblood">
            Home
          </Link>
          <span className="mx-2 text-champagne">/</span>
          <Link href="/shop" className="transition-colors hover:text-oxblood">
            Shop
          </Link>
          <span className="mx-2 text-champagne">/</span>
          <Link
            href={`/shop?category=${encodeURIComponent(product.category)}`}
            className="transition-colors hover:text-oxblood"
          >
            {product.category}
          </Link>
          <span className="mx-2 text-champagne">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          <Reveal>
            <ProductGallery
              images={product.images.length > 0 ? product.images : [primaryImage]}
              name={product.name}
              badge={product.badge ?? product.promoLabel}
            />
          </Reveal>

          <div>
            <ProductPurchase
              product={product}
              primaryImage={primaryImage}
              promos={promos}
              deliveryPlan={deliveryPlan}
            />

            <div className="mt-10">
              <ProductAccordion
                items={[
                  {
                    title: "The details",
                    content: (
                      <div className="space-y-4">
                        <p>{product.description}</p>
                        <dl className="grid gap-2 text-[12px]">
                          <div className="flex justify-between gap-4 border-b border-line/70 pb-2">
                            <dt>Category</dt>
                            <dd className="text-ink">{product.category}</dd>
                          </div>
                          <div className="flex justify-between gap-4 border-b border-line/70 pb-2">
                            <dt>Gifting for</dt>
                            <dd className="text-ink">{product.recipient}</dd>
                          </div>
                          <div className="flex justify-between gap-4 border-b border-line/70 pb-2">
                            <dt>Occasion</dt>
                            <dd className="text-ink">{product.occasion}</dd>
                          </div>
                          {product.colors.length > 0 ? (
                            <div className="flex justify-between gap-4 border-b border-line/70 pb-2">
                              <dt>Colourways</dt>
                              <dd className="text-right text-ink">
                                {product.colors.join(", ")}
                              </dd>
                            </div>
                          ) : null}
                          <div className="flex justify-between gap-4">
                            <dt>Product code</dt>
                            <dd className="text-ink">{product.sku}</dd>
                          </div>
                        </dl>
                      </div>
                    ),
                  },
                  {
                    title: "Delivery & returns",
                    content: (
                      <div className="space-y-3">
                        <p>
                          Dispatched from {product.shipsFrom} with an estimated
                          delivery window of {deliveryLabel(product)}. Local
                          pieces leave our Johannesburg studio within 24 hours.
                        </p>
                        <p>
                          Complimentary delivery on orders over R950. Returns
                          accepted within 30 days in original condition; fragrance
                          must be unopened. See{" "}
                          <Link
                            href="/delivery-and-returns"
                            className="text-oxblood underline underline-offset-2"
                          >
                            delivery &amp; returns
                          </Link>
                          .
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Sourcing & care",
                    content: (
                      <div className="space-y-3">
                        <p>
                          {product.supplierKind === "LOCAL"
                            ? "Sourced from a vetted South African maker or supplier and checked by our studio before dispatch."
                            : "Sourced through our vetted global supplier network, inspected against our quality checklist and tracked end to end."}
                        </p>
                        <p>
                          Each order includes a care card. Store fragrance away
                          from direct sunlight; wipe metals with the supplied
                          cloth; hand wash delicates cold.
                        </p>
                      </div>
                    ),
                  },
                  {
                    title: "Gift wrap & message",
                    content: (
                      <p>
                        Every order arrives in signature ivory packaging with a
                        hand-tied ribbon. Add a complimentary handwritten note at
                        checkout — we&apos;ll hide the prices from the packing
                        slip.
                      </p>
                    ),
                  },
                ]}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {product.tagDetails.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tag/${tag.slug}`}
                  className="inline-flex min-h-9 items-center border border-line px-3 text-[9.5px] uppercase tracking-[0.14em] text-stone transition-colors hover:border-oxblood hover:text-oxblood"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section className="border-y border-line bg-ivory-deep/20">
        <div className="container-lux py-12 lg:py-16">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-champagne-dark">See it properly</p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl">
                An interactive look, before it arrives.
              </h2>
              <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-stone">
                Spin the piece in the studio, change the colourway, or open your camera to picture
                it in your own space.
              </p>
            </div>
            <ArPreview image={primaryImage} name={product.name} />
          </div>
          <ProductStage
            images={product.images.length > 0 ? product.images : [primaryImage]}
            name={product.name}
            colours={product.colors}
          />
        </div>
      </section>

      <section className="border-y border-line bg-cream">
        <div className="container-lux grid gap-8 py-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow text-champagne-dark">Worn &amp; loved</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">
              {displayRating.toFixed(1)}{" "}
              <span className="text-stone">/ 5</span>
            </h2>
            <Stars rating={displayRating} className="mt-3" size="size-4" />
            <p className="mt-2 text-xs text-stone">
              Based on {displayCount} review{displayCount === 1 ? "" : "s"}
              {approvedReviews.length > 0 ? " · moderated by the studio" : ""}
            </p>
            <div className="mt-6 space-y-2">
              {[5, 4, 3, 2, 1].map((score) => {
                const count = displayReviews.filter(
                  (review) => Math.round(review.rating) === score,
                ).length;
                const share =
                  displayReviews.length > 0
                    ? (count / displayReviews.length) * 100
                    : score === Math.round(displayRating)
                      ? 78
                      : 8;
                return (
                  <div key={score} className="flex items-center gap-3 text-[10px] text-stone">
                    <span className="w-3 tabular-nums">{score}</span>
                    <Star className="size-3 fill-champagne text-champagne" aria-hidden />
                    <span className="h-1 flex-1 bg-ivory-deep">
                      <span
                        className="block h-full bg-champagne"
                        style={{ width: `${Math.min(100, share)}%` }}
                      />
                    </span>
                    <span className="w-6 text-right tabular-nums">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            {displayReviews.length > 0 ? (
              <ul className="divide-y divide-line border-t border-line">
                {displayReviews.slice(0, 4).map((review) => (
                  <li key={review.id} className="py-5 first:pt-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Stars rating={review.rating} />
                      <span className="text-[10px] uppercase tracking-[0.12em] text-stone">
                        {formatDate(review.date)}
                      </span>
                    </div>
                    <p className="mt-2 font-display text-xl">{review.title}</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-stone">
                      {review.text}
                    </p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-stone">
                      {review.name}
                      {review.verified ? " · Verified purchase" : ""}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="border border-line bg-ivory p-8">
                <p className="font-display text-2xl">First to unwrap it?</p>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-stone">
                  This piece is new to the atelier. Be the first to share how it
                  felt to give or receive it.
                </p>
              </div>
            )}

            <ReviewForm
              productId={product.id}
              signedIn={Boolean(viewer)}
              name={viewer ? `${viewer.firstName} ${viewer.lastName}`.trim() : ""}
            />
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="container-lux py-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-champagne-dark">Styled together</p>
              <h2 className="mt-2 font-display text-4xl sm:text-5xl">
                You may also <span className="italic text-oxblood">love</span>
              </h2>
            </div>
            <Link
              href={`/shop?category=${encodeURIComponent(product.category)}`}
              className="btn-quiet hidden sm:inline-flex"
            >
              More {product.category.toLowerCase()}
            </Link>
          </div>
          <div className="mt-8">
            <ProductGrid
              products={related.map(toStoreProduct)}
              columns={4}
            />
          </div>
        </section>
      ) : null}
    </>
  );
}
