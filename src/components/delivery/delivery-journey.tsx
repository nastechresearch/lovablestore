"use client";

import {
  Bike,
  CarFront,
  Clock3,
  Info,
  MapPin,
  PackageCheck,
  Plane,
  Route,
  ShieldCheck,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import { formatDeliveryDate, type DeliveryPlan } from "@/lib/delivery";

function VehicleIcon({
  vehicle,
  className,
}: {
  vehicle: DeliveryPlan["vehicle"];
  className?: string;
}) {
  if (vehicle === "plane") return <Plane className={className} aria-hidden />;
  if (vehicle === "bike") return <Bike className={className} aria-hidden />;
  return <CarFront className={className} aria-hidden />;
}

function RouteTrack({ plan }: { plan: DeliveryPlan }) {
  const reduced = useReducedMotion();
  const laneOne =
    plan.vehicle === "mixed"
      ? "car"
      : plan.vehicle === "plane"
        ? "plane"
        : plan.vehicle;
  const laneTwo = plan.vehicle === "mixed" ? "plane" : null;

  return (
    <div className="relative mt-6 overflow-hidden border border-line bg-ivory-deep/30 px-4 py-6">
      <div className="relative mx-2 h-24">
        <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-stone/40" aria-hidden />
        <div className="absolute left-0 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-cream text-[9px] font-medium uppercase tracking-[0.1em] text-stone">
          JM
        </div>
        <div className="absolute right-0 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-oxblood text-ivory shadow-soft">
          <MapPin className="size-4" aria-hidden />
        </div>

        <div
          className={`absolute left-10 top-[calc(50%-40px)] text-champagne-dark ${
            reduced ? "translate-x-[58%]" : "delivery-ride"
          }`}
          aria-hidden
        >
          <span className="flex size-9 items-center justify-center rounded-full border border-champagne/50 bg-cream shadow-soft">
            <VehicleIcon vehicle={laneOne as DeliveryPlan["vehicle"]} className="size-4" />
          </span>
        </div>

        {laneTwo ? (
          <div
            className={`absolute left-10 top-[calc(50%+14px)] text-oxblood/70 ${
              reduced ? "translate-x-[42%]" : "delivery-ride delivery-ride-slow"
            }`}
            aria-hidden
          >
            <span className="flex size-8 items-center justify-center rounded-full border border-oxblood/20 bg-cream shadow-soft">
              <VehicleIcon vehicle={laneTwo as DeliveryPlan["vehicle"]} className="size-3.5" />
            </span>
          </div>
        ) : null}

        <div className="absolute inset-x-0 -bottom-1 flex justify-between text-[8px] uppercase tracking-[0.12em] text-stone">
          <span>Packed in Joburg</span>
          <span>{plan.mode === "GLOBAL" ? "Customs · last mile" : "Your door"}</span>
        </div>
      </div>
    </div>
  );
}

export function DeliveryJourney({
  plan,
  compact = false,
  title = "Delivery estimate",
}: {
  plan: DeliveryPlan;
  compact?: boolean;
  title?: string;
}) {
  if (compact) {
    return (
      <div className="border border-line bg-cream p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full border border-champagne/50 bg-champagne/10 text-champagne-dark">
              <VehicleIcon vehicle={plan.vehicle} className="size-4" />
            </span>
            <div>
              <p className="text-[9px] uppercase tracking-[0.14em] text-stone">{title}</p>
              <p className="text-[13px] font-medium text-ink">{plan.windowLabel}</p>
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-[0.1em] text-stone">
            {plan.modeLabel} · {plan.minBusinessDays}–{plan.maxBusinessDays} business days
          </p>
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed text-stone">
          <Clock3 className="mt-0.5 size-3 shrink-0" aria-hidden />
          {plan.dispatchLabel}. Ordered after {plan.cutoffHour}:00 SAST? Dispatch moves to the next business day.
        </p>
      </div>
    );
  }

  return (
    <section className="border border-line bg-cream">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
        <div>
          <p className="eyebrow text-champagne-dark">{title}</p>
          <h2 className="mt-1.5 font-display text-3xl leading-tight">{plan.windowLabel}</h2>
          <p className="mt-1 text-[11px] text-stone">{plan.summary}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 border border-champagne-dark/40 bg-champagne/10 px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-champagne-dark">
          <Route className="size-3" aria-hidden />
          {plan.modeLabel}
        </span>
      </div>

      <div className="px-5 py-5 sm:px-6">
        <RouteTrack plan={plan} />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {plan.steps.map((step, index) => (
            <div
              key={`${step.label}-${index}`}
              className="flex gap-3 border border-line/80 bg-ivory/60 p-3"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-medium text-ivory">
                {index + 1}
              </span>
              <div>
                <p className="text-[11px] font-medium">{step.label}</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-stone">{step.detail}</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.1em] text-champagne-dark">
                  {formatDeliveryDate(new Date(step.dateISO))}
                </p>
              </div>
            </div>
          ))}
        </div>

        <details className="group mt-5 border border-line/80 bg-ivory/50">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-ink-soft">
            <span className="inline-flex items-center gap-2">
              <Info className="size-3.5 text-champagne-dark" aria-hidden />
              Why this estimate
            </span>
            <span className="text-stone transition-transform group-open:rotate-45">+</span>
          </summary>
          <ul className="space-y-3 border-t border-line px-4 py-4">
            {plan.reasons.map((reason) => (
              <li key={reason.title} className="flex gap-2.5">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-champagne-dark" aria-hidden />
                <div>
                  <p className="text-[11px] font-medium">{reason.title}</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-stone">{reason.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </details>

        <p className="mt-3 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.1em] text-stone">
          <PackageCheck className="size-3" aria-hidden />
          Gift wrapped · tracked door to door · {plan.dispatchLabel.toLowerCase()}
        </p>
      </div>
    </section>
  );
}
