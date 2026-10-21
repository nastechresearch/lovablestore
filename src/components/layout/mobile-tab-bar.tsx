"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, House, LayoutGrid, Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="absolute -right-1.5 -top-1 flex min-w-[17px] items-center justify-center rounded-full bg-oxblood px-1 text-[9px] font-semibold leading-[17px] text-ivory">
      {count > 9 ? "9+" : count}
    </span>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  const { count, hydrated, openCart } = useCart();
  const { count: saved, ready } = useWishlist();

  if (pathname.startsWith("/product/") || pathname.startsWith("/checkout")) {
    return null;
  }

  const tabs = [
    {
      label: "Home",
      href: "/",
      icon: House,
      active: pathname === "/",
    },
    {
      label: "Shop",
      href: "/shop",
      icon: LayoutGrid,
      active:
        pathname.startsWith("/shop") ||
        pathname.startsWith("/collections") ||
        pathname.startsWith("/product") ||
        pathname.startsWith("/tag"),
    },
    {
      label: "Search",
      href: "/search",
      icon: Search,
      active: pathname.startsWith("/search"),
    },
    {
      label: "Saved",
      href: "/account/wishlist",
      icon: Heart,
      active: pathname.startsWith("/account/wishlist"),
      badge: ready ? saved : 0,
    },
  ];

  return (
    <nav className="mobile-dock md:hidden" aria-label="Store app">
      <ul className="mobile-dock-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`mobile-dock-link ${tab.active ? "is-active" : ""}`}
                aria-current={tab.active ? "page" : undefined}
              >
                <span className="relative">
                  <Icon className="size-[19px]" strokeWidth={1.7} aria-hidden />
                  {tab.badge ? <Badge count={tab.badge} /> : null}
                </span>
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={openCart}
            className="mobile-dock-link w-full"
            aria-label={`Open bag${count ? `, ${count} items` : ""}`}
          >
            <span className="relative">
              <ShoppingBag className="size-[19px]" strokeWidth={1.7} aria-hidden />
              <Badge count={hydrated ? count : 0} />
            </span>
            <span>Bag</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
