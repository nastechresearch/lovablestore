"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Save, Sparkles } from "lucide-react";
import type { FormState } from "@/lib/form";
import { needsPlainImage } from "@/lib/products";

export type ProductFormValues = {
  name: string;
  tagline: string;
  description: string;
  price: string;
  compareAtPrice: string;
  category: string;
  recipient: string;
  occasion: string;
  badge: string;
  images: string;
  sizes: string;
  colors: string;
  stock: number;
  sku: string;
  barcode: string;
  status: string;
  featured: boolean;
  tags: string;
  supplierConnectionId: string;
  supplierCost: string;
  supplierProductId: string;
  supplierSku: string;
  supplierUrl: string;
  supplierCurrency: string;
  shipsFrom: string;
  leadTimeMin: number;
  leadTimeMax: number;
  promoLabel: string;
  promoEndsAt: string;
};

type Action = (previous: FormState, formData: FormData) => Promise<FormState>;
const initial: FormState = { status: "idle", message: "" };

const CATEGORIES = ["Watches", "Fragrance", "Women", "Men", "Shoes", "Gifts"];
const RECIPIENTS = ["For Her", "For Him", "For Couples", "For Everyone"];
const STATUSES = ["ACTIVE", "DRAFT", "ARCHIVED"];

export function ProductForm({
  action,
  values,
  connections,
  submitLabel,
  previewImage,
  storefrontHref,
}: {
  action: Action;
  values: ProductFormValues;
  connections: { id: string; name: string; kind: string }[];
  submitLabel: string;
  previewImage?: string;
  storefrontHref?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const error = (key: string) => state.fieldErrors?.[key];
  const images = values.images
    .split(/[\n,]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  const firstImage = images[0] || previewImage;

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" ? (
        <p role="alert" className="border border-oxblood/30 bg-oxblood/5 p-3 text-[11px] text-oxblood">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
        <div className="space-y-6">
          <section className="border border-line bg-cream p-5">
            <h2 className="font-display text-2xl">The piece</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="label">Product name</label>
                <input id="name" name="name" defaultValue={values.name} className="field" required />
                {error("name") ? <p className="mt-1 text-[11px] text-oxblood">{error("name")}</p> : null}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="tagline" className="label">Tagline</label>
                <input id="tagline" name="tagline" defaultValue={values.tagline} className="field" placeholder="A quiet classic for every wrist." />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="description" className="label">Description</label>
                <textarea id="description" name="description" defaultValue={values.description} rows={5} className="field resize-y" required />
                {error("description") ? <p className="mt-1 text-[11px] text-oxblood">{error("description")}</p> : null}
              </div>
              <div>
                <label htmlFor="category" className="label">Category</label>
                <select id="category" name="category" defaultValue={values.category || "Gifts"} className="field">
                  {CATEGORIES.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                {error("category") ? <p className="mt-1 text-[11px] text-oxblood">{error("category")}</p> : null}
              </div>
              <div>
                <label htmlFor="recipient" className="label">Gifting for</label>
                <select id="recipient" name="recipient" defaultValue={values.recipient || "For Her"} className="field">
                  {RECIPIENTS.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="occasion" className="label">Occasion</label>
                <input id="occasion" name="occasion" defaultValue={values.occasion || "Everyday"} className="field" placeholder="Valentine's, Birthday, Everyday…" />
              </div>
              <div>
                <label htmlFor="badge" className="label">Badge</label>
                <input id="badge" name="badge" defaultValue={values.badge} className="field" placeholder="Bestseller, New in, Limited…" />
              </div>
              <div>
                <label htmlFor="status" className="label">Status</label>
                <select id="status" name="status" defaultValue={values.status || "ACTIVE"} className="field">
                  {STATUSES.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-2.5 self-end pb-3 text-[11px] uppercase tracking-[0.1em] text-stone">
                <input type="checkbox" name="featured" defaultChecked={values.featured} className="size-4 accent-oxblood" />
                Featured on the storefront
              </label>
              <div className="sm:col-span-2">
                <label htmlFor="tags" className="label">Tags (comma separated)</label>
                <input id="tags" name="tags" defaultValue={values.tags} className="field" placeholder="valentines, under-1000, bestseller" />
                {error("tags") ? <p className="mt-1 text-[11px] text-oxblood">{error("tags")}</p> : null}
                <p className="mt-1 text-[10px] text-stone">
                  Tags power filters, edits and tag-scoped promos. New tags are created automatically.
                </p>
              </div>
            </div>
          </section>

          <section className="border border-line bg-cream p-5">
            <h2 className="font-display text-2xl">Price &amp; stock</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="price" className="label">Selling price (R)</label>
                <input id="price" name="price" inputMode="decimal" defaultValue={values.price} className="field" placeholder="1299.00" required />
                {error("price") ? <p className="mt-1 text-[11px] text-oxblood">{error("price")}</p> : null}
              </div>
              <div>
                <label htmlFor="compareAtPrice" className="label">Compare-at price (R)</label>
                <input id="compareAtPrice" name="compareAtPrice" inputMode="decimal" defaultValue={values.compareAtPrice} className="field" placeholder="1599.00" />
              </div>
              <div>
                <label htmlFor="stock" className="label">Stock on hand</label>
                <input id="stock" name="stock" type="number" min={0} defaultValue={values.stock} className="field" />
                {error("stock") ? <p className="mt-1 text-[11px] text-oxblood">{error("stock")}</p> : null}
              </div>
              <div>
                <label htmlFor="promoLabel" className="label">Product promo label</label>
                <input id="promoLabel" name="promoLabel" defaultValue={values.promoLabel} className="field" placeholder="Save 20% this week" />
              </div>
              <div>
                <label htmlFor="promoEndsAt" className="label">Product promo ends</label>
                <input id="promoEndsAt" name="promoEndsAt" type="datetime-local" defaultValue={values.promoEndsAt} className="field" />
              </div>
            </div>

            <div className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
              <div>
                <label htmlFor="sku" className="label">SKU</label>
                <input id="sku" name="sku" defaultValue={values.sku} className="field uppercase" placeholder="Auto-generated if blank" />
                {error("sku") ? <p className="mt-1 text-[11px] text-oxblood">{error("sku")}</p> : null}
              </div>
              <div>
                <label htmlFor="barcode" className="label">Barcode / EAN</label>
                <input id="barcode" name="barcode" defaultValue={values.barcode} className="field" placeholder="Auto-generated if blank" />
              </div>
            </div>
          </section>

          <section className="border border-line bg-cream p-5">
            <h2 className="font-display text-2xl">Imagery &amp; options</h2>
            <div className="mt-4 grid gap-4">
              <div>
                <label htmlFor="images" className="label">Image URLs (one per line)</label>
                <textarea id="images" name="images" defaultValue={values.images} rows={4} className="field resize-y" placeholder="/images/products/watch.jpg&#10;https://supplier.example/image.jpg" />
                <p className="mt-1 text-[10px] text-stone">
                  Leave blank to use the auto-generated portrait image. Only local,
                  http and https URLs are accepted.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="sizes" className="label">Sizes / options</label>
                  <input id="sizes" name="sizes" defaultValue={values.sizes} className="field" placeholder="S, M, L or 38, 40, 42" />
                </div>
                <div>
                  <label htmlFor="colors" className="label">Colours</label>
                  <input id="colors" name="colors" defaultValue={values.colors} className="field" placeholder="Gold, Silver, Rose" />
                </div>
              </div>
            </div>
          </section>

          <section className="border border-line bg-cream p-5">
            <h2 className="font-display text-2xl">Sourcing &amp; delivery</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="supplierConnectionId" className="label">Supplier connection</label>
                <select id="supplierConnectionId" name="supplierConnectionId" defaultValue={values.supplierConnectionId} className="field">
                  <option value="">No linked connection (local studio)</option>
                  {connections.map((connection) => (
                    <option key={connection.id} value={connection.id}>
                      {connection.name} · {connection.kind}
                    </option>
                  ))}
                </select>
                {error("supplierConnectionId") ? <p className="mt-1 text-[11px] text-oxblood">{error("supplierConnectionId")}</p> : null}
              </div>
              <div>
                <label htmlFor="supplierCost" className="label">Supplier cost (R)</label>
                <input id="supplierCost" name="supplierCost" inputMode="decimal" defaultValue={values.supplierCost} className="field" placeholder="420.00" />
              </div>
              <div>
                <label htmlFor="supplierCurrency" className="label">Supplier currency</label>
                <input id="supplierCurrency" name="supplierCurrency" defaultValue={values.supplierCurrency || "ZAR"} className="field uppercase" />
              </div>
              <div>
                <label htmlFor="supplierProductId" className="label">Supplier product ID</label>
                <input id="supplierProductId" name="supplierProductId" defaultValue={values.supplierProductId} className="field" />
              </div>
              <div>
                <label htmlFor="supplierSku" className="label">Supplier SKU</label>
                <input id="supplierSku" name="supplierSku" defaultValue={values.supplierSku} className="field" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="supplierUrl" className="label">Supplier URL</label>
                <input id="supplierUrl" name="supplierUrl" type="url" defaultValue={values.supplierUrl} className="field" placeholder="https://…" />
              </div>
              <div>
                <label htmlFor="shipsFrom" className="label">Ships from</label>
                <input id="shipsFrom" name="shipsFrom" defaultValue={values.shipsFrom || "South Africa"} className="field" />
              </div>
              <div>
                <label htmlFor="leadTimeMin" className="label">Lead time min (days)</label>
                <input id="leadTimeMin" name="leadTimeMin" type="number" min={0} defaultValue={values.leadTimeMin} className="field" />
                {error("leadTimeMin") ? <p className="mt-1 text-[11px] text-oxblood">{error("leadTimeMin")}</p> : null}
              </div>
              <div>
                <label htmlFor="leadTimeMax" className="label">Lead time max (days)</label>
                <input id="leadTimeMax" name="leadTimeMax" type="number" min={0} defaultValue={values.leadTimeMax} className="field" />
                {error("leadTimeMax") ? <p className="mt-1 text-[11px] text-oxblood">{error("leadTimeMax")}</p> : null}
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <div className="border border-line bg-cream p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl">Preview</h2>
              <Sparkles className="size-4 text-champagne-dark" aria-hidden />
            </div>
            <div className="relative mt-4 aspect-[4/5] overflow-hidden bg-ivory-deep">
              {firstImage ? (
                <Image
                  src={firstImage}
                  alt="Product preview"
                  fill
                  unoptimized={needsPlainImage(firstImage)}
                  sizes="320px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center">
                  <p className="text-[11px] leading-relaxed text-stone">
                    Auto portrait image will be generated from the product name,
                    category and SKU.
                  </p>
                </div>
              )}
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-stone">
              {values.name || "Untitled piece"} · {values.category || "Category"}
            </p>
            {storefrontHref ? (
              <Link href={storefrontHref} target="_blank" className="btn-outline mt-4 w-full min-h-10 text-[9px]">
                View on storefront
              </Link>
            ) : null}
          </div>

          <div className="border border-line bg-cream p-5">
            <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
              {pending ? "Saving…" : submitLabel}
            </button>
            <p className="mt-3 text-[10px] leading-relaxed text-stone">
              Changes go live immediately for active products. Draft and archived
              pieces stay hidden from the storefront.
            </p>
          </div>
        </aside>
      </div>
    </form>
  );
}
