"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Check,
  CreditCard,
  Gift,
  Loader2,
  MapPin,
  ShieldCheck,
  Tag,
  Truck,
  User,
} from "lucide-react";
import { placeOrderAction } from "@/actions/checkout";
import type { CheckoutState } from "@/actions/checkout";
import { checkPromoAction } from "@/actions/promo";
import type { PromoCheck } from "@/actions/promo";
import { useCart } from "@/components/cart/cart-provider";
import { CardPayment } from "@/components/checkout/card-payment";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { LocationFields } from "@/components/checkout/location-fields";
import { formatZAR, shippingForSubtotal } from "@/lib/format";
import { needsPlainImage } from "@/lib/products";

const initialState: CheckoutState = { status: "idle", message: "" };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-[11px] text-oxblood">
      {message}
    </p>
  );
}

export function CheckoutForm({
  demo,
  cancelled,
  initialPromo = "",
}: {
  demo: boolean;
  cancelled?: boolean;
  initialPromo?: string;
}) {
  const { items, hydrated, subtotal, count, clearCart } = useCart();
  const [state, formAction, pending] = useActionState(placeOrderAction, initialState);
  const [promoCode, setPromoCode] = useState(initialPromo);
  const [applied, setApplied] = useState<PromoCheck | null>(null);
  const [promoChecking, setPromoChecking] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const cardValidatorRef = useRef<(() => boolean) | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const validator = cardValidatorRef.current;
    if (!validator) return;
    if (!validator()) {
      event.preventDefault();
      document
        .getElementById("payment-heading")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  const cartPayload = useMemo(
    () =>
      JSON.stringify(
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
        })),
      ),
    [items],
  );

  const shipping = applied?.ok && applied.freeShipping ? 0 : shippingForSubtotal(subtotal);
  const discount = applied?.ok ? applied.discount ?? 0 : 0;
  const total = Math.max(0, subtotal - discount + shipping);

  useEffect(() => {
    if (!state.payfast) return;
    const form = document.createElement("form");
    form.method = "POST";
    form.action = state.payfast.url;
    for (const [name, value] of Object.entries(state.payfast.fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  }, [state.payfast]);

  useEffect(() => {
    if (state.status === "error") {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [state]);

  async function applyPromo() {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      setPromoError("Enter a code to apply.");
      return;
    }
    setPromoChecking(true);
    setPromoError(null);
    try {
      const result = await checkPromoAction(code, cartPayload);
      if (!result.ok) {
        setApplied(null);
        setPromoError(result.message);
      } else {
        setApplied(result);
        setPromoCode(code);
      }
    } catch {
      setPromoError("We could not check that code. Try again.");
    } finally {
      setPromoChecking(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-oxblood" aria-hidden />
        <span className="sr-only">Loading your bag</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-line bg-cream px-6 py-16 text-center">
        <p className="eyebrow text-champagne-dark">Checkout</p>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl">Your bag is empty.</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-stone">
          Add something you love before heading to checkout — the gift finder is
          a good place to start.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn-primary">
            Shop all
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/gift-finder" className="btn-outline">
            Gift finder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="grid gap-10 pb-24 lg:grid-cols-[1.3fr_0.7fr] lg:gap-14 lg:pb-0">
      <input type="hidden" name="cart" value={cartPayload} />
      <input type="hidden" name="promoCode" value={applied?.ok ? promoCode : ""} />

      <div className="space-y-10">
        <CheckoutProgress confirmed={confirmed} />

        {cancelled ? (
          <div className="border border-champagne-dark/40 bg-champagne/10 p-4 text-[12px] leading-relaxed text-ink-soft">
            Payment was cancelled at PayFast. Your bag is still here — try again
            when you&apos;re ready.
          </div>
        ) : null}

        {demo ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border border-champagne-dark/40 bg-champagne/10 px-4 py-3 text-[11px] leading-relaxed text-ink-soft">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-champagne-dark" aria-hidden />
              Demo checkout is active — PayFast keys aren&apos;t configured yet.
            </span>
            <span className="uppercase tracking-[0.14em] text-champagne-dark">
              No real payment is taken
            </span>
          </div>
        ) : null}

        {state.status === "error" ? (
          <div role="alert" className="border border-oxblood/40 bg-oxblood/5 p-4 text-[12px] leading-relaxed text-oxblood">
            {state.message}
          </div>
        ) : null}

        <section aria-labelledby="contact-heading">
          <div className="flex items-center gap-3 border-b border-line pb-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-ink text-[11px] text-ivory">1</span>
            <h2 id="contact-heading" className="flex items-center gap-2 font-display text-2xl">
              <User className="size-4 text-champagne-dark" aria-hidden />
              Contact
            </h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="label">First name</label>
              <input id="firstName" name="firstName" autoComplete="given-name" className="field" required />
              <FieldError message={state.fieldErrors?.firstName} />
            </div>
            <div>
              <label htmlFor="lastName" className="label">Last name</label>
              <input id="lastName" name="lastName" autoComplete="family-name" className="field" required />
              <FieldError message={state.fieldErrors?.lastName} />
            </div>
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" className="field" placeholder="you@example.co.za" required />
              <FieldError message={state.fieldErrors?.email} />
              <p className="mt-1.5 text-[10px] text-stone">Order updates and tracking go here.</p>
            </div>
            <div>
              <label htmlFor="phone" className="label">Mobile number</label>
              <input id="phone" name="phone" type="tel" autoComplete="tel" className="field" placeholder="082 000 0000" required />
              <FieldError message={state.fieldErrors?.phone} />
              <p className="mt-1.5 text-[10px] text-stone">For courier SMS updates.</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="delivery-heading">
          <div className="flex items-center gap-3 border-b border-line pb-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-ink text-[11px] text-ivory">2</span>
            <h2 id="delivery-heading" className="flex items-center gap-2 font-display text-2xl">
              <MapPin className="size-4 text-champagne-dark" aria-hidden />
              Delivery
            </h2>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="address" className="label">Street address</label>
              <input id="address" name="address" autoComplete="street-address" className="field" placeholder="12 Rose Street, Parkhurst" required />
              <FieldError message={state.fieldErrors?.address} />
            </div>
            <LocationFields
              errors={{
                city: state.fieldErrors?.city,
                province: state.fieldErrors?.province,
                postalCode: state.fieldErrors?.postalCode,
              }}
            />
            <div className="sm:col-span-2">
              <label htmlFor="notes" className="label">Delivery notes <span className="normal-case tracking-normal text-stone">(optional)</span></label>
              <input id="notes" name="notes" className="field" placeholder="Gate code, complex name, landmark…" />
              <FieldError message={state.fieldErrors?.notes} />
            </div>
          </div>
        </section>

        <section aria-labelledby="gifting-heading">
          <div className="flex items-center gap-3 border-b border-line pb-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-ink text-[11px] text-ivory">3</span>
            <h2 id="gifting-heading" className="flex items-center gap-2 font-display text-2xl">
              <Gift className="size-4 text-champagne-dark" aria-hidden />
              Gifting
            </h2>
          </div>
          <div className="mt-5">
            <label htmlFor="giftNote" className="label">Handwritten note <span className="normal-case tracking-normal text-stone">(optional, free)</span></label>
            <textarea
              id="giftNote"
              name="giftNote"
              rows={3}
              maxLength={300}
              className="field resize-none"
              placeholder="For you, always. Happy anniversary."
            />
            <FieldError message={state.fieldErrors?.giftNote} />
            <p className="mt-1.5 text-[10px] text-stone">
              Every order is wrapped in signature ivory packaging with a ribbon.
            </p>
          </div>
        </section>

        <section aria-labelledby="payment-heading">
          <div className="flex items-center gap-3 border-b border-line pb-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-ink text-[11px] text-ivory">4</span>
            <h2 id="payment-heading" className="flex items-center gap-2 font-display text-2xl">
              <CreditCard className="size-4 text-champagne-dark" aria-hidden />
              Payment
            </h2>
          </div>
          <div className="mt-5">
            <CardPayment
              demo={demo}
              total={total}
              formRef={formRef}
              errorSignal={state.status === "error" ? state.message : ""}
              validatorRef={cardValidatorRef}
              onConfirm={() => {
                setConfirmed(true);
                formRef.current?.requestSubmit();
              }}
              onBlocked={() =>
                document
                  .getElementById("payment-heading")
                  ?.scrollIntoView({ behavior: "smooth", block: "center" })
              }
            />
          </div>
        </section>

        <p className="text-[10px] leading-relaxed text-stone">
          By placing your order you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-oxblood">terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-oxblood">privacy &amp; POPIA policy</Link>.
          We use your details only to fulfil this order and keep you updated.
        </p>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="border border-line bg-cream p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-3xl">Your order</h2>
            <span className="text-[10px] uppercase tracking-[0.14em] text-stone">{count} {count === 1 ? "item" : "items"}</span>
          </div>

          <ul className="mt-5 space-y-4 pr-1 lg:max-h-[19rem] lg:overflow-y-auto">
            {items.map((item) => (
              <li key={item.key} className="flex gap-3">
                <div className="relative aspect-[4/5] w-14 shrink-0 overflow-hidden bg-ivory-deep">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    unoptimized={needsPlainImage(item.image)}
                    sizes="56px"
                    className="object-cover"
                  />
                  <span className="absolute right-0 top-0 flex size-5 items-center justify-center bg-black/85 text-[9px] text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg leading-tight">{item.name}</p>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-stone">
                    {item.size ? `${item.size} · ` : ""}{formatZAR(item.price)}
                  </p>
                </div>
                <p className="text-xs tabular-nums">{formatZAR(item.price * item.quantity)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 border-t border-line pt-5">
            <label htmlFor="promo" className="label flex items-center gap-1.5">
              <Tag className="size-3" aria-hidden />
              Promo code
            </label>
            <div className="flex gap-2">
              <input
                id="promo"
                value={promoCode}
                onChange={(event) => {
                  setPromoCode(event.target.value.toUpperCase());
                  setApplied(null);
                  setPromoError(null);
                }}
                className="field min-h-11 flex-1 uppercase tracking-[0.08em]"
                placeholder="LOVE10"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={applyPromo}
                disabled={promoChecking}
                className="btn-outline min-h-11 shrink-0 px-4 text-[10px] disabled:opacity-50"
              >
                {promoChecking ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : "Apply"}
              </button>
            </div>
            <AnimatePresence mode="wait">
              {applied?.ok ? (
                <motion.p
                  key="applied"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-2 flex items-center gap-1.5 text-[11px] text-oxblood"
                >
                  <Check className="size-3.5" aria-hidden />
                  {applied.code} applied — {applied.label}
                </motion.p>
              ) : promoError ? (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  role="alert"
                  className="mt-2 text-[11px] text-oxblood"
                >
                  {promoError}
                </motion.p>
              ) : (
                <p key="hint" className="mt-2 text-[10px] text-stone">
                  Try LOVE10 for 10% off your first order.
                </p>
              )}
            </AnimatePresence>
          </div>

          <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-stone">Subtotal</dt>
              <dd>{formatZAR(subtotal)}</dd>
            </div>
            {discount > 0 ? (
              <div className="flex justify-between gap-4 text-oxblood">
                <dt>Discount</dt>
                <dd>−{formatZAR(discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-stone">Delivery</dt>
              <dd>{shipping === 0 ? "Complimentary" : formatZAR(shipping)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
              <dt className="text-[11px] uppercase tracking-[0.14em]">Total</dt>
              <dd className="font-display text-3xl">{formatZAR(total)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[9.5px] text-stone">
            All prices include 15% VAT. Free delivery from R950, otherwise R85 nationwide.
          </p>

          <button
            type="submit"
            data-checkout-commit
            disabled={pending}
            className="btn-primary mt-6 w-full disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Placing order…
              </>
            ) : (
              <>
                {demo ? "Complete demo order" : "Swipe or pay securely"}
                <ArrowRight className="size-4" aria-hidden />
              </>
            )}
          </button>

          <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-stone">
            <Truck className="size-3.5" aria-hidden />
            Dispatch in 1–2 business days
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="mt-4 w-full text-center text-[10px] uppercase tracking-[0.14em] text-stone transition-colors hover:text-oxblood"
        >
          Empty bag and start over
        </button>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-cream/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-lift backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] uppercase tracking-[0.16em] text-stone">
              Total · {count} {count === 1 ? "item" : "items"}
            </p>
            <p className="font-display text-xl leading-tight">{formatZAR(total)}</p>
          </div>
          <button
            type="submit"
            data-checkout-commit
            disabled={pending}
            className="btn-primary shrink-0 px-5 text-[10px] disabled:cursor-wait disabled:opacity-70"
          >
            {pending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Placing…
              </>
            ) : (
              <>
                {demo ? "Complete order" : "Pay securely"}
                <ArrowRight className="size-3.5" aria-hidden />
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
