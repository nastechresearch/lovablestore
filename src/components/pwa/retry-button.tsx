"use client";

import { RotateCw } from "lucide-react";

export function RetryButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="btn-primary w-full"
    >
      <RotateCw className="size-4" aria-hidden />
      Try again
    </button>
  );
}
