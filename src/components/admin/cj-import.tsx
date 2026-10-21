"use client";

import { useActionState, useState, useTransition } from "react";
import { Download, Loader2, Search, Sparkles } from "lucide-react";
import type { FormState } from "@/lib/form";
import {
  importSupplierProductAction,
  searchCjAction,
  type CjSearchResult,
} from "@/actions/admin-suppliers";

type Result = CjSearchResult["products"][number];

type Action = (previous: FormState, formData: FormData) => Promise<FormState>;
const initial: FormState = { status: "idle", message: "" };

const CATEGORIES = ["Watches", "Fragrance", "Women", "Men", "Shoes", "Gifts"];
const RECIPIENTS = ["For Her", "For Him", "For Couples", "For Everyone"];

export function CjImportPanel({
  connectionId,
  defaultMarkup,
  defaultCurrency,
  hasCredentials,
}: {
  connectionId: string;
  defaultMarkup: number;
  defaultCurrency: string;
  hasCredentials: boolean;
}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<CjSearchResult | null>(null);
  const [pending, startTransition] = useTransition();

  function runSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const response = await searchCjAction(connectionId, trimmed);
      setResult(response);
    });
  }

  return (
    <section className="border border-line bg-cream p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-champagne-dark">CJ catalogue</p>
          <h2 className="mt-1 font-display text-2xl">Find &amp; import a product</h2>
          <p className="mt-1 max-w-lg text-[11px] leading-relaxed text-stone">
            Search the live CJ catalogue. Imports download the supplier image, convert
            the cost to rand and apply this connection&apos;s markup.
          </p>
        </div>
        <form onSubmit={runSearch} className="flex gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-stone" aria-hidden />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Watches, perfume, gift box…"
              className="field min-h-10 w-56 py-1.5 pl-9 text-[11px]"
              aria-label="Search CJ products"
            />
          </div>
          <button type="submit" disabled={pending} className="btn-primary min-h-10 px-4 text-[9px] disabled:opacity-60">
            {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Search className="size-3.5" aria-hidden />}
            {pending ? "Searching…" : "Search"}
          </button>
        </form>
      </div>

      {!hasCredentials ? (
        <p className="mt-4 border border-champagne-dark/30 bg-champagne/10 p-3 text-[11px] text-champagne-dark">
          Add the CJ email and API key above, save, then come back to search the catalogue.
        </p>
      ) : null}

      {result ? (
        result.ok ? (
          result.products.length === 0 ? (
            <p className="mt-5 border border-line bg-ivory p-4 text-[11px] text-stone">
              {result.message || "No products matched that search."}
            </p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {result.products.map((product) => (
                <ImportCard
                  key={product.id}
                  product={product}
                  connectionId={connectionId}
                  defaultMarkup={defaultMarkup}
                  defaultCurrency={defaultCurrency}
                />
              ))}
            </div>
          )
        ) : (
          <p role="alert" className="mt-5 border border-oxblood/30 bg-oxblood/5 p-3 text-[11px] text-oxblood">
            {result.message}
          </p>
        )
      ) : null}
    </section>
  );
}

function ImportCard({
  product,
  connectionId,
  defaultMarkup,
  defaultCurrency,
}: {
  product: Result;
  connectionId: string;
  defaultMarkup: number;
  defaultCurrency: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    importSupplierProductAction,
    initial,
  );
  const initialTags = product.category ? `new, global, ${product.category.toLowerCase()}` : "new, global";

  return (
    <article className="border border-line bg-ivory">
      <div className="flex gap-3 border-b border-line p-3">
        <div className="relative size-20 shrink-0 overflow-hidden bg-ivory-deep">
          {product.imageUrl ? (
            // Supplier hosts are arbitrary, so skip the Next.js image proxy.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-[8px] uppercase tracking-[0.1em] text-stone">
              No image
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-[12px] font-medium leading-snug">{product.name}</p>
          <p className="mt-1 text-[10px] text-stone">
            {product.cost !== null ? `${product.currency} ${product.cost.toFixed(2)}` : "Cost on request"}
            {product.category ? ` · ${product.category}` : ""}
          </p>
          {product.description ? (
            <p className="mt-1 line-clamp-2 text-[9.5px] leading-relaxed text-stone">{product.description}</p>
          ) : null}
        </div>
      </div>

      <form action={formAction} className="space-y-3 p-3">
        <input type="hidden" name="connectionId" value={connectionId} />
        <input type="hidden" name="name" value={product.name} />
        <input type="hidden" name="cost" value={product.cost ?? 0} />
        <input type="hidden" name="currency" value={product.currency || defaultCurrency} />
        <input type="hidden" name="imageUrl" value={product.imageUrl ?? ""} />
        <input type="hidden" name="supplierProductId" value={product.id} />
        <input type="hidden" name="supplierUrl" value={product.url ?? ""} />
        <input type="hidden" name="description" value={product.description ?? ""} />

        {state.status === "error" ? (
          <p role="alert" className="text-[10px] text-oxblood">{state.message}</p>
        ) : null}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label" htmlFor={`category-${product.id}`}>Category</label>
            <select
              id={`category-${product.id}`}
              name="category"
              defaultValue={CATEGORIES.includes(product.category ?? "") ? (product.category as string) : "Gifts"}
              className="field min-h-9 py-1.5 text-[11px]"
            >
              {CATEGORIES.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor={`recipient-${product.id}`}>Gifting</label>
            <select id={`recipient-${product.id}`} name="recipient" defaultValue="For Her" className="field min-h-9 py-1.5 text-[11px]">
              {RECIPIENTS.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="label" htmlFor={`stock-${product.id}`}>Stock</label>
            <input id={`stock-${product.id}`} name="stock" type="number" min={0} defaultValue={25} className="field min-h-9 py-1.5 text-[11px]" />
          </div>
          <div>
            <label className="label" htmlFor={`leadMin-${product.id}`}>Lead min</label>
            <input id={`leadMin-${product.id}`} name="leadMin" type="number" min={0} defaultValue={10} className="field min-h-9 py-1.5 text-[11px]" />
          </div>
          <div>
            <label className="label" htmlFor={`leadMax-${product.id}`}>Lead max</label>
            <input id={`leadMax-${product.id}`} name="leadMax" type="number" min={0} defaultValue={18} className="field min-h-9 py-1.5 text-[11px]" />
          </div>
        </div>
        <div className="grid grid-cols-[1fr_88px] gap-2">
          <div>
            <label className="label" htmlFor={`tags-${product.id}`}>Tags</label>
            <input id={`tags-${product.id}`} name="tags" defaultValue={initialTags} className="field min-h-9 py-1.5 text-[11px]" />
          </div>
          <div>
            <label className="label" htmlFor={`markup-${product.id}`}>Markup %</label>
            <input id={`markup-${product.id}`} name="markupPct" type="number" min={0} max={500} defaultValue={defaultMarkup} className="field min-h-9 py-1.5 text-[11px]" />
          </div>
        </div>

        <button type="submit" disabled={pending} className="btn-outline min-h-9 w-full text-[9px] disabled:opacity-60">
          {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Download className="size-3.5" aria-hidden />}
          {pending ? "Importing…" : "Import to catalogue"}
        </button>
        <p className="flex items-center gap-1.5 text-[9px] text-stone">
          <Sparkles className="size-3 text-champagne-dark" aria-hidden />
          Image cached locally · identifiers generated
        </p>
      </form>
    </article>
  );
}
