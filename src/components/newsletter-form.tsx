"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { subscribeToNewsletter } from "@/actions/newsletter";
import type { NewsletterState } from "@/lib/newsletter-types";

const initialState: NewsletterState = { status: "idle", message: "" };

function SubmitButton({ tone }: { tone: "light" | "dark" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        tone === "dark"
          ? "flex min-h-12 items-center justify-center gap-2 bg-champagne px-5 text-[11px] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:bg-ivory disabled:opacity-60"
          : "btn-primary disabled:opacity-60"
      }
    >
      {pending ? "Joining…" : "Join the list"}
      <ArrowRight className="size-4" aria-hidden />
    </button>
  );
}

export function NewsletterForm({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [state, formAction] = useActionState(subscribeToNewsletter, initialState);
  const dark = tone === "dark";

  if (state.status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-start gap-3 border p-4 ${
          dark ? "border-ivory/20 text-ivory" : "border-line text-ink"
        }`}
        role="status"
        aria-live="polite"
      >
        <span
          className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full ${
            dark ? "bg-champagne text-ink" : "bg-oxblood text-ivory"
          }`}
        >
          <Check className="size-4" aria-hidden />
        </span>
        <p className="text-sm leading-relaxed">{state.message}</p>
      </motion.div>
    );
  }

  return (
    <form action={formAction} className="w-full">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`newsletter-${tone}`} className="sr-only">
          Email address
        </label>
        <input
          id={`newsletter-${tone}`}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          placeholder="Your email address"
          className={
            dark
              ? "min-h-12 w-full flex-1 border border-ivory/25 bg-transparent px-4 text-base text-ivory placeholder:text-ivory/70 focus:border-champagne focus:outline-none sm:text-sm"
              : "field flex-1"
          }
        />
        <SubmitButton tone={tone} />
      </div>
      <AnimatePresence>
        {state.status === "error" ? (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mt-2 text-xs ${dark ? "text-champagne" : "text-oxblood"}`}
            role="alert"
          >
            {state.message}
          </motion.p>
        ) : null}
      </AnimatePresence>
      <p className={`mt-3 text-[11px] leading-relaxed ${dark ? "text-ivory/70" : "text-stone"}`}>
        First looks, new arrivals and gift edits. No noise. Unsubscribe anytime.
      </p>
    </form>
  );
}
