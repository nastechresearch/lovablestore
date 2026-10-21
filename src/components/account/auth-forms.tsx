"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Eye,
  EyeOff,
  Fingerprint,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { startAuthentication } from "@simplewebauthn/browser";
import { passwordStrength } from "@/lib/password";
import type { FormState } from "@/lib/form";
import { loginAction, registerAction } from "@/actions/auth";

const initial: FormState = { status: "idle", message: "" };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initial);
  const [show, setShow] = useState(false);
  const error = (key: string) => state.fieldErrors?.[key];

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      {state.status === "error" ? (
        <p role="alert" className="border border-oxblood/30 bg-oxblood/5 p-3 text-[11px] text-oxblood">
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="login-email" className="label">Email address</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          className="field"
          placeholder="you@example.co.za"
          required
        />
        {error("email") ? <p className="mt-1 text-[11px] text-oxblood">{error("email")}</p> : null}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="label">Password</label>
          <Link href="/contact" className="text-[9px] uppercase tracking-[0.1em] text-stone hover:text-oxblood">
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <input
            id="login-password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            className="field pr-11"
            placeholder="Your password"
            required
          />
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-ink"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {error("password") ? <p className="mt-1 text-[11px] text-oxblood">{error("password")}</p> : null}
      </div>

      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <LockKeyhole className="size-4" aria-hidden />}
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[9px] uppercase tracking-[0.16em] text-stone">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <PasskeyLoginButton />

      <p className="text-center text-[11px] text-stone">
        New to the house?{" "}
        <Link href="/account/register" className="font-medium text-oxblood hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function PasskeyLoginButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signIn() {
    setBusy(true);
    setError("");
    try {
      const optionsResponse = await fetch("/api/passkeys/login/options", {
        method: "POST",
      });
      if (!optionsResponse.ok) {
        const data = (await optionsResponse.json()) as { error?: string };
        throw new Error(data.error || "Passkey sign-in is unavailable.");
      }
      const options = await optionsResponse.json();
      const response = await startAuthentication({ optionsJSON: options });
      const verifyResponse = await fetch("/api/passkeys/login/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(response),
      });
      const data = (await verifyResponse.json()) as { error?: string; redirect?: string };
      if (!verifyResponse.ok) throw new Error(data.error || "Passkey sign-in failed.");
      window.location.href = data.redirect || "/account";
    } catch (cause) {
      const message =
        cause instanceof Error && cause.name === "NotAllowedError"
          ? "Passkey sign-in was cancelled."
          : cause instanceof Error
            ? cause.message
            : "Passkey sign-in is unavailable on this device.";
      setError(message);
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={signIn}
        disabled={busy}
        className="btn-outline w-full disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Fingerprint className="size-4" aria-hidden />}
        {busy ? "Waiting for your device…" : "Use Face ID, fingerprint or passkey"}
      </button>
      {error ? <p className="mt-2 text-[10px] text-oxblood">{error}</p> : null}
      <p className="mt-2 text-center text-[9px] leading-relaxed text-stone">
        Biometric checks happen on your device. We never see your face or fingerprint.
      </p>
    </div>
  );
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initial);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const error = (key: string) => state.fieldErrors?.[key];
  const strength = useMemo(
    () =>
      passwordStrength(password, [
        firstName,
        lastName,
        email.split("@")[0] ?? "",
      ]),
    [password, firstName, lastName, email],
  );

  return (
    <form action={formAction} className="space-y-4">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      {state.status === "error" ? (
        <p role="alert" className="border border-oxblood/30 bg-oxblood/5 p-3 text-[11px] text-oxblood">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="first-name" className="label">First name</label>
          <input
            id="first-name"
            name="firstName"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            autoComplete="given-name"
            className="field"
            required
          />
          {error("firstName") ? <p className="mt-1 text-[11px] text-oxblood">{error("firstName")}</p> : null}
        </div>
        <div>
          <label htmlFor="last-name" className="label">Last name</label>
          <input
            id="last-name"
            name="lastName"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            autoComplete="family-name"
            className="field"
            required
          />
          {error("lastName") ? <p className="mt-1 text-[11px] text-oxblood">{error("lastName")}</p> : null}
        </div>
      </div>

      <div>
        <label htmlFor="register-email" className="label">Email address</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone" aria-hidden />
          <input
            id="register-email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className="field pl-10"
            placeholder="you@example.co.za"
            required
          />
        </div>
        {error("email") ? <p className="mt-1 text-[11px] text-oxblood">{error("email")}</p> : null}
        <p className="mt-1 text-[9.5px] text-stone">
          Permanent inboxes only. Temporary and disposable email domains are blocked.
        </p>
      </div>

      <div>
        <label htmlFor="register-phone" className="label">Mobile number (optional)</label>
        <input
          id="register-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className="field"
          placeholder="082 123 4567"
        />
        {error("phone") ? <p className="mt-1 text-[11px] text-oxblood">{error("phone")}</p> : null}
      </div>

      <div>
        <label htmlFor="register-password" className="label">Password</label>
        <div className="relative">
          <input
            id="register-password"
            name="password"
            type={show ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            className="field pr-11"
            required
          />
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone hover:text-ink"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
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
            {password ? strength.label : ""}
          </span>
        </div>
        {password && strength.issues.length > 0 ? (
          <ul className="mt-2 space-y-1 text-[10px] text-stone">
            {strength.issues.slice(0, 3).map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[9.5px] text-stone">
            10+ characters with upper and lower case, a number and a symbol.
          </p>
        )}
        {error("password") ? <p className="mt-1 text-[11px] text-oxblood">{error("password")}</p> : null}
      </div>

      <div>
        <label htmlFor="confirm-password" className="label">Confirm password</label>
        <input
          id="confirm-password"
          name="confirmPassword"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          className="field"
          required
        />
        {error("confirmPassword") ? <p className="mt-1 text-[11px] text-oxblood">{error("confirmPassword")}</p> : null}
      </div>

      <label className="flex items-start gap-2.5 text-[11px] leading-relaxed text-stone">
        <input type="checkbox" name="terms" className="mt-0.5 size-4 accent-oxblood" required />
        <span>
          I agree to the{" "}
          <Link href="/terms" className="text-oxblood hover:underline">terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-oxblood hover:underline">privacy policy</Link>.
        </span>
      </label>
      {error("terms") ? <p className="text-[11px] text-oxblood">{error("terms")}</p> : null}

      <label className="flex items-center gap-2.5 text-[11px] text-stone">
        <input type="checkbox" name="newsletter" className="size-4 accent-oxblood" />
        Send me occasional edits and early access. No noise.
      </label>

      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ShieldCheck className="size-4" aria-hidden />}
        {pending ? "Creating your account…" : "Create account"}
      </button>

      <p className="text-center text-[11px] text-stone">
        Already have an account?{" "}
        <Link href="/account/login" className="font-medium text-oxblood hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function AccountPerks() {
  const perks = [
    "Order history and live tracking in one place",
    "Passkey sign-in with Face ID or fingerprint",
    "Save pieces to your wishlist",
    "Faster checkout with saved details",
  ];
  return (
    <ul className="space-y-3">
      {perks.map((perk) => (
        <li key={perk} className="flex items-start gap-2.5 text-[11px] leading-relaxed text-stone">
          <Check className="mt-0.5 size-3.5 shrink-0 text-oxblood" aria-hidden />
          {perk}
        </li>
      ))}
    </ul>
  );
}
