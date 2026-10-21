import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";
import { RetryButton } from "@/components/pwa/retry-button";

export const metadata: Metadata = {
  title: "You're offline",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-cream px-5 py-16">
      <div className="surface-card surface-grid w-full max-w-md p-8 text-center sm:p-10">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full border border-line bg-ivory text-oxblood">
          <WifiOff className="size-6" aria-hidden />
        </span>
        <p className="eyebrow mt-6 text-champagne-dark">Lovable Store</p>
        <h1 className="mt-3 font-display text-4xl leading-none sm:text-5xl">
          A quiet moment.
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-stone">
          You&apos;re offline. Saved pages and images still open — reconnect to
          browse the full store, check your bag or track an order.
        </p>
        <div className="mt-7 space-y-3">
          <RetryButton />
          <Link href="/" className="btn-outline w-full">
            Back to the store
          </Link>
        </div>
      </div>
    </main>
  );
}
