"use client";

import { useActionState } from "react";
import { Loader2, LockKeyhole, Save, ShieldCheck } from "lucide-react";
import type { FormState } from "@/lib/form";

export type ConnectionFormValues = {
  name: string;
  provider: string;
  kind: string;
  enabled: boolean;
  apiBaseUrl: string;
  defaultMarkupPct: number;
  defaultCurrency: string;
  defaultShipsFrom: string;
  defaultLeadMin: number;
  defaultLeadMax: number;
  notes: string;
};

type Action = (previous: FormState, formData: FormData) => Promise<FormState>;
const initial: FormState = { status: "idle", message: "" };

const PROVIDERS = [
  { value: "CJ", label: "CJ Dropshipping" },
  { value: "ALIEXPRESS", label: "AliExpress" },
  { value: "LOCAL", label: "Local studio / maker" },
  { value: "CUSTOM", label: "Custom API" },
];
const KINDS = [
  { value: "CHINA", label: "Global (China)" },
  { value: "LOCAL", label: "Local (South Africa)" },
  { value: "REGIONAL", label: "Regional (Africa)" },
];

export function SupplierForm({
  action,
  values,
  hasCredentials,
  submitLabel,
}: {
  action: Action;
  values: ConnectionFormValues;
  hasCredentials: boolean;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
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
            <h2 className="font-display text-2xl">Connection</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="label">Connection name</label>
                <input id="name" name="name" defaultValue={values.name} className="field" placeholder="CJ Watches · Shenzhen" required />
                {error("name") ? <p className="mt-1 text-[11px] text-oxblood">{error("name")}</p> : null}
              </div>
              <div>
                <label htmlFor="provider" className="label">Provider</label>
                <select id="provider" name="provider" defaultValue={values.provider} className="field">
                  {PROVIDERS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="kind" className="label">Sourcing region</label>
                <select id="kind" name="kind" defaultValue={values.kind} className="field">
                  {KINDS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="apiBaseUrl" className="label">API base URL</label>
                <input id="apiBaseUrl" name="apiBaseUrl" defaultValue={values.apiBaseUrl} className="field" placeholder="Leave blank for the provider default" />
              </div>
              <label className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.1em] text-stone">
                <input type="checkbox" name="enabled" defaultChecked={values.enabled} className="size-4 accent-oxblood" />
                Connection enabled for new products
              </label>
            </div>
          </section>

          <section className="border border-line bg-cream p-5">
            <div className="flex items-center gap-2">
              <LockKeyhole className="size-4 text-champagne-dark" aria-hidden />
              <h2 className="font-display text-2xl">Credentials</h2>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-stone">
              Credentials are encrypted with AES-256-GCM before they touch the database.
              {hasCredentials ? " A credential set is already stored — leave these blank to keep it." : ""}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="label">Account email</label>
                <input id="email" name="email" type="email" autoComplete="off" className="field" placeholder={hasCredentials ? "Stored · enter to replace" : "you@supplier.com"} />
              </div>
              <div>
                <label htmlFor="apiKey" className="label">API key</label>
                <input id="apiKey" name="apiKey" type="password" autoComplete="new-password" className="field" placeholder={hasCredentials ? "Stored · enter to replace" : "API key"} />
              </div>
              <div>
                <label htmlFor="apiSecret" className="label">API secret</label>
                <input id="apiSecret" name="apiSecret" type="password" autoComplete="new-password" className="field" />
              </div>
              <div>
                <label htmlFor="accessToken" className="label">Access token</label>
                <input id="accessToken" name="accessToken" type="password" autoComplete="new-password" className="field" />
              </div>
              <div>
                <label htmlFor="contactName" className="label">Contact name</label>
                <input id="contactName" name="contactName" autoComplete="off" className="field" />
              </div>
              <div>
                <label htmlFor="phone" className="label">Contact phone</label>
                <input id="phone" name="phone" autoComplete="off" className="field" />
              </div>
              {hasCredentials ? (
                <label className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.1em] text-oxblood sm:col-span-2">
                  <input type="checkbox" name="clearCredentials" className="size-4 accent-oxblood" />
                  Remove the stored credentials
                </label>
              ) : null}
            </div>
          </section>

          <section className="border border-line bg-cream p-5">
            <h2 className="font-display text-2xl">Sourcing defaults</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="defaultMarkupPct" className="label">Default markup (%)</label>
                <input id="defaultMarkupPct" name="defaultMarkupPct" type="number" min={0} max={500} defaultValue={values.defaultMarkupPct} className="field" />
                {error("defaultMarkupPct") ? <p className="mt-1 text-[11px] text-oxblood">{error("defaultMarkupPct")}</p> : null}
              </div>
              <div>
                <label htmlFor="defaultCurrency" className="label">Supplier currency</label>
                <input id="defaultCurrency" name="defaultCurrency" defaultValue={values.defaultCurrency} className="field uppercase" placeholder="USD" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="defaultShipsFrom" className="label">Ships from</label>
                <input id="defaultShipsFrom" name="defaultShipsFrom" defaultValue={values.defaultShipsFrom} className="field" />
              </div>
              <div>
                <label htmlFor="defaultLeadMin" className="label">Lead time min (days)</label>
                <input id="defaultLeadMin" name="defaultLeadMin" type="number" min={0} defaultValue={values.defaultLeadMin} className="field" />
                {error("defaultLeadMin") ? <p className="mt-1 text-[11px] text-oxblood">{error("defaultLeadMin")}</p> : null}
              </div>
              <div>
                <label htmlFor="defaultLeadMax" className="label">Lead time max (days)</label>
                <input id="defaultLeadMax" name="defaultLeadMax" type="number" min={0} defaultValue={values.defaultLeadMax} className="field" />
                {error("defaultLeadMax") ? <p className="mt-1 text-[11px] text-oxblood">{error("defaultLeadMax")}</p> : null}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="notes" className="label">Internal notes</label>
                <textarea id="notes" name="notes" defaultValue={values.notes} rows={3} className="field resize-y" placeholder="Minimum order quantities, packaging notes, account manager…" />
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <div className="border border-line bg-cream p-5">
            <div className="flex items-center gap-2 text-champagne-dark">
              <ShieldCheck className="size-4" aria-hidden />
              <p className="text-[9px] uppercase tracking-[0.16em]">Encrypted at rest</p>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-stone">
              Keys stay on the server. Test a connection after saving to confirm the
              API responds before importing products.
            </p>
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
