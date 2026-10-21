"use client";

import { Printer } from "lucide-react";

export function PrintButton({
  label = "Print or save PDF",
  className = "btn-primary",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={className}
      data-print-hide
    >
      <Printer className="size-4" aria-hidden />
      {label}
    </button>
  );
}
