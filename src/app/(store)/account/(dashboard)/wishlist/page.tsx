import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { productInclude, toStoreProduct, imageFor, needsPlainImage } from "@/lib/products";
import { removeWishlistItemAction } from "@/actions/wishlist";
import { formatZAR } from "@/lib/format";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your wishlist",
  robots: { index: false, follow: false },
};

export default async function AccountWishlistPage() {
  const user = await requireUser("/account/wishlist");
  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: { product: { include: productInclude } },
    orderBy: { createdAt: "desc" },
  });

  const active = items.filter((item) => item.product.status === "ACTIVE");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-champagne-dark">Saved for later</p>
          <h1 className="mt-1 font-display text-3xl">Your wishlist.</h1>
          <p className="mt-1 text-[11px] text-stone">
            {active.length === 0
              ? "Tap the heart on any piece to keep it here."
              : `${active.length} piece${active.length === 1 ? "" : "s"} kept for another day.`}
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 border border-line bg-cream px-3 py-2 text-[9px] uppercase tracking-[0.12em] text-stone transition-colors hover:border-oxblood hover:text-oxblood"
        >
          Keep browsing
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>

      {active.length === 0 ? (
        <div className="mt-8 border border-dashed border-line bg-cream p-10 text-center">
          <Heart className="mx-auto size-8 text-stone" aria-hidden />
          <p className="mt-4 font-display text-2xl">Nothing saved yet.</p>
          <p className="mx-auto mt-1 max-w-sm text-[11px] leading-relaxed text-stone">
            Save watches, fragrance and gifts as you browse. Your wishlist follows your account
            across devices.
          </p>
          <Link href="/shop" className="btn-primary mt-5">
            Find something worth keeping
          </Link>
        </div>
      ) : (
        <StaggerGroup className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {active.map((item) => {
            const product = toStoreProduct(item.product);
            const primary = imageFor(product);
            return (
              <StaggerItem key={item.id}>
                <article className="group flex h-full flex-col border border-line bg-cream">
                  <Link
                    href={`/product/${product.slug}`}
                    className="relative block aspect-[4/5] overflow-hidden bg-ivory-deep"
                  >
                    <Image
                      src={primary}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      unoptimized={needsPlainImage(primary)}
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    {product.badge ? (
                      <span className="absolute left-2.5 top-2.5 bg-cream/95 px-2 py-0.5 text-[8.5px] uppercase tracking-[0.12em] text-oxblood">
                        {product.badge}
                      </span>
                    ) : null}
                  </Link>
                  <div className="flex flex-1 flex-col p-3">
                    <p className="text-[8.5px] uppercase tracking-[0.14em] text-stone">
                      {product.category}
                    </p>
                    <Link
                      href={`/product/${product.slug}`}
                      className="mt-1 line-clamp-2 font-display text-[1.05rem] leading-tight hover:text-oxblood"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-1.5 text-[11px] text-ink">{formatZAR(product.price)}</p>
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5">
                      <Link
                        href={`/product/${product.slug}`}
                        className="text-[8.5px] uppercase tracking-[0.12em] text-oxblood hover:text-ink"
                      >
                        View piece
                      </Link>
                      <form action={removeWishlistItemAction.bind(null, product.id)}>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 text-[8.5px] uppercase tracking-[0.1em] text-stone transition-colors hover:text-oxblood"
                          aria-label={`Remove ${product.name} from wishlist`}
                        >
                          <Trash2 className="size-3" aria-hidden />
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      )}

      {items.length > active.length ? (
        <p className="mt-6 text-[10px] text-stone">
          {items.length - active.length} saved piece
          {items.length - active.length === 1 ? " is" : "s are"} no longer available and hidden
          from this list.
        </p>
      ) : null}
    </div>
  );
}
