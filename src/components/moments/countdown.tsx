"use client";

import { useEffect, useState } from "react";

const UNITS = [
  { key: "days", label: "days" },
  { key: "hours", label: "hrs" },
  { key: "minutes", label: "min" },
  { key: "seconds", label: "sec" },
] as const;

function remaining(target: number) {
  const distance = Math.max(0, target - Date.now());
  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
    done: distance === 0,
  };
}

export function MomentCountdown({ end }: { end: string }) {
  const target = new Date(end).getTime();
  const [time, setTime] = useState<ReturnType<typeof remaining> | null>(null);

  useEffect(() => {
    setTime(remaining(target));
    const timer = window.setInterval(() => setTime(remaining(target)), 1_000);
    return () => window.clearInterval(timer);
  }, [target]);

  return (
    <div className="flex items-center gap-2.5" aria-live="off">
      {UNITS.map((unit) => (
        <div
          key={unit.key}
          className="min-w-[52px] border border-current/20 bg-black/10 px-2 py-1.5 text-center"
        >
          <span className="block font-display text-xl leading-none tabular-nums">
            {time ? String(time[unit.key]).padStart(2, "0") : "—"}
          </span>
          <span className="mt-1 block text-[7.5px] uppercase tracking-[0.18em] opacity-70">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
