"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import {
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Loader2,
  ShieldCheck,
  Trash2,
  Usb,
} from "lucide-react";
import { startRegistration } from "@simplewebauthn/browser";
import { changePasswordAction, deletePasskeyAction } from "@/actions/auth";
import { passwordStrength } from "@/lib/password";
import type { FormState } from "@/lib/form";

const initial: FormState = { status: "idle", message: "" };

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initial);
  const [next, setNext] = useState("");
  const [show, setShow] = useState(false);
  const error = (key: string) => state.fieldErrors?.[key];
  const strength = useMemo(() => passwordStrength(next), [next]);

  return (
    <form action={formAction} className="border border-line bg-cream p-5">
      <h2 className="font-display text-2xl">Change password</h2>
      <p className="mt-1 text-[11px] leading-relaxed text-stone">
        Changing your password signs out every other device. Your current session stays active.
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

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="current-password" className="label">Current password</label>
          <input
            id="current-password"
            name="currentPassword"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            className="field"
            required
          />
          {error("currentPassword") ? <p className="mt-1 text-[11px] text-oxblood">{error("currentPassword")}</p> : null}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="new-password" className="label">New password</label>
            <button
              type="button"
              onClick={() => setShow((value) => !value)}
              className="mb-1.5 inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.1em] text-stone hover:text-ink"
            >
              {show ? <EyeOff className="size-3" aria-hidden /> : <Eye className="size-3" aria-hidden />}
              {show ? "Hide" : "Show"}
            </button>
          </div>
          <input
            id="new-password"
            name="newPassword"
            type={show ? "text" : "password"}
            value={next}
            onChange={(event) => setNext(event.target.value)}
            autoComplete="new-password"
            className="field"
            required
          />
          <div className="mt-2 flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[1, 2, 3, 4, 5].map((step) => (
                <span
                  key={step}
                  className={`h-1 flex-1 transition-colors ${
                    strength.score >= step
                      ? strength.score >= 4
                        ? "bg-oxblood"
                        : strength.score === 3
                          ? "bg-champagne-dark"
                          : "bg-oxblood/40"
                      : "bg-line"
                  }`}
                />
              ))}
            </div>
            <span className="w-16 text-right text-[9px] uppercase tracking-[0.1em] text-stone">
              {next ? strength.label : ""}
            </span>
          </div>
          {next && strength.issues.length > 0 ? (
            <ul className="mt-2 space-y-1 text-[10px] text-stone">
              {strength.issues.slice(0, 3).map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          ) : null}
          {error("newPassword") ? <p className="mt-1 text-[11px] text-oxblood">{error("newPassword")}</p> : null}
        </div>

        <div>
          <label htmlFor="confirm-new-password" className="label">Confirm new password</label>
          <input
            id="confirm-new-password"
            name="confirmPassword"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            className="field"
            required
          />
          {error("confirmPassword") ? <p className="mt-1 text-[11px] text-oxblood">{error("confirmPassword")}</p> : null}
        </div>
      </div>

      <button type="submit" disabled={pending} className="btn-primary mt-4 disabled:opacity-60">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <KeyRound className="size-4" aria-hidden />}
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}

export type PasskeySummary = {
  id: string;
  deviceType: string;
  backedUp: boolean;
  transports: string;
  lastUsedAt: string | null;
  createdAt: string;
};

function transportLabel(value: string): string {
  if (value.includes("internal")) return "This device";
  if (value.includes("hybrid")) return "Phone or tablet";
  if (value.includes("usb") || value.includes("nfc")) return "Security key";
  return "Device";
}

