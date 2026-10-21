"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import { updateProfileAction } from "@/actions/auth";
import type { FormState } from "@/lib/form";

const initial: FormState = { status: "idle", message: "" };

export function ProfileForm({
  firstName,
  lastName,
  phone,
  email,
}: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initial);
  const error = (key: string) => state.fieldErrors?.[key];

  return (
    <form action={formAction} className="border border-line bg-cream p-5">
      <h2 className="font-display text-2xl">Your details</h2>
      <p className="mt-1 text-[11px] leading-relaxed text-stone">
        Used for order updates and delivery. Your email is the key to your order history.
      </p>
      {state.status !== "idle" ? (
        <p
          role="status"
          className={`mt-3 border p-2.5 text-[11px] ${
            state.status === "success"
              ? "border-oxblood/25 bg-oxblood/5 text-oxblood"
              : "border-oxblood/30 bg-oxblood/5 text-oxblood"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="account-first" className="label">First name</label>
          <input id="account-first" name="firstName" defaultValue={firstName} className="field" required />
          {error("firstName") ? <p className="mt-1 text-[11px] text-oxblood">{error("firstName")}</p> : null}
        </div>
        <div>
          <label htmlFor="account-last" className="label">Last name</label>
          <input id="account-last" name="lastName" defaultValue={lastName} className="field" required />
          {error("lastName") ? <p className="mt-1 text-[11px] text-oxblood">{error("lastName")}</p> : null}
        </div>
        <div>
          <label htmlFor="account-email" className="label">Email</label>
          <input id="account-email" value={email} readOnly className="field bg-ivory-deep/50 text-stone" />
        </div>
        <div>
          <label htmlFor="account-phone" className="label">Mobile number</label>
          <input id="account-phone" name="phone" type="tel" defaultValue={phone} className="field" placeholder="082 123 4567" />
          {error("phone") ? <p className="mt-1 text-[11px] text-oxblood">{error("phone")}</p> : null}
        </div>
      </div>
      <button type="submit" disabled={pending} className="btn-primary mt-4 disabled:opacity-60">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
        {pending ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}
