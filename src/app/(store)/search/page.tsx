import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  SearchX,
  SlidersHorizontal,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { productInclude, toStoreProduct, type StoreProduct } from "@/lib/products";
import { ProductGrid } from "@/components/product/product-grid";
import { CATEGORY_META } from "@/lib/constants";
import { COLLECTIONS } from "@/lib/collections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search watches, fragrance, fashion and ready-to-give gifts at Lovable Store.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  q?: string | string[];
  category?: string | string[];
  recipient?: string | string[];
  sort?: string | string[];
}>;

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest first" },
] as const;

type Sort = (typeof SORT_OPTIONS)[number]["value"];

const RECIPIENT_ORDER = [
  "For Her",
  "For Him",
  "For Couples",
  "For Everyone",
] as const;

const EDIT_SLUGS = ["for-her", "for-him", "gifts", "under-500"] as const;

const POPULAR_SEARCHES = [
  { label: "watch", href: "/search?q=watch" },
  { label: "perfume", href: "/collections/fragrance" },
  { label: "gift for him", href: "/collections/for-him" },
  { label: "under R500", href: "/collections/under-500" },
  { label: "oud", href: "/search?q=oud" },
  { label: "new in", href: "/collections/new" },
] as const;

type Facet = { value: string; label: string; count: number };

