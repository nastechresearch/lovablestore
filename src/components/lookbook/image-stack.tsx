"use client";

import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import type { PointerEvent as ReactPointerEvent } from "react";

export type LookImage = {
  src: string;
  alt: string;
  /** Optional object-position for art-directed crops. */
  position?: string;
};

type ImageStackProps = {
  images: LookImage[];
  className?: string;
  aspectClassName?: string;
  preload?: boolean;
};

type CardLayout = {
  frame: string;
  rotate: number;
  depth: number;
  sizes: string;
};

/**
 * Four layered compositions, first image largest. Cards are positioned in
 * percentages so the same cluster scales from mobile to desktop.
 */
const LAYOUTS: Record<number, CardLayout[]> = {
  1: [
    {
      frame: "inset-x-[8%] top-[5%] h-[88%]",
      rotate: -1.2,
      depth: 0,
      sizes: "(max-width: 640px) 84vw, (max-width: 1024px) 60vw, 36vw",
    },
  ],
  2: [
    {
      frame: "left-[1%] top-[4%] h-[78%] w-[68%]",
      rotate: -2,
      depth: -16,
      sizes: "(max-width: 640px) 68vw, (max-width: 1024px) 48vw, 30vw",
    },
    {
      frame: "bottom-[3%] right-0 h-[56%] w-[46%]",
      rotate: 2.4,
      depth: 26,
      sizes: "(max-width: 640px) 44vw, (max-width: 1024px) 30vw, 18vw",
    },
  ],
  3: [
    {
      frame: "left-0 top-[3%] h-[66%] w-[62%]",
      rotate: -1.8,
      depth: -18,
      sizes: "(max-width: 640px) 64vw, (max-width: 1024px) 44vw, 27vw",
    },
    {
      frame: "right-0 top-[1%] h-[38%] w-[36%]",
      rotate: 2.6,
      depth: 12,
      sizes: "(max-width: 640px) 38vw, (max-width: 1024px) 26vw, 16vw",
    },
    {
      frame: "bottom-0 right-[3%] h-[40%] w-[46%]",
      rotate: -1.4,
      depth: 34,
      sizes: "(max-width: 640px) 46vw, (max-width: 1024px) 32vw, 20vw",
    },
  ],
  4: [
    {
      frame: "left-0 top-[2%] h-[56%] w-[56%]",
      rotate: -1.6,
      depth: -22,
      sizes: "(max-width: 640px) 58vw, (max-width: 1024px) 40vw, 24vw",
    },
    {
      frame: "right-[1%] top-[8%] h-[38%] w-[40%]",
      rotate: 2.4,
      depth: 10,
      sizes: "(max-width: 640px) 40vw, (max-width: 1024px) 28vw, 17vw",
    },
    {
      frame: "right-[2%] top-[48%] h-[32%] w-[42%]",
      rotate: -2,
      depth: 28,
      sizes: "(max-width: 640px) 42vw, (max-width: 1024px) 30vw, 18vw",
    },
    {
      frame: "bottom-0 left-[10%] h-[34%] w-[44%]",
      rotate: 1.6,
      depth: 44,
      sizes: "(max-width: 640px) 44vw, (max-width: 1024px) 30vw, 18vw",
    },
  ],
};

export function ImageStack({
  images,
  className = "",
  aspectClassName = "aspect-[4/5]",
  preload = false,
}: ImageStackProps) {
  const reduce = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const spring = { stiffness: 110, damping: 20, mass: 0.5 };

  const rotateX = useSpring(
    useTransform(pointerY, [-0.5, 0.5], [6, -6]),
    spring,
  );
  const rotateY = useSpring(
    useTransform(pointerX, [-0.5, 0.5], [-7, 7]),
    spring,
  );

  const visible = images.slice(0, 4);
  const layout = LAYOUTS[visible.length] ?? LAYOUTS[1];

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }

  function resetTilt() {
    pointerX.set(0);
    pointerY.set(0);
  }

  if (visible.length === 0) return null;

  return (
    <motion.div
      className={`relative isolate ${aspectClassName} ${className}`}
      initial={reduce ? false : { opacity: 0, y: 30 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      <div
        aria-hidden
        className="absolute inset-[8%] rounded-[2.25rem] border border-champagne/45"
      />
      <div
        aria-hidden
        className="absolute right-[7%] top-[38%] size-9 rounded-full border border-champagne/40 sm:size-12"
      />

      <motion.div
        className="absolute inset-0"
        style={{
          transformPerspective: 1300,
          transformStyle: "preserve-3d",
          rotateX: reduce ? 0 : rotateX,
          rotateY: reduce ? 0 : rotateY,
        }}
        whileHover={reduce ? undefined : { scale: 1.012 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {visible.map((image, index) => {
          const card = layout[index];
          return (
            <motion.div
              key={`${image.src}-${index}`}
              className={`absolute overflow-hidden rounded-[1.4rem] border border-line bg-ivory-deep ${
                index === visible.length - 1 ? "shadow-lift" : "shadow-soft"
              } ${card.frame}`}
              style={{
                rotate: reduce ? 0 : card.rotate,
                translateZ: reduce ? 0 : card.depth,
              }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={card.sizes}
                preload={preload && index === 0}
                draggable={false}
                className="select-none object-cover"
                style={image.position ? { objectPosition: image.position } : undefined}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