export function PasskeyManager({ passkeys }: { passkeys: PasskeySummary[] }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingDelete, startDelete] = useTransition();
  const [removing, setRemoving] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported("PublicKeyCredential" in window);
  }, []);

  async function addPasskey() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const optionsResponse = await fetch("/api/passkeys/register/options", {
        method: "POST",
      });
      if (!optionsResponse.ok) {
        const data = (await optionsResponse.json()) as { error?: string };
        throw new Error(data.error || "Passkeys are unavailable.");
      }
      const options = await optionsResponse.json();
      const response = await startRegistration({ optionsJSON: options });
      const verify = await fetch("/api/passkeys/register/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(response),
      });
      const data = (await verify.json()) as { error?: string };
      if (!verify.ok) throw new Error(data.error || "Passkey registration failed.");
      setMessage("Passkey added. Use Face ID, your fingerprint or Windows Hello next time.");
      window.location.reload();
    } catch (cause) {
      const reason =
        cause instanceof Error && cause.name === "NotAllowedError"
          ? "Passkey setup was cancelled."
          : cause instanceof Error
            ? cause.message
            : "This device could not create a passkey.";
      setError(reason);
      setBusy(false);
    }
  }

  function remove(id: string) {
    setRemoving(id);
    startDelete(async () => {
      await deletePasskeyAction(id);
      setRemoving(null);
      window.location.reload();
    });
  }

  return (
    <div className="border border-line bg-cream p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl">Passkeys &amp; biometrics</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-stone">
            Sign in with Face ID, a fingerprint, Windows Hello or your device PIN. The biometric
            check happens on your device — we only store a public key.
          </p>
        </div>
        <span className="hidden size-11 shrink-0 place-items-center border border-oxblood/20 bg-oxblood/5 text-oxblood sm:grid">
          <Fingerprint className="size-5" aria-hidden />
        </span>
      </div>

      {!supported ? (
        <p className="mt-3 border border-line bg-ivory-deep/40 p-2.5 text-[10px] text-stone">
          This browser does not support passkeys. Try Safari, Chrome or Edge on a device with a
          screen lock.
        </p>
      ) : null}

      {message ? (
        <p className="mt-3 border border-oxblood/25 bg-oxblood/5 p-2.5 text-[11px] text-oxblood">{message}</p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 border border-oxblood/30 bg-oxblood/5 p-2.5 text-[11px] text-oxblood">{error}</p>
      ) : null}

      <ul className="mt-4 divide-y divide-line border border-line">
        {passkeys.length === 0 ? (
          <li className="p-4 text-[11px] text-stone">
            No passkeys yet. Add one to sign in without typing your password.
          </li>
        ) : (
          passkeys.map((passkey) => (
            <li key={passkey.id} className="flex items-center justify-between gap-3 p-3.5">
              <div className="flex items-center gap-3">
                <span className="grid size-8 place-items-center border border-line bg-ivory-deep/40 text-stone">
                  {passkey.transports.includes("usb") ? (
                    <Usb className="size-4" aria-hidden />
                  ) : (
                    <Fingerprint className="size-4" aria-hidden />
                  )}
                </span>
                <div>
                  <p className="text-[11px] font-medium text-ink">
                    {transportLabel(passkey.transports)}
                    {passkey.backedUp ? " · synced" : ""}
                  </p>
                  <p className="text-[9.5px] text-stone">
                    Added {passkey.createdAt}
                    {passkey.lastUsedAt ? ` · last used ${passkey.lastUsedAt}` : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(passkey.id)}
                disabled={pendingDelete}
                className="inline-flex items-center gap-1.5 border border-line px-2.5 py-1.5 text-[9px] uppercase tracking-[0.1em] text-stone transition-colors hover:border-oxblood hover:text-oxblood disabled:opacity-50"
              >
                {removing === passkey.id ? (
                  <Loader2 className="size-3 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="size-3" aria-hidden />
                )}
                Remove
              </button>
            </li>
          ))
        )}
      </ul>

      <button
        type="button"
        onClick={addPasskey}
        disabled={busy}
        className="btn-outline mt-4 disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ShieldCheck className="size-4" aria-hidden />}
        {busy ? "Waiting for your device…" : "Add a passkey"}
      </button>
      <p className="mt-2 text-[9.5px] leading-relaxed text-stone">
        Tip: add one passkey per device you use. You can remove lost devices here at any time.
      </p>
    </div>
  );
}
