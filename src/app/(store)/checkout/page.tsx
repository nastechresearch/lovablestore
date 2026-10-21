import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { isDemoCheckout } from "@/lib/payfast";
import { Reveal } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Secure checkout",
  description: "Complete your Lovable Store order with secure delivery across South Africa.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ cancelled?: string; promo?: string }>;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const demo = isDemoCheckout();

  return (
    <div className="container-lux py-10 sm:py-14">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <nav className="text-[9px] uppercase tracking-[0.16em] text-stone" aria-label="Breadcrumb">
              <Link href="/" className="transition-colors hover:text-oxblood">Home</Link>
              <span className="mx-2 text-champagne">/</span>
              <Link href="/cart" className="transition-colors hover:text-oxblood">Bag</Link>
              <span className="mx-2 text-champagne">/</span>
              <span className="text-ink">Checkout</span>
            </nav>
            <p className="mt-6 eyebrow text-champagne-dark">Almost theirs</p>
            <h1 className="mt-3 font-display text-[clamp(2.6rem,5.5vw,4.4rem)] leading-[0.95]">
              Secure <span className="italic text-oxblood">checkout</span>
            </h1>
          </div>
          <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-stone">
            <span className="size-1.5 rounded-full bg-champagne-dark" aria-hidden />
            Encrypted · POPIA compliant · PayFast
          </p>
        </div>
      </Reveal>

      <div className="mt-10">
        <CheckoutForm
          demo={demo}
          cancelled={params.cancelled === "1"}
          initialPromo={params.promo?.toUpperCase() ?? ""}
        />
      </div>
    </div>
  );
}
