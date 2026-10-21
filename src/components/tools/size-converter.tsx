"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, Info, Ruler } from "lucide-react";

type TabKey = "women" | "men" | "shoes" | "rings";
type ShoeAudience = "women" | "men";
type DataKey = "women" | "men" | "shoes-women" | "shoes-men" | "rings";

type SizeRow = {
  id: string;
  label: string;
  sa: string;
  uk: string;
  eu: string;
  us: string;
  measurements: string[];
};

type Category = {
  title: string;
  intro: string;
  unit: "cm" | "mm";
  measurementLabels: string[];
  selectHint: string;
  fitNote: string;
  measureTitle: string;
  helper: { title: string; body: string }[];
  rows: SizeRow[];
};

const TABS: { key: TabKey; label: string }[] = [
  { key: "women", label: "Women's clothing" },
  { key: "men", label: "Men's clothing" },
  { key: "shoes", label: "Shoes" },
  { key: "rings", label: "Rings" },
];

const REGIONS = [
  { key: "sa", label: "SA", name: "South Africa" },
  { key: "uk", label: "UK", name: "United Kingdom" },
  { key: "eu", label: "EU", name: "Europe" },
  { key: "us", label: "US", name: "United States" },
] as const;

const CATEGORIES: Record<DataKey, Category> = {
  women: {
    title: "Women's clothing",
    intro:
      "South African numeric sizes translated to UK, EU and US, with bust, waist and hip measurements in centimetres.",
    unit: "cm",
    measurementLabels: ["Bust", "Waist", "Hip"],
    selectHint: "Start with the SA size you normally buy in dresses, tops and tailoring.",
    fitNote:
      "Between sizes? Size up for oversized fits and fluid silhouettes; size down if you prefer a close, body-skimming line.",
    measureTitle: "How to measure clothing",
    helper: [
      {
        title: "Bust",
        body: "Wrap the tape around the fullest part of your bust, level under the arms and across the shoulder blades.",
      },
      {
        title: "Waist",
        body: "Find the narrowest point above the navel. Breathe out normally and keep the tape snug, not tight.",
      },
      {
        title: "Hip",
        body: "Stand with your feet together and measure around the fullest part of your seat.",
      },
      {
        title: "Double-check",
        body: "Measure over light clothing and keep one finger under the tape so it sits comfortably.",
      },
    ],
    rows: [
      { id: "w-xs", label: "XS", sa: "30", uk: "6", eu: "34", us: "2", measurements: ["80", "62", "88"] },
      { id: "w-s", label: "S", sa: "32", uk: "8", eu: "36", us: "4", measurements: ["84", "66", "92"] },
      { id: "w-m", label: "M", sa: "34", uk: "10", eu: "38", us: "6", measurements: ["88", "70", "96"] },
      { id: "w-ml", label: "M–L", sa: "36", uk: "12", eu: "40", us: "8", measurements: ["92", "74", "100"] },
      { id: "w-l", label: "L", sa: "38", uk: "14", eu: "42", us: "10", measurements: ["98", "79", "105"] },
      { id: "w-xl", label: "XL", sa: "40", uk: "16", eu: "44", us: "12", measurements: ["103", "84", "110"] },
      { id: "w-xxl", label: "XXL", sa: "42", uk: "18", eu: "46", us: "14", measurements: ["108", "89", "115"] },
      { id: "w-3xl", label: "3XL", sa: "44", uk: "20", eu: "48", us: "16", measurements: ["113", "94", "120"] },
    ],
  },
  men: {
    title: "Men's clothing",
    intro:
      "SA/UK chest sizing with EU and US equivalents, plus chest, waist and neck measurements in centimetres.",
    unit: "cm",
    measurementLabels: ["Chest", "Waist", "Neck"],
    selectHint: "Choose the size you wear in SA suiting, shirting or knitwear.",
    fitNote:
      "Between sizes? Size up for a relaxed fit over shirting; size down for a sharp, close-cut silhouette.",
    measureTitle: "How to measure clothing",
    helper: [
      {
        title: "Chest",
        body: "Measure around the fullest part of your chest, under the arms and across the shoulder blades.",
      },
      {
        title: "Waist",
        body: "Measure at your natural waistband, keeping one finger of room so the tape is not pulled tight.",
      },
      {
        title: "Neck",
        body: "Measure around the base of your neck with one finger of room for a comfortable shirt collar.",
      },
      {
        title: "Double-check",
        body: "Stand naturally with arms down. Measure over a light shirt, not a heavy jacket.",
      },
    ],
    rows: [
      { id: "m-xs", label: "XS", sa: "34", uk: "34", eu: "44", us: "34", measurements: ["86–91", "71–76", "36"] },
      { id: "m-s", label: "S", sa: "36", uk: "36", eu: "46", us: "36", measurements: ["91–96", "76–81", "38"] },
      { id: "m-m", label: "M", sa: "38", uk: "38", eu: "48", us: "38", measurements: ["96–101", "81–86", "40"] },
      { id: "m-l", label: "L", sa: "40", uk: "40", eu: "50", us: "40", measurements: ["101–106", "86–91", "42"] },
      { id: "m-xl", label: "XL", sa: "42", uk: "42", eu: "52", us: "42", measurements: ["106–111", "91–96", "44"] },
      { id: "m-xxl", label: "XXL", sa: "44", uk: "44", eu: "54", us: "44", measurements: ["111–116", "96–101", "46"] },
      { id: "m-3xl", label: "3XL", sa: "46", uk: "46", eu: "56", us: "46", measurements: ["116–121", "101–106", "48"] },
    ],
  },
  "shoes-women": {
    title: "Shoes — women's",
    intro:
      "Women's shoe sizes across SA, UK, EU and US, with foot length in centimetres.",
    unit: "cm",
    measurementLabels: ["Foot length"],
    selectHint: "Choose the UK size you usually wear in women's shoes.",
    fitNote:
      "Between sizes? Size up for closed shoes and thick socks. Leather and suede relax about half a size with wear.",
    measureTitle: "How to measure your feet",
    helper: [
      {
        title: "Trace",
        body: "Stand on a sheet of paper with your heel against a wall, late in the day when feet are largest.",
      },
      {
        title: "Mark",
        body: "Mark the heel and your longest toe. Repeat for both feet — one is often slightly longer.",
      },
      {
        title: "Measure",
        body: "Measure heel to toe in centimetres and use the longer foot for the chart.",
      },
      {
        title: "Allow",
        body: "Between lengths? Choose the larger size for closed shoes and the closer fit for sandals.",
      },
    ],
    rows: [
      { id: "sw-3", label: "UK 3", sa: "3", uk: "3", eu: "36", us: "5", measurements: ["22.5"] },
      { id: "sw-4", label: "UK 4", sa: "4", uk: "4", eu: "37", us: "6", measurements: ["23.2"] },
      { id: "sw-5", label: "UK 5", sa: "5", uk: "5", eu: "38", us: "7", measurements: ["24.0"] },
      { id: "sw-6", label: "UK 6", sa: "6", uk: "6", eu: "39", us: "8", measurements: ["24.8"] },
      { id: "sw-7", label: "UK 7", sa: "7", uk: "7", eu: "40", us: "9", measurements: ["25.5"] },
      { id: "sw-8", label: "UK 8", sa: "8", uk: "8", eu: "41", us: "10", measurements: ["26.3"] },
      { id: "sw-9", label: "UK 9", sa: "9", uk: "9", eu: "42", us: "11", measurements: ["27.1"] },
    ],
  },
  "shoes-men": {
    title: "Shoes — men's",
    intro:
      "Men's shoe sizes across SA, UK, EU and US, with foot length in centimetres.",
    unit: "cm",
    measurementLabels: ["Foot length"],
    selectHint: "Choose the UK size you usually wear in men's shoes.",
    fitNote:
      "Between sizes? Size up for closed shoes and thick socks. Leather and suede relax about half a size with wear.",
    measureTitle: "How to measure your feet",
    helper: [
      {
        title: "Trace",
        body: "Stand on a sheet of paper with your heel against a wall, late in the day when feet are largest.",
      },
      {
        title: "Mark",
        body: "Mark the heel and your longest toe. Repeat for both feet — one is often slightly longer.",
      },
      {
        title: "Measure",
        body: "Measure heel to toe in centimetres and use the longer foot for the chart.",
      },
      {
        title: "Allow",
        body: "Between lengths? Choose the larger size for closed shoes, boots and thick socks.",
      },
    ],
    rows: [
      { id: "sm-6", label: "UK 6", sa: "6", uk: "6", eu: "40", us: "7", measurements: ["24.5"] },
      { id: "sm-7", label: "UK 7", sa: "7", uk: "7", eu: "41", us: "8", measurements: ["25.4"] },
      { id: "sm-8", label: "UK 8", sa: "8", uk: "8", eu: "42", us: "9", measurements: ["26.2"] },
      { id: "sm-9", label: "UK 9", sa: "9", uk: "9", eu: "43", us: "10", measurements: ["27.1"] },
      { id: "sm-10", label: "UK 10", sa: "10", uk: "10", eu: "44", us: "11", measurements: ["27.9"] },
      { id: "sm-11", label: "UK 11", sa: "11", uk: "11", eu: "45", us: "12", measurements: ["28.8"] },
      { id: "sm-12", label: "UK 12", sa: "12", uk: "12", eu: "46", us: "13", measurements: ["29.6"] },
      { id: "sm-13", label: "UK 13", sa: "13", uk: "13", eu: "47", us: "14", measurements: ["30.5"] },
    ],
  },
  rings: {
    title: "Rings",
    intro:
      "UK-style letters (used in South Africa), EU/ISO circumference and US ring sizes, measured in millimetres.",
    unit: "mm",
    measurementLabels: ["Inner circumference"],
    selectHint: "Choose a size you already wear, or measure your finger below.",
    fitNote:
      "Between sizes? Size up for wide bands and warm afternoons. Fingers are often a little smaller in the cold.",
    measureTitle: "How to measure a ring",
    helper: [
      {
        title: "Wrap",
        body: "Wrap a thin strip of paper or string around the base of the finger, snug but able to slide over the knuckle.",
      },
      {
        title: "Mark",
        body: "Mark exactly where the ends overlap, without stretching the paper or string.",
      },
      {
        title: "Measure",
        body: "Lay it flat and measure the length in millimetres. Match that number to the inner circumference.",
      },
      {
        title: "Check",
        body: "Your knuckle must pass through the ring. Wide bands often need one size up.",
      },
    ],
    rows: [
      { id: "ring-f", label: "F", sa: "F", uk: "F", eu: "44.0", us: "3", measurements: ["44.0"] },
      { id: "ring-g", label: "G", sa: "G", uk: "G", eu: "45.5", us: "3.5", measurements: ["45.5"] },
      { id: "ring-h", label: "H", sa: "H", uk: "H", eu: "46.5", us: "4", measurements: ["46.5"] },
      { id: "ring-i", label: "I", sa: "I", uk: "I", eu: "47.8", us: "4.5", measurements: ["47.8"] },
      { id: "ring-j", label: "J", sa: "J", uk: "J", eu: "49.0", us: "5", measurements: ["49.0"] },
      { id: "ring-k", label: "K", sa: "K", uk: "K", eu: "50.0", us: "5.5", measurements: ["50.0"] },
      { id: "ring-l", label: "L", sa: "L", uk: "L", eu: "51.2", us: "6", measurements: ["51.2"] },
      { id: "ring-m", label: "M", sa: "M", uk: "M", eu: "52.5", us: "6.5", measurements: ["52.5"] },
      { id: "ring-n", label: "N", sa: "N", uk: "N", eu: "53.8", us: "7", measurements: ["53.8"] },
      { id: "ring-o", label: "O", sa: "O", uk: "O", eu: "55.1", us: "7.5", measurements: ["55.1"] },
      { id: "ring-p", label: "P", sa: "P", uk: "P", eu: "56.3", us: "8", measurements: ["56.3"] },
      { id: "ring-q", label: "Q", sa: "Q", uk: "Q", eu: "57.6", us: "8.5", measurements: ["57.6"] },
      { id: "ring-r", label: "R", sa: "R", uk: "R", eu: "58.9", us: "9", measurements: ["58.9"] },
      { id: "ring-s", label: "S", sa: "S", uk: "S", eu: "60.2", us: "9.5", measurements: ["60.2"] },
      { id: "ring-t", label: "T", sa: "T", uk: "T", eu: "61.4", us: "10", measurements: ["61.4"] },
      { id: "ring-u", label: "U", sa: "U", uk: "U", eu: "62.7", us: "10.5", measurements: ["62.7"] },
      { id: "ring-v", label: "V", sa: "V", uk: "V", eu: "64.0", us: "11", measurements: ["64.0"] },
      { id: "ring-w", label: "W", sa: "W", uk: "W", eu: "65.3", us: "11.5", measurements: ["65.3"] },
      { id: "ring-x", label: "X", sa: "X", uk: "X", eu: "66.6", us: "12", measurements: ["66.6"] },
      { id: "ring-y", label: "Y", sa: "Y", uk: "Y", eu: "67.8", us: "12.5", measurements: ["67.8"] },
      { id: "ring-z", label: "Z", sa: "Z", uk: "Z", eu: "68.5", us: "13", measurements: ["68.5"] },
    ],
  },
};

