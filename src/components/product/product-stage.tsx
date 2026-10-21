"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Hand, Rotate3d, Sparkles } from "lucide-react";
import { needsPlainImage } from "@/lib/products";

const COLOUR_HEX: Record<string, string> = {
  black: "#1c1a18",
  onyx: "#232323",
  charcoal: "#3a3a3a",
  ivory: "#efe6d6",
  cream: "#f1e9da",
  white: "#f6f2ea",
  gold: "#c8a96a",
  champagne: "#d8bd8b",
  silver: "#c4c8cc",
  rose: "#c78c8c",
  pink: "#d8a3ad",
  red: "#9e2b2b",
  oxblood: "#5c1f25",
  burgundy: "#4e1f2a",
  navy: "#1f2b45",
  blue: "#3c5a7a",
  green: "#3f5b43",
  olive: "#6b6a44",
  brown: "#5a4030",
  tan: "#a9805c",
  beige: "#d8c8ae",
  grey: "#8a8a86",
  gray: "#8a8a86",
  lilac: "#a692b5",
  purple: "#5b4468",
  multi: "#9a7a5c",
};

const FALLBACKS = ["#b79a6b", "#8d5e54", "#4d5c62", "#a692b5", "#6b6a44"];

function colourHex(name: string, index: number): string {
  const key = name.toLowerCase().trim();
  const direct = COLOUR_HEX[key];
  if (direct) return direct;
  const match = Object.keys(COLOUR_HEX).find((token) => key.includes(token));
  return match ? COLOUR_HEX[match] : FALLBACKS[index % FALLBACKS.length];
}

