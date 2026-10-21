"use client";

import { useActionState, useState } from "react";
import { Loader2, Star } from "lucide-react";
import { submitReviewAction } from "@/actions/reviews";
import type { FormState } from "@/lib/form";

const initial: FormState = { status: "idle", message: "" };

export function ReviewForm({
  productId,
  signedIn,
  name = "",
}: {
  productId: string;
  signedIn: boolean;
  name?: string;
}) {
  const [state, formAction, pending] = useActionState(submitReviewAction, initial);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const error = (key: string) => state.fieldErrors?.[key];

  if (state.status === "success") {
    return (
      <div className="mt-6 border border-oxblood/25 bg-oxblood/5 p-5">
        <p className="font-display text-xl text-oxblood">Thank you.</p>
        <p className="mt-1 text-[11px] leading-relaxed text-stone">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-6 border border-line bg-ivory p-5">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-2xl">Write a review</h3>
        <span className="text-[9px] uppercase tracking-[0.12em] text-stone">
          {signedIn ? `Reviewing as ${name || "your account"}` : "Guest review"}
        </span>
      </div>

      {state.status === "error" ? (
        <p role="alert" className="mt-3 border border-oxblood/30 bg-oxblood/5 p-2.5 text-[11px] text-oxblood">
          {state.message}
        </p>
      ) : null}

      <div className="mt-4">
        <span className="label">Your rating</span>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => setRating(score)}
              onMouseEnter={() => setHover(score)}
              className="p-0.5"
              aria-label={`${score} star${score === 1 ? "" : "s"}`}
              aria-pressed={rating === score}
            >
              <Star
                className={`size-6 transition-colors ${
                  score <= (hover || rating)
                    ? "fill-champagne text-champagne"
                    : "text-line"
                }`}
                aria-hidden
              />
            </button>
          ))}
          <span className="ml-2 text-[10px] uppercase tracking-[0.1em] text-stone">
            {rating ? `${rating} of 5` : "Tap to rate"}
          </span>
        </div>
        {error("rating") ? <p className="mt-1 text-[11px] text-oxblood">{error("rating")}</p> : null}
      </div>

      {!signedIn ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="review-name" className="label">Your name</label>
            <input id="review-name" name="name" className="field" placeholder="Thandi M." required />
            {error("name") ? <p className="mt-1 text-[11px] text-oxblood">{error("name")}</p> : null}
          </div>
          <div>
            <label htmlFor="review-email" className="label">Email</label>
            <input
              id="review-email"
              name="email"
              type="email"
              className="field"
              placeholder="you@example.co.za"
              required
            />
            {error("email") ? <p className="mt-1 text-[11px] text-oxblood">{error("email")}</p> : null}
            <p className="mt-1 text-[9px] text-stone">Never published. Used to verify your order.</p>
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <label htmlFor="review-title" className="label">Headline</label>
        <input
          id="review-title"
          name="title"
          className="field"
          placeholder="The watch I reach for every day"
          required
        />
        {error("title") ? <p className="mt-1 text-[11px] text-oxblood">{error("title")}</p> : null}
      </div>

      <div className="mt-4">
        <label htmlFor="review-body" className="label">Your review</label>
        <textarea
          id="review-body"
          name="body"
          className="field min-h-[110px] resize-y"
          placeholder="How does it feel? How was the fit, the finish, the wrapping?"
          required
        />
        {error("body") ? <p className="mt-1 text-[11px] text-oxblood">{error("body")}</p> : null}
      </div>

      <button type="submit" disabled={pending} className="btn-primary mt-4 disabled:opacity-60">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Star className="size-4" aria-hidden />}
        {pending ? "Sending…" : "Submit review"}
      </button>
      <p className="mt-2 text-[9px] leading-relaxed text-stone">
        Reviews are checked for spam. Verified purchases are published immediately.
      </p>
    </form>
  );
}