function single(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

function parseSort(value: string): Sort {
  switch (value) {
    case "price-asc":
    case "price-desc":
    case "newest":
      return value;
    default:
      return "featured";
  }
}

function searchHref({
  q = "",
  category = "",
  recipient = "",
  sort = "featured",
}: {
  q?: string;
  category?: string;
  recipient?: string;
  sort?: Sort;
}): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (recipient) params.set("recipient", recipient);
  if (sort !== "featured") params.set("sort", sort);
  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

function orderFacets(facets: Facet[], order: readonly string[]): Facet[] {
  return [...facets].sort((a, b) => {
    const aIndex = order.indexOf(a.value);
    const bIndex = order.indexOf(b.value);
    const aRank = aIndex === -1 ? order.length : aIndex;
    const bRank = bIndex === -1 ? order.length : bIndex;
    return aRank - bRank || a.label.localeCompare(b.label);
  });
}

function PopularSearches({
  title = "Popular searches",
  centered = false,
}: {
  title?: string;
  centered?: boolean;
}) {
  return (
    <div>
      <p
        className={`text-[9px] font-semibold uppercase tracking-[0.2em] text-stone ${
          centered ? "text-center" : ""
        }`}
      >
        {title}
      </p>
      <ul
        className={`mt-3 flex flex-wrap gap-2 ${centered ? "justify-center" : ""}`}
      >
        {POPULAR_SEARCHES.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              className="inline-flex min-h-9 items-center border border-line bg-cream px-3 text-[9.5px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-oxblood hover:text-oxblood"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const q = single(resolved.q).trim().replace(/\s+/g, " ").slice(0, 80);
  const rawCategory = single(resolved.category).trim();
  const rawRecipient = single(resolved.recipient).trim();
  const sort = parseSort(single(resolved.sort));

  const [categoryGroups, recipientGroups] = await Promise.all([
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
  ]);

  const categoryFacets = orderFacets(
    categoryGroups.map((group) => ({
      value: group.category,
      label: group.category,
      count: group._count._all,
    })),
    Object.keys(CATEGORY_META),
  );
  const recipientFacets = orderFacets(
    recipientGroups.map((group) => ({
      value: group.recipient,
      label: group.recipient,
      count: group._count._all,
    })),
    RECIPIENT_ORDER,
  );

  const category = categoryFacets.some((facet) => facet.value === rawCategory)
    ? rawCategory
    : "";
  const recipient = recipientFacets.some((facet) => facet.value === rawRecipient)
    ? rawRecipient
    : "";

  const hasQuery = q.length > 0;
  const hasFilters = Boolean(category || recipient);
  const isLanding = !hasQuery && !hasFilters;
  const hasActiveState = hasQuery || hasFilters || sort !== "featured";
  const activeTotal = categoryFacets.reduce((sum, facet) => sum + facet.count, 0);

  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
  if (category) where.category = category;
  if (recipient) where.recipient = recipient;
  if (q) {
    where.AND = [
      {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { tagline: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
          { recipient: { contains: q, mode: "insensitive" } },
          { occasion: { contains: q, mode: "insensitive" } },
          { tags: { some: { name: { contains: q, mode: "insensitive" } } } },
        ],
      },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    sort === "price-asc"
      ? [{ price: "asc" }, { name: "asc" }]
      : sort === "price-desc"
        ? [{ price: "desc" }, { name: "asc" }]
        : sort === "newest"
          ? [{ createdAt: "desc" }]
          : [{ featured: "desc" }, { rating: "desc" }, { createdAt: "desc" }];

  let products: StoreProduct[] = [];
  let total = 0;
  let bestsellers: StoreProduct[] = [];

  if (isLanding) {
    const records = await prisma.product.findMany({
      where: { status: "ACTIVE", featured: true },
      include: productInclude,
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      take: 4,
    });
    bestsellers = records.map(toStoreProduct);
  } else {
    const [records, count] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy,
        take: 24,
      }),
      prisma.product.count({ where }),
    ]);
    products = records.map(toStoreProduct);
    total = count;
  }

  const activeChips: { key: string; label: string; href: string }[] = [];
  if (hasQuery) {
    activeChips.push({
      key: "q",
      label: `Search: “${q}”`,
      href: searchHref({ category, recipient, sort }),
    });
  }
  if (category) {
    activeChips.push({
      key: "category",
      label: category,
      href: searchHref({ q, recipient, sort }),
    });
  }
  if (recipient) {
    activeChips.push({
      key: "recipient",
      label: recipient,
      href: searchHref({ q, category, sort }),
    });
  }

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
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span className="text-ink">Search</span>
          </nav>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-end">
            <div>
              <p className="eyebrow text-champagne-dark">Find the one</p>
              <h1 className="mt-3 font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.98]">
                Search the <span className="italic text-oxblood">atelier.</span>
              </h1>
              <p className="mt-4 max-w-lg text-[13px] leading-relaxed text-stone">
                Names, categories, occasions or a half-formed idea — start with
                a word and we&apos;ll narrow the edit.
              </p>
            </div>

            <form
              method="get"
              action="/search"
              role="search"
              aria-label="Product search"
              className="w-full"
            >
              <label htmlFor="search-q" className="label">
                What are you looking for?
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone"
                    aria-hidden
                  />
                  <input
                    id="search-q"
                    name="q"
                    type="search"
                    defaultValue={q}
                    placeholder="Watch, oud, silk, gift under R500…"
                    autoComplete="off"
                    className="field pl-11"
                  />
                </div>
                <button type="submit" className="btn-primary shrink-0 px-7">
                  Search
                </button>
              </div>
              {category ? (
                <input type="hidden" name="category" value={category} />
              ) : null}
              {recipient ? (
                <input type="hidden" name="recipient" value={recipient} />
              ) : null}
              {sort !== "featured" ? (
                <input type="hidden" name="sort" value={sort} />
              ) : null}
              <div className="mt-3 flex min-h-5 flex-wrap items-center justify-between gap-2">
                <p className="text-[9px] uppercase tracking-[0.14em] text-stone">
                  Search by name, category or occasion
                </p>
                {hasActiveState ? (
                  <Link
                    href={searchHref({})}
                    className="text-[9px] uppercase tracking-[0.14em] text-oxblood underline-offset-4 hover:underline"
                  >
                    Clear all
                  </Link>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="container-lux grid gap-8 py-10 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12 lg:py-14">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <form
            method="get"
            action="/search"
            className="surface-card surface-grid p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em]">
                <SlidersHorizontal className="size-3.5 text-oxblood" aria-hidden />
                Refine
              </p>
              {hasActiveState ? (
                <Link
                  href={searchHref({})}
                  className="text-[9px] uppercase tracking-[0.14em] text-oxblood underline-offset-4 hover:underline"
                >
                  Clear all
                </Link>
              ) : null}
            </div>

            <input type="hidden" name="q" value={q} />

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <label htmlFor="filter-category" className="label">
                  Category
                </label>
                <select
                  id="filter-category"
                  name="category"
                  defaultValue={category}
                  className="field"
                >
                  <option value="">All categories</option>
                  {categoryFacets.map((facet) => (
                    <option key={facet.value} value={facet.value}>
                      {facet.label} ({facet.count})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-recipient" className="label">
                  Recipient
                </label>
                <select
                  id="filter-recipient"
                  name="recipient"
                  defaultValue={recipient}
                  className="field"
                >
                  <option value="">Everyone</option>
                  {recipientFacets.map((facet) => (
                    <option key={facet.value} value={facet.value}>
                      {facet.label} ({facet.count})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-1">
                <label htmlFor="filter-sort" className="label">
                  Sort by
                </label>
                <select
                  id="filter-sort"
                  name="sort"
                  defaultValue={sort}
                  className="field"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary mt-5 w-full">
              Apply filters
            </button>

            <p className="mt-4 border-t border-line pt-4 text-[9px] uppercase tracking-[0.14em] text-stone">
              {activeTotal} active {activeTotal === 1 ? "piece" : "pieces"} in the
              collection
            </p>
          </form>
        </aside>

        <div>
          {isLanding ? (
            <div>
              <section aria-labelledby="edits-heading">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow text-champagne-dark">A way in</p>
                    <h2
                      id="edits-heading"
                      className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] leading-tight"
                    >
                      Start with an{" "}
                      <span className="italic text-oxblood">edit.</span>
                    </h2>
                  </div>
                  <p className="max-w-xs text-[11px] leading-relaxed text-stone">
                    Four short routes into the collection — by recipient, moment
                    and price.
                  </p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {EDIT_SLUGS.map((slug, index) => {
                    const edit = COLLECTIONS[slug];
                    return (
                      <Link
                        key={slug}
                        href={`/collections/${edit.slug}`}
                        className="group surface-card surface-grid flex min-h-48 flex-col justify-between p-5 transition-colors hover:border-oxblood"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[9px] uppercase tracking-[0.2em] text-stone">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <ArrowUpRight
                            className="size-4 text-stone transition-colors group-hover:text-oxblood"
                            aria-hidden
                          />
                        </div>
                        <div className="mt-8">
                          <p className="eyebrow text-champagne-dark">
                            {edit.eyebrow}
                          </p>
                          <p className="mt-2 font-display text-2xl leading-tight">
                            {edit.title}{" "}
                            {edit.accent ? (
                              <span className="italic text-oxblood">
                                {edit.accent}
                              </span>
                            ) : null}
                          </p>
                          <p className="line-clamp-2 mt-2 text-[11px] leading-relaxed text-stone">
                            {edit.description}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </section>

              <div className="mt-8 border-t border-line pt-6">
                <PopularSearches />
              </div>

              {bestsellers.length > 0 ? (
                <section aria-labelledby="bestsellers-heading" className="mt-12">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="eyebrow text-champagne-dark">Most gifted</p>
                      <h2
                        id="bestsellers-heading"
                        className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] leading-tight"
                      >
                        The ones that{" "}
                        <span className="italic text-oxblood">
                          keep leaving.
                        </span>
                      </h2>
                    </div>
                    <Link
                      href="/collections/bestsellers"
                      className="inline-flex min-h-11 items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-oxblood underline-offset-4 hover:underline"
                    >
                      The bestseller edit
                      <ArrowRight className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                  <div className="mt-6">
                    <ProductGrid
                      products={bestsellers}
                      columns={4}
                      priorityCount={4}
                    />
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-champagne-dark">
                    {hasQuery ? "Search results" : "The filtered edit"}
                  </p>
                  <h2 className="mt-2 font-display text-[clamp(2rem,4vw,3rem)] leading-tight">
                    {total} {total === 1 ? "piece" : "pieces"}
                    {hasQuery ? (
                      <>
                        {" "}
                        for{" "}
                        <span className="italic text-oxblood">“{q}”</span>
                      </>
                    ) : null}
                  </h2>
                </div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-stone">
                  {products.length < total
                    ? `Showing first ${products.length}`
                    : "All results shown"}
                </p>
              </div>

              {activeChips.length > 0 ? (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-line pb-4">
                  {activeChips.map((chip) => (
                    <Link
                      key={chip.key}
                      href={chip.href}
                      aria-label={`Remove ${chip.label}`}
                      className="inline-flex min-h-8 items-center gap-2 border border-line bg-cream px-3 text-[9px] uppercase tracking-[0.12em] text-ink transition-colors hover:border-oxblood hover:text-oxblood"
                    >
                      <span className="max-w-[16rem] truncate">{chip.label}</span>
                      <span aria-hidden>×</span>
                    </Link>
                  ))}
                  {activeChips.length > 1 ? (
                    <Link
                      href={searchHref({})}
                      className="px-2 text-[9px] uppercase tracking-[0.14em] text-stone underline-offset-4 hover:text-oxblood hover:underline"
                    >
                      Clear all
                    </Link>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 border-b border-line" />
              )}

              {total > 0 ? (
                <div className="mt-7">
                  <ProductGrid
                    products={products}
                    columns={3}
                    priorityCount={3}
                  />
                </div>
              ) : (
                <div className="surface-card surface-grid mt-6 px-6 py-14 text-center sm:px-12">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-line bg-ivory-deep">
                    <SearchX className="size-5 text-oxblood" aria-hidden />
                  </div>
                  <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3rem)] leading-tight">
                    No matches{" "}
                    <span className="italic text-oxblood">this time.</span>
                  </h2>
                  <p className="mx-auto mt-3 max-w-md text-[12px] leading-relaxed text-stone">
                    {hasQuery ? (
                      <>
                        Nothing in the current edit matches “{q}”
                        {category ? ` in ${category}` : ""}
                        {recipient ? ` for ${recipient}` : ""}. Try a shorter
                        word, a different category, or one of the routes below.
                      </>
                    ) : (
                      "That combination is a little too narrow. Loosen a filter or start from one of the routes below."
                    )}
                  </p>

                  <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
                    <Link href="/search" className="btn-primary">
                      Start again
                    </Link>
                    <Link href="/gift-finder" className="btn-outline">
                      Let the gift finder help
                    </Link>
                  </div>

                  <div className="mx-auto mt-8 max-w-lg border-t border-line pt-6">
                    <PopularSearches title="Try instead" centered />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
