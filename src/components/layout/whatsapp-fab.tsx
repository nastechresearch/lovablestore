"use client";

import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { whatsappHref } from "@/lib/constants";

export function WhatsAppFab() {
  const pathname = usePathname();
  const href = whatsappHref();
  if (!href) return null;
  if (
    pathname.startsWith("/product/") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout")
  ) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 left-6 z-40 hidden items-center gap-2 border border-line bg-cream px-4 py-3 text-[10px] font-medium uppercase tracking-[0.15em] text-ink shadow-soft transition-colors hover:border-oxblood hover:text-oxblood md:flex"
      aria-label="Chat with Lovable Store on WhatsApp"
    >
      <MessageCircle className="size-4" aria-hidden />
      Need a hand?
    </a>
  );
}
