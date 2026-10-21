"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgePercent,
  BookOpen,
  Boxes,
  Headset,
  LayoutDashboard,
  Package,
  Scissors,
  Settings2,
  Shapes,
  ShoppingBag,
  Star,
  Store,
  Tags,
} from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/suppliers", label: "Suppliers", icon: Boxes },
  { href: "/admin/promos", label: "Promos", icon: BadgePercent },
  { href: "/admin/tags", label: "Tags", icon: Tags },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/support", label: "Support", icon: Headset },
  { href: "/admin/studio", label: "Studio", icon: Scissors },
  { href: "/admin/guides", label: "Staff guides", icon: BookOpen },
  { href: "/admin/settings", label: "Settings", icon: Settings2 },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav data-print-hide className="flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5 lg:overflow-visible" aria-label="Admin">
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-3 px-3 py-2.5 text-[10.5px] font-medium uppercase tracking-[0.12em] transition-colors lg:px-4 ${
              active
                ? "bg-ivory text-ink"
                : "text-ivory/55 hover:bg-ivory/10 hover:text-ivory"
            }`}
          >
            <item.icon className="size-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
      <div className="hidden border-t border-ivory/10 pt-2 lg:mt-4 lg:block">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 text-[10.5px] font-medium uppercase tracking-[0.12em] text-ivory/45 transition-colors hover:text-ivory"
        >
          <Store className="size-4" aria-hidden />
          View storefront
        </Link>
      </div>
    </nav>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <nav data-print-hide className="flex gap-1 overflow-x-auto border-t border-ivory/10 px-3 py-2 lg:hidden" aria-label="Admin mobile">
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-2 px-3 py-2 text-[9px] uppercase tracking-[0.1em] ${
              active ? "bg-ivory text-ink" : "text-ivory/60"
            }`}
          >
            <item.icon className="size-3.5" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebarMark() {
  return (
    <Link href="/admin" className="block px-4 pb-6 pt-5">
      <span className="font-display text-2xl leading-none text-ivory">
        Lovable Store
      </span>
      <span className="mt-1.5 block text-[8px] uppercase tracking-[0.24em] text-ivory/40">
        Atelier desk
      </span>
    </Link>
  );
}

export function AdminIconBadge({ icon: Icon }: { icon: typeof Shapes }) {
  return <Icon className="size-4" aria-hidden />;
}
