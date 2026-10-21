"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Loader2, Save, Tag } from "lucide-react";
import type { FormState } from "@/lib/form";

export type PromoFormValues = {
  code: string;
  label: string;
  description: string;
  type: string;
  value: string;
  minSubtotal: string;
  scope: string;
  scopeValue: string;
  startsAt: string;
  endsAt: string;
  maxUses: string;
  active: boolean;
};

type Action = (previous: FormState, formData: FormData) => Promise<FormState>;
const initial: FormState = { status: "idle", message: "" };

const TYPES = [
  { value: "PERCENT", label: "Percentage off" },
  { value: "FIXED", label: "Rand amount off" },
  { value: "FREE_SHIPPING", label: "Free shipping" },
];
const SCOPES = [
  { value: "ALL", label: "Everything in the store" },
  { value: "CATEGORY", label: "One category" },
  { value: "TAG", label: "One tag / edit" },
  { value: "PRODUCT", label: "One product" },
  { value: "SUPPLIER", label: "One supplier connection" },
  { value: "SUPPLIER_KIND", label: "Local or global sourcing" },
];
const CATEGORIES = ["Watches", "Fragrance", "Women", "Men", "Shoes", "Gifts"];
const KINDS = [
  { value: "LOCAL", label: "Local sourcing" },
  { value: "CHINA", label: "Global sourcing (China)" },
  { value: "REGIONAL", label: "Regional sourcing (Africa)" },
];

export function PromoForm({
  action,
  values,
  tags,
  products,
  suppliers,
  submitLabel,
}: {
  action: Action;
  values: PromoFormValues;
  tags: { slug: string; name: string }[];
  products: { id: string; name: string }[];
  suppliers: { id: string; name: string; kind: string }[];
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [type, setType] = useState(values.type || "PERCENT");
  const [scope, setScope] = useState(values.scope || "ALL");
  const error = (key: string) => state.fieldErrors?.[key];

  return (
    <form action={formAction} className="space-y-6">
      {state.status === "error" ? (
        <p role="alert" className="border border-oxblood/30 bg-oxblood/5 p-3 text-[11px] text-oxblood">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <section className="border border-line bg-cream p-5">
            <h2 className="font-display text-2xl">The offer</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="code" className="label">Promo code</label>
                <input id="code" name="code" defaultValue={values.code} className="field uppercase" placeholder="LOVE10" required />
                {error("code") ? <p className="mt-1 text-[11px] text-oxblood">{error("code")}</p> : null}
              </div>
              <div>
                <label htmlFor="label" className="label">Customer-facing label</label>
                <input id="label" name="label" defaultValue={values.label} className="field" placeholder="10% off the love edit" required />
                {error("label") ? <p className="mt-1 text-[11px] text-oxblood">{error("label")}</p> : null}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="description" className="label">Description</label>
                <textarea id="description" name="description" defaultValue={values.description} rows={2} className="field resize-y" placeholder="Shown on the offers page and at checkout." />
              </div>
              <div>
                <label htmlFor="type" className="label">Offer type</label>
                <select
                  id="type"
                  name="type"
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="field"
                >
                  {TYPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              {type === "FREE_SHIPPING" ? (
                <div className="flex items-end pb-3 text-[11px] text-stone">
                  No value needed — shipping is waived at checkout.
                </div>
              ) : (
                <div>
                  <label htmlFor="value" className="label">
                    {type === "PERCENT" ? "Percentage off" : "Rand amount off"}
                  </label>
                  <input
                    id="value"
                    name="value"
                    inputMode="decimal"
                    defaultValue={values.value}
                    className="field"
                    placeholder={type === "PERCENT" ? "10" : "150.00"}
                  />
                  {error("value") ? <p className="mt-1 text-[11px] text-oxblood">{error("value")}</p> : null}
                </div>
              )}
              <div>
                <label htmlFor="minSubtotal" className="label">Minimum spend (R)</label>
                <input id="minSubtotal" name="minSubtotal" inputMode="decimal" defaultValue={values.minSubtotal} className="field" placeholder="0.00" />
              </div>
              <div>
                <label htmlFor="maxUses" className="label">Maximum uses</label>
                <input id="maxUses" name="maxUses" type="number" min={1} defaultValue={values.maxUses} className="field" placeholder="Unlimited" />
                {error("maxUses") ? <p className="mt-1 text-[11px] text-oxblood">{error("maxUses")}</p> : null}
              </div>
            </div>
          </section>

          <section className="border border-line bg-cream p-5">
            <h2 className="font-display text-2xl">Where it applies</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="scope" className="label">Scope</label>
                <select
                  id="scope"
                  name="scope"
                  value={scope}
                  onChange={(event) => setScope(event.target.value)}
                  className="field"
                >
                  {SCOPES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              {scope !== "ALL" ? (
                <div>
                  <label htmlFor="scopeValue" className="label">
                    {scope === "CATEGORY"
                      ? "Category"
                      : scope === "TAG"
                        ? "Tag"
                        : scope === "PRODUCT"
                          ? "Product"
                          : scope === "SUPPLIER"
                            ? "Supplier connection"
                            : "Sourcing region"}
                  </label>
                  <select id="scopeValue" name="scopeValue" defaultValue={values.scopeValue} className="field" required>
                    <option value="">Choose…</option>
                    {scope === "CATEGORY"
                      ? CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)
                      : scope === "TAG"
                        ? tags.map((tag) => <option key={tag.slug} value={tag.slug}>{tag.name}</option>)
                        : scope === "PRODUCT"
                          ? products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)
                          : scope === "SUPPLIER"
                            ? suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name} · {supplier.kind}</option>)
                            : KINDS.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}
                  </select>
                  {error("scopeValue") ? <p className="mt-1 text-[11px] text-oxblood">{error("scopeValue")}</p> : null}
                </div>
              ) : null}
              <div>
                <label htmlFor="startsAt" className="label">Starts</label>
                <input id="startsAt" name="startsAt" type="datetime-local" defaultValue={values.startsAt} className="field" />
                {error("startsAt") ? <p className="mt-1 text-[11px] text-oxblood">{error("startsAt")}</p> : null}
              </div>
              <div>
                <label htmlFor="endsAt" className="label">Ends</label>
                <input id="endsAt" name="endsAt" type="datetime-local" defaultValue={values.endsAt} className="field" />
                {error("endsAt") ? <p className="mt-1 text-[11px] text-oxblood">{error("endsAt")}</p> : null}
              </div>
              <label className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.1em] text-stone sm:col-span-2">
                <input type="checkbox" name="active" defaultChecked={values.active} className="size-4 accent-oxblood" />
                Active — customers can redeem this code
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <div className="border border-line bg-cream p-5">
            <div className="flex items-center gap-2 text-champagne-dark">
              <Tag className="size-4" aria-hidden />
              <p className="text-[9px] uppercase tracking-[0.16em]">Promo rules</p>
            </div>
            <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-stone">
              <li>Codes are recalculated on the server at checkout.</li>
              <li>Scope limits which bag lines receive the discount.</li>
              <li>Minimum spend applies to the eligible subtotal.</li>
              <li>Use a supplier kind scope to run local-only offers.</li>
            </ul>
            <Link href="/admin/promos" className="mt-4 inline-block text-[9px] uppercase tracking-[0.12em] text-oxblood hover:underline">
              View all promos
            </Link>
          </div>
          <div className="border border-line bg-cream p-5">
            <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
              {pending ? "Saving…" : submitLabel}
            </button>
          </div>
        </aside>
      </div>
    </form>
  );
}
