"use client";

import { useEffect, useState } from "react";

function nextValentines(): number {
  const now = new Date();
  const year = now.getFullYear();
  const thisYear = new Date(`${year}-02-14T00:00:00+02:00`);
  const target = now.getTime() > thisYear.getTime() ? year + 1 : year;
  return new Date(`${target}-02-14T00:00:00+02:00`).getTime();
}

function pad(value: number): string {
  return String(Math.max(0, value)).padStart(2, "0");
}

export function ValentinesCountdown() {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const target = nextValentines();
    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const totalSeconds = Math.floor((remaining ?? 0) / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const blocks = [
    { label: "Days", value: pad(days) },
    { label: "Hours", value: pad(hours) },
    { label: "Minutes", value: pad(minutes) },
    { label: "Seconds", value: pad(seconds) },
  ];

  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.2em] text-champagne">
        {remaining === null ? "Counting down to 14 February" : "Until Valentine's Day"}
      </p>
      <div className="mt-3 flex gap-2 sm:gap-3">
        {blocks.map((block) => (
          <div
            key={block.label}
            className="min-w-[3.6rem] border border-ivory/15 bg-ivory/[0.04] px-3 py-2.5 text-center sm:min-w-[4.2rem]"
          >
            <p className="font-display text-3xl tabular-nums leading-none text-ivory sm:text-4xl">
              {block.value}
            </p>
            <p className="mt-1.5 text-[8px] uppercase tracking-[0.16em] text-ivory/50">
              {block.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
