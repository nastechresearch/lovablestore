"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { toggleWishlistAction } from "@/actions/wishlist";

type WishlistContextValue = {
  saved: (productId: string) => boolean;
  toggle: (productId: string) => void;
  isPending: (productId: string) => boolean;
  count: number;
  ready: boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ids, setIds] = useState<string[]>([]);
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/wishlist", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { ids?: string[] } | null) => {
        if (!active || !data?.ids) return;
        setIds(data.ids);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const saved = useCallback(
    (productId: string) => ids.includes(productId),
    [ids],
  );

  const isPending = useCallback(
    (productId: string) => pendingIds.includes(productId),
    [pendingIds],
  );

  const toggle = useCallback(
    (productId: string) => {
      setPendingIds((current) =>
        current.includes(productId) ? current : [...current, productId],
      );
      const wasSaved = ids.includes(productId);

      setIds((current) =>
        wasSaved
          ? current.filter((id) => id !== productId)
          : [...current, productId],
      );

      void toggleWishlistAction(productId)
        .then((result) => {
          if (result.requiresAuth) {
            setIds((current) => current.filter((id) => id !== productId));
            router.push(
              `/account/login?next=${encodeURIComponent(pathname || "/shop")}`,
            );
            return;
          }
          setIds((current) =>
            result.saved
              ? current.includes(productId)
                ? current
                : [...current, productId]
              : current.filter((id) => id !== productId),
          );
        })
        .catch(() => {
          setIds((current) =>
            wasSaved
              ? current.includes(productId)
                ? current
                : [...current, productId]
              : current.filter((id) => id !== productId),
          );
        })
        .finally(() => {
          setPendingIds((current) => current.filter((id) => id !== productId));
        });
    },
    [ids, pathname, router],
  );

  const value = useMemo(
    () => ({ saved, toggle, isPending, count: ids.length, ready }),
    [saved, toggle, isPending, ids.length, ready],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }
  return context;
}
