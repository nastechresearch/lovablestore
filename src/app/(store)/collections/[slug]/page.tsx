import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { productInclude, toStoreProduct } from "@/lib/products";
import { COLLECTIONS, COLLECTION_LINKS } from "@/lib/collections";
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
  const collection = COLLECTIONS[slug];
  if (!collection) return { title: "Collection" };
  return {
    title: collection.eyebrow,
    description: collection.description,
  };
}

export default async function CollectionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const collection = COLLECTIONS[slug];
  if (!collection) notFound();

  const query = collection.query;
  const where: Prisma.ProductWhereInput = { status: "ACTIVE" };
  if (query.category) where.category = query.category;
  if (query.recipient) where.recipient = query.recipient;
  if (query.tag) where.tags = { some: { slug: query.tag } };
  if (query.maxPrice) where.price = { lte: query.maxPrice };
  if (query.source === "local") {
    where.OR = [
      { supplierConnection: { kind: "LOCAL" } },
      { supplierConnectionId: null },
    ];
  } else if (query.source === "global") {
    where.supplierConnection = { kind: "CHINA" };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    query.sort === "rating"
      ? [{ rating: "desc" }, { reviewCount: "desc" }]
      : query.sort === "newest"
        ? [{ createdAt: "desc" }]
        : [{ featured: "desc" }, { rating: "desc" }];

  const products = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy,
  });

  const others = COLLECTION_LINKS.filter((link) => link.href !== `/collections/${slug}`);

  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-lux py-10 sm:py-14 lg:py-16">
          <nav className="text-[9px] uppercase tracking-[0.16em] text-stone" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-oxblood">
              Home
            </Link>
            <span className="mx-2 text-champagne">/</span>
            <Link href="/shop" className="transition-colors hover:text-oxblood">
              Shop
            </Link>
            <span className="mx-2 text-champagne">/</span>
            <span className="text-ink">{collection.eyebrow}</span>
          </nav>

          <div className="mt-7 grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
            <Reveal className="lg:col-span-6">
              <p className="eyebrow text-champagne-dark">{collection.note}</p>
              <h1 className="mt-4 font-display text-[clamp(2.8rem,6.5vw,5.2rem)] leading-[0.95]">
                {collection.title}
                {collection.accent ? (
                  <>
                    {" "}
                    <span className="italic text-oxblood">{collection.accent}</span>
                  </>
                ) : null}
              </h1>
              <p className="mt-5 max-w-md text-[13px] leading-relaxed text-stone">
                {collection.description}
              </p>
              <p className="mt-6 text-[10px] uppercase tracking-[0.18em] text-stone">
                {products.length} {products.length === 1 ? "piece" : "pieces"} in this edit
              </p>
            </Reveal>

            <Reveal className="lg:col-span-6" delay={0.08}>
              <div className="relative ml-auto aspect-[16/11] w-full overflow-hidden bg-ivory-deep lg:max-w-xl">
                <Image
                  src={collection.image}
                  alt={collection.eyebrow}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                <p className="absolute bottom-4 left-5 font-display text-xl italic text-white sm:text-2xl">
                  {collection.note}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="container-lux py-10 sm:py-14">
        {products.length > 0 ? (
          <ProductGrid products={products.map(toStoreProduct)} priorityCount={4} />
        ) : (
          <div className="border border-line bg-cream p-10 text-center">
            <p className="font-display text-3xl">This edit is being restyled.</p>
            <p className="mt-2 text-sm text-stone">
              Check back shortly, or browse the full collection.
            </p>
            <Link href="/shop" className="btn-primary mt-6">
              Shop everything
            </Link>
          </div>
        )}
      </section>

      <section className="border-t border-line">
        <div className="container-lux py-10">
          <p className="eyebrow text-stone">Keep exploring</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {others.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-10 items-center border border-line bg-cream px-4 text-[10px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-oxblood hover:text-oxblood"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
