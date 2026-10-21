"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bike,
  Boxes,
  CalendarDays,
  CarFront,
  Check,
  Clock3,
  Copy,
  Globe2,
  MapPin,
  PackageCheck,
  Plane,
  RotateCcw,
  ShieldCheck,
  TimerReset,
} from "lucide-react";
import { DeliveryJourney } from "@/components/delivery/delivery-journey";
import {
  buildDeliveryPlan,
  type DeliveryMode,
  type DeliveryPlan,
} from "@/lib/delivery";
import { PROVINCES } from "@/lib/constants";

export type DeliveryEstimatorSettings = {
  dispatchCutoffHour: number;
  localLeadMin: number;
  localLeadMax: number;
  globalLeadMin: number;
  globalLeadMax: number;
};

type ParcelOption = {
  value: DeliveryMode;
  label: string;
  detail: string;
  icon: typeof PackageCheck;
};

const ORDER_DATE_FORMAT = new Intl.DateTimeFormat("en-ZA", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Johannesburg",
});

const VEHICLE_LABELS: Record<DeliveryPlan["vehicle"], string> = {
  bike: "Courier bike",
  car: "Courier van",
  plane: "International flight",
  mixed: "Van + flight",
};

function todaySast(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function isValidDateInput(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return false;
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}

function fallbackCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "-9999px";
  document.body.appendChild(area);
  area.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  document.body.removeChild(area);
  return copied;
}

function VehicleGlyph({ vehicle }: { vehicle: DeliveryPlan["vehicle"] }) {
  if (vehicle === "plane") return <Plane className="size-5" aria-hidden />;
  if (vehicle === "bike") return <Bike className="size-5" aria-hidden />;
  if (vehicle === "mixed") {
    return (
      <span className="flex items-center">
        <CarFront className="size-4" aria-hidden />
        <Plane className="ml-0.5 size-4" aria-hidden />
      </span>
    );
  }
  return <CarFront className="size-5" aria-hidden />;
}

