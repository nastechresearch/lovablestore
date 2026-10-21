"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";

export type Facet = { value: string; label: string; count: number };

export type ShopFacets = {
  total: number;
  categories: Facet[];
  recipients: Facet[];
  sources: Facet[];
  prices: Facet[];
  tags: Facet[];
};

const GROUPS: {
  key: string;
  title: string;
  facet: keyof Omit<ShopFacets, "total">;
}[] = [
  { key: "category", title: "Category", facet: "categories" },
  { key: "recipient", title: "Recipient", facet: "recipients" },
  { key: "source", title: "Sourced from", facet: "sources" },
  { key: "max", title: "Price", facet: "prices" },
  { key: "tag", title: "Collections & tags", facet: "tags" },
];

export function ShopFilters({ facets }: { facets: ShopFacets }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const activeCount = GROUPS.filter((group) => searchParams.get(group.key)).length;
  const hasFilters = activeCount > 0;

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function select(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || params.get(key) === value) params.delete(key);
    else params.set(key, value);
    startTransition(() => {
      router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname, {
        scroll: false,
      });
    });
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams.toString());
    for (const group of GROUPS) params.delete(group.key);
    startTransition(() => {
      router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname, {
        scroll: false,
      });
    });
  }

  const panel = (
    <div>
      <div className="flex items-center justify-between border-b border-ink/15 pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em]">Filter</p>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-[10px] uppercase tracking-[0.14em] text-oxblood underline-offset-4 hover:underline"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {GROUPS.map((group) => {
        const options = facets[group.facet];
        if (options.length === 0) return null;
        return (
          <div key={group.key} className="border-b border-line py-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-stone">
              {group.title}
            </p>
            <ul className="mt-3 space-y-0.5">
              {options.map((option) => {
                const active = searchParams.get(group.key) === option.value;
                return (
                  <li key={`${group.key}-${option.value}`}>
                    <button
                      type="button"
                      onClick={() => select(group.key, option.value)}
                      aria-pressed={active}
                      className={`flex min-h-11 w-full items-center justify-between gap-2 text-left text-[12px] leading-snug transition-colors ${
                        active
                          ? "font-medium text-oxblood"
                          : "text-ink-soft hover:text-oxblood"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`h-px w-3 transition-all ${
                            active ? "bg-oxblood" : "bg-transparent"
                          }`}
                          aria-hidden
                        />
                        {option.label}
                      </span>
                      <span className="text-[9px] tabular-nums text-stone/60">
                        {option.count}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      <p className="pt-5 text-[9px] uppercase tracking-[0.16em] text-stone">
        {facets.total} pieces in the collection
      </p>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="sticky top-[64px] z-30 inline-flex min-h-11 w-full items-center justify-center gap-2 border border-line bg-cream/95 px-4 text-[10px] uppercase tracking-[0.16em] backdrop-blur-md sm:top-[72px] lg:hidden"
        aria-expanded={open}
      >
        <SlidersHorizontal className="size-3.5" aria-hidden />
        Filters{activeCount ? ` (${activeCount})` : ""}
      </button>

      <aside className="hidden lg:block">
        <div className="sticky top-28">{panel}</div>
      </aside>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              className="fixed inset-y-0 left-0 z-[95] flex w-[88%] max-w-sm flex-col bg-cream shadow-lift lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
            >
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <p className="font-display text-2xl">Refine the edit</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex size-11 items-center justify-center"
                  aria-label="Close filters"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5 pb-6">{panel}</div>
              <div className="border-t border-line p-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full"
                >
                  Show results
                </button>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
