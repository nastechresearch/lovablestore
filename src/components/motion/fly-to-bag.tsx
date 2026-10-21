"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import { EASE_SILK } from "@/lib/motion";

const EVENT = "lovable:fly-to-bag";

export type FlyToBagDetail = {
  image: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
};

type Flight = FlyToBagDetail & { id: number };

export function flyToBag(detail: { image: string; x: number; y: number }) {
  if (typeof window === "undefined") return;
  const anchor = document.getElementById("bag-target");
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  window.dispatchEvent(
    new CustomEvent<FlyToBagDetail>(EVENT, {
      detail: {
        ...detail,
        targetX: rect.left + rect.width / 2,
        targetY: rect.top + rect.height / 2,
      },
    }),
  );
}

function FlightChip({ flight, onDone }: { flight: Flight; onDone: (id: number) => void }) {
  return (
    <div
      className="pointer-events-none fixed z-[130]"
      style={{ left: flight.x, top: flight.y, transform: "translate(-50%, -50%)" }}
      aria-hidden
    >
      <motion.div
        className="overflow-hidden rounded-lg border border-line bg-cream shadow-lift"
        initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
        animate={{
          x: flight.targetX - flight.x,
          y: flight.targetY - flight.y,
          scale: 0.16,
          opacity: 0.15,
        }}
        transition={{ duration: 0.72, ease: EASE_SILK }}
        onAnimationComplete={() => onDone(flight.id)}
      >
        <Image src={flight.image} alt="" width={54} height={66} unoptimized className="object-cover" />
      </motion.div>
    </div>
  );
}

export function FlyToBagLayer() {
  const reduce = useReducedMotion();
  const [flights, setFlights] = useState<Flight[]>([]);

  useEffect(() => {
    if (reduce) return;
    const onFly = (event: Event) => {
      const detail = (event as CustomEvent<FlyToBagDetail>).detail;
      if (!detail) return;
      setFlights((current) => [
        ...current,
        { ...detail, id: Date.now() + Math.random() },
      ]);
    };
    window.addEventListener(EVENT, onFly);
    return () => window.removeEventListener(EVENT, onFly);
  }, [reduce]);

  const remove = useCallback((id: number) => {
    setFlights((current) => current.filter((flight) => flight.id !== id));
  }, []);

  if (reduce || flights.length === 0) return null;

  return createPortal(
    <>
      {flights.map((flight) => (
        <FlightChip key={flight.id} flight={flight} onDone={remove} />
      ))}
    </>,
    document.body,
  );
}
