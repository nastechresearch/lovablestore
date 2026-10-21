"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { formatZAR } from "@/lib/format";

export function CartDrawer() {
  const {
    items,
    isOpen,
    subtotal,
    closeCart,
    removeItem,
    updateQuantity,
    count,
  } = useCart();
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeCart();
    // Close only when the route actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeCart]);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[90]">
          <motion.button
            type="button"
            aria-label="Close shopping bag"
            className="absolute inset-0 h-full w-full bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            className="absolute right-0 top-0 flex h-dvh w-full max-w-md flex-col bg-cream shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-5 sm:px-6">
              <div>
                <p className="eyebrow text-stone">Your selection</p>
                <h2 className="mt-1 font-display text-3xl">
                  The bag <span className="text-stone">({count})</span>
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={closeCart}
                className="flex size-11 items-center justify-center rounded-full border border-line transition-colors hover:border-ink"
                aria-label="Close shopping bag"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div className="border-b border-line px-5 py-4 sm:px-6">
              <p className="text-xs tracking-wide text-stone">
                {remaining > 0
                  ? `You're ${formatZAR(remaining)} away from complimentary delivery.`
                  : "Complimentary delivery unlocked."}
              </p>
              <div className="mt-3 h-[3px] overflow-hidden bg-ivory-deep">
                <motion.div
                  className="h-full origin-left bg-oxblood"
                  initial={false}
                  animate={{ scaleX: progress / 100 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <span className="flex size-16 items-center justify-center rounded-full border border-line">
                  <ShoppingBag className="size-6 text-oxblood" aria-hidden />
                </span>
                <h3 className="mt-6 font-display text-3xl">Your bag is waiting.</h3>
                <p className="mt-3 max-w-[26ch] text-sm leading-relaxed text-stone">
                  Start with a watch, a signature scent, or a gift that arrives
                  ready to give.
                </p>
                <Link href="/shop" onClick={closeCart} className="btn-primary mt-7">
                  Explore the store
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
                <ul className="divide-y divide-line">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.key}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        className="flex gap-4 py-5 first:pt-0"
                      >
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="relative aspect-[4/5] w-[84px] shrink-0 overflow-hidden bg-ivory-deep"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="84px"
                            className="object-cover"
                          />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={`/product/${item.slug}`}
                                onClick={closeCart}
                                className="font-display text-lg leading-tight hover:text-oxblood"
                              >
                                {item.name}
                              </Link>
                              {item.size ? (
                                <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-stone">
                                  {item.size}
                                </p>
                              ) : null}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.key)}
                              className="flex size-10 shrink-0 items-center justify-center text-stone transition-colors hover:text-oxblood"
                              aria-label={`Remove ${item.name}`}
                            >
                              <X className="size-4" aria-hidden />
                            </button>
                          </div>
                          <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                            <div className="flex items-center border border-line">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.key, item.quantity - 1)
                                }
                                className="flex size-11 items-center justify-center transition-colors hover:bg-ivory-deep"
                                aria-label={`Decrease quantity of ${item.name}`}
                              >
                                <Minus className="size-3.5" aria-hidden />
                              </button>
                              <span className="w-8 text-center text-sm tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuantity(item.key, item.quantity + 1)
                                }
                                className="flex size-11 items-center justify-center transition-colors hover:bg-ivory-deep disabled:opacity-30"
                                aria-label={`Increase quantity of ${item.name}`}
                                disabled={item.quantity >= item.stock}
                              >
                                <Plus className="size-3.5" aria-hidden />
                              </button>
                            </div>
                            <p className="text-sm font-medium">
                              {formatZAR(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
            )}

            {items.length > 0 ? (
              <div className="border-t border-line bg-ivory px-5 py-5 sm:px-6">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-[0.16em] text-stone">
                    Subtotal
                  </span>
                  <span className="font-display text-2xl">{formatZAR(subtotal)}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-stone">
                  Delivery calculated at checkout. Complimentary gift wrap is
                  included.
                </p>
                <div className="mt-5 grid gap-2.5">
                  <Link href="/checkout" onClick={closeCart} className="btn-primary w-full">
                    Checkout securely
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                  <Link href="/cart" onClick={closeCart} className="btn-outline w-full">
                    View bag
                  </Link>
                </div>
              </div>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
