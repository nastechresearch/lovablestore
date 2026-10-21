"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CartDrawer } from "@/components/cart/cart-drawer";

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  quantity: number;
  stock: number;
};

type IncomingItem = Omit<CartItem, "key" | "quantity">;

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  hydrated: boolean;
  count: number;
  subtotal: number;
  addItem: (item: IncomingItem, quantity?: number) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "vv-cart-v1";

function itemKey(productId: string, size?: string): string {
  return `${productId}:${size || "one-size"}`;
}

function isValidCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<CartItem>;
  return Boolean(
    item.key &&
      item.productId &&
      item.slug &&
      item.name &&
      typeof item.price === "number" &&
      item.image &&
      typeof item.quantity === "number" &&
      typeof item.stock === "number",
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed.filter(isValidCartItem));
        }
      }
    } catch {
      // A corrupt saved cart should not block the storefront.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage can be unavailable in private browsing; the cart still works in-session.
    }
  }, [items, hydrated]);

  const addItem = useCallback((incoming: IncomingItem, quantity = 1) => {
    setItems((current) => {
      const key = itemKey(incoming.productId, incoming.size);
      const safeQuantity = Math.max(1, Math.min(quantity, incoming.stock));
      const existing = current.find((item) => item.key === key);

      if (existing) {
        return current.map((item) =>
          item.key === key
            ? {
                ...item,
                quantity: Math.min(item.stock, item.quantity + safeQuantity),
                stock: incoming.stock,
                price: incoming.price,
              }
            : item,
        );
      }

      return [...current, { ...incoming, key, quantity: safeQuantity }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) =>
          item.key === key
            ? { ...item, quantity: Math.max(0, Math.min(quantity, item.stock)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      isOpen,
      hydrated,
      count,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
    }),
    [
      items,
      isOpen,
      hydrated,
      count,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
