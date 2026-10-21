"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BookOpen, Heart, Menu, Search, ShoppingBag, Sparkles, UserRound, X } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist/wishlist-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { InstallLink } from "@/components/pwa/install-link";
import { NAV_LINKS } from "@/lib/constants";

export function Header() {
  const pathname = usePathname();
  const { count, hydrated, openCart, closeCart } = useCart();
  const { count: wishlistCount, ready: wishlistReady } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    closeCart();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen, closeCart]);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-line bg-cream/95 backdrop-blur-md"
            : "border-transparent bg-cream"
        }`}
      >
        <div className="container-lux flex h-[64px] items-center justify-between gap-2 sm:h-[72px] lg:h-[84px]">
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="-ml-2.5 flex size-11 items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="size-5" aria-hidden />
            </button>
          </div>

          <Link href="/" className="group flex min-w-0 flex-col items-center whitespace-nowrap lg:items-start" aria-label="Lovable Store home">
            <span className="font-display text-[1.28rem] leading-none tracking-[0.01em] min-[390px]:text-[1.45rem] sm:text-[2.15rem] lg:text-[2.35rem]">
              Lovable Store
            </span>
            <span className="mt-1 hidden text-[0.52rem] font-medium uppercase tracking-[0.24em] text-stone sm:block">
              Where magic gift starts from
            </span>
          </Link>

          <nav className="hidden items-center gap-5 lg:flex xl:gap-6" aria-label="Primary">
            {NAV_LINKS.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(link.href);
              const accent = "accent" in link && link.accent;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative py-2 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors ${
                    accent ? "text-oxblood" : "text-ink hover:text-oxblood"                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-current transition-transform duration-300 ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/studio"
              className="hidden items-center gap-2 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-stone transition-colors hover:text-oxblood xl:flex"
            >
              <Sparkles className="size-3.5" aria-hidden />
              Customise
            </Link>
            <Link
              href="/gift-finder"
              className="hidden items-center gap-2 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-stone transition-colors hover:text-oxblood xl:flex"
            >
              <Sparkles className="size-3.5" aria-hidden />
              Gift finder
            </Link>
            <Link
              href="/guides"
              className="hidden items-center gap-2 px-3 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-stone transition-colors hover:text-oxblood 2xl:flex"
            >
              <BookOpen className="size-3.5" aria-hidden />
              Guides
            </Link>
            <div className="mr-1 hidden sm:block">
              <ThemeToggle />
            </div>
            <Link
              href="/search"
              className="hidden size-11 items-center justify-center transition-colors hover:text-oxblood sm:flex"
              aria-label="Search the store"
            >
              <Search className="size-[19px]" aria-hidden />
            </Link>
            <Link
              href="/account/wishlist"
              className="relative hidden size-11 items-center justify-center transition-colors hover:text-oxblood sm:flex"
              aria-label={`Your wishlist${wishlistCount ? `, ${wishlistCount} saved` : ""}`}
            >
              <Heart className="size-[19px]" aria-hidden />
              {wishlistReady && wishlistCount > 0 ? (
                <span className="absolute right-0.5 top-0.5 flex size-[18px] items-center justify-center rounded-full bg-oxblood text-[10px] font-medium text-ivory">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              ) : null}
            </Link>
            <Link
              href="/account"
              className="flex size-11 items-center justify-center transition-colors hover:text-oxblood"
              aria-label="Your account"
            >
              <UserRound className="size-[19px]" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openCart();
              }}
              className="relative flex size-11 items-center justify-center transition-colors hover:text-oxblood"
              aria-label={`Open shopping bag${count ? `, ${count} items` : ""}`}
            >
              <ShoppingBag className="size-[19px]" aria-hidden />
              {hydrated && count > 0 ? (
                <span className="absolute right-0.5 top-0.5 flex size-[18px] items-center justify-center rounded-full bg-oxblood text-[10px] font-medium text-ivory">
                  {count > 9 ? "9+" : count}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            className="fixed inset-0 z-[85] flex flex-col bg-cream lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex h-[72px] items-center justify-between border-b border-line px-5">
              <span className="font-display text-2xl">
                Lovable Store
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex size-11 items-center justify-center"
                aria-label="Close menu"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 py-8" aria-label="Mobile">
              <ul className="space-y-1">
                {[
                  { label: "Shop all", href: "/shop" },
                  { label: "For her", href: "/collections/for-her" },
                  { label: "For him", href: "/collections/for-him" },
                  { label: "For couples", href: "/collections/couples" },
                  { label: "Gifts", href: "/collections/gifts" },
                  { label: "Custom atelier", href: "/studio" },
                  { label: "Mzansi moments", href: "/moments" },
                  { label: "Lookbook", href: "/lookbook" },
                  { label: "Offers", href: "/promos" },
                  { label: "Valentine's", href: "/valentines" },
                ].map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + index * 0.045, duration: 0.4 }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center justify-between border-b border-line/70 py-4 font-display text-[2rem] leading-none"
                    >
                      {link.label}
                      <span className="text-xs font-sans uppercase tracking-[0.16em] text-stone">
                        0{index + 1}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8 grid gap-3 text-[11px] uppercase tracking-[0.15em] text-stone">
                <Link href="/search" className="py-2">
                  Search
                </Link>
                <Link href="/account" className="py-2">
                  Your account
                </Link>
                <Link href="/account/wishlist" className="py-2">
                  Wishlist
                </Link>
                <Link href="/gift-finder" className="py-2">
                  Gift finder
                </Link>
                <Link href="/guides" className="py-2">
                  Guides &amp; tutorials
                </Link>
                <Link href="/tools" className="py-2">
                  Tools
                </Link>
                <Link href="/collections/under-500" className="py-2">
                  Gifts under R500
                </Link>
                <Link href="/delivery-and-returns" className="py-2">
                  Delivery &amp; returns
                </Link>
                <Link href="/contact" className="py-2">
                  Contact
                </Link>
                <InstallLink className="py-2 text-left uppercase tracking-[0.15em]">
                  Get the app
                </InstallLink>
              </div>
            </nav>

            <div className="border-t border-line px-6 py-5">
              <div className="flex items-center justify-between gap-4">
                <p className="max-w-[24ch] text-xs leading-relaxed text-stone">
                  Complimentary gift wrap · Nationwide delivery · Secure checkout
                </p>
                <ThemeToggle />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
