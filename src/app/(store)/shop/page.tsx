import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { productInclude, toStoreProduct } from "@/lib/products";
import { ProductGrid } from "@/components/product/product-grid";
import { ShopFilters, type ShopFacets } from "@/components/shop/shop-filters";
import { ShopSort } from "@/components/shop/shop-sort";
import { Reveal } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop all",
  description:
    "Browse watches, fragrance, women's and men's fashion, shoes and gifts. Local pieces delivered in 2–5 days across South Africa.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const CATEGORY_ORDER = ["Watches", "Fragrance", "Women", "Men", "Shoes", "Gifts"];
const RECIPIENT_ORDER = ["For Her", "For Him", "For Couples", "For Everyone"];

function single(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

function facetHref(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const params = new URLSearchParams();
  for (const [param, value] of Object.entries(searchParams)) {
    if (param === key || typeof value !== "string") continue;
    params.set(param, value);
  }
  return params.toString() ? `/shop?${params.toString()}` : "/shop";
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const category = single(resolved.category);
  const recipient = single(resolved.recipient);
  const source = single(resolved.source);
  const tag = single(resolved.tag);
  const max = single(resolved.max);
  const q = single(resolved.q);
  const sort = single(resolved.sort);

  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
  if (CATEGORY_ORDER.includes(category)) where.category = category;
  if (RECIPIENT_ORDER.includes(recipient)) where.recipient = recipient;
  if (tag) where.tags = { some: { slug: tag } };
  if (source === "local") {
    where.OR = [
      { supplierConnection: { kind: "LOCAL" } },
      { supplierConnectionId: null },
    ];
  } else if (source === "global") {
    where.supplierConnection = { kind: "CHINA" };
  }
  if (["500", "1000", "1500"].includes(max)) {
    where.price = { lte: Number(max) * 100 };
  }
  if (q) {
    where.AND = [
      {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { tagline: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { recipient: { contains: q, mode: "insensitive" } },
          { tags: { some: { name: { contains: q, mode: "insensitive" } } } },
        ],
      },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === "price-asc"
      ? [{ price: "asc" }]
      : sort === "price-desc"
        ? [{ price: "desc" }]
        : sort === "newest"
          ? [{ createdAt: "desc" }]
          : sort === "rating"
            ? [{ rating: "desc" }, { reviewCount: "desc" }]
            : [{ featured: "desc" }, { rating: "desc" }];

  const [
    products,
    categoryGroups,
    recipientGroups,
    localCount,
    globalCount,
    tagRecords,
    under500,
    under1000,
    under1500,
    total,
  ] = await Promise.all([
    prisma.product.findMany({ where, include: productInclude, orderBy }),
    prisma.product.groupBy({
      by: ["category"],
      where: { status: "ACTIVE" },
      _count: { _all: true },
    }),
    prisma.product.groupBy({
      by: ["recipient"],
      where: { status: "ACTIVE" },
      _count: { _all: true },
    }),
    prisma.product.count({
      where: {
        status: "ACTIVE",
        OR: [{ supplierConnection: { kind: "LOCAL" } }, { supplierConnectionId: null }],
      },
    }),
    prisma.product.count({
      where: { status: "ACTIVE", supplierConnection: { kind: "CHINA" } },
    }),
    prisma.tag.findMany({
      where: { products: { some: { status: "ACTIVE" } } },
      include: {
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
      },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    }),
    prisma.product.count({ where: { status: "ACTIVE", price: { lte: 50000 } } }),
    prisma.product.count({ where: { status: "ACTIVE", price: { lte: 100000 } } }),
    prisma.product.count({ where: { status: "ACTIVE", price: { lte: 150000 } } }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
  ]);

  const facets: ShopFacets = {
    total,
    categories: CATEGORY_ORDER.map((name) => ({
      value: name,
      label: name,
      count: categoryGroups.find((group) => group.category === name)?._count._all ?? 0,
    })).filter((facet) => facet.count > 0),
    recipients: RECIPIENT_ORDER.map((name) => ({
      value: name,
      label: name,
      count: recipientGroups.find((group) => group.recipient === name)?._count._all ?? 0,
    })).filter((facet) => facet.count > 0),
    sources: [
      { value: "local", label: "Locally sourced", count: localCount },
      { value: "global", label: "Global finds", count: globalCount },
    ].filter((facet) => facet.count > 0),
    prices: [
      { value: "500", label: "Under R500", count: under500 },
      { value: "1000", label: "Under R1000", count: under1000 },
      { value: "1500", label: "Under R1500", count: under1500 },
    ],
    tags: tagRecords.map((record) => ({
      value: record.slug,
      label: record.name,
      count: record._count.products,
    })),
  };

  const tagName = tagRecords.find((record) => record.slug === tag)?.name ?? tag;
  const activeChips = [
    category && { key: "category", label: category },
    recipient && { key: "recipient", label: recipient },
    source && { key: "source", label: source === "local" ? "Locally sourced" : "Global finds" },
    max && { key: "max", label: `Under R${Number(max).toLocaleString("en-ZA")}` },
    tag && { key: "tag", label: tagName },
    q && { key: "q", label: `Search: ${q}` },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-lux py-10 sm:py-14">
          <nav className="text-[9px] uppercase tracking-[0.16em] text-stone" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-oxblood">
              Home
            </Link>
            <span className="mx-2 text-champagne">/</span>
            <span className="text-ink">Shop</span>
          </nav>
          <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow text-champagne-dark">The collection</p>
              <h1 className="mt-3 font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.98]">
                Everything, <span className="italic text-oxblood">considered.</span>
              </h1>
              <p className="mt-4 max-w-lg text-[13px] leading-relaxed text-stone">
                Watches, scent, fashion, shoes and gifts — with the source and
                delivery time shown on every piece.
              </p>
            </div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-stone">
              {products.length} {products.length === 1 ? "piece" : "pieces"} shown
            </p>
          </div>
        </div>
      </section>

      <div className="container-lux grid gap-5 py-8 lg:grid-cols-[230px_1fr] lg:gap-12 lg:py-14">
        <ShopFilters facets={facets} />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-stone">
              {products.length} of {total} pieces
            </p>
            <ShopSort />
          </div>

          {activeChips.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <Link
                  key={chip.key}
                  href={facetHref(resolved, chip.key)}
                  className="inline-flex min-h-10 items-center gap-2 border border-line bg-cream px-3.5 text-[9px] uppercase tracking-[0.12em] text-ink transition-colors hover:border-oxblood hover:text-oxblood"
                >
                  {chip.label}
                  <span aria-hidden>×</span>
                </Link>
              ))}
              {activeChips.length > 1 ? (
                <Link
                  href="/shop"
                  className="px-2 text-[9px] uppercase tracking-[0.14em] text-stone underline-offset-4 hover:text-oxblood hover:underline"
                >
                  Clear all
                </Link>
              ) : null}
            </div>
          ) : null}

          {products.length > 0 ? (
            <div className="mt-7">
              <ProductGrid products={products.map(toStoreProduct)} columns={3} priorityCount={3} />
            </div>
          ) : (
            <Reveal>
              <div className="mt-10 border border-line bg-cream p-8 text-center sm:p-14">
                <p className="font-display text-3xl">Nothing matched that edit.</p>
                <p className="mx-auto mt-3 max-w-sm text-[12px] leading-relaxed text-stone">
                  Try a different category or price, or let the gift finder do
                  the narrowing for you.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link href="/shop" className="btn-primary">
                    Clear filters
                  </Link>
                  <Link href="/gift-finder" className="btn-outline">
                    Find their gift
                  </Link>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </>
  );
}
