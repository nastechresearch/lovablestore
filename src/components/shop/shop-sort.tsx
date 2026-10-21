"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

const OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

export function ShopSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") || "featured";

  function change(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") params.delete("sort");
    else params.set("sort", value);
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname, {
      scroll: false,
    });
  }

  return (
    <label className="relative inline-flex min-h-11 items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-stone">
      <span className="hidden sm:inline">Sort</span>
      <span className="relative">
        <select
          value={current}
          onChange={(event) => change(event.target.value)}
          className="appearance-none bg-transparent py-2 pr-6 text-[10px] uppercase tracking-[0.14em] text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne-dark focus-visible:ring-offset-2"
          aria-label="Sort products"
        >
          {OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-0 top-1/2 size-3.5 -translate-y-1/2 text-stone"
          aria-hidden
        />
      </span>
    </label>
  );
}