export function DeliveryEstimator({
  settings,
}: {
  settings: DeliveryEstimatorSettings;
}) {
  const [mode, setMode] = useState<DeliveryMode>("LOCAL");
  const [province, setProvince] = useState<string>("Gauteng");
  const [dispatchDate, setDispatchDate] = useState<string>(() => todaySast());
  const [afterCutoff, setAfterCutoff] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const resetTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  const cutoffLabel = `${String(settings.dispatchCutoffHour).padStart(2, "0")}:00`;
  const dateIsValid = isValidDateInput(dispatchDate);
  const effectiveDate = dateIsValid ? dispatchDate : todaySast();

  const parcelOptions: ParcelOption[] = [
    {
      value: "LOCAL",
      label: "Local stock",
      detail: `Ships from Joburg · ${settings.localLeadMin}–${settings.localLeadMax} days`,
      icon: PackageCheck,
    },
    {
      value: "GLOBAL",
      label: "Global atelier",
      detail: `Flight + customs · ${settings.globalLeadMin}–${settings.globalLeadMax} days`,
      icon: Globe2,
    },
    {
      value: "MIXED",
      label: "Mixed bag",
      detail: `Local + imported · up to ${settings.globalLeadMax} days`,
      icon: Boxes,
    },
  ];
  const parcel =
    parcelOptions.find((option) => option.value === mode) ?? parcelOptions[0];

  const leadTimeMin =
    mode === "LOCAL" ? settings.localLeadMin : settings.globalLeadMin;
  const leadTimeMax =
    mode === "LOCAL" ? settings.localLeadMax : settings.globalLeadMax;

  const plan = useMemo(() => {
    const createdAt = new Date(
      `${effectiveDate}T${afterCutoff ? "15:00:00" : "10:00:00"}+02:00`,
    );
    return buildDeliveryPlan({
      createdAt,
      mode,
      leadTimeMin,
      leadTimeMax,
      cutoffHour: settings.dispatchCutoffHour,
    });
  }, [
    afterCutoff,
    effectiveDate,
    leadTimeMax,
    leadTimeMin,
    mode,
    settings.dispatchCutoffHour,
  ]);

  const provinceNote =
    province === "Gauteng"
      ? "Metro estimate. Farm, smallholding and outlying Gauteng addresses can add one business day once the courier routes the parcel."
      : `${province} metro estimate. Outlying towns, farms and smallholdings can add one business day once the courier routes the parcel.`;

  const copyText = useMemo(() => {
    const orderDate = ORDER_DATE_FORMAT.format(
      new Date(`${effectiveDate}T12:00:00+02:00`),
    );
    return [
      "Lovable Store — delivery estimate",
      `Parcel: ${parcel.label} (${plan.modeLabel})`,
      `Destination: ${province}, South Africa`,
      `Order date: ${orderDate}`,
      plan.dispatchLabel,
      plan.windowLabel,
      `Transit: ${plan.minBusinessDays}–${plan.maxBusinessDays} business days after dispatch`,
      `Cutoff: ${cutoffLabel} SAST. Business days exclude weekends and South African public holidays.`,
      `Regional note: ${provinceNote}`,
      "Estimate only — the courier confirms tracking when the parcel is scanned.",
    ].join("\n");
  }, [
    cutoffLabel,
    effectiveDate,
    parcel.label,
    plan,
    province,
    provinceNote,
  ]);

  async function handleCopy() {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(copyText);
        copied = true;
      } else {
        copied = fallbackCopy(copyText);
      }
    } catch {
      copied = fallbackCopy(copyText);
    }
    setCopyState(copied ? "copied" : "error");
    if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyState("idle"), 3000);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
      <div className="surface-card surface-grid p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow text-champagne-dark">Your parcel</p>
            <h3 className="mt-2 font-display text-2xl">Set the details</h3>
          </div>
          <span className="grid-badge">
            <TimerReset className="size-3 text-champagne-dark" aria-hidden />
            Live estimate
          </span>
        </div>

        <fieldset className="mt-6">
          <legend className="label">Parcel type</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {parcelOptions.map((option) => {
              const Icon = option.icon;
              const active = mode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMode(option.value)}
                  aria-pressed={active}
                  className={`flex h-full flex-col items-start rounded-2xl border p-3.5 text-left transition-colors duration-200 ${
                    active
                      ? "border-ink bg-ink text-ivory"
                      : "border-line bg-cream text-ink hover:border-ink/40"
                  }`}
                >
                  <span
                    className={`flex size-8 items-center justify-center rounded-full border ${
                      active
                        ? "border-ivory/30 bg-ivory/10 text-ivory"
                        : "border-line bg-ivory/70 text-champagne-dark"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="mt-3 block text-[12px] font-medium">
                    {option.label}
                  </span>
                  <span
                    className={`mt-1 block text-[10px] leading-relaxed ${
                      active ? "text-ivory/70" : "text-stone"
                    }`}
                  >
                    {option.detail}
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="dispatch-date" className="label">
              Order date
            </label>
            <input
              id="dispatch-date"
              type="date"
              value={dispatchDate}
              onChange={(event) => setDispatchDate(event.target.value)}
              className="field bg-cream"
            />
            <p className="mt-1.5 text-[10px] leading-relaxed text-stone">
              {dateIsValid
                ? "Simulated payment at 10:00 SAST, or 15:00 SAST with the cutoff toggle on."
                : "That date could not be read — falling back to today in Johannesburg."}
            </p>
            {!dateIsValid ? (
              <button
                type="button"
                onClick={() => setDispatchDate(todaySast())}
                className="mt-1.5 inline-flex min-h-6 items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-oxblood hover:underline"
              >
                <RotateCcw className="size-3" aria-hidden />
                Use today
              </button>
            ) : null}
          </div>

          <div>
            <label htmlFor="province-select" className="label">
              Delivery province
            </label>
            <select
              id="province-select"
              value={province}
              onChange={(event) => setProvince(event.target.value)}
              className="field appearance-none bg-cream"
            >
              {PROVINCES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[10px] leading-relaxed text-stone">
              Metro estimate — outlying towns and farms can add a business day.
            </p>
          </div>
        </div>

        <label
          htmlFor="after-cutoff"
          className={`mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
            afterCutoff
              ? "border-oxblood/40 bg-oxblood/5"
              : "border-line bg-ivory/40"
          }`}
        >
          <input
            id="after-cutoff"
            type="checkbox"
            checked={afterCutoff}
            onChange={(event) => setAfterCutoff(event.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-champagne-dark ${
              afterCutoff
                ? "border-oxblood bg-oxblood"
                : "border-line bg-ivory-deep"
            }`}
          >
            <span
              className={`size-4 rounded-full border border-line/60 bg-cream shadow-soft transition-transform duration-200 ${
                afterCutoff ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </span>
          <span>
            <span
              className={`block text-[12px] font-medium ${
                afterCutoff ? "text-oxblood" : "text-ink"
              }`}
            >
              Ordering after {cutoffLabel} SAST
            </span>
            <span className="mt-0.5 block text-[10px] leading-relaxed text-stone">
              Dispatch moves to the next business day. Weekends and public
              holidays always do.
            </span>
          </span>
        </label>

        <p className="mt-5 flex items-start gap-2 border-t border-line pt-4 text-[10px] leading-relaxed text-stone">
          <ShieldCheck
            className="mt-0.5 size-3.5 shrink-0 text-champagne-dark"
            aria-hidden
          />
          Calculated on the same dispatch engine that runs our checkout — not a
          live courier quote.
        </p>
      </div>

      <div className="surface-card surface-grid min-w-0">
        <p className="sr-only" role="status" aria-live="polite">
          {plan.windowLabel}. {plan.dispatchLabel}. {plan.modeLabel},{" "}
          {plan.minBusinessDays} to {plan.maxBusinessDays} business days.
        </p>

        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line bg-ivory-deep/30 px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-champagne/50 bg-champagne/10 text-champagne-dark">
              <VehicleGlyph vehicle={plan.vehicle} />
            </span>
            <div className="min-w-0">
              <p className="eyebrow text-champagne-dark">Estimated arrival</p>
              <p className="mt-1.5 font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.05]">
                {plan.windowLabel}
              </p>
              <p className="mt-1.5 text-[10px] uppercase tracking-[0.12em] text-stone">
                {VEHICLE_LABELS[plan.vehicle]} · {plan.modeLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-line px-5 py-4 sm:px-6">
          <span className="grid-badge">
            <CalendarDays className="size-3 text-champagne-dark" aria-hidden />
            {plan.dispatchLabel}
          </span>
          <span className="grid-badge">
            <Clock3 className="size-3 text-champagne-dark" aria-hidden />
            {plan.minBusinessDays}–{plan.maxBusinessDays} business days
          </span>
          <span className="grid-badge">
            <MapPin className="size-3 text-champagne-dark" aria-hidden />
            {province}
          </span>
        </div>

        <div className="px-5 py-5 sm:px-6">
          <DeliveryJourney
            plan={plan}
            title="This is when it would arrive"
          />
        </div>

        <div className="border-t border-line px-5 py-5 sm:px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-champagne-dark" aria-hidden />
            <p className="eyebrow">Why this window</p>
          </div>
          <ul className="mt-4 space-y-3.5">
            {plan.reasons.map((reason, index) => (
              <li key={reason.title} className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-line bg-ivory text-[9px] tabular-nums text-stone">
                  {index + 1}
                </span>
                <div>
                  <p className="text-[12px] font-medium">{reason.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-stone">
                    {reason.body}
                  </p>
                </div>
              </li>
            ))}
            <li className="flex gap-3">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border border-line bg-ivory text-stone">
                <MapPin className="size-3" aria-hidden />
              </span>
              <div>
                <p className="text-[12px] font-medium">Regional routing</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-stone">
                  {provinceNote}
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-5 sm:px-6">
          <button type="button" onClick={handleCopy} className="btn-primary">
            {copyState === "copied" ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <Copy className="size-4" aria-hidden />
            )}
            {copyState === "copied" ? "Estimate copied" : "Copy estimate"}
          </button>
          <p className="max-w-xs text-[10px] leading-relaxed text-stone">
            Plain text for WhatsApp or email. No address or payment details are
            included.
          </p>
          <span className="sr-only" role="status">
            {copyState === "copied"
              ? "Delivery estimate copied to clipboard."
              : copyState === "error"
                ? "Could not copy the estimate automatically."
                : ""}
          </span>
          {copyState === "error" ? (
            <p role="alert" className="w-full text-[10px] text-oxblood">
              Clipboard access is blocked in this browser. Select the arrival
              window above and copy it manually.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
