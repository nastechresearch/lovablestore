"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { updateStoreSettingsAction } from "@/actions/admin-settings";
import type { StoreSettings } from "@/lib/settings";
import type { FormState } from "@/lib/form";

const initial: FormState = { status: "idle", message: "" };

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="label">{label}</span>
      {children}
      {hint && !error ? <p className="mt-1 text-[10px] text-stone">{hint}</p> : null}
      {error ? <p className="mt-1 text-[11px] text-oxblood">{error}</p> : null}
    </div>
  );
}

function Input({
  name,
  defaultValue,
  type = "text",
  min,
  max,
  placeholder,
}: {
  name: string;
  defaultValue?: string | number;
  type?: string;
  min?: number;
  max?: number;
  placeholder?: string;
}) {
  return (
    <input
      name={name}
      type={type}
      min={min}
      max={max}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="field"
    />
  );
}

export function StoreSettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, formAction, pending] = useActionState(
    updateStoreSettingsAction,
    initial,
  );
  const error = (key: string) => state.fieldErrors?.[key];

  return (
    <form action={formAction} className="space-y-6">
      {state.status !== "idle" ? (
        <p
          role="status"
          className={`border p-3 text-[11px] ${
            state.status === "success"
              ? "border-champagne-dark/40 bg-champagne/10 text-champagne-dark"
              : "border-oxblood/30 bg-oxblood/5 text-oxblood"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <section className="border border-line bg-cream p-5">
        <h2 className="font-display text-2xl">Business identity</h2>
        <p className="mt-1 text-[11px] text-stone">
          Printed on every tax invoice, packing slip and courier label.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Trading name" error={error("companyName")}>
            <Input name="companyName" defaultValue={settings.companyName} />
          </Field>
          <Field label="Company registration" error={error("registration")}>
            <Input name="registration" defaultValue={settings.registration} />
          </Field>
          <Field label="VAT number" error={error("vatNumber")} hint="South African VAT registration number.">
            <Input name="vatNumber" defaultValue={settings.vatNumber} />
          </Field>
          <Field label="Invoice email" error={error("companyEmail")}>
            <Input name="companyEmail" type="email" defaultValue={settings.companyEmail} />
          </Field>
          <Field label="Telephone" error={error("companyPhone")}>
            <Input name="companyPhone" defaultValue={settings.companyPhone} />
          </Field>
          <Field label="Support hours" error={error("supportHours")}>
            <Input name="supportHours" defaultValue={settings.supportHours} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Registered address" error={error("companyAddress")}>
              <Input name="companyAddress" defaultValue={settings.companyAddress} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Announcement bar" error={error("announcement")} hint="Short line shown above the header.">
              <Input name="announcement" defaultValue={settings.announcement} />
            </Field>
          </div>
        </div>
      </section>

      <section className="border border-line bg-cream p-5">
        <h2 className="font-display text-2xl">Dispatch &amp; delivery</h2>
        <p className="mt-1 text-[11px] text-stone">
          Drives the animated delivery estimate, product pages and the invoice.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Dispatch cut-off (SAST)" error={error("dispatchCutoffHour")} hint="24-hour clock, e.g. 14.">
            <Input name="dispatchCutoffHour" type="number" min={0} max={23} defaultValue={settings.dispatchCutoffHour} />
          </Field>
          <Field label="Local lead min (days)" error={error("localLeadMin")}>
            <Input name="localLeadMin" type="number" min={0} max={40} defaultValue={settings.localLeadMin} />
          </Field>
          <Field label="Local lead max (days)" error={error("localLeadMax")}>
            <Input name="localLeadMax" type="number" min={0} max={60} defaultValue={settings.localLeadMax} />
          </Field>
          <Field label="Global lead min (days)" error={error("globalLeadMin")}>
            <Input name="globalLeadMin" type="number" min={1} max={60} defaultValue={settings.globalLeadMin} />
          </Field>
          <Field label="Global lead max (days)" error={error("globalLeadMax")}>
            <Input name="globalLeadMax" type="number" min={1} max={90} defaultValue={settings.globalLeadMax} />
          </Field>
          <div />
          <Field label="Free shipping threshold (cents)" error={error("freeShippingThreshold")} hint="95000 = R950.">
            <Input name="freeShippingThreshold" type="number" min={0} max={1_000_000} defaultValue={settings.freeShippingThreshold} />
          </Field>
          <Field label="Standard delivery fee (cents)" error={error("shippingFee")} hint="8500 = R85.">
            <Input name="shippingFee" type="number" min={0} max={100_000} defaultValue={settings.shippingFee} />
          </Field>
        </div>
      </section>

      <button type="submit" disabled={pending} className="btn-primary disabled:opacity-60">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
        {pending ? "Saving…" : "Save store settings"}
      </button>
    </form>
  );
}
