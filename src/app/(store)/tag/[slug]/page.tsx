import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productInclude, toStoreProduct } from "@/lib/products";
import { ProductGrid } from "@/components/product/product-grid";
import { Reveal } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) return { title: "Edit not found" };
  return {
    title: `${tag.name} edit`,
    description:
      tag.description ??
      `Shop the ${tag.name} edit — considered pieces delivered across South Africa.`,
  };
}

export default async function TagPage({ params }: { params: Params }) {
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      products: {
        where: { status: "ACTIVE" },
        include: productInclude,
        orderBy: [{ featured: "desc" }, { rating: "desc" }],
      },
    },
  });
  if (!tag) notFound();

  const relatedTags = await prisma.tag.findMany({
    where: { slug: { not: slug } },
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
    take: 18,
  });

  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-lux py-12 sm:py-16">
          <nav className="text-[9px] uppercase tracking-[0.16em] text-stone" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-oxblood">
              Home
            </Link>
            <span className="mx-2 text-champagne">/</span>
            <Link href="/shop" className="transition-colors hover:text-oxblood">
              Shop
            </Link>
            <span className="mx-2 text-champagne">/</span>
            <span className="text-ink">Tag · {tag.name}</span>
          </nav>

          <Reveal className="mt-8 max-w-2xl">
            <p className="eyebrow text-champagne-dark">{tag.kind.toLowerCase()} edit</p>
            <h1 className="mt-4 font-display text-[clamp(3rem,7vw,5.5rem)] leading-[0.94]">
              {tag.name}
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-stone">
              {tag.description ??
                `Every piece tagged ${tag.name} across the Lovable Store atelier — curated for gifting and everyday wear.`}
            </p>
            <p className="mt-6 text-[10px] uppercase tracking-[0.18em] text-stone">
              {tag.products.length} {tag.products.length === 1 ? "piece" : "pieces"}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-lux py-10 sm:py-14">
        {tag.products.length > 0 ? (
          <ProductGrid products={tag.products.map(toStoreProduct)} priorityCount={4} />
        ) : (
          <div className="border border-line bg-cream p-10 text-center">
            <p className="font-display text-3xl">Nothing tagged yet.</p>
            <p className="mt-2 text-sm text-stone">
              This edit is being prepared. Browse everything in the meantime.
            </p>
            <Link href="/shop" className="btn-primary mt-6">
              Shop all
            </Link>
          </div>
        )}
      </section>

      <section className="border-t border-line">
        <div className="container-lux py-10">
          <p className="eyebrow text-stone">More edits</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedTags.map((related) => (
              <Link
                key={related.slug}
                href={`/tag/${related.slug}`}
                className="inline-flex min-h-10 items-center gap-2 border border-line bg-cream px-4 text-[10px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-oxblood hover:text-oxblood"
              >
                {related.name}
                <span className="text-stone">{related._count.products}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
