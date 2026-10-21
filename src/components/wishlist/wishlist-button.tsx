"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/components/wishlist/wishlist-provider";

export function WishlistButton({
  productId,
  productName,
  variant = "icon",
  className = "",
}: {
  productId: string;
  productName: string;
  variant?: "icon" | "labelled";
  className?: string;
}) {
  const { saved, toggle, isPending, ready } = useWishlist();
  const active = saved(productId);
  const pending = isPending(productId);

  if (variant === "labelled") {
    return (
      <button
        type="button"
        onClick={() => toggle(productId)}
        aria-pressed={active}
        disabled={pending}
        className={`btn-outline ${active ? "border-oxblood text-oxblood" : ""} disabled:opacity-60 ${className}`}
      >
        <Heart
          className={`size-4 ${active ? "fill-oxblood text-oxblood" : ""}`}
          aria-hidden
        />
        {active ? "Saved to wishlist" : "Save to wishlist"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-pressed={active}
      aria-label={
        active
          ? `Remove ${productName} from your wishlist`
          : `Save ${productName} to your wishlist`
      }
      disabled={pending}
      className={`flex size-11 items-center justify-center bg-cream/95 text-ink shadow-soft backdrop-blur-sm transition-all duration-300 hover:bg-oxblood hover:text-ivory disabled:opacity-60 ${active ? "text-oxblood" : ""} ${className}`}
    >
      <Heart
        className={`size-4 transition-transform duration-200 ${
          active ? "scale-110 fill-oxblood text-oxblood" : ""
        } ${!ready && active ? "animate-pulse" : ""}`}
        aria-hidden
      />
    </button>
  );
}
