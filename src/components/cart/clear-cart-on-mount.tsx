"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/cart/cart-provider";

export function ClearCartOnMount() {
  const { clearCart, hydrated } = useCart();
  const cleared = useRef(false);

  useEffect(() => {
    if (!hydrated || cleared.current) return;
    cleared.current = true;
    clearCart();
  }, [clearCart, hydrated]);

  return null;
}
