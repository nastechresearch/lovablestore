"use client";

import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";
import type { FormState } from "@/lib/form";

type Action = (previous: FormState, formData: FormData) => Promise<FormState>;
const initial: FormState = { status: "idle", message: "" };

const KINDS = [
  { value: "CURATED", label: "Curated edit" },
  { value: "PRICE", label: "Price band" },
  { value: "OCCASION", label: "Occasion / moment" },
  { value: "RECIPIENT", label: "Recipient" },
  { value: "STYLE", label: "Style" },
  { value: "SUPPLIER", label: "Sourcing" },
];

export function TagForm({ action }: { action: Action }) {
  const [state, formAction, pending] = useActionState(action, initial);
  const error = (key: string) => state.fieldErrors?.[key];

  return (
    <form action={formAction} className="border border-line bg-cream p-5">
      <h2 className="font-display text-2xl">New tag</h2>
      <p className="mt-1 text-[11px] leading-relaxed text-stone">
        Tags power filters, curated edits, search and tag-scoped promos. The slug is
        generated from the name.
      </p>
      {state.status === "error" ? (
        <p role="alert" className="mt-3 border border-oxblood/30 bg-oxblood/5 p-2.5 text-[11px] text-oxblood">
          {state.message}
        </p>
      ) : null}
      <div className="mt-4 grid gap-4">
        <div>
          <label htmlFor="tag-name" className="label">Name</label>
          <input id="tag-name" name="name" className="field" placeholder="Matric dance" required />
          {error("name") ? <p className="mt-1 text-[11px] text-oxblood">{error("name")}</p> : null}
        </div>
        <div>
          <label htmlFor="tag-kind" className="label">Type</label>
          <select id="tag-kind" name="kind" defaultValue="STYLE" className="field">
            {KINDS.map((kind) => <option key={kind.value} value={kind.value}>{kind.label}</option>)}
          </select>
          {error("kind") ? <p className="mt-1 text-[11px] text-oxblood">{error("kind")}</p> : null}
        </div>
        <div>
          <label htmlFor="tag-description" className="label">Description</label>
          <textarea id="tag-description" name="description" rows={2} className="field resize-y" placeholder="A short line used on the tag page." />
        </div>
        <label className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.1em] text-stone">
          <input type="checkbox" name="featured" className="size-4 accent-oxblood" />
          Feature in navigation &amp; edits
        </label>
      </div>
      <button type="submit" disabled={pending} className="btn-primary mt-4 w-full disabled:opacity-60">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Plus className="size-4" aria-hidden />}
        {pending ? "Creating…" : "Create tag"}
      </button>
    </form>
  );
}
