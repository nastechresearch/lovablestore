"use client";

import { motion, useReducedMotion } from "motion/react";

function normalise(word: string): string {
  return word.toLowerCase().replace(/[^a-z']/g, "");
}

export function SplitHeadline({
  text,
  accentWord,
  className,
}: {
  text: string;
  accentWord?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  return (
    <span className={className} aria-label={text}>
      {words.map((word, index) => {
        const accent = accentWord ? normalise(word) === normalise(accentWord) : false;
        return (
          <span
            key={`${word}-${index}`}
            aria-hidden
            className="inline-block overflow-hidden pb-[0.08em] align-bottom"
          >
            <motion.span
              className={`inline-block ${accent ? "italic text-oxblood" : ""}`}
              initial={reduce ? false : { y: "110%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{
                duration: 0.9,
                delay: 0.08 + index * 0.065,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}
              {index < words.length - 1 ? "\u00A0" : ""}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
