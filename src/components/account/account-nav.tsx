"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  LockKeyhole,
  Package,
  Settings2,
  ShieldCheck,
} from "lucide-react";

const ITEMS = [
  { href: "/account", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/settings", label: "Settings", icon: Settings2 },
  { href: "/account/security", label: "Security", icon: LockKeyhole },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-line pb-3" aria-label="Account">
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex min-h-11 shrink-0 items-center gap-2 border px-4 py-2.5 text-[10px] uppercase tracking-[0.12em] transition-colors ${
              active
                ? "border-ink bg-ink text-ivory"
                : "border-line bg-cream text-stone hover:border-ink"
            }`}
          >
            <item.icon className="size-3.5" aria-hidden />
            {item.label}
          </Link>
        );
      })}
      <span className="ml-auto hidden items-center gap-1.5 text-[9px] uppercase tracking-[0.1em] text-stone sm:flex">
        <ShieldCheck className="size-3.5 text-oxblood" aria-hidden />
        Protected account
      </span>
    </nav>
  );
}
