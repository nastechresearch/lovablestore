"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { MAJOR_CITIES, PROVINCE_SHAPES } from "@/lib/sa-geo";
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  SA_BOUNDS,
  STUDIO,
  angleOnCubic,
  buildRoute,
  formatKm,
  pointOnCubic,
  project,
  stageForStatus,
  type TrackPlace,
} from "@/lib/delivery-track";
import { EASE_SILK } from "@/lib/motion";
import { CheckSeal, CourierVan, DeliveryRoute } from "@/components/icons/atelier-icons";

const MILESTONES = ["Atelier", "Hub", "Out for delivery", "Door"];

export function LiveDeliveryMap({
  status,
  orderNumber,
  destination,
  etaLabel,
  courier,
  trackingNumber,
}: {
  status: string;
  orderNumber: string;
  destination: TrackPlace;
  etaLabel: string;
  courier?: string | null;
  trackingNumber?: string | null;
}) {
  const reduce = useReducedMotion();
  const markerRef = useRef<SVGGElement>(null);
  const stage = stageForStatus(status);

  const { lat, lng } = destination;
  const route = useMemo(
    () => buildRoute(STUDIO, { lat, lng }),
    [lat, lng],
  );

  const staticT = stage === "delivered" ? 1 : stage === "transit" ? 0.72 : 0;
  const staticPoint = pointOnCubic(route, staticT);
  const staticAngle = angleOnCubic(route, staticT);

  useEffect(() => {
    const node = markerRef.current;
    if (!node || stage === "atelier") return;

    if (stage !== "transit" || reduce) {
      node.setAttribute(
        "transform",
        `translate(${staticPoint.x} ${staticPoint.y}) rotate(${staticAngle + 90})`,
      );
      return;
    }

    const duration = 75_000;
    let frame = 0;
    let last = performance.now();
    let elapsed = 0;

    const tick = (now: number) => {
      if (!document.hidden) elapsed += now - last;
      last = now;
      const t = Math.min(1, elapsed / duration);
      const point = pointOnCubic(route, t);
      const angle = angleOnCubic(route, t);
      node.setAttribute(
        "transform",
        `translate(${point.x} ${point.y}) rotate(${angle + 90})`,
      );
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [route, stage, reduce, staticAngle, staticPoint.x, staticPoint.y]);

  if (stage === "cancelled") return null;

  const stageIndex = stage === "atelier" ? 0 : stage === "transit" ? 2 : 3;
  const railScale = [0.12, 0.45, 0.78, 1][stageIndex];
  const stageLabel =
    stage === "delivered"
      ? "Delivered"
      : stage === "transit"
        ? "Out for delivery"
        : "Preparing in Rosebank";
  const description = `Order ${orderNumber}. Estimated route from ${STUDIO.name} to ${destination.name}, ${destination.province}. Current stage: ${stageLabel}.`;

  const pulse = stage === "atelier" ? route.from : route.to;

  return (
    <section className="mt-5 border border-line bg-ivory/50" data-testid="live-delivery-map">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="text-[9px] uppercase tracking-[0.16em] text-stone">Last mile</p>
          <p className="mt-0.5 text-[12px] font-medium text-ink">{stageLabel}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 border border-champagne-dark/40 bg-champagne/10 px-2.5 py-1 text-[8.5px] uppercase tracking-[0.14em] text-champagne-dark">
          <DeliveryRoute size={12} />
          {formatKm(route.km)} · {etaLabel}
        </span>
      </div>

      <div className="relative overflow-hidden">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="block h-auto w-full"
          role="img"
          aria-label={description}
        >
          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="var(--color-ivory)" />

          {Array.from({ length: 9 }, (_, index) => SA_BOUNDS.minLng + index * 2).map(
            (gridLng) => {
              const x = project({ lat: SA_BOUNDS.maxLat, lng: gridLng }).x;
              return (
                <line
                  key={`lng-${gridLng}`}
                  x1={x}
                  x2={x}
                  y1={0}
                  y2={MAP_HEIGHT}
                  stroke="var(--color-line)"
                  strokeWidth={0.6}
                  strokeDasharray="2 8"
                  opacity={0.45}
                />
              );
            },
          )}
          {Array.from({ length: 7 }, (_, index) => SA_BOUNDS.maxLat - index * 2).map(
            (gridLat) => {
              const y = project({ lat: gridLat, lng: SA_BOUNDS.minLng }).y;
              return (
                <line
                  key={`lat-${gridLat}`}
                  x1={0}
                  x2={MAP_WIDTH}
                  y1={y}
                  y2={y}
                  stroke="var(--color-line)"
                  strokeWidth={0.6}
                  strokeDasharray="2 8"
                  opacity={0.45}
                />
              );
            },
          )}

          {PROVINCE_SHAPES.map((shape, index) => {
            const isDestination = shape.name === destination.province;
            return (
              <g key={shape.name}>
                <path
                  d={shape.path}
                  fill={
                    isDestination
                      ? "var(--color-champagne)"
                      : index % 2 === 0
                        ? "var(--color-cream)"
                        : "var(--color-ivory-deep)"
                  }
                  fillOpacity={isDestination ? 0.28 : 1}
                  stroke="var(--color-line)"
                  strokeWidth={1.2}
                  strokeLinejoin="round"
                />
                <text
                  x={shape.label.x}
                  y={shape.label.y}
                  textAnchor="middle"
                  fill="var(--color-stone)"
                  fontSize={8}
                  letterSpacing={1}
                  opacity={0.8}
                >
                  {shape.name.toUpperCase()}
                </text>
              </g>
            );
          })}

          {MAJOR_CITIES.map((city) => {
            const point = project(city);
            return (
              <g key={city.name}>
                <circle cx={point.x} cy={point.y} r={2.6} fill="var(--color-stone)" />
                <text
                  x={point.x + 7}
                  y={point.y + 3}
                  fill="var(--color-stone)"
                  fontSize={8}
                  opacity={0.85}
                >
                  {city.name}
                </text>
              </g>
            );
          })}

          {stage === "atelier" ? (
            <path
              d={route.d}
              fill="none"
              stroke="var(--color-champagne-dark)"
              strokeWidth={2}
              strokeDasharray="4 10"
              opacity={0.35}
            />
          ) : (
            <motion.path
              d={route.d}
              fill="none"
              stroke="var(--color-oxblood)"
              strokeWidth={2.4}
              strokeLinecap="round"
              initial={reduce ? false : { pathLength: stage === "transit" ? 0 : 1 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 75, ease: "linear" }}
            />
          )}

          <g transform={`translate(${route.from.x} ${route.from.y})`}>
            <circle r={16} fill="var(--color-cream)" stroke="var(--color-champagne-dark)" strokeWidth={1.5} />
            <path
              d="M0 -8c-3 0-5.4 2.4-5.4 5.4 0 3.9 5.4 9.2 5.4 9.2s5.4-5.3 5.4-9.2C5.4 -5.6 3 -8 0 -8Zm0 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2Z"
              fill="var(--color-oxblood)"
            />
            <text y={-22} textAnchor="middle" fill="var(--color-ink-soft)" fontSize={9} fontWeight={600}>
              ATELIER
            </text>
          </g>

          <g transform={`translate(${route.to.x} ${route.to.y})`}>
            <circle r={15} fill="var(--color-cream)" stroke="var(--color-oxblood)" strokeWidth={1.5} />
            <path
              d="M0 -8c-3 0-5.4 2.4-5.4 5.4 0 3.9 5.4 9.2 5.4 9.2s5.4-5.3 5.4-9.2C5.4 -5.6 3 -8 0 -8Zm0 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2Z"
              fill="var(--color-oxblood)"
            />
            <text y={-20} textAnchor="middle" fill="var(--color-ink-soft)" fontSize={9} fontWeight={600}>
              {destination.name.toUpperCase()}
            </text>
          </g>

          {stage !== "delivered" ? (
            <circle cx={pulse.x} cy={pulse.y} r={26} fill="none" stroke="var(--color-oxblood)" strokeWidth={1} opacity={0.18}>
              {!reduce ? (
                <animate attributeName="r" values="18;34;18" dur="2.8s" repeatCount="indefinite" />
              ) : null}
              {!reduce ? (
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2.8s" repeatCount="indefinite" />
              ) : null}
            </circle>
          ) : null}

          {stage !== "atelier" ? (
            <g
              ref={markerRef}
              aria-hidden
              transform={`translate(${staticPoint.x} ${staticPoint.y}) rotate(${staticAngle + 90})`}
            >
              {stage === "transit" ? (
                <path d="M0 -12 L-7 -27 L7 -27 Z" fill="var(--color-champagne)" opacity={0.32} />
              ) : null}
              <circle r={15} fill="var(--color-cream)" stroke="var(--color-champagne-dark)" strokeWidth={1.5} />
              <path d="M-5 -8h10l3 4v10H-8V-4z" fill="var(--color-oxblood)" />
              <path d="M-4 -5h8v4h-8z" fill="var(--color-cream)" />
              <circle cx={-8} cy={-2} r={1.5} fill="var(--color-ink)" />
              <circle cx={8} cy={-2} r={1.5} fill="var(--color-ink)" />
            </g>
          ) : null}

          <g transform={`translate(${MAP_WIDTH - 34} 30)`} aria-hidden>
            <path d="M0 -10 L4 8 L0 5 L-4 8 Z" fill="var(--color-stone)" opacity={0.5} />
          </g>
        </svg>

        {stage === "transit" ? (
          <span className="absolute bottom-3 left-3 border border-champagne-dark/40 bg-cream/95 px-2.5 py-1.5 text-[8px] uppercase tracking-[0.14em] text-champagne-dark backdrop-blur-sm">
            Estimated last-mile preview · not live GPS
          </span>
        ) : null}
      </div>

      <div className="border-t border-line px-4 py-3">
        <div className="relative h-px bg-line">
          <motion.div
            className="h-full origin-left bg-oxblood"
            initial={reduce ? false : { scaleX: 0 }}
            animate={{ scaleX: railScale }}
            transition={{ duration: 0.7, ease: EASE_SILK }}
          />
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1 text-[8px] uppercase tracking-[0.12em] text-stone">
          {MILESTONES.map((milestone, index) => (
            <span key={milestone} className={index <= stageIndex ? "text-oxblood" : ""}>
              {milestone}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 text-[10px] text-stone">
        <span className="inline-flex items-center gap-1.5">
          {stage === "delivered" ? <CheckSeal size={14} /> : <CourierVan size={14} />}
          {courier ?? "Courier partner"} {trackingNumber ? `· ${trackingNumber}` : ""}
        </span>
        <span className="uppercase tracking-[0.12em]">
          {stage === "delivered" ? "Signed for" : "Estimated route"}
        </span>
      </div>
    </section>
  );
}
