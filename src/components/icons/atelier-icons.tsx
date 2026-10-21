"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE_SILK } from "@/lib/motion";

export type AtelierIconProps = {
  size?: number;
  className?: string;
  animated?: boolean;
};

function Svg({
  size = 24,
  className,
  children,
}: AtelierIconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function Draw({
  d,
  animated,
  delay = 0,
}: {
  d: string;
  animated?: boolean;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (!animated || reduce) return <path d={d} />;
  return (
    <motion.path
      d={d}
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay, ease: EASE_SILK }}
    />
  );
}

export function AtelierBox(props: AtelierIconProps) {
  return (
    <Svg {...props}>
      <Draw d="M4 9h16v11H4z" animated={props.animated} />
      <Draw d="M4 9l2.5-4h11L20 9" animated={props.animated} delay={0.12} />
      <path d="M12 9v11M8 9v11M16 9v11" />
    </Svg>
  );
}

export function GiftRibbon(props: AtelierIconProps) {
  return (
    <Svg {...props}>
      <Draw d="M4 10h16v10H4z" animated={props.animated} />
      <Draw d="M4 7h16v3H4z" animated={props.animated} delay={0.1} />
      <Draw d="M12 7v13" animated={props.animated} delay={0.2} />
      <Draw
        d="M12 7c-2.6 0-4.2-1-4.2-2.6C7.8 3 9.2 2 12 7Zm0 0c2.6 0 4.2-1 4.2-2.6C16.2 3 14.8 2 12 7Z"
        animated={props.animated}
        delay={0.28}
      />
    </Svg>
  );
}

export function CourierVan(props: AtelierIconProps) {
  return (
    <Svg {...props}>
      <Draw d="M3 7h11v9H3z" animated={props.animated} />
      <Draw d="M14 10h4l3 3v3h-7z" animated={props.animated} delay={0.12} />
      <Draw
        d="M7 19a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM17.3 19a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2Z"
        animated={props.animated}
        delay={0.22}
      />
      <path d="M8.8 16h6.4M14 7v3" />
    </Svg>
  );
}

export function DeliveryRoute(props: AtelierIconProps) {
  return (
    <Svg {...props}>
      <Draw d="M3 8h5a3 3 0 0 1 0 6h8a3 3 0 0 0 0-6h5" animated={props.animated} />
      <path d="M3 8v5M21 8v5" />
      <circle cx="3" cy="8" r="2" />
      <circle cx="21" cy="8" r="2" />
    </Svg>
  );
}

export function MapPin(props: AtelierIconProps) {
  return (
    <Svg {...props}>
      <Draw
        d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"
        animated={props.animated}
      />
      <Draw
        d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        animated={props.animated}
        delay={0.18}
      />
    </Svg>
  );
}

export function ShieldCheck(props: AtelierIconProps) {
  return (
    <Svg {...props}>
      <Draw d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" animated={props.animated} />
      <Draw d="m8.5 12 2.3 2.3 4.7-5" animated={props.animated} delay={0.2} />
    </Svg>
  );
}

export function Spark(props: AtelierIconProps) {
  return (
    <Svg {...props}>
      <Draw
        d="M12 3c.7 4.6 3.4 7.3 8 8-4.6.7-7.3 3.4-8 8-.7-4.6-3.4-7.3-8-8 4.6-.7 7.3-3.4 8-8Z"
        animated={props.animated}
      />
    </Svg>
  );
}

export function Receipt(props: AtelierIconProps) {
  return (
    <Svg {...props}>
      <Draw d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" animated={props.animated} />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </Svg>
  );
}

export function Plane(props: AtelierIconProps) {
  return (
    <Svg {...props}>
      <Draw d="m2 12 19-8-7 19-3-7-9-4Z" animated={props.animated} />
      <path d="m11 15 4-4" />
    </Svg>
  );
}

export function CheckSeal(props: AtelierIconProps) {
  return (
    <Svg {...props}>
      <Draw d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" animated={props.animated} />
      <Draw d="m8 12 2.6 2.6L16.5 9" animated={props.animated} delay={0.2} />
    </Svg>
  );
}
