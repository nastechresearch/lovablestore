"use client";

import { MotionConfig } from "motion/react";
import { CartProvider } from "@/components/cart/cart-provider";
import { WishlistProvider } from "@/components/wishlist/wishlist-provider";
import { FlyToBagLayer } from "@/components/motion/fly-to-bag";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <CartProvider>
        <WishlistProvider>
          {children}
          <FlyToBagLayer />
        </WishlistProvider>
      </CartProvider>
    </MotionConfig>
  );
}
