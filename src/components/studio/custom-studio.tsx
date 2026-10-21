"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Loader2,
  Minus,
  Plus,
  RotateCw,
  Scissors,
  Shirt,
  Sparkles,
} from "lucide-react";
import { submitCustomRequestAction } from "@/actions/custom";
import type { FormState } from "@/lib/form";

const initial: FormState = { status: "idle", message: "" };

type GarmentKey = "Tee" | "Hoodie" | "Shirt" | "Dress" | "Cap" | "Tote";

const GARMENTS: { key: GarmentKey; label: string; note: string; path: string }[] = [
  {
    key: "Tee",
    label: "Tee",
    note: "240gsm combed cotton",
    path: "M64 34 L88 22 Q100 38 112 22 L136 34 L172 62 L150 86 L142 214 Q100 226 58 214 L50 86 L28 62 Z",
  },
  {
    key: "Hoodie",
    label: "Hoodie",
    note: "380gsm brushed fleece",
    path: "M62 40 Q100 8 138 40 L170 66 L150 92 L144 220 Q100 232 56 220 L50 92 L30 66 Z",
  },
  {
    key: "Shirt",
    label: "Shirt",
    note: "Cotton poplin, relaxed",
    path: "M66 36 L88 24 L100 44 L112 24 L134 36 L170 64 L148 88 L142 218 Q100 228 58 218 L52 88 L30 64 Z",
  },
  {
    key: "Dress",
    label: "Dress",
    note: "Linen blend midi",
    path: "M70 32 L92 24 Q100 38 108 24 L130 32 L148 70 L136 100 L160 218 Q100 236 40 218 L64 100 L52 70 Z",
  },
  {
    key: "Cap",
    label: "Cap",
    note: "Structured six-panel",
    path: "M38 138 Q38 70 100 70 Q162 70 162 138 L164 150 L36 150 Z",
  },
  {
    key: "Tote",
    label: "Tote",
    note: "Heavy canvas, boxed base",
    path: "M54 92 L146 92 L156 214 L44 214 Z",
  },
];

