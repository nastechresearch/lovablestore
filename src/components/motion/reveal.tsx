"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE_SILK, STAGGER } from "@/lib/motion";

const MOTION_TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  li: motion.li,
} as const;

type RevealTag = keyof typeof MOTION_TAGS;

export function Reveal({
  children,
  className,
  delay = 0,
  distance = 24,
  y,
  blur = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  y?: number;
  blur?: number;
  as?: RevealTag;
}) {
  const reduce = useReducedMotion();
  const MotionTag = MOTION_TAGS[as];
  const target = blur > 0 ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 1, y: 0 };

  return (
    <MotionTag
      className={className}
      initial={
        reduce
          ? false
          : {
              opacity: 0,
              y: y ?? distance,
              ...(blur > 0 ? { filter: `blur(${blur}px)` } : {}),
            }
      }
      whileInView={target}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.8, delay, ease: EASE_SILK }}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: STAGGER } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: RevealTag;
}) {
  const reduce = useReducedMotion();
  const MotionTag = MOTION_TAGS[as];

  return (
    <MotionTag
      className={className}
      variants={{
        hidden: reduce ? { opacity: 1 } : { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.65, ease: EASE_SILK },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}