const INITIAL_SELECTION: Record<DataKey, string> = {
  women: "w-m",
  men: "m-m",
  "shoes-women": "sw-5",
  "shoes-men": "sm-9",
  rings: "ring-l",
};

export function SizeConverter() {
  const [tab, setTab] = useState<TabKey>("women");
  const [shoeAudience, setShoeAudience] = useState<ShoeAudience>("women");
  const [selection, setSelection] = useState<Record<DataKey, string>>(INITIAL_SELECTION);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    };
  }, []);

  const dataKey: DataKey =
    tab === "shoes" ? (shoeAudience === "women" ? "shoes-women" : "shoes-men") : tab;
  const data = CATEGORIES[dataKey];
  const selectedId = selection[dataKey] ?? data.rows[0].id;
  const selected = data.rows.find((row) => row.id === selectedId) ?? data.rows[0];

  function resetCopyState() {
    if (copyState !== "idle") setCopyState("idle");
    if (copyTimer.current !== null) {
      window.clearTimeout(copyTimer.current);
      copyTimer.current = null;
    }
  }

  function chooseRow(id: string) {
    setSelection((previous) => ({ ...previous, [dataKey]: id }));
    resetCopyState();
  }

  function chooseTab(key: TabKey) {
    setTab(key);
    resetCopyState();
  }

  function chooseShoeAudience(audience: ShoeAudience) {
    setShoeAudience(audience);
    resetCopyState();
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + TABS.length) % TABS.length;
    setTab(TABS[nextIndex].key);
    resetCopyState();
    const buttons =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons?.[nextIndex]?.focus();
  }

  function optionText(row: SizeRow) {
    if (tab === "rings") {
      return `${row.label} · US ${row.us} — ${row.measurements[0]} mm inner`;
    }
    if (tab === "shoes") {
      return `${row.label} · EU ${row.eu} — ${row.measurements[0]} cm foot`;
    }
    return `${row.label} · SA ${row.sa} — UK ${row.uk}`;
  }

  async function copySizes() {
    const text = [
      `Lovable Store size conversion — ${data.title}`,
      `${selected.label}: SA ${selected.sa} · UK ${selected.uk} · EU ${selected.eu} · US ${selected.us}`,
      ...data.measurementLabels.map(
        (label, index) => `${label}: ${selected.measurements[index]} ${data.unit}`,
      ),
      data.fitNote,
    ].join("\n");

    let nextState: "copied" | "error" = "copied";
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      nextState = "error";
    }

    setCopyState(nextState);
    if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopyState("idle"), 2800);
  }

  return (
    <section aria-labelledby="size-converter-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow flex items-center gap-2 text-champagne-dark">
            <Ruler className="size-3.5" aria-hidden />
            Conversion studio
          </p>
          <h2
            id="size-converter-title"
            className="mt-3 font-display text-[clamp(2rem,4vw,3.1rem)] leading-[1.02]"
          >
            One size, <span className="italic text-oxblood">four languages.</span>
          </h2>
          <p className="mt-3 max-w-xl text-[12px] leading-relaxed text-stone">
            Choose what you&apos;re shopping for and the size you normally buy. The
            equivalents update instantly — nothing is sent anywhere.
          </p>
        </div>
        <span className="grid-badge">
          <span className="size-1.5 rounded-full bg-oxblood" aria-hidden />
          Works on your device
        </span>
      </div>

      <div className="mt-7 flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="tablist"
          aria-label="Size category"
          className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1"
        >
          {TABS.map((item, index) => (
            <button
              key={item.key}
              id={`size-tab-${item.key}`}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              aria-controls="size-converter-panel"
              tabIndex={tab === item.key ? 0 : -1}
              onClick={() => chooseTab(item.key)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              className={`shrink-0 rounded-full border px-4 py-2.5 text-[9.5px] uppercase tracking-[0.12em] transition-colors ${
                tab === item.key
                  ? "border-ink bg-ink text-ivory"
                  : "border-transparent text-stone hover:border-line hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {tab === "shoes" ? (
          <div
            role="group"
            aria-label="Shoe fit"
            className="flex items-center gap-1 self-start rounded-full border border-line bg-ivory-deep/40 p-1 sm:self-auto"
          >
            {(["women", "men"] as const).map((audience) => (
              <button
                key={audience}
                type="button"
                onClick={() => chooseShoeAudience(audience)}
                aria-pressed={shoeAudience === audience}
                className={`rounded-full px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] transition-colors ${
                  shoeAudience === audience ? "bg-ink text-ivory" : "text-stone hover:text-ink"
                }`}
              >
                {audience === "women" ? "Women's" : "Men's"}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div
        id="size-converter-panel"
        role="tabpanel"
        aria-labelledby={`size-tab-${tab}`}
        className="pt-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow text-stone">{data.title}</p>
            <p className="mt-1.5 max-w-2xl text-[11.5px] leading-relaxed text-stone">
              {data.intro}
            </p>
          </div>
          <span className="grid-badge">
            <Ruler className="size-3" aria-hidden />
            {data.unit === "cm" ? "Centimetres" : "Millimetres"}
          </span>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="surface-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow text-champagne-dark">Step 01</p>
              <span className="text-[9px] uppercase tracking-[0.14em] text-stone">All local</span>
            </div>
            <label htmlFor="usual-size" className="label mt-5">
              Your usual size
            </label>
            <select
              id="usual-size"
              className="field"
              value={selected.id}
              onChange={(event) => chooseRow(event.target.value)}
            >
              {data.rows.map((row) => (
                <option key={row.id} value={row.id}>
                  {optionText(row)}
                </option>
              ))}
            </select>
            <p className="mt-2 text-[10px] leading-relaxed text-stone">{data.selectHint}</p>

            <div className="mt-5 border-t border-line pt-4">
              <button
                type="button"
                onClick={copySizes}
                className={`btn-outline min-h-11 w-full px-4 text-[9px] sm:w-auto ${
                  copyState === "copied" ? "border-champagne-dark text-champagne-dark" : ""
                }`}
              >
                {copyState === "copied" ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  <Copy className="size-3.5" aria-hidden />
                )}
                {copyState === "copied" ? "Sizes copied" : "Copy sizes"}
              </button>
              <p
                aria-live="polite"
                className={`mt-2 text-[10px] leading-relaxed ${
                  copyState === "error" ? "text-oxblood" : "text-stone"
                }`}
              >
                {copyState === "copied"
                  ? "Copied — paste it into a note or send it to the studio."
                  : copyState === "error"
                    ? "Clipboard access is blocked. Use the chart below to note your sizes."
                    : "Copies your equivalents and measurements as plain text."}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow text-champagne-dark">Step 02 · Your equivalents</p>
              <p className="text-[9px] uppercase tracking-[0.14em] text-stone">{selected.label}</p>
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-2.5">
              {REGIONS.map((region) => (
                <div
                  key={region.key}
                  className={`surface-card p-4 ${
                    region.key === "sa" ? "border-oxblood/30" : ""
                  }`}
                >
                  <dt className="flex items-center justify-between gap-2 text-[9px] uppercase tracking-[0.16em] text-stone">
                    {region.name}
                    <span className="text-champagne-dark">{region.label}</span>
                  </dt>
                  <dd className="mt-2 font-display text-4xl leading-none">
                    {selected[region.key]}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-2.5">
              <p className="label">Body measurements</p>
              <dl
                className={`grid gap-2.5 ${
                  data.measurementLabels.length === 1 ? "grid-cols-1" : "grid-cols-3"
                }`}
              >
                {data.measurementLabels.map((label, index) => (
                  <div key={label} className="border border-line bg-ivory/60 px-3 py-2.5">
                    <dt className="text-[8.5px] uppercase tracking-[0.14em] text-stone">{label}</dt>
                    <dd className="mt-1 font-display text-xl leading-none">
                      {selected.measurements[index]}{" "}
                      <span className="font-sans text-[9px] uppercase tracking-[0.1em] text-stone">
                        {data.unit}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-stone">
              <Info className="mt-0.5 size-3 shrink-0" aria-hidden />
              Equivalents are a starting point. Cuts, fabric and the maker&apos;s block all move
              the fit.
            </p>
          </div>
        </div>

        <div className="mt-4 border border-champagne-dark/30 bg-champagne/10 p-5 sm:p-6">
          <div className="flex flex-wrap items-start gap-3">
            <Info className="mt-0.5 size-4 shrink-0 text-champagne-dark" aria-hidden />
            <div>
              <p className="eyebrow text-champagne-dark">Fit note</p>
              <p className="mt-1.5 max-w-3xl font-display text-xl leading-snug sm:text-2xl">
                {data.fitNote}
              </p>
              <p className="mt-2 text-[10.5px] leading-relaxed text-stone">
                Always check the product page for model measurements and any fit notes before
                ordering.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="surface-card surface-grid p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow text-champagne-dark">Measure at home</p>
                <h3 className="mt-1.5 font-display text-2xl">{data.measureTitle}</h3>
              </div>
              <Ruler className="size-5 text-stone" aria-hidden />
            </div>
            <ol className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {data.helper.map((step, index) => (
                <li key={step.title} className="flex gap-3 border border-line bg-cream/80 p-3.5">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-[8px] font-medium tracking-[0.04em] text-ivory">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-ink">
                      {step.title}
                    </p>
                    <p className="mt-1 text-[10px] leading-relaxed text-stone">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="surface-card flex flex-col p-5 sm:p-6">
            <p className="eyebrow text-champagne-dark">A second opinion</p>
            <p className="mt-3 font-display text-2xl leading-snug">
              Not sure? Send three measurements and the studio will confirm the closest size.
            </p>
            <p className="mt-2 text-[10.5px] leading-relaxed text-stone">
              Share your bust or chest, waist and hip — or your foot length for shoes — and the
              studio will check it against the piece you have in mind.
            </p>
            <Link
              href="/contact"
              className="btn-outline mt-4 min-h-10 w-full px-4 text-[9px] sm:w-auto sm:self-start"
            >
              Ask the studio
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="surface-card mt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <p className="eyebrow text-champagne-dark">Full chart</p>
              <p className="mt-1 text-[10.5px] text-stone">
                {data.title} · measurements in {data.unit}
              </p>
            </div>
            <span className="grid-badge">{data.rows.length} sizes</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-[11.5px]">
              <caption className="sr-only">
                {data.title} size chart with SA, UK, EU and US equivalents and body measurements
                in {data.unit}.
              </caption>
              <thead>
                <tr className="border-b border-line text-[8.5px] uppercase tracking-[0.14em] text-stone">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Size
                  </th>
                  {REGIONS.map((region) => (
                    <th key={region.key} scope="col" className="px-4 py-3 font-medium">
                      {region.label}
                    </th>
                  ))}
                  {data.measurementLabels.map((label) => (
                    <th key={label} scope="col" className="px-4 py-3 font-medium">
                      {label} ({data.unit})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.rows.map((row) => {
                  const active = row.id === selected.id;
                  return (
                    <tr
                      key={row.id}
                      className={
                        active ? "bg-oxblood/5" : "transition-colors hover:bg-ivory-deep/40"
                      }
                    >
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          onClick={() => chooseRow(row.id)}
                          aria-pressed={active}
                          className={`inline-flex min-h-8 items-center gap-1.5 text-left font-medium transition-colors ${
                            active ? "text-oxblood" : "text-ink hover:text-oxblood"
                          }`}
                        >
                          {row.label}
                          {active ? <Check className="size-3" aria-hidden /> : null}
                        </button>
                      </td>
                      <td className="px-4 py-2.5">{row.sa}</td>
                      <td className="px-4 py-2.5">{row.uk}</td>
                      <td className="px-4 py-2.5">{row.eu}</td>
                      <td className="px-4 py-2.5">{row.us}</td>
                      {row.measurements.map((measurement, index) => (
                        <td
                          key={data.measurementLabels[index]}
                          className="px-4 py-2.5 text-stone"
                        >
                          {measurement}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t border-line px-5 py-3 text-[9.5px] leading-relaxed text-stone">
            Tap any size to load it above. Charts are a guide, not a guarantee — always check the
            product page.
          </p>
        </div>
      </div>
    </section>
  );
}
