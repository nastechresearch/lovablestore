import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { productInclude, toStoreProduct } from "@/lib/products";
import { ProductGrid } from "@/components/product/product-grid";
import { GiftFinderQuiz } from "@/components/gift-finder/gift-finder-quiz";
import { Reveal } from "@/components/motion/reveal";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gift finder",
  description:
    "Three questions to the right gift. Tell us who it's for, the moment and your budget — we'll curate the shortlist.",
};

type SearchParams = Promise<{
  recipient?: string;
  moment?: string;
  budget?: string;
}>;

const RECIPIENTS: Record<string, string> = {
  her: "For Her",
  him: "For Him",
  couples: "For Couples",
  everyone: "For Everyone",
};

const MOMENTS: Record<string, string | null> = {
  valentines: "valentines",
  anniversary: "anniversary",
  birthday: "birthday",
  any: null,
};

const BUDGETS: Record<string, number | null> = {
  "under-500": 50000,
  "under-1000": 100000,
  "under-1500": 150000,
  any: null,
};

export default async function GiftFinderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const recipientKey = params.recipient && RECIPIENTS[params.recipient] ? params.recipient : "";
  const momentKey = params.moment && params.moment in MOMENTS ? params.moment : "";
  const budgetKey = params.budget && params.budget in BUDGETS ? params.budget : "";
  const complete = Boolean(recipientKey && momentKey && budgetKey);

  const recipient = RECIPIENTS[recipientKey];
  const momentTag = momentKey ? MOMENTS[momentKey] : null;
  const maxPrice = budgetKey ? BUDGETS[budgetKey] : null;

  let products: Awaited<ReturnType<typeof fetchProducts>> = [];

  async function fetchProducts(filters: {
    recipient?: string;
    momentTag?: string | null;
    maxPrice?: number | null;
  }) {
    const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
    if (filters.recipient) where.recipient = filters.recipient;
    if (filters.momentTag) where.tags = { some: { slug: filters.momentTag } };
    if (filters.maxPrice) where.price = { lte: filters.maxPrice };
    return prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: [{ featured: "desc" }, { rating: "desc" }],
      take: 8,
    });
  }

  if (complete) {
    products = await fetchProducts({ recipient, momentTag, maxPrice });
    if (products.length < 3) {
      products = await fetchProducts({ recipient, maxPrice });
    }
    if (products.length < 3) {
      products = await fetchProducts({ maxPrice });
    }
  }

  const alternatives = complete
    ? await prisma.product.findMany({
        where: { status: "ACTIVE", id: { notIn: products.map((product) => product.id) } },
        include: productInclude,
        orderBy: [{ featured: "desc" }, { rating: "desc" }],
        take: 4,
      })
    : [];

  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-lux py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="eyebrow text-champagne-dark">The gift finder</p>
              <h1 className="mt-4 font-display text-[clamp(2.9rem,6.5vw,5.2rem)] leading-[0.94]">
                Three questions.
                <br />
                <span className="italic text-oxblood">One they&apos;ll keep.</span>
              </h1>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-stone">
                Who it&apos;s for, what you&apos;re marking and what feels right to
                spend. We&apos;ll do the rest — no account, no endless scrolling.
              </p>
            </div>
            <Reveal className="hidden lg:block" delay={0.08}>
              <div className="relative ml-auto aspect-[4/5] w-full max-w-sm overflow-hidden bg-ivory-deep">
                <Image
                  src="/images/editorial/editorial-perfume.jpg"
                  alt="A thoughtful fragrance gift"
                  fill
                  priority
                  sizes="(max-width: 1024px) 0px, 380px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                <p className="absolute bottom-5 left-5 font-display text-2xl italic text-white">
                  Chosen with intent.
                </p>
              </div>
            </Reveal>
          </div>

          <div className="mt-10 max-w-3xl">
            <GiftFinderQuiz
              initial={{
                recipient: recipientKey,
                moment: momentKey,
                budget: budgetKey,
              }}
              complete={complete}
            />
          </div>
        </div>
      </section>

      {complete ? (
        <section id="shortlist" className="container-lux scroll-mt-24 py-12 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-champagne-dark">Their shortlist</p>
              <h2 className="mt-2 font-display text-[clamp(2.3rem,4.8vw,3.8rem)] leading-[1]">
                We think they&apos;ll <span className="italic text-oxblood">love</span> these.
              </h2>
            </div>
            <Link href="/shop" className="btn-quiet">
              Browse everything
            </Link>
          </div>

          <div className="mt-8">
            {products.length > 0 ? (
              <ProductGrid products={products.map(toStoreProduct)} priorityCount={4} />
            ) : (
              <div className="border border-line bg-cream p-10 text-center">
                <p className="font-display text-3xl">Nothing fits all three answers yet.</p>
                <p className="mt-2 text-sm text-stone">
                  Try a higher budget or &ldquo;just because&rdquo; to see the wider edit.
                </p>
                <Link href="/shop" className="btn-primary mt-6">
                  Shop all gifts
                </Link>
              </div>
            )}
          </div>

          {alternatives.length > 0 ? (
            <div className="mt-14 border-t border-line pt-10">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-stone">If you want options</p>
                  <h3 className="mt-2 font-display text-3xl">Worth a second look</h3>
                </div>
                <Link
                  href="/gift-finder"
                  className="text-[10px] uppercase tracking-[0.14em] text-oxblood hover:underline"
                >
                  Start again
                </Link>
              </div>
              <div className="mt-6">
                <ProductGrid products={alternatives.map(toStoreProduct)} columns={4} priorityCount={0} />
              </div>
            </div>
          ) : null}
        </section>
      ) : (
        <section className="container-lux py-12">
          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-line py-6">
            <p className="text-[11px] uppercase tracking-[0.14em] text-stone">
              Or browse by moment
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Valentine's", href: "/valentines" },
                { label: "Under R500", href: "/collections/under-500" },
                { label: "Local makers", href: "/collections/local" },
                { label: "Gift-ready", href: "/tag/gift-ready" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex min-h-9 items-center border border-line px-3 text-[9.5px] uppercase tracking-[0.14em] text-stone transition-colors hover:border-oxblood hover:text-oxblood"
                >
                  {link.label}
                  <ArrowRight className="ml-1.5 size-3" aria-hidden />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
