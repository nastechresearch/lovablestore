import Link from "next/link";
import Image from "next/image";
import { Plus, Search, TrendingDown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { formatZAR } from "@/lib/format";
import { imageFor, needsPlainImage, parseImages } from "@/lib/products";
import { AdminHeading, EmptyState, StatusBadge } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string; q?: string; category?: string }>;

const STATUSES = ["ACTIVE", "DRAFT", "ARCHIVED"];
const CATEGORIES = ["Watches", "Fragrance", "Women", "Men", "Shoes", "Gifts"];

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status = params.status && STATUSES.includes(params.status) ? params.status : "";
  const category = params.category && CATEGORIES.includes(params.category) ? params.category : "";
  const q = params.q?.trim() ?? "";

  const where: Prisma.ProductWhereInput = {};
  if (status) where.status = status;
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { tagline: { contains: q, mode: "insensitive" } },
      { supplier: { contains: q, mode: "insensitive" } },
    ];
  }

  const [products, total, active, lowStock, groups] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { tags: true, supplierConnection: true },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 150,
    }),
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.product.count({ where: { status: "ACTIVE", stock: { lte: 8 } } }),
    prisma.product.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const countFor = (value: string) =>
    groups.find((group) => group.status === value)?._count._all ?? 0;

  return (
    <div className="space-y-6">
      <AdminHeading
        eyebrow="Catalogue"
        title="Products"
        description={`${total} pieces in the atelier. ${active} live, ${lowStock} running low. Edit pricing, imagery, tags and supplier sourcing.`}
        action={
          <>
            <form method="get" className="flex gap-2">
              {status ? <input type="hidden" name="status" value={status} /> : null}
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-stone" aria-hidden />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Name, SKU, supplier…"
                  className="field min-h-10 w-52 py-1.5 pl-9 text-[11px]"
                />
              </div>
              <button type="submit" className="btn-outline min-h-10 px-4 text-[9px]">Search</button>
            </form>
            <Link href="/admin/products/new" className="btn-primary min-h-10 px-4 text-[9px]">
              <Plus className="size-3.5" aria-hidden />
              New piece
            </Link>
          </>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        <Link
          href="/admin/products"
          className={`inline-flex min-h-9 items-center gap-2 border px-3 text-[9px] uppercase tracking-[0.12em] transition-colors ${
            !status ? "border-ink bg-ink text-ivory" : "border-line bg-cream text-stone hover:border-ink"
          }`}
        >
          All <span className="opacity-60">{total}</span>
        </Link>
        {STATUSES.map((value) => (
          <Link
            key={value}
            href={`/admin/products?status=${value}`}
            className={`inline-flex min-h-9 items-center gap-2 border px-3 text-[9px] uppercase tracking-[0.12em] transition-colors ${
              status === value ? "border-ink bg-ink text-ivory" : "border-line bg-cream text-stone hover:border-ink"
            }`}
          >
            {value} <span className="opacity-60">{countFor(value)}</span>
          </Link>
        ))}
        <span className="mx-1 hidden w-px bg-line sm:block" />
        {CATEGORIES.map((value) => (
          <Link
            key={value}
            href={`/admin/products?category=${encodeURIComponent(value)}`}
            className={`inline-flex min-h-9 items-center border px-3 text-[9px] uppercase tracking-[0.12em] transition-colors ${
              category === value ? "border-ink bg-ink text-ivory" : "border-line bg-cream text-stone hover:border-ink"
            }`}
          >
            {value}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Nothing in this rail."
          copy={q ? "No pieces match that search. Try a different name or SKU." : "Add your first piece, or import one from a supplier connection."}
          action={
            <>
              <Link href="/admin/products/new" className="btn-primary min-h-10 px-4 text-[9px]">Add a piece</Link>
              <Link href="/admin/suppliers" className="btn-outline min-h-10 px-4 text-[9px]">Import from supplier</Link>
            </>
          }
        />
      ) : (
        <div className="overflow-x-auto border border-line bg-cream">
          <table className="w-full min-w-[960px] text-left text-[12px]">
            <thead>
              <tr className="border-b border-line text-[8.5px] uppercase tracking-[0.14em] text-stone">
                <th className="px-4 py-3 font-medium">Piece</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Price</th>
                <th className="px-3 py-3 font-medium">Stock</th>
                <th className="px-3 py-3 font-medium">Tags</th>
                <th className="px-3 py-3 font-medium">Sourcing</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Open</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((product) => {
                const images = parseImages(product.images);
                const src = imageFor({ images, slug: product.slug });
                const low = product.stock <= 8;
                return (
                  <tr key={product.id} className="transition-colors hover:bg-ivory/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative size-12 shrink-0 overflow-hidden bg-ivory-deep">
                          <Image
                            src={src}
                            alt=""
                            fill
                            unoptimized={needsPlainImage(src)}
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link href={`/admin/products/${product.id}`} className="font-medium text-oxblood hover:underline">
                            {product.name}
                          </Link>
                          <p className="mt-0.5 text-[9.5px] uppercase tracking-[0.08em] text-stone">
                            {product.sku}
                            {product.featured ? " · Featured" : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[11px] text-stone">{product.category}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium">{formatZAR(product.price)}</p>
                      {product.compareAtPrice ? (
                        <p className="text-[10px] text-stone line-through">{formatZAR(product.compareAtPrice)}</p>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1 ${low ? "text-oxblood" : "text-stone"}`}>
                        {low ? <TrendingDown className="size-3.5" aria-hidden /> : null}
                        {product.stock}
                      </span>
                    </td>
                    <td className="max-w-[190px] px-3 py-3">
                      <p className="truncate text-[10.5px] text-stone">
                        {product.tags.map((tag) => tag.name).join(", ") || "—"}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-[10.5px] text-stone">
                      {product.supplierConnection ? (
                        <>
                          {product.supplierConnection.name}
                          <span className="mt-0.5 block text-[8.5px] uppercase tracking-[0.1em] opacity-70">
                            {product.supplierConnection.kind}
                          </span>
                        </>
                      ) : (
                        "Studio"
                      )}
                    </td>
                    <td className="px-3 py-3"><StatusBadge status={product.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/products/${product.id}`} className="text-[9px] uppercase tracking-[0.12em] text-oxblood hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[10px] text-stone">
        Showing up to 150 pieces. Archived pieces stay in the database for order history.
      </p>
    </div>
  );
}