const COLOURS = [
  { name: "Ivory", hex: "#EDE4D3" },
  { name: "Onyx", hex: "#1E1C1A" },
  { name: "Oxblood", hex: "#5B1F26" },
  { name: "Olive", hex: "#6B6A44" },
  { name: "Dusty Rose", hex: "#C78C8C" },
  { name: "Sand", hex: "#C9AE8C" },
  { name: "Navy", hex: "#1F2B45" },
  { name: "Sage", hex: "#8FA08B" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const PRINT_STYLES = ["None", "Chest print", "Back print", "Embroidery", "All-over print"];

type Maker = {
  id: string;
  name: string;
  kind: string;
  shipsFrom: string;
  leadMin: number;
  leadMax: number;
};

function shade(hex: string, amount: number): string {
  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);
  const r = Math.max(0, Math.min(255, (number >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((number >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (number & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function GarmentPreview({
  garment,
  colour,
  monogram,
  printStyle,
  side,
}: {
  garment: GarmentKey;
  colour: string;
  monogram: string;
  printStyle: string;
  side: "front" | "back";
}) {
  const shape = GARMENTS.find((item) => item.key === garment) ?? GARMENTS[0];
  const hex = COLOURS.find((item) => item.name === colour)?.hex ?? "#EDE4D3";
  const light = shade(hex, 22);
  const dark = shade(hex, -28);
  const label = (monogram || "BM").slice(0, 12);
  const showPrint = printStyle !== "None" && (printStyle !== "Back print" || side === "back");
  const darkGarment = Number.parseInt(hex.replace("#", ""), 16) < 0x7a7a7a;
  const textColour = darkGarment ? shade(hex, 150) : shade(hex, -120);
  const printY = garment === "Cap" ? 112 : garment === "Tote" ? 146 : 124;
  const printSize = printStyle === "All-over print" ? 26 : printStyle === "Back print" ? 22 : 14;

  return (
    <svg viewBox="0 0 200 240" className="h-full w-full" role="img" aria-label={`${colour} ${garment} preview`}>
      <defs>
        <linearGradient id="garment-shade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={light} />
          <stop offset="55%" stopColor={hex} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="226" rx="62" ry="7" fill="rgba(30,22,14,0.12)" />
      <path d={shape.path} fill="url(#garment-shade)" stroke={dark} strokeWidth="1.4" strokeLinejoin="round" />
      {garment === "Hoodie" ? (
        <>
          <path d="M78 34 Q100 16 122 34 Q126 52 100 60 Q74 52 78 34 Z" fill={dark} opacity="0.35" />
          <path d="M72 158 L128 158 L132 190 L68 190 Z" fill={dark} opacity="0.18" />
          <path d="M98 58 L98 92 M102 58 L102 92" stroke={light} strokeWidth="2" opacity="0.7" />
        </>
      ) : null}
      {garment === "Shirt" ? (
        <>
          <path d="M88 24 L100 48 L112 24" fill="none" stroke={dark} strokeWidth="1.4" />
          <path d="M100 48 L100 214" stroke={dark} strokeWidth="1" opacity="0.5" />
          {[70, 94, 118, 142, 166, 190].map((y) => (
            <circle key={y} cx="100" cy={y} r="1.6" fill={dark} opacity="0.65" />
          ))}
        </>
      ) : null}
      {garment === "Cap" ? (
        <>
          <path d="M38 138 Q100 154 162 138" fill="none" stroke={dark} strokeWidth="2" />
          <path d="M38 144 Q20 162 40 172 L72 156 Z" fill={dark} opacity="0.55" />
          <path d="M100 70 L100 140" stroke={dark} strokeWidth="1" opacity="0.4" />
        </>
      ) : null}
      {garment === "Tote" ? (
        <path d="M76 92 Q76 54 100 54 Q124 54 124 92" fill="none" stroke={dark} strokeWidth="4" />
      ) : null}
      {showPrint ? (
        <text
          x="100"
          y={printY}
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize={printSize}
          letterSpacing={printSize > 18 ? "2" : "1"}
          fill={textColour}
          opacity="0.88"
        >
          {label}
        </text>
      ) : null}
      {printStyle === "Embroidery" && side === "front" ? (
        <text x="100" y={printY + 14} textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="5" letterSpacing="2" fill={textColour} opacity="0.6">
          HAND STITCHED
        </text>
      ) : null}
    </svg>
  );
}

export function CustomStudio({
  makers,
  signedIn,
  viewerName,
  viewerEmail,
}: {
  makers: Maker[];
  signedIn: boolean;
  viewerName: string;
  viewerEmail: string;
}) {
  const [state, formAction, pending] = useActionState(submitCustomRequestAction, initial);
  const [garment, setGarment] = useState<GarmentKey>("Tee");
  const [colour, setColour] = useState("Ivory");
  const [size, setSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [printStyle, setPrintStyle] = useState("None");
  const [monogram, setMonogram] = useState("");
  const [side, setSide] = useState<"front" | "back">("front");
  const [maker, setMaker] = useState(makers[0]?.id ?? "");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const activeColour = COLOURS.find((item) => item.name === colour) ?? COLOURS[0];
  const activeMaker = makers.find((item) => item.id === maker);
  const error = (key: string) => state.fieldErrors?.[key];
  const lead = useMemo(() => {
    if (!activeMaker) return "Lead times confirmed with the quote.";
    return `${activeMaker.leadMin}–${activeMaker.leadMax} working days after artwork approval`;
  }, [activeMaker]);

  function onTilt(event: React.PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((event.clientY - bounds.top) / bounds.height - 0.5) * -12,
      y: ((event.clientX - bounds.left) / bounds.width - 0.5) * 16,
    });
  }

  if (state.status === "success") {
    return (
      <div className="border border-oxblood/25 bg-cream p-8 text-center sm:p-12">
        <span className="mx-auto grid size-14 place-items-center border border-oxblood/25 bg-oxblood/5 text-oxblood">
          <Check className="size-6" aria-hidden />
        </span>
        <h2 className="mt-5 font-display text-3xl">Sent to the atelier.</h2>
        <p className="mx-auto mt-3 max-w-lg text-[12px] leading-relaxed text-stone">{state.message}</p>
        <dl className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-px overflow-hidden border border-line bg-line text-left text-[10px]">
          <div className="bg-cream p-3">
            <dt className="text-[8px] uppercase tracking-[0.12em] text-stone">Garment</dt>
            <dd className="mt-1 text-ink">{garment} · {colour} · {size} · qty {quantity}</dd>
          </div>
          <div className="bg-cream p-3">
            <dt className="text-[8px] uppercase tracking-[0.12em] text-stone">Finish</dt>
            <dd className="mt-1 text-ink">{printStyle}{monogram ? ` · ${monogram}` : ""}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/account" className="btn-outline">Your account</Link>
          <Link href="/shop" className="btn-primary">
            Keep browsing
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10">
      <input type="hidden" name="garment" value={garment} />
      <input type="hidden" name="colour" value={colour} />
      <input type="hidden" name="size" value={size} />
      <input type="hidden" name="printStyle" value={printStyle} />
      <input type="hidden" name="connectionId" value={maker} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div
          className="surface-grid relative overflow-hidden rounded-2xl border border-line bg-ivory-deep p-4 sm:p-6"
          style={{ perspective: "1000px" }}
          onPointerMove={onTilt}
          onPointerLeave={() => setTilt({ x: 0, y: 0 })}
        >
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[8.5px] uppercase tracking-[0.14em] text-stone">
              <RotateCw className="size-3" aria-hidden />
              Live preview
            </span>
            <div className="flex border border-line bg-cream">
              {(["front", "back"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSide(option)}
                  className={`px-2.5 py-1 text-[8px] uppercase tracking-[0.12em] ${
                    side === option ? "bg-ink text-ivory" : "text-stone"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div
            className="mx-auto mt-3 aspect-square w-full max-w-[360px] transition-transform duration-300 ease-out"
            style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
          >
            <GarmentPreview
              garment={garment}
              colour={colour}
              monogram={monogram}
              printStyle={printStyle}
              side={side}
            />
          </div>

          <div className="flex items-center justify-between border-t border-line/70 pt-3 text-[9px] text-stone">
            <span>
              {garment} · {activeColour.name} · {size}
            </span>
            <span>Qty {quantity}</span>
          </div>
        </div>

        <p className="mt-3 text-[9.5px] leading-relaxed text-stone">
          Preview is illustrative. Fabric, placement and print scale are confirmed on the digital
          mock-up before production.
        </p>
      </div>

      <div className="space-y-6">
        {state.status === "error" ? (
          <p role="alert" className="border border-oxblood/30 bg-oxblood/5 p-3 text-[11px] text-oxblood">
            {state.message}
          </p>
        ) : null}

        <fieldset>
          <legend className="flex items-center gap-2 font-display text-2xl">
            <span className="font-sans text-[9px] uppercase tracking-[0.14em] text-champagne-dark">01</span>
            Choose the blank
          </legend>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {GARMENTS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setGarment(item.key)}
                className={`border px-2 py-3 text-[9px] uppercase tracking-[0.1em] transition-colors ${
                  garment === item.key
                    ? "border-ink bg-ink text-ivory"
                    : "border-line bg-cream text-stone hover:border-ink hover:text-ink"
                }`}
                aria-pressed={garment === item.key}
                title={item.note}
              >
                <Shirt className="mx-auto mb-1.5 size-4" aria-hidden />
                {item.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[9.5px] text-stone">
            {GARMENTS.find((item) => item.key === garment)?.note}
          </p>
        </fieldset>

        <fieldset>
          <legend className="flex items-center gap-2 font-display text-2xl">
            <span className="font-sans text-[9px] uppercase tracking-[0.14em] text-champagne-dark">02</span>
            Pick a colour
          </legend>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {COLOURS.map((option) => (
              <button
                key={option.name}
                type="button"
                onClick={() => setColour(option.name)}
                aria-pressed={colour === option.name}
                aria-label={option.name}
                className={`flex items-center gap-2 border px-2 py-1.5 text-[9px] uppercase tracking-[0.08em] transition-colors ${
                  colour === option.name
                    ? "border-ink bg-ink text-ivory"
                    : "border-line bg-cream text-stone hover:border-ink"
                }`}
              >
                <span className="size-4 rounded-full border border-black/10" style={{ background: option.hex }} aria-hidden />
                {option.name}
              </button>
            ))}
          </div>
          {error("colour") ? <p className="mt-1 text-[11px] text-oxblood">{error("colour")}</p> : null}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <fieldset>
            <legend className="font-display text-xl">Size</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {SIZES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSize(option)}
                  aria-pressed={size === option}
                  className={`min-w-9 border px-2 py-1.5 text-[9px] uppercase tracking-[0.1em] ${
                    size === option
                      ? "border-ink bg-ink text-ivory"
                      : "border-line bg-cream text-stone hover:border-ink"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {error("size") ? <p className="mt-1 text-[11px] text-oxblood">{error("size")}</p> : null}
          </fieldset>

          <fieldset>
            <legend className="font-display text-xl">Quantity</legend>
            <div className="mt-2 flex w-fit items-center border border-line bg-cream">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="grid size-9 place-items-center text-stone hover:text-oxblood"
                aria-label="Decrease quantity"
              >
                <Minus className="size-3.5" aria-hidden />
              </button>
              <input
                name="quantity"
                type="number"
                min={1}
                max={150}
                value={quantity}
                onChange={(event) =>
                  setQuantity(Math.max(1, Math.min(150, Number(event.target.value) || 1)))
                }
                className="w-12 border-x border-line bg-cream py-1.5 text-center text-[11px] tabular-nums outline-none"
                aria-label="Quantity"
              />
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.min(150, value + 1))}
                className="grid size-9 place-items-center text-stone hover:text-oxblood"
                aria-label="Increase quantity"
              >
                <Plus className="size-3.5" aria-hidden />
              </button>
            </div>
            <p className="mt-1.5 text-[9px] text-stone">
              {quantity >= 10 ? "Bulk pricing available." : "1–9 pieces welcome for monograms."}
            </p>
            {error("quantity") ? <p className="mt-1 text-[11px] text-oxblood">{error("quantity")}</p> : null}
          </fieldset>
        </div>

        <fieldset>
          <legend className="flex items-center gap-2 font-display text-2xl">
            <span className="font-sans text-[9px] uppercase tracking-[0.14em] text-champagne-dark">03</span>
            Finish &amp; monogram
          </legend>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {PRINT_STYLES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setPrintStyle(option);
                  if (option === "Back print") setSide("back");
                  if (option !== "Back print") setSide("front");
                }}
                aria-pressed={printStyle === option}
                className={`border px-2.5 py-1.5 text-[9px] uppercase tracking-[0.08em] ${
                  printStyle === option
                    ? "border-ink bg-ink text-ivory"
                    : "border-line bg-cream text-stone hover:border-ink"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="monogram" className="label">Monogram / word</label>
              <input
                id="monogram"
                name="monogram"
                value={monogram}
                onChange={(event) => setMonogram(event.target.value.slice(0, 12))}
                className="field"
                placeholder="e.g. T &amp; M"
                maxLength={12}
              />
              {error("monogram") ? <p className="mt-1 text-[11px] text-oxblood">{error("monogram")}</p> : null}
            </div>
            <div>
              <label htmlFor="notes" className="label">Notes for the maker</label>
              <input
                id="notes"
                name="notes"
                className="field"
                placeholder="Fabric weight, deadline, references…"
              />
            </div>
          </div>
          {error("printStyle") ? <p className="mt-1 text-[11px] text-oxblood">{error("printStyle")}</p> : null}
        </fieldset>

        <fieldset>
          <legend className="flex items-center gap-2 font-display text-2xl">
            <span className="font-sans text-[9px] uppercase tracking-[0.14em] text-champagne-dark">04</span>
            Choose a maker
          </legend>
          <select
            value={maker}
            onChange={(event) => setMaker(event.target.value)}
            className="field mt-3"
            aria-label="Maker"
          >
            <option value="">Let the studio match me</option>
            {makers.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name} · {option.kind === "LOCAL" ? "Local maker" : "Global maker"} · ships from {option.shipsFrom}
              </option>
            ))}
          </select>
          <p className="mt-1.5 flex items-center gap-1.5 text-[9.5px] text-stone">
            <Scissors className="size-3 text-champagne-dark" aria-hidden />
            {lead}
          </p>
        </fieldset>

        <fieldset>
          <legend className="flex items-center gap-2 font-display text-2xl">
            <span className="font-sans text-[9px] uppercase tracking-[0.14em] text-champagne-dark">05</span>
            Where do we send the quote?
          </legend>
          {signedIn ? (
            <p className="mt-3 flex items-center gap-2 border border-line bg-cream px-3 py-2.5 text-[10px] text-stone">
              <Sparkles className="size-3.5 text-champagne-dark" aria-hidden />
              Quoting {viewerName} · {viewerEmail}
            </p>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="custom-name" className="label">Name</label>
                <input id="custom-name" name="name" className="field" required />
                {error("name") ? <p className="mt-1 text-[11px] text-oxblood">{error("name")}</p> : null}
              </div>
              <div>
                <label htmlFor="custom-email" className="label">Email</label>
                <input id="custom-email" name="email" type="email" className="field" required />
                {error("email") ? <p className="mt-1 text-[11px] text-oxblood">{error("email")}</p> : null}
              </div>
            </div>
          )}
          <div className="mt-3">
            <label htmlFor="custom-phone" className="label">WhatsApp number (optional)</label>
            <input id="custom-phone" name="phone" type="tel" className="field" placeholder="082 123 4567" />
            {error("phone") ? <p className="mt-1 text-[11px] text-oxblood">{error("phone")}</p> : null}
          </div>
        </fieldset>

        <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Scissors className="size-4" aria-hidden />}
          {pending ? "Sending to the studio…" : "Request a quote"}
        </button>
        <p className="text-center text-[9px] leading-relaxed text-stone">
          No payment now. We confirm artwork, fabric and timing before anything is made.
        </p>
      </div>
    </form>
  );
}