export function ProductStage({
  images,
  name,
  colours,
}: {
  images: string[];
  name: string;
  colours: string[];
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, x: 0, y: 0, targetX: 0, targetY: -8, angle: 0 });

  const [colour, setColour] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const palette = colours.length > 0 ? colours : ["Signature"];
  const activeHex = colourHex(palette[colour] ?? "Signature", colour);
  const front = images[0];
  const back = images[1] ?? images[0];

  useEffect(() => {
    let frame = 0;
    let blendX = 0;
    let blendY = -8;

    const tick = (time: number) => {
      const state = drag.current;
      const targetX = state.active ? state.targetX : state.targetX * 0.25;
      const targetY = state.active
        ? state.targetY
        : state.targetY * 0.35 + Math.sin(time / 2400) * 5;
      blendX += (targetX - blendX) * 0.075;
      blendY += (targetY - blendY) * 0.075;
      if (cardRef.current) {
        cardRef.current.style.transform = `rotateX(${blendX.toFixed(2)}deg) rotateY(${blendY.toFixed(2)}deg)`;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current.active = true;
    drag.current.x = event.clientX;
    drag.current.y = event.clientY;
    drag.current.angle = drag.current.targetY;
    setDragging(true);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state.active) return;
    const dx = event.clientX - state.x;
    const dy = event.clientY - state.y;
    state.x = event.clientX;
    state.y = event.clientY;
    state.angle = Math.max(-42, Math.min(42, state.angle + dx * 0.35));
    state.targetY = state.angle;
    state.targetX = Math.max(-18, Math.min(18, -dy * 0.18));
  }

  function onPointerUp() {
    drag.current.active = false;
    drag.current.targetX = 0;
    setDragging(false);
  }

  return (
    <div className="grid gap-6 border border-line bg-cream p-5 sm:p-7 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:p-8">
      <div
        ref={cardRef}
        className="relative flex min-h-[380px] cursor-grab touch-none select-none items-center justify-center overflow-hidden bg-ivory-deep/50 active:cursor-grabbing sm:min-h-[460px]"
        style={{
          perspective: "1100px",
          background: `radial-gradient(circle at 50% 65%, ${activeHex}33 0%, transparent 58%), radial-gradient(circle at 50% 30%, #ffffff 0%, #f4eee2 70%)`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="img"
        aria-label={`Interactive 3D preview of ${name}. Drag to rotate.`}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-10 bottom-10 h-12 rounded-[50%] blur-2xl"
          style={{ background: `${activeHex}55` }}
        />

        <div
          ref={cardRef}
          className="relative w-[66%] max-w-[330px]"
          style={{ transformStyle: "preserve-3d", willChange: "transform" }}
        >
          <div className="relative aspect-[4/5] overflow-hidden border border-white/60 shadow-[0_35px_70px_-30px_rgba(30,20,10,0.55)]">
            {front ? (
              <Image
                src={front}
                alt={name}
                fill
                sizes="(max-width: 1024px) 60vw, 320px"
                unoptimized={needsPlainImage(front)}
                onLoad={() => setLoaded(true)}
                className={`object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
              />
            ) : null}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: `linear-gradient(115deg, rgba(255,255,255,0.35) 0%, transparent 35%, transparent 65%, ${activeHex}22 100%)`,
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-18deg] bg-white/25 blur-md"
              style={{ animation: "stageSheen 5.5s ease-in-out infinite" }}
            />
          </div>

          <div
            aria-hidden
            className="absolute inset-0 overflow-hidden border border-line/40"
            style={{ transform: "translateZ(-26px) rotateY(180deg)" }}
          >
            {back ? (
              <Image
                src={back}
                alt=""
                fill
                sizes="320px"
                unoptimized={needsPlainImage(back)}
                className="scale-x-[-1] object-cover opacity-80"
              />
            ) : null}
          </div>
        </div>

        <span className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-1.5 bg-cream/85 px-2.5 py-1.5 text-[8.5px] uppercase tracking-[0.14em] text-stone backdrop-blur-sm">
          <Hand className="size-3" aria-hidden />
          {dragging ? "Rotating…" : "Drag to rotate"}
        </span>
        <span className="pointer-events-none absolute right-4 top-4 flex items-center gap-1.5 bg-cream/85 px-2.5 py-1.5 text-[8.5px] uppercase tracking-[0.14em] text-stone backdrop-blur-sm">
          <Rotate3d className="size-3" aria-hidden />
          360° studio
        </span>

        <style>{`
          @keyframes stageSheen {
            0%, 55% { transform: translateX(0) skewX(-18deg); opacity: 0; }
            62% { opacity: .55; }
            82%, 100% { transform: translateX(430%) skewX(-18deg); opacity: 0; }
          }
          @media (prefers-reduced-motion: reduce) {
            [style*="stageSheen"] { animation: none !important; }
          }
        `}</style>
      </div>

      <div className="flex flex-col justify-center">
        <p className="eyebrow text-champagne-dark">The atelier view</p>
        <h2 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
          Turn it over. Change the mood.
        </h2>
        <p className="mt-3 max-w-md text-[11.5px] leading-relaxed text-stone">
          A closer look at {name.toLowerCase()} in the studio light. Drag the piece to spin it, then
          choose a colourway to see how it sits against the palette.
        </p>

        <div className="mt-6">
          <p className="flex items-center gap-1.5 text-[8.5px] uppercase tracking-[0.16em] text-stone">
            <Sparkles className="size-3 text-champagne-dark" aria-hidden />
            Colourway preview
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            {palette.map((option, index) => {
              const hex = colourHex(option, index);
              const active = index === colour;
              return (
                <button
                  key={`${option}-${index}`}
                  type="button"
                  onClick={() => setColour(index)}
                  aria-pressed={active}
                  aria-label={`Preview ${option}`}
                  className={`group flex items-center gap-2 border px-2 py-1.5 text-[9px] uppercase tracking-[0.1em] transition-colors ${
                    active
                      ? "border-ink bg-ink text-ivory"
                      : "border-line bg-cream text-stone hover:border-ink"
                  }`}
                >
                  <span
                    className="size-3.5 rounded-full border border-black/10"
                    style={{ background: hex }}
                    aria-hidden
                  />
                  {option}
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-[9px] leading-relaxed text-stone">
            Digital preview only — natural materials and screens shift colour slightly. The exact
            colourway is confirmed on your order.
          </p>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line text-[10px]">
          <div className="bg-cream p-3">
            <dt className="text-[8px] uppercase tracking-[0.14em] text-stone">Finish</dt>
            <dd className="mt-1 text-ink">Studio photographed</dd>
          </div>
          <div className="bg-cream p-3">
            <dt className="text-[8px] uppercase tracking-[0.14em] text-stone">Colourways</dt>
            <dd className="mt-1 text-ink">{palette.length}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
