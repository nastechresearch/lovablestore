"use client";

import { useActionState } from "react";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { updateAccountSettingsAction } from "@/actions/auth";
import { PROVINCES } from "@/lib/constants";
import type { FormState } from "@/lib/form";

const initial: FormState = { status: "idle", message: "" };

export function AccountSettingsForm({
  firstName,
  lastName,
  email,
  phone,
  accountId,
  defaultAddress,
  defaultCity,
  defaultProvince,
  defaultPostalCode,
  marketingEmail,
  marketingWhatsapp,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  accountId: string;
  defaultAddress: string;
  defaultCity: string;
  defaultProvince: string;
  defaultPostalCode: string;
  marketingEmail: boolean;
  marketingWhatsapp: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    updateAccountSettingsAction,
    initial,
  );
  const error = (key: string) => state.fieldErrors?.[key];

  return (
    <form action={formAction} className="border border-line bg-cream p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl">Profile &amp; delivery</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-stone">
            Used to prefill checkout and to keep your order updates going to the
            right number.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 border border-line bg-ivory px-3 py-2">
          <ShieldCheck className="size-3.5 text-oxblood" aria-hidden />
          <span className="text-[9px] uppercase tracking-[0.12em] text-stone">Account ID</span>
          <span className="font-mono text-[11px] font-medium text-ink">{accountId}</span>
        </span>
      </div>

      {state.status !== "idle" ? (
        <p
          role="status"
          className={`mt-3 border p-2.5 text-[11px] ${
            state.status === "success"
              ? "border-champagne-dark/40 bg-champagne/10 text-champagne-dark"
              : "border-oxblood/30 bg-oxblood/5 text-oxblood"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="settings-first" className="label">First name</label>
          <input id="settings-first" name="firstName" defaultValue={firstName} className="field" required />
          {error("firstName") ? <p className="mt-1 text-[11px] text-oxblood">{error("firstName")}</p> : null}
        </div>
        <div>
          <label htmlFor="settings-last" className="label">Last name</label>
          <input id="settings-last" name="lastName" defaultValue={lastName} className="field" required />
          {error("lastName") ? <p className="mt-1 text-[11px] text-oxblood">{error("lastName")}</p> : null}
        </div>
        <div>
          <label htmlFor="settings-email" className="label">Email</label>
          <input id="settings-email" value={email} readOnly className="field bg-ivory-deep/50 text-stone" />
        </div>
        <div>
          <label htmlFor="settings-phone" className="label">Mobile number</label>
          <input id="settings-phone" name="phone" type="tel" defaultValue={phone} className="field" placeholder="082 123 4567" />
          {error("phone") ? <p className="mt-1 text-[11px] text-oxblood">{error("phone")}</p> : null}
        </div>
      </div>

      <fieldset className="mt-6 border-t border-line pt-5">
        <legend className="label">Default delivery address</legend>
        <p className="mb-3 text-[10px] text-stone">
          Optional. We use this to prefill checkout — you can still change it per order.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="settings-address" className="label">Street address</label>
            <input id="settings-address" name="defaultAddress" defaultValue={defaultAddress} className="field" placeholder="12 Oxford Road, Illovo" />
            {error("defaultAddress") ? <p className="mt-1 text-[11px] text-oxblood">{error("defaultAddress")}</p> : null}
          </div>
          <div>
            <label htmlFor="settings-city" className="label">City / suburb</label>
            <input id="settings-city" name="defaultCity" defaultValue={defaultCity} className="field" placeholder="Johannesburg" />
            {error("defaultCity") ? <p className="mt-1 text-[11px] text-oxblood">{error("defaultCity")}</p> : null}
          </div>
          <div>
            <label htmlFor="settings-province" className="label">Province</label>
            <select id="settings-province" name="defaultProvince" defaultValue={defaultProvince} className="field">
              <option value="">Choose a province</option>
              {PROVINCES.map((province) => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
            {error("defaultProvince") ? <p className="mt-1 text-[11px] text-oxblood">{error("defaultProvince")}</p> : null}
          </div>
          <div>
            <label htmlFor="settings-postal" className="label">Postal code</label>
            <input id="settings-postal" name="defaultPostalCode" defaultValue={defaultPostalCode} className="field" inputMode="numeric" placeholder="2196" maxLength={4} />
            {error("defaultPostalCode") ? <p className="mt-1 text-[11px] text-oxblood">{error("defaultPostalCode")}</p> : null}
          </div>
        </div>
      </fieldset>

      <fieldset className="mt-6 border-t border-line pt-5">
        <legend className="label">What we may send you</legend>
        <div className="mt-3 space-y-3">
          <label className="flex items-start gap-3 text-[12px] leading-relaxed">
            <input type="checkbox" name="marketingEmail" defaultChecked={marketingEmail} className="mt-1 size-4 accent-oxblood" />
            <span>
              <span className="block font-medium">Email edits and early access</span>
              <span className="block text-[11px] text-stone">New arrivals, payday edits and restock notes. Order updates are always sent.</span>
            </span>
          </label>
          <label className="flex items-start gap-3 text-[12px] leading-relaxed">
            <input type="checkbox" name="marketingWhatsapp" defaultChecked={marketingWhatsapp} className="mt-1 size-4 accent-oxblood" />
            <span>
              <span className="block font-medium">WhatsApp drops</span>
              <span className="block text-[11px] text-stone">Occasional voice-note-sized updates. No spam, unsubscribe by replying STOP.</span>
            </span>
          </label>
        </div>
      </fieldset>

      <button type="submit" disabled={pending} className="btn-primary mt-6 disabled:opacity-60">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
        {pending ? "Saving…" : "Save account settings"}
      </button>
    </form>
  );
}
