"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function PromoCodeChip({
  code,
  tone = "light",
  className = "",
}: {
  code: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be blocked; the code remains visible to type.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`group inline-flex min-h-10 items-center gap-2 border border-dashed px-3.5 text-[10px] font-medium uppercase tracking-[0.16em] transition-colors ${
        tone === "dark"
          ? "border-champagne/50 text-champagne hover:bg-champagne/10"
          : "border-champagne-dark/50 text-oxblood hover:bg-oxblood/5"
      } ${className}`}
      aria-label={copied ? `${code} copied` : `Copy promo code ${code}`}
    >
      {code}
      {copied ? (
        <Check className="size-3.5" aria-hidden />
      ) : (
        <Copy className="size-3 transition-opacity group-hover:opacity-100 sm:opacity-60" aria-hidden />
      )}
    </button>
  );
}
