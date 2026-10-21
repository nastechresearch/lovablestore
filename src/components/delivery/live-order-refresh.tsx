"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LiveOrderRefresh({ active }: { active: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 45_000);
    return () => window.clearInterval(timer);
  }, [active, router]);

  return null;
}
