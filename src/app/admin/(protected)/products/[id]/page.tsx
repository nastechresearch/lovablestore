import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { deleteProductAction, updateProductAction } from "@/actions/admin-products";
import { formatDateShort, formatZAR } from "@/lib/format";
import { randsFromCents } from "@/lib/form";
import { imageFor, parseImages } from "@/lib/products";
import { AdminHeading } from "@/components/admin/admin-ui";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

function toLocalInput(date: Date | null): string {
  if (!date) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; imported?: string }>;
}) {
  const { id } = await params;
  const flags = await searchParams;

  const [product, connections] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { tags: { orderBy: { name: "asc" } }, supplierConnection: true },
    }),
    prisma.supplierConnection.findMany({
      orderBy: [{ kind: "asc" }, { name: "asc" }],
      select: { id: true, name: true, kind: true },
    }),
  ]);

  if (!product) notFound();

  const images = parseImages(product.images);
  const preview = imageFor({ images, slug: product.slug });
  const margin = product.supplierCost > 0 ? product.price - product.supplierCost : null;

  const values: ProductFormValues = {
    name: product.name,
    tagline: product.tagline ?? "",
    description: product.description,
    price: randsFromCents(product.price),
    compareAtPrice: randsFromCents(product.compareAtPrice),
    category: product.category,
    recipient: product.recipient,
    occasion: product.occasion,
    badge: product.badge ?? "",
    images: images.join("\n"),
    sizes: product.sizes,
    colors: product.colors,
    stock: product.stock,
    sku: product.sku,
    barcode: product.barcode ?? "",
    status: product.status,
    featured: product.featured,
    tags: product.tags.map((tag) => tag.name).join(", "),
    supplierConnectionId: product.supplierConnectionId ?? "",
    supplierCost: randsFromCents(product.supplierCost),
    supplierProductId: product.supplierProductId ?? "",
    supplierSku: product.supplierSku ?? "",
    supplierUrl: product.supplierUrl ?? "",
    supplierCurrency: product.supplierCurrency,
    shipsFrom: product.shipsFrom,
    leadTimeMin: product.leadTimeMin,
    leadTimeMax: product.leadTimeMax,
    promoLabel: product.promoLabel ?? "",
    promoEndsAt: toLocalInput(product.promoEndsAt),
  };

  return (
    <div className="space-y-6">
      <AdminHeading
        eyebrow={product.status === "ACTIVE" ? "Live piece" : `${product.status} piece`}
        title={product.name}
        description={`${product.sku} · added ${formatDateShort(product.createdAt)} · ${formatZAR(product.price)}${
          margin !== null ? ` · margin ${formatZAR(margin)}` : ""
        }`}
        action={
          <>
            <Link href={`/product/${product.slug}`} target="_blank" className="btn-outline min-h-10 px-4 text-[9px]">
              <Eye className="size-3.5" aria-hidden />
              Storefront
            </Link>
            <Link href="/admin/products" className="btn-outline min-h-10 px-4 text-[9px]">
              <ArrowLeft className="size-3.5" aria-hidden />
              All products
            </Link>
          </>
        }
      />

      {flags.saved ? (
        <p role="status" className="border border-oxblood/25 bg-oxblood/5 px-4 py-3 text-[11px] text-oxblood">
          Piece saved. Storefront pages have been refreshed.
        </p>
      ) : null}
      {flags.imported ? (
        <p role="status" className="border border-champagne-dark/30 bg-champagne/10 px-4 py-3 text-[11px] text-champagne-dark">
          Imported from the supplier. Check the description, imagery and price before
          promoting it widely.
        </p>
      ) : null}

      <div className="grid gap-3 border border-line bg-cream p-4 text-[10px] uppercase tracking-[0.1em] text-stone sm:grid-cols-4">
        <p>
          Stock <span className="mt-1 block font-display text-xl normal-case tracking-normal text-ink">{product.stock}</span>
        </p>
        <p>
          Rating <span className="mt-1 block font-display text-xl normal-case tracking-normal text-ink">{product.rating.toFixed(1)} · {product.reviewCount} reviews</span>
        </p>
        <p>
          Barcode <span className="mt-1 block font-display text-xl normal-case tracking-normal text-ink">{product.barcode || "—"}</span>
        </p>
        <p>
          Supplier{" "}
          <span className="mt-1 block font-display text-xl normal-case tracking-normal text-ink">
            {product.supplierConnection?.name ?? product.supplier ?? "Studio"}
          </span>
        </p>
      </div>

      <ProductForm
        action={updateProductAction.bind(null, product.id)}
        values={values}
        connections={connections}
        submitLabel="Save changes"
        previewImage={preview}
        storefrontHref={`/product/${product.slug}`}
      />

      <section className="border border-oxblood/25 bg-oxblood/[0.03] p-5">
        <h2 className="font-display text-2xl text-oxblood">Archive this piece</h2>
        <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-stone">
          Archiving hides the piece from the storefront, search and collections while
          keeping it attached to past orders. You can restore it any time by editing
          its status.
        </p>
        <form action={deleteProductAction.bind(null, product.id)} className="mt-4">
          <button
            type="submit"
            className="inline-flex min-h-10 items-center gap-2 border border-oxblood/40 px-4 text-[9px] uppercase tracking-[0.14em] text-oxblood transition-colors hover:bg-oxblood hover:text-ivory"
          >
            Archive piece
            <ExternalLink className="size-3.5" aria-hidden />
          </button>
        </form>
      </section>
    </div>
  );
}
