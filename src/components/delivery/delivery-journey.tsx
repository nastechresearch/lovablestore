"use client";

import {
  Bike,
  CarFront,
  Clock3,
  Info,
  PackageCheck,
  Plane,
  Route,
  ShieldCheck,
} from "lucide-react";
import { formatDeliveryDate, type DeliveryPlan } from "@/lib/delivery";
import { LiveDeliveryMap } from "@/components/delivery/live-delivery-map";
import type { TrackPlace } from "@/lib/delivery-track";

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

export function DeliveryJourney({
  plan,
  compact = false,
  title = "Delivery estimate",
  destination,
  status,
  orderNumber,
  courier,
  trackingNumber,
}: {
  plan: DeliveryPlan;
  compact?: boolean;
  title?: string;
  destination?: TrackPlace;
  status?: string;
  orderNumber?: string;
  courier?: string | null;
  trackingNumber?: string | null;
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
        {destination && status && orderNumber ? (
          <LiveDeliveryMap
            status={status}
            orderNumber={orderNumber}
            destination={destination}
            etaLabel={plan.windowLabel}
            courier={courier}
            trackingNumber={trackingNumber}
          />
        ) : null}

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
