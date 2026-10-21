"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Loader2 } from "lucide-react";
import { loginAction } from "@/actions/admin-auth";
import type { FormState } from "@/lib/form";

const initial: FormState = { status: "idle", message: "" };

export function LoginForm({ showDemoHint }: { showDemoHint: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, initial);
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <div>
        <label htmlFor="password" className="label">Admin password</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            className="field pr-12"
            autoComplete="current-password"
            required
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            className="absolute right-0 top-0 flex h-full w-11 items-center justify-center text-stone transition-colors hover:text-ink"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
          </button>
        </div>
      </div>

      {state.status === "error" ? (
        <p role="alert" className="border border-oxblood/30 bg-oxblood/5 p-3 text-[11px] text-oxblood">
          {state.message}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Opening the desk…
          </>
        ) : (
          <>
            <LockKeyhole className="size-4" aria-hidden />
            Enter atelier desk
          </>
        )}
      </button>

      {showDemoHint ? (
        <p className="border border-line bg-ivory px-3 py-2.5 text-[10px] leading-relaxed text-stone">
          Demo environment — the password is{" "}
          <code className="bg-ivory-deep px-1.5 py-0.5 text-ink">blacks-market-admin</code>.
          Set <code>ADMIN_PASSWORD</code> in the environment before going live.
        </p>
      ) : null}
    </form>
  );
}
