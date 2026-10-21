import type { Metadata } from "next";
import Link from "next/link";
import { CartView } from "@/components/cart/cart-view";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review your Lovable Store selection before secure checkout.",
};

export default function CartPage() {
  return (
    <div className="container-lux py-10 sm:py-14">
      <Reveal>
        <nav className="text-[9px] uppercase tracking-[0.16em] text-stone" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-oxblood">
            Home
          </Link>
          <span className="mx-2 text-champagne">/</span>
          <span className="text-ink">Your bag</span>
        </nav>
        <p className="mt-6 eyebrow text-champagne-dark">The good part</p>
        <h1 className="mt-3 font-display text-[clamp(2.8rem,6vw,4.8rem)] leading-[0.95]">
          Your <span className="italic text-oxblood">selection</span>
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-stone">
          Wrapped by hand, dispatched from our studio and tracked all the way to
          their door.
        </p>
      </Reveal>

      <div className="mt-10">
        <CartView />
      </div>
    </div>
  );
}
