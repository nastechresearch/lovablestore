# Atelier Express Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Atelier Express experience — a branded live delivery map, a packing theatre, custom animated icons and a consistent premium motion pass across the Lovable Store storefront.

**Architecture:** Pure geometry and stage helpers live in `src/lib`, custom SVG primitives live in `src/components/icons`, and the two experiential components are client-only islands fed by authorised server pages. No new API routes, database fields, runtime dependencies or external map tiles. Every animation honours reduced motion and only animates transform, opacity or SVG path length.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, Motion (`motion/react`), Playwright, Prisma/Supabase.

**Spec:** `docs/superpowers/specs/2026-10-22-atelier-express-motion-tracking-design.md`

## Global Constraints

- Use Node 22 (`node -v` must start with `v22`) for every install, build and test command. The system Node 18 breaks npm and Playwright.
- Local verification uses port `3100` only. Never touch port `3000` (the WhatsApp bridge).
- No new runtime dependencies, no schema changes, no new API routes, no external map tiles or geocoding calls.
- Motion may animate only `transform`, `opacity` and SVG `pathLength`. No layout-property animation, no autoplay video, no infinite background animation.
- Respect reduced motion: render the final/static state and hide replay controls.
- The map is an estimated last-mile preview. Never label it as live GPS and never invent a driver name.
- Keep the existing visual language: ivory, cream, oxblood, champagne, Cormorant display, Montserrat body. Use ZAR and South African English.
- Every commit must leave `npm run lint` and `npm run build` green. Push only after the full plan is complete.
- Do not print customer PII (emails, addresses) in logs or test output.

---

### Task 1: Motion foundation and Atelier icon set

**Files:**
- Create: `src/lib/motion.ts`
- Create: `src/components/icons/atelier-icons.tsx`
- Modify: `src/components/motion/reveal.tsx`

**Interfaces:**
- Consumes: `motion/react`, existing `Reveal`/`StaggerGroup`/`StaggerItem` consumers.
- Produces: `EASE_SILK`, `EASE_OUT`, `DURATION`, `STAGGER`; icon components accepting `{ size?: number; className?: string; animated?: boolean }`; `Reveal` gains `distance`, `blur`, `as`; `StaggerItem` gains `as`.

- [ ] **Step 1: Create the motion tokens**

```ts
// src/lib/motion.ts
export const EASE_SILK: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const DURATION = {
  quick: 0.18,
  base: 0.32,
  slow: 0.56,
  scene: 0.9,
} as const;

export const STAGGER = 0.07;
```

- [ ] **Step 2: Upgrade the reveal primitives**

Replace `src/components/motion/reveal.tsx` with:

```tsx
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
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
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
```

- [ ] **Step 3: Create the custom icon set**

```tsx
// src/components/icons/atelier-icons.tsx
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
```

- [ ] **Step 4: Verify the primitives compile**

Run: `npm run lint && npm run build`
Expected: lint exits 0 (existing warnings allowed); build completes with all routes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/motion.ts src/components/icons/atelier-icons.tsx src/components/motion/reveal.tsx
git commit -m "Add Atelier motion tokens and custom icon set"
```

---

### Task 2: South African geography, route geometry and tests

**Files:**
- Create: `scripts/generate-sa-geo.mjs`
- Create: `src/lib/sa-geo.ts` (generated, then committed)
- Create: `src/lib/delivery-track.ts`
- Test: `tests/e2e/delivery-track.spec.ts`

**Interfaces:**
- Consumes: `SA_PLACES`, `findPlace` from `src/lib/sa-locations.ts`.
- Produces:
  - `PROVINCE_SHAPES: { name: string; path: string; label: { x: number; y: number } }[]`
  - `PROVINCE_CENTROIDS: Record<string, GeoPoint>`
  - `MAJOR_CITIES: { name: string; lat: number; lng: number }[]`
  - `GeoPoint`, `MapPoint`, `TrackPlace`, `RouteGeometry`, `DeliveryStage`
  - `MAP_WIDTH`, `MAP_HEIGHT`, `STUDIO`, `project`, `distanceKm`, `resolveDestination`, `buildRoute`, `pointOnCubic`, `angleOnCubic`, `stageForStatus`, `seedFromOrder`, `formatKm`.

- [ ] **Step 1: Write the geography generator**

```js
// scripts/generate-sa-geo.mjs
import { readFileSync, writeFileSync } from "node:fs";

const PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
  "Mpumalanga", "Northern Cape", "North West", "Western Cape",
];
const BOUNDS = { minLng: 16, maxLng: 33, minLat: -35, maxLat: -22 };
const WIDTH = 900;
const HEIGHT = 640;

const source = readFileSync("src/lib/sa-locations.ts", "utf8");
const match = source.match(
  /export const SA_PLACES: SouthAfricanPlace\[\] = (\[[\s\S]*?\]);/,
);
if (!match) throw new Error("Could not read SA_PLACES");
const places = JSON.parse(match[1]);

const project = ({ lat, lng }) => [
  ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * WIDTH,
  ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * HEIGHT,
];

function cross(o, a, b) {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

function convexHull(points) {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (sorted.length < 3) return sorted;
  const lower = [];
  for (const point of sorted) {
    while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  }
  const upper = [];
  for (const point of [...sorted].reverse()) {
    while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

const shapes = PROVINCES.map((name) => {
  const group = places.filter((place) => place.province === name);
  if (group.length === 0) throw new Error(`No places for ${name}`);
  const hull = convexHull(group.map(project));
  const path = `M ${hull.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")} Z`;
  const label = hull.reduce(
    (acc, [x, y]) => ({ x: acc.x + x / hull.length, y: acc.y + y / hull.length }),
    { x: 0, y: 0 },
  );
  const centroid = group.reduce(
    (acc, place) => ({
      lat: acc.lat + place.lat / group.length,
      lng: acc.lng + place.lng / group.length,
    }),
    { lat: 0, lng: 0 },
  );
  return {
    name,
    path,
    label: { x: +label.x.toFixed(1), y: +label.y.toFixed(1) },
    centroid: { lat: +centroid.lat.toFixed(4), lng: +centroid.lng.toFixed(4) },
  };
});

const file = `// Generated by scripts/generate-sa-geo.mjs from the bundled GeoNames places
// dataset (CC BY 4.0). Stylised province hulls, not cadastral boundaries.
export type GeoPoint = { lat: number; lng: number };

export type ProvinceShape = {
  name: string;
  path: string;
  label: { x: number; y: number };
};

export const PROVINCE_SHAPES: ProvinceShape[] = ${JSON.stringify(
  shapes.map(({ name, path, label }) => ({ name, path, label })),
  null,
  2,
)};

export const PROVINCE_CENTROIDS: Record<string, GeoPoint> = ${JSON.stringify(
  Object.fromEntries(shapes.map((shape) => [shape.name, shape.centroid])),
  null,
  2,
)};

export const MAJOR_CITIES = [
  { name: "Johannesburg", lat: -26.2023, lng: 28.0436 },
  { name: "Pretoria", lat: -25.7449, lng: 28.1878 },
  { name: "Cape Town", lat: -33.9258, lng: 18.4232 },
  { name: "Durban", lat: -29.8579, lng: 31.0292 },
  { name: "Gqeberha", lat: -33.9608, lng: 25.6022 },
  { name: "Bloemfontein", lat: -29.1211, lng: 26.214 },
  { name: "Kimberley", lat: -28.7323, lng: 24.7623 },
  { name: "Polokwane", lat: -23.9045, lng: 29.4688 },
  { name: "Mbombela", lat: -25.4753, lng: 30.9694 },
  { name: "East London", lat: -33.0153, lng: 27.9116 },
];
`;
writeFileSync("src/lib/sa-geo.ts", file);
console.log(`Wrote ${shapes.length} province shapes to src/lib/sa-geo.ts`);
```

- [ ] **Step 2: Generate and inspect the geography file**

Run: `node scripts/generate-sa-geo.mjs`
Expected: `Wrote 9 province shapes to src/lib/sa-geo.ts`.

Run: `grep -c '"name"' src/lib/sa-geo.ts`
Expected: `9` or more (province shapes and major cities both contain names).

- [ ] **Step 3: Write the route and stage helpers**

```ts
// src/lib/delivery-track.ts
import { PROVINCE_CENTROIDS } from "@/lib/sa-geo";
import { findPlace } from "@/lib/sa-locations";

export const MAP_WIDTH = 900;
export const MAP_HEIGHT = 640;
export const SA_BOUNDS = { minLng: 16, maxLng: 33, minLat: -35, maxLat: -22 };

export type GeoPoint = { lat: number; lng: number };
export type MapPoint = { x: number; y: number };
export type TrackPlace = GeoPoint & { name: string; province: string };

export type RouteGeometry = {
  d: string;
  from: MapPoint;
  to: MapPoint;
  c1: MapPoint;
  c2: MapPoint;
  km: number;
};

export const STUDIO: TrackPlace = {
  name: "Rosebank Atelier",
  province: "Gauteng",
  lat: -26.146,
  lng: 28.041,
};

export function project(point: GeoPoint): MapPoint {
  const x =
    ((point.lng - SA_BOUNDS.minLng) /
      (SA_BOUNDS.maxLng - SA_BOUNDS.minLng)) *
    MAP_WIDTH;
  const y =
    ((SA_BOUNDS.maxLat - point.lat) /
      (SA_BOUNDS.maxLat - SA_BOUNDS.minLat)) *
    MAP_HEIGHT;
  return { x, y };
}

export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function resolveDestination(city: string, province: string): TrackPlace {
  const place = findPlace(city, province);
  if (place) {
    return {
      name: place.name,
      province: place.province,
      lat: place.lat,
      lng: place.lng,
    };
  }

  const centroid = PROVINCE_CENTROIDS[province];
  if (centroid) {
    return {
      name: city.trim() || province,
      province,
      lat: centroid.lat,
      lng: centroid.lng,
    };
  }

  return {
    name: city.trim() || "Johannesburg",
    province: "Gauteng",
    lat: -26.2023,
    lng: 28.0436,
  };
}

export function buildRoute(origin: GeoPoint, destination: GeoPoint): RouteGeometry {
  const from = project(origin);
  const to = project(destination);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const bend = Math.min(150, Math.max(26, distanceKm(origin, destination) * 0.12));
  const side = destination.lng >= origin.lng ? 1 : -1;

  const c1 = {
    x: from.x + dx * 0.3 + nx * bend * side,
    y: from.y + dy * 0.3 + ny * bend * side,
  };
  const c2 = {
    x: from.x + dx * 0.68 - nx * bend * 0.55 * side,
    y: from.y + dy * 0.68 - ny * bend * 0.55 * side,
  };

  const d = `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} C ${c1.x.toFixed(1)} ${c1.y.toFixed(
    1,
  )}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;

  return { d, from, to, c1, c2, km: distanceKm(origin, destination) };
}

export function pointOnCubic(route: RouteGeometry, t: number): MapPoint {
  const clamped = Math.min(1, Math.max(0, t));
  const mt = 1 - clamped;
  return {
    x:
      mt ** 3 * route.from.x +
      3 * mt ** 2 * clamped * route.c1.x +
      3 * mt * clamped ** 2 * route.c2.x +
      clamped ** 3 * route.to.x,
    y:
      mt ** 3 * route.from.y +
      3 * mt ** 2 * clamped * route.c1.y +
      3 * mt * clamped ** 2 * route.c2.y +
      clamped ** 3 * route.to.y,
  };
}

export function angleOnCubic(route: RouteGeometry, t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  const mt = 1 - clamped;
  const dx =
    3 * mt ** 2 * (route.c1.x - route.from.x) +
    6 * mt * clamped * (route.c2.x - route.c1.x) +
    3 * clamped ** 2 * (route.to.x - route.c2.x);
  const dy =
    3 * mt ** 2 * (route.c1.y - route.from.y) +
    6 * mt * clamped * (route.c2.y - route.c1.y) +
    3 * clamped ** 2 * (route.to.y - route.c2.y);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

export type DeliveryStage = "atelier" | "transit" | "delivered" | "cancelled";

export function stageForStatus(status: string): DeliveryStage {
  if (status === "CANCELLED") return "cancelled";
  if (status === "DELIVERED") return "delivered";
  if (status === "SHIPPED") return "transit";
  return "atelier";
}

export function seedFromOrder(orderNumber: string): number {
  let hash = 0;
  for (let index = 0; index < orderNumber.length; index += 1) {
    hash = (hash * 31 + orderNumber.charCodeAt(index)) % 1000;
  }
  return hash / 1000;
}

export function formatKm(km: number): string {
  return `${Math.round(km).toLocaleString("en-ZA")} km`;
}
```

- [ ] **Step 4: Write the failing tests first**

```ts
// tests/e2e/delivery-track.spec.ts
import { expect, test } from "@playwright/test";
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  STUDIO,
  angleOnCubic,
  buildRoute,
  distanceKm,
  formatKm,
  pointOnCubic,
  project,
  resolveDestination,
  seedFromOrder,
  stageForStatus,
} from "../../src/lib/delivery-track";
import { PROVINCE_CENTROIDS, PROVINCE_SHAPES } from "../../src/lib/sa-geo";

test.describe("South African route geometry", () => {
  test("projects the map bounds onto the viewBox", () => {
    expect(project({ lat: -22, lng: 16 })).toEqual({ x: 0, y: 0 });
    expect(project({ lat: -35, lng: 33 })).toEqual({
      x: MAP_WIDTH,
      y: MAP_HEIGHT,
    });
  });

  test("resolves a known city and falls back to a province centroid", () => {
    const capeTown = resolveDestination("Cape Town", "Western Cape");
    expect(capeTown.name).toBe("Cape Town");
    expect(capeTown.lat).toBeCloseTo(-33.9258, 3);

    const fallback = resolveDestination("Atlantis North", "Western Cape");
    expect(fallback.name).toBe("Atlantis North");
    expect(fallback.lat).toBeCloseTo(PROVINCE_CENTROIDS["Western Cape"].lat, 5);
    expect(fallback.lng).toBeCloseTo(PROVINCE_CENTROIDS["Western Cape"].lng, 5);
  });

  test("builds a route that starts at the studio and ends at the door", () => {
    const capeTown = resolveDestination("Cape Town", "Western Cape");
    const route = buildRoute(STUDIO, capeTown);
    expect(route.from).toEqual(project(STUDIO));
    expect(route.to).toEqual(project(capeTown));
    expect(pointOnCubic(route, 0)).toEqual(route.from);
    expect(pointOnCubic(route, 1)).toEqual(route.to);
    expect(route.km).toBeGreaterThan(1200);
    expect(route.km).toBeLessThan(1350);
    expect(Number.isFinite(angleOnCubic(route, 0.5))).toBe(true);
    expect(route.d.startsWith("M ")).toBe(true);
  });

  test("maps order status to a stage and seed", () => {
    expect(stageForStatus("PENDING")).toBe("atelier");
    expect(stageForStatus("PAID")).toBe("atelier");
    expect(stageForStatus("PACKED")).toBe("atelier");
    expect(stageForStatus("SHIPPED")).toBe("transit");
    expect(stageForStatus("DELIVERED")).toBe("delivered");
    expect(stageForStatus("CANCELLED")).toBe("cancelled");
    expect(seedFromOrder("LS-261020-0001")).toBeGreaterThanOrEqual(0);
    expect(seedFromOrder("LS-261020-0001")).toBeLessThan(1);
  });

  test("formats distance and ships all nine province shapes", () => {
    expect(formatKm(1264.7)).toBe("1 265 km");
    expect(PROVINCE_SHAPES).toHaveLength(9);
    expect(PROVINCE_SHAPES.every((shape) => shape.path.startsWith("M "))).toBe(true);
    expect(distanceKm(STUDIO, STUDIO)).toBe(0);
  });
});
```

- [ ] **Step 5: Run the tests to verify they fail before the module exists**

Run: `PLAYWRIGHT_BASE_URL=https://lovablestorex.vercel.app npx playwright test tests/e2e/delivery-track.spec.ts`
Expected: FAIL with a module-resolution error for `delivery-track` or `sa-geo` if either file is missing.

- [ ] **Step 6: Generate the geography file and run the tests again**

Run: `node scripts/generate-sa-geo.mjs`
Run: `PLAYWRIGHT_BASE_URL=https://lovablestorex.vercel.app npx playwright test tests/e2e/delivery-track.spec.ts`
Expected: 5 passed.

- [ ] **Step 7: Commit**

```bash
git add scripts/generate-sa-geo.mjs src/lib/sa-geo.ts src/lib/delivery-track.ts tests/e2e/delivery-track.spec.ts
git commit -m "Add branded South African map geometry and route stages"
```

---

### Task 3: Packing theatre

**Files:**
- Create: `src/components/delivery/packing-scene.tsx`

**Interfaces:**
- Consumes: `DURATION`, `EASE_SILK`, Motion, `CheckSeal`, `Spark`.
- Produces: `PackingScene({ status, items })` where `items` is `{ name: string; image: string }[]`.

- [ ] **Step 1: Build the packing scene**

```tsx
// src/components/delivery/packing-scene.tsx
"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CheckSeal, Spark } from "@/components/icons/atelier-icons";
import { DURATION, EASE_SILK } from "@/lib/motion";

type PackingItem = { name: string; image: string };

const SEALED = new Set(["PACKED", "SHIPPED", "DELIVERED"]);

export function PackingScene({
  status,
  items,
  className = "",
}: {
  status: string;
  items: PackingItem[];
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  const sealed = SEALED.has(status);
  const delivered = status === "DELIVERED";
  const visibleItems = items.slice(0, 3);

  if (status === "CANCELLED") return null;

  const caption = delivered
    ? "Delivered and signed for."
    : sealed
      ? "Wrapped, sealed and ready for the courier."
      : "Being packed at the atelier.";

  const fade = reduce
    ? { initial: false as const, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
      };

  return (
    <section
      className={`border border-line bg-ivory/60 p-5 sm:p-7 ${className}`}
      aria-label="Packing scene"
      data-testid="packing-scene"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="eyebrow text-champagne-dark">The atelier</p>
          <h3 className="mt-1 font-display text-3xl leading-tight">
            {sealed ? "Tied by hand." : "Packing your gift."}
          </h3>
        </div>
        <p className="text-[10px] uppercase tracking-[0.14em] text-stone">
          {delivered ? "Complete" : sealed ? "Sealed" : "In progress"}
        </p>
      </div>

      <div
        className="relative mx-auto mt-5 h-[290px] w-full max-w-[430px]"
        style={{ perspective: 1100 }}
      >
        <div className="absolute inset-x-10 bottom-5 h-12 rounded-full bg-ink/10 blur-2xl" aria-hidden />

        <motion.div
          key={`${status}-${run}`}
          className="absolute inset-x-[8%] bottom-10 top-4 origin-bottom"
          style={{ transformStyle: "preserve-3d" }}
          initial={reduce ? false : { opacity: 0, y: 30, rotateX: 16 }}
          animate={{ opacity: 1, y: 0, rotateX: 7 }}
          transition={{ duration: DURATION.scene, ease: EASE_SILK }}
        >
          <div
            className="absolute inset-x-0 bottom-0 top-[30%] bg-oxblood shadow-lift"
            style={{ clipPath: "polygon(4% 0, 96% 0, 100% 100%, 0 100%)" }}
            aria-hidden
          />
          <div
            className="absolute inset-x-[7%] bottom-[8%] top-[34%] bg-ivory-deep"
            style={{ clipPath: "polygon(3% 0, 97% 0, 94% 100%, 6% 100%)" }}
            aria-hidden
          />

          <motion.div
            className="absolute inset-x-[11%] top-[36%] z-10 flex items-end justify-center gap-2"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: DURATION.slow, ease: EASE_SILK }}
          >
            {visibleItems.map((item, index) => (
              <motion.div
                key={`${item.name}-${index}`}
                className="relative h-[94px] w-[70px] overflow-hidden border border-line bg-cream shadow-soft"
                initial={
                  reduce ? false : { opacity: 0, y: 22, rotate: index === 1 ? 0 : index === 0 ? -5 : 5 }
                }
                animate={{ opacity: 1, y: 0, rotate: index === 1 ? 0 : index === 0 ? -4 : 4 }}
                transition={{
                  delay: 0.22 + index * 0.1,
                  duration: DURATION.slow,
                  ease: EASE_SILK,
                }}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={70}
                  height={94}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            ))}
          </motion.div>

          <div
            className="absolute inset-x-[10%] bottom-[4%] h-6 rounded-[50%] bg-cream/90"
            aria-hidden
          />

          <motion.div
            className="absolute left-1/2 top-[28%] z-20 h-[58%] w-[18px] -translate-x-1/2 bg-champagne"
            initial={sealed && !reduce ? { scaleY: 0, opacity: 0 } : false}
            animate={{ scaleY: sealed ? 1 : 0, opacity: sealed ? 1 : 0 }}
            transition={{ delay: 0.95, duration: DURATION.slow, ease: EASE_SILK }}
            style={{ originY: 0 }}
            aria-hidden
          />
          <motion.div
            className="absolute inset-x-[4%] top-[58%] z-20 h-[18px] bg-champagne"
            initial={sealed && !reduce ? { scaleX: 0, opacity: 0 } : false}
            animate={{ scaleX: sealed ? 1 : 0, opacity: sealed ? 1 : 0 }}
            transition={{ delay: 1.05, duration: DURATION.slow, ease: EASE_SILK }}
            style={{ originX: 0.5 }}
            aria-hidden
          />

          <motion.div
            className="absolute left-1/2 top-[22%] z-30 -translate-x-1/2"
            initial={sealed && !reduce ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: sealed ? 1 : 0, opacity: sealed ? 1 : 0 }}
            transition={{ delay: 1.3, duration: DURATION.base, ease: EASE_SILK }}
            aria-hidden
          >
            <span className="absolute left-[-18px] top-0 block h-6 w-7 -rotate-[22deg] rounded-full border-[5px] border-champagne bg-transparent" />
            <span className="absolute left-[2px] top-0 block h-6 w-7 rotate-[22deg] rounded-full border-[5px] border-champagne bg-transparent" />
            <span className="relative block size-4 rounded-full bg-champagne shadow-soft" />
          </motion.div>

          <motion.div
            className="absolute bottom-[30%] right-[13%] z-30 flex size-14 items-center justify-center rounded-full border border-champagne-dark/60 bg-cream text-champagne-dark shadow-soft"
            initial={reduce ? false : { scale: 1.5, opacity: 0, rotate: -12 }}
            animate={{ scale: sealed ? 1 : 0, opacity: sealed ? 1 : 0, rotate: -8 }}
            transition={{ delay: 1.45, duration: DURATION.base, ease: EASE_SILK }}
            aria-hidden
          >
            {delivered ? <CheckSeal size={26} /> : <span className="font-display text-lg">LS</span>}
          </motion.div>

          <motion.div
            className="absolute left-[12%] top-[18%] z-30"
            {...fade}
            transition={{ delay: 1.5, duration: DURATION.slow, ease: EASE_SILK }}
            aria-hidden
          >
            <span className="block h-5 w-16 rotate-[-6deg] border border-line bg-cream shadow-soft" />
          </motion.div>
        </motion.div>

        {sealed ? (
          <>
            {[
              { left: "17%", top: "20%", delay: 1.55 },
              { left: "78%", top: "34%", delay: 1.68 },
              { left: "68%", top: "14%", delay: 1.8 },
            ].map((spark) => (
              <motion.span
                key={spark.left}
                className="absolute z-40 text-champagne-dark"
                style={{ left: spark.left, top: spark.top }}
                initial={reduce ? false : { opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.6] }}
                transition={{
                  delay: spark.delay,
                  duration: 1.1,
                  ease: EASE_SILK,
                  times: [0, 0.35, 1],
                }}
                aria-hidden
              >
                <Spark size={14} />
              </motion.span>
            ))}
          </>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-[11px] leading-relaxed text-stone" aria-live="polite">
          {caption} {visibleItems.length > 0 ? `${visibleItems.length} piece${visibleItems.length === 1 ? "" : "s"} in this gift.` : ""}
        </p>
        {sealed && !reduce ? (
          <button
            type="button"
            onClick={() => setRun((value) => value + 1)}
            className="border border-line bg-cream px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-oxblood hover:text-oxblood"
          >
            Replay packing
          </button>
        ) : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify the scene compiles**

Run: `npm run lint && npm run build`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/delivery/packing-scene.tsx
git commit -m "Add the atelier packing theatre"
```

---

### Task 4: Live delivery map and journey integration

**Files:**
- Create: `src/components/delivery/live-delivery-map.tsx`
- Create: `src/components/delivery/live-order-refresh.tsx`
- Modify: `src/components/delivery/delivery-journey.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `DeliveryPlan`; `TrackPlace`, `STUDIO`, `MAP_WIDTH`, `MAP_HEIGHT`, `SA_BOUNDS`, `buildRoute`, `pointOnCubic`, `angleOnCubic`, `stageForStatus`, `formatKm`; `PROVINCE_SHAPES`, `MAJOR_CITIES`; `CourierVan`, `MapPin`, `CheckSeal`, `Plane`, `DeliveryRoute`.
- Produces: `LiveDeliveryMap({ status, orderNumber, destination, etaLabel, courier, trackingNumber })`; `LiveOrderRefresh({ active })`; `DeliveryJourney` accepts optional `destination`, `status`, `orderNumber`, `courier`, `trackingNumber`.

- [ ] **Step 1: Write the live map component**

```tsx
// src/components/delivery/live-delivery-map.tsx
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
  const route = useMemo(() => buildRoute(STUDIO, destination), [destination]);
  const staticT = stage === "delivered" ? 1 : stage === "transit" ? 0.72 : 0;
  const staticPoint = pointOnCubic(route, staticT);
  const staticAngle = angleOnCubic(route, staticT);

  useEffect(() => {
    const node = markerRef.current;
    if (!node) return;
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
            (lng) => {
              const x = project({ lat: SA_BOUNDS.maxLat, lng }).x;
              return (
                <line
                  key={`lng-${lng}`}
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
            (lat) => {
              const y = project({ lat, lng: SA_BOUNDS.minLng }).y;
              return (
                <line
                  key={`lat-${lat}`}
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

          {PROVINCE_SHAPES.map((shape, index) => (
            <g key={shape.name}>
              <path
                d={shape.path}
                fill={index % 2 === 0 ? "var(--color-cream)" : "var(--color-ivory-deep)"}
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
          ))}

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
            <MapPin size={14} className="text-oxblood" />
            <text y={-22} textAnchor="middle" fill="var(--color-ink-soft)" fontSize={9} fontWeight={600}>
              ATELIER
            </text>
          </g>

          <g transform={`translate(${route.to.x} ${route.to.y})`}>
            <circle r={15} fill="var(--color-cream)" stroke="var(--color-oxblood)" strokeWidth={1.5} />
            <MapPin size={14} className="text-oxblood" />
            <text y={-20} textAnchor="middle" fill="var(--color-ink-soft)" fontSize={9} fontWeight={600}>
              {destination.name.toUpperCase()}
            </text>
          </g>

          {stage === "transit" ? (
            <circle cx={route.to.x} cy={route.to.y} r={26} fill="none" stroke="var(--color-oxblood)" strokeWidth={1} opacity={0.18}>
              {!reduce ? (
                <animate attributeName="r" values="18;34;18" dur="2.8s" repeatCount="indefinite" />
              ) : null}
              {!reduce ? (
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2.8s" repeatCount="indefinite" />
              ) : null}
            </circle>
          ) : null}

          <g ref={markerRef} transform={`translate(${staticPoint.x} ${staticPoint.y}) rotate(${staticAngle + 90})`}>
            {stage === "transit" ? (
              <path d="M0 -12 L-7 -27 L7 -27 Z" fill="var(--color-champagne)" opacity={0.32} />
            ) : null}
            <circle r={15} fill="var(--color-cream)" stroke="var(--color-champagne-dark)" strokeWidth={1.5} />
            <path d="M-5 -8h10l3 4v10H-8V-4z" fill="var(--color-oxblood)" />
            <path d="M-4 -5h8v4h-8z" fill="var(--color-cream)" />
            <circle cx={-8} cy={-2} r={1.5} fill="var(--color-ink)" />
            <circle cx={8} cy={-2} r={1.5} fill="var(--color-ink)" />
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
```

- [ ] **Step 2: Add the live refresh helper**

```tsx
// src/components/delivery/live-order-refresh.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LiveOrderRefresh({ active }: { active: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 45_000);
    return () => window.clearInterval(timer);
  }, [active, router]);

  return null;
}
```

- [ ] **Step 3: Integrate the map into the journey**

In `src/components/delivery/delivery-journey.tsx`:

1. Replace the Lucide/useReducedMotion block with:

```tsx
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
```

2. Delete the entire `RouteTrack` function.

3. Change the `DeliveryJourney` signature to:

```tsx
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
```

4. Replace `<RouteTrack plan={plan} />` with:

```tsx
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
```

- [ ] **Step 4: Remove the retired CSS ride animation**

Delete the `@keyframes delivery-ride`, `.delivery-ride`, `.delivery-ride-slow` blocks from `src/app/globals.css`. Leave all other keyframes untouched.

- [ ] **Step 5: Verify**

Run: `npm run lint && npm run build`
Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/components/delivery/live-delivery-map.tsx src/components/delivery/live-order-refresh.tsx src/components/delivery/delivery-journey.tsx src/app/globals.css
git commit -m "Add live delivery map and retire the route placeholder"
```

---

### Task 5: Wire packing and tracking into order pages

**Files:**
- Modify: `src/app/(store)/order/[number]/page.tsx`
- Modify: `src/app/(store)/track/page.tsx`

**Interfaces:**
- Consumes: `PackingScene`, `LiveOrderRefresh`, `resolveDestination`, existing `DeliveryJourney` props.
- Produces: order confirmation and tracking pages with a packing scene, map, live refresh and accessible test hooks.

- [ ] **Step 1: Update the order confirmation page**

Add imports:

```tsx
import { PackingScene } from "@/components/delivery/packing-scene";
import { LiveOrderRefresh } from "@/components/delivery/live-order-refresh";
import { resolveDestination } from "@/lib/delivery-track";
```

After `deliveryPlan` is computed, add:

```tsx
const destination = resolveDestination(order.city, order.province);
const packingItems = order.items.map((item) => ({
  name: item.name,
  image: item.image,
}));
const liveRefresh = !["DELIVERED", "CANCELLED"].includes(order.status);
```

Inside the returned card, replace the timeline block with:

```tsx
<div className="mt-8 border-t border-line pt-6">
  <PackingScene status={order.status} items={packingItems} />
</div>

<div className="mt-6 border-t border-line pt-6">
  <OrderTimeline status={order.status} />
</div>
```

Render `LiveOrderRefresh` just before the closing `</div>` of the page wrapper:

```tsx
<LiveOrderRefresh active={liveRefresh} />
```

Change the delivery journey call to:

```tsx
<DeliveryJourney
  plan={deliveryPlan}
  title="When it arrives"
  destination={destination}
  status={order.status}
  orderNumber={order.number}
  courier={order.courier}
  trackingNumber={order.trackingNumber}
/>
```

- [ ] **Step 2: Update the tracking page**

Add imports:

```tsx
import { PackingScene } from "@/components/delivery/packing-scene";
import { LiveOrderRefresh } from "@/components/delivery/live-order-refresh";
import { resolveDestination } from "@/lib/delivery-track";
```

After `deliveryPlan` is computed, add the guarded values:

```tsx
const destination = order
  ? resolveDestination(order.city, order.province)
  : null;
const packingItems = order
  ? order.items.map((item) => ({ name: item.name, image: item.image }))
  : [];
const liveRefresh = order
  ? !["DELIVERED", "CANCELLED"].includes(order.status)
  : false;
```

Inside the authorised order card, before the timeline block, add:

```tsx
<PackingScene status={order.status} items={packingItems} />
```

Change the delivery journey call to:

```tsx
<DeliveryJourney
  plan={deliveryPlan}
  title="Estimated arrival"
  destination={destination ?? undefined}
  status={order.status}
  orderNumber={order.number}
  courier={order.courier}
  trackingNumber={order.trackingNumber}
/>
```

Render `LiveOrderRefresh` immediately after the order card:

```tsx
{order ? <LiveOrderRefresh active={liveRefresh} /> : null}
```

- [ ] **Step 3: Verify**

Run: `npm run lint && npm run build`
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(store)/order/[number]/page.tsx" "src/app/(store)/track/page.tsx"
git commit -m "Show packing theatre and live route on order pages"
```

---

### Task 6: Fly-to-bag and storefront motion

**Files:**
- Create: `src/components/motion/fly-to-bag.tsx`
- Modify: `src/components/providers.tsx`
- Modify: `src/components/product/product-card.tsx`
- Modify: `src/components/product/product-purchase.tsx`
- Modify: `src/components/layout/header.tsx`
- Modify: `src/components/cart/cart-drawer.tsx`
- Modify: `src/components/home/hero.tsx`

**Interfaces:**
- Consumes: `EASE_SILK`, `DURATION`; existing cart/wishlist state.
- Produces: `flyToBag(detail)` and `FlyToBagLayer`; `#bag-target` header anchor; spring tilt on product cards; bag/wishlist badge bumps; parallax hero.

- [ ] **Step 1: Create the shared fly-to-bag layer**

```tsx
// src/components/motion/fly-to-bag.tsx
"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "motion/react";
import { EASE_SILK } from "@/lib/motion";

const EVENT = "lovable:fly-to-bag";

export type FlyToBagDetail = { image: string; x: number; y: number };

type Flight = FlyToBagDetail & { id: number };

export function flyToBag(detail: FlyToBagDetail) {
  window.dispatchEvent(new CustomEvent<FlyToBagDetail>(EVENT, { detail }));
}

function FlightChip({ flight, onDone }: { flight: Flight; onDone: (id: number) => void }) {
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const anchor = document.getElementById("bag-target");
    if (!anchor) {
      onDone(flight.id);
      return;
    }
    const rect = anchor.getBoundingClientRect();
    setTarget({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }, [flight.id, onDone]);

  if (!target) return null;

  return (
    <motion.div
      className="pointer-events-none fixed z-[130] overflow-hidden rounded-lg border border-line bg-cream shadow-lift"
      style={{ left: flight.x, top: flight.y, translateX: "-50%", translateY: "-50%" }}
      initial={{ scale: 1, opacity: 1 }}
      animate={{
        x: target.x - flight.x,
        y: target.y - flight.y,
        scale: 0.16,
        opacity: 0.15,
      }}
      transition={{ duration: 0.72, ease: EASE_SILK }}
      onAnimationComplete={() => onDone(flight.id)}
      aria-hidden
    >
      <Image src={flight.image} alt="" width={54} height={66} className="object-cover" />
    </motion.div>
  );
}

export function FlyToBagLayer() {
  const reduce = useReducedMotion();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (reduce) return;
    const onFly = (event: Event) => {
      const detail = (event as CustomEvent<FlyToBagDetail>).detail;
      if (!detail) return;
      setFlights((current) => [
        ...current,
        { ...detail, id: Date.now() + Math.random() },
      ]);
    };
    window.addEventListener(EVENT, onFly);
    return () => window.removeEventListener(EVENT, onFly);
  }, [reduce]);

  const remove = useCallback((id: number) => {
    setFlights((current) => current.filter((flight) => flight.id !== id));
  }, []);

  if (!mounted || reduce) return null;

  return createPortal(
    <>
      {flights.map((flight) => (
        <FlightChip key={flight.id} flight={flight} onDone={remove} />
      ))}
    </>,
    document.body,
  );
}
```

- [ ] **Step 2: Mount the layer**

In `src/components/providers.tsx`, import `FlyToBagLayer` and render it inside `MotionConfig`, after `WishlistProvider`:

```tsx
<WishlistProvider>
  {children}
  <FlyToBagLayer />
</WishlistProvider>
```

- [ ] **Step 3: Add spring tilt and fly-to-bag to product cards**

In `src/components/product/product-card.tsx`, add imports:

```tsx
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { flyToBag } from "@/components/motion/fly-to-bag";
```

Inside the component add:

```tsx
const reduce = useReducedMotion();
const rotateXValue = useMotionValue(0);
const rotateYValue = useMotionValue(0);
const rotateX = useSpring(rotateXValue, { stiffness: 220, damping: 22 });
const rotateY = useSpring(rotateYValue, { stiffness: 220, damping: 22 });
```

Change `quickAdd` to accept the button element:

```tsx
function quickAdd(origin: HTMLButtonElement) {
  addItem({
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    image: primary,
    stock: product.stock,
  });
  const rect = origin.getBoundingClientRect();
  flyToBag({
    image: primary,
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  });
}
```

Change the onClick to:

```tsx
onClick={(event) => quickAdd(event.currentTarget)}
```

Replace the image wrapper opening `<div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ivory-deep">` with:

```tsx
<motion.div
  className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ivory-deep will-change-transform"
  style={{ rotateX, rotateY, transformPerspective: 900 }}
  onPointerMove={(event) => {
    if (reduce || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    rotateYValue.set(((event.clientX - rect.left) / rect.width - 0.5) * 6);
    rotateXValue.set(-((event.clientY - rect.top) / rect.height - 0.5) * 6);
  }}
  onPointerLeave={() => {
    rotateXValue.set(0);
    rotateYValue.set(0);
  }}
>
```

Close it with `</motion.div>` where the old div closed after the quick-add controls.

- [ ] **Step 4: Add fly-to-bag to the product purchase panel**

In `src/components/product/product-purchase.tsx`, import `flyToBag`.

Change the handler signature:

```tsx
function handleAdd(openDrawer = true, origin?: HTMLElement) {
```

After `addItem(...)` and before `if (!openDrawer)`, add:

```tsx
if (origin) {
  const rect = origin.getBoundingClientRect();
  flyToBag({
    image: primaryImage,
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  });
}
```

Change the three call sites:

```tsx
onClick={(event) => handleAdd(true, event.currentTarget)}
```

for both add-to-bag buttons, and:

```tsx
onClick={(event) => handleAdd(false, event.currentTarget)}
```

for Buy now.

- [ ] **Step 5: Add the bag anchor and animated badges**

In `src/components/layout/header.tsx`:

1. Add `id="bag-target"` to the bag button.
2. Replace the wishlist badge `<span ...>` with:

```tsx
<motion.span
  key={`wish-${wishlistCount}`}
  className="absolute right-0.5 top-0.5 flex size-[18px] items-center justify-center rounded-full bg-oxblood text-[10px] font-medium text-ivory"
  initial={{ scale: 0.65 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 420, damping: 16 }}
>
  {wishlistCount > 9 ? "9+" : wishlistCount}
</motion.span>
```

3. Replace the bag badge `<span ...>` with the same pattern using `key={`bag-${count}`}`.

- [ ] **Step 6: Add the cart shimmer**

In `src/components/cart/cart-drawer.tsx`, change the progress wrapper to `relative`:

```tsx
<div className="relative mt-3 h-[3px] overflow-hidden bg-ivory-deep">
```

Keep the existing `motion.div`, then add:

```tsx
<span
  className="animate-shimmer pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-transparent"
  aria-hidden
/>
```

- [ ] **Step 7: Add hero parallax**

In `src/components/home/hero.tsx`, change the Motion import to:

```tsx
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
```

Inside `Hero`, after `const reduce = useReducedMotion();`, add:

```tsx
const { scrollY } = useScroll();
const imageY = useTransform(scrollY, [0, 700], [0, -42]);
```

Find the editorial image frame (`<motion.div className="relative aspect-[4/5] overflow-hidden bg-ivory-deep">`) and add:

```tsx
style={reduce ? undefined : { y: imageY }}
```

- [ ] **Step 8: Verify**

Run: `npm run lint && npm run build`
Expected: both exit 0. Fix any `motion.div` closing-tag mismatch in the product card before committing.

- [ ] **Step 9: Commit**

```bash
git add src/components/motion/fly-to-bag.tsx src/components/providers.tsx src/components/product/product-card.tsx src/components/product/product-purchase.tsx src/components/layout/header.tsx src/components/cart/cart-drawer.tsx src/components/home/hero.tsx
git commit -m "Add fly-to-bag and premium storefront motion"
```

---

### Task 7: Checkout rail, animated stats, trust icons and About motif

**Files:**
- Create: `src/components/checkout/checkout-progress.tsx`
- Create: `src/components/motion/count-up.tsx`
- Create: `src/components/delivery/route-motif.tsx`
- Modify: `src/components/checkout/checkout-form.tsx`
- Modify: `src/app/(store)/account/(dashboard)/orders/page.tsx`
- Modify: `src/components/home/promises.tsx`
- Modify: `src/app/(store)/about/page.tsx`
- Modify: `src/components/layout/footer.tsx`

**Interfaces:**
- Consumes: `EASE_SILK`, `DURATION`, `CheckSeal`, `CountUp`, `RouteMotif`, `StaggerGroup`/`StaggerItem`.
- Produces: `CheckoutProgress({ confirmed })`; `CountUp({ value, currency })`; `RouteMotif()`; footer underline class.

- [ ] **Step 1: Build the checkout progress rail**

```tsx
// src/components/checkout/checkout-progress.tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE_SILK } from "@/lib/motion";

const STEPS = ["Bag", "Details", "Payment", "Confirm"];

export function CheckoutProgress({ confirmed }: { confirmed: boolean }) {
  const reduce = useReducedMotion();
  const activeIndex = confirmed ? 3 : 1;

  return (
    <ol className="grid grid-cols-4 gap-2 border border-line bg-cream p-4" aria-label="Checkout progress">
      {STEPS.map((step, index) => {
        const done = index < activeIndex || (confirmed && index <= activeIndex);
        const active = index === activeIndex;
        return (
          <li key={step} className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${
                  done || active ? "bg-ink text-ivory" : "border border-line text-stone"
                }`}
              >
                {done && !active ? "✓" : index + 1}
              </span>
              <span
                className={`truncate text-[9px] uppercase tracking-[0.12em] ${
                  active ? "text-ink" : "text-stone"
                }`}
              >
                {step}
              </span>
            </div>
            <div className="mt-2 h-px bg-line">
              <motion.div
                className="h-full origin-left bg-oxblood"
                initial={reduce ? false : { scaleX: 0 }}
                animate={{ scaleX: done || active ? 1 : 0 }}
                transition={{ duration: 0.5, delay: index * 0.06, ease: EASE_SILK }}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 2: Add the rail to checkout**

In `src/components/checkout/checkout-form.tsx`, import `CheckoutProgress` and add state after `cardValidatorRef`:

```tsx
const [confirmed, setConfirmed] = useState(false);
```

Inside the left column (`<div className="space-y-10">`), before the cancelled banner, add:

```tsx
<CheckoutProgress confirmed={confirmed} />
```

Change the `CardPayment` callback to:

```tsx
onConfirm={() => {
  setConfirmed(true);
  formRef.current?.requestSubmit();
}}
```

- [ ] **Step 3: Build the count-up primitive**

```tsx
// src/components/motion/count-up.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { formatZAR } from "@/lib/format";
import { EASE_SILK } from "@/lib/motion";

export function CountUp({
  value,
  currency = false,
  className,
}: {
  value: number;
  currency?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: EASE_SILK,
      onUpdate: (latest) => setDisplay(latest),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  const formatted = currency
    ? formatZAR(Math.round(display))
    : Math.round(display).toLocaleString("en-ZA");

  return (
    <span ref={ref} className={className}>
      {formatted}
    </span>
  );
}
```

- [ ] **Step 4: Animate account order stats and cards**

In `src/app/(store)/account/(dashboard)/orders/page.tsx`, add:

```tsx
import { CountUp } from "@/components/motion/count-up";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
```

Replace the two stat values with:

```tsx
<CountUp value={orders.length} className="mt-1 block font-display text-2xl leading-none" />
```

```tsx
<CountUp
  value={lifetime}
  currency
  className="mt-1 block font-display text-2xl leading-none"
/>
```

Wrap the order list:

```tsx
<StaggerGroup className="mt-8">
  <ul className="space-y-4">
```

and replace `<li key={order.id} className="border border-line bg-cream">` with:

```tsx
<StaggerItem as="li" key={order.id} className="border border-line bg-cream">
```

Close the item with `</StaggerItem>` and the list with `</ul></StaggerGroup>`.

- [ ] **Step 5: Add the About route motif**

```tsx
// src/components/delivery/route-motif.tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import { MapPin } from "@/components/icons/atelier-icons";
import { EASE_SILK } from "@/lib/motion";

const ROUTE =
  "M 48 150 C 110 120, 132 64, 210 54 C 270 46, 300 88, 348 46";

export function RouteMotif() {
  const reduce = useReducedMotion();

  return (
    <div className="mt-6 border border-line bg-cream p-4">
      <svg
        viewBox="0 0 396 190"
        className="h-auto w-full"
        role="img"
        aria-label="A route drawing from Johannesburg across South Africa"
      >
        <path d="M0 152h396M0 96h396M0 40h396" stroke="var(--color-line)" strokeDasharray="2 8" opacity={0.55} />
        <path
          d={ROUTE}
          fill="none"
          stroke="var(--color-oxblood)"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {!reduce ? (
          <motion.path
            d={ROUTE}
            fill="none"
            stroke="var(--color-champagne-dark)"
            strokeWidth={3.5}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.9 }}
            whileInView={{ pathLength: 1, opacity: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: EASE_SILK }}
          />
        ) : null}
        <g transform="translate(48 150)">
          <circle r={13} fill="var(--color-cream)" stroke="var(--color-oxblood)" strokeWidth={1.4} />
          <MapPin size={12} className="text-oxblood" />
        </g>
        <g transform="translate(348 46)">
          <circle r={13} fill="var(--color-cream)" stroke="var(--color-champagne-dark)" strokeWidth={1.4} />
          <MapPin size={12} className="text-champagne-dark" />
        </g>
      </svg>
      <p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-stone">
        Johannesburg atelier · anywhere in South Africa
      </p>
    </div>
  );
}
```

In `src/app/(store)/about/page.tsx`, import `RouteMotif` and render it inside the left column, after the `inline-flex` studio badge:

```tsx
<RouteMotif />
```

- [ ] **Step 6: Use the custom icons in trust promises**

In `src/components/home/promises.tsx`, replace the Lucide import with:

```tsx
import {
  CourierVan,
  GiftRibbon,
  Plane,
  ShieldCheck,
} from "@/components/icons/atelier-icons";
```

Change the four `icon` values to `CourierVan`, `GiftRibbon`, `ShieldCheck`, `Plane` respectively. The render stays `<Icon className=... strokeWidth={1.3} aria-hidden />`; remove `strokeWidth` because the custom icons fix their own stroke. Use:

```tsx
<Icon className="mt-0.5 size-5 shrink-0 text-champagne-dark" aria-hidden />
```

- [ ] **Step 7: Add footer link underlines**

In `src/components/layout/footer.tsx`, replace the column link with:

```tsx
<Link
  href={link.href}
  className="group relative inline-block transition-colors hover:text-ivory"
>
  {link.label}
  <span
    className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100"
    aria-hidden
  />
</Link>
```

- [ ] **Step 8: Verify**

Run: `npm run lint && npm run build`
Expected: both exit 0.

- [ ] **Step 9: Commit**

```bash
git add src/components/checkout/checkout-progress.tsx src/components/motion/count-up.tsx src/components/delivery/route-motif.tsx src/components/checkout/checkout-form.tsx "src/app/(store)/account/(dashboard)/orders/page.tsx" src/components/home/promises.tsx "src/app/(store)/about/page.tsx" src/components/layout/footer.tsx
git commit -m "Polish checkout, account, trust and About with Atelier motion"
```

---

### Task 8: Full validation, live deployment and APK

**Files:**
- No new files. Verification and release only.

**Interfaces:**
- Consumes: everything above.
- Produces: green lint/build/tests, verified Vercel routes, refreshed Android artifact.

- [ ] **Step 1: Confirm the runtime**

Run: `node -v`
Expected: `v22.x.x`. If not, prepend the Node 22 bin directory to `PATH` before every remaining command.

- [ ] **Step 2: Run lint, unit tests and build**

```bash
npm run lint
PLAYWRIGHT_BASE_URL=https://lovablestorex.vercel.app npx playwright test tests/e2e/delivery-track.spec.ts
npm run build
```

Expected: lint 0 errors, 5 Playwright tests pass, build completes.

- [ ] **Step 3: Run the existing mobile/theme suite locally**

Start the production server on port 3100 in a background shell, then run:

```bash
PORT=3100 npm run start -- -p 3100
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npx playwright test tests/e2e/mobile-themes.spec.ts
```

Expected: the existing suite passes at every viewport and theme. Stop the server after the suite.

- [ ] **Step 4: Browser QA the new experiences**

With the production server still running at `http://127.0.0.1:3100`:

1. Home: verify hero parallax, promises show custom icons, no horizontal overflow at 360 px.
2. Shop: pointer-tilt a product card, quick-add, confirm the image chip flies to the bag and the badge bumps.
3. Product: add to bag, confirm the same flight and the sticky mobile bar.
4. Cart: confirm the drawer opens, lines stagger and the free-shipping bar shimmers.
5. Checkout: confirm the progress rail appears and advances after swipe confirmation.
6. Order/track: open an authorised demo order, confirm the packing scene, map, milestone rail, preview label and replay button.
7. Reduced motion: emulate `prefers-reduced-motion: reduce`, reload the order page, confirm the packing scene is static, replay is hidden and the map marker is static.

Do not print the order email or address in the terminal. Stop the local server when finished.

- [ ] **Step 5: Push and verify Vercel**

```bash
git status --short
git push origin main
```

Wait for the Vercel deployment, then verify:

```bash
for path in / /shop /about /checkout /track; do
  curl -s -o /dev/null -w "%{http_code} $path\n" "https://lovablestorex.vercel.app$path"
done
```

Expected: `200` for every route. Open the order page on the live domain with the authorised demo order and confirm the map, packing scene and reduced-motion behaviour.

- [ ] **Step 6: Verify the Android workflow**

The push touches `src/**`, so `.github/workflows/android.yml` runs automatically. Confirm the workflow succeeds and the rolling release at `https://github.com/nastechresearch/lovablestore/releases/tag/android-latest` has a newer asset. Do not change the release tag or the signing setup.

- [ ] **Step 7: Final commit only if QA required a fix**

If a QA fix was needed, commit it with a focused message and push again. Do not amend published commits.

---

## Self-Review

**Spec coverage:**
- Motion tokens, upgraded reveal, reduced motion — Task 1; `MotionConfig` already exists in `providers.tsx` and is preserved.
- Custom animated icons — Task 1, used in Tasks 4, 7 and the packing scene.
- Packing theatre and status mapping — Task 3, placed in Task 5.
- Branded map, provinces, route, moving courier, milestone rail, honesty label, 45 s refresh — Tasks 2, 4, 5.
- Storefront pass: hero parallax, product tilt, fly-to-bag, cart shimmer, checkout rail, account stats, About motif, header/footer motion — Tasks 6 and 7. The product gallery crossfade and sticky mobile purchase bar already exist and are preserved.
- Validation, live deployment, APK — Task 8.
- No new dependencies, schema changes, APIs or external tiles — enforced by the global constraints and file list.

**Type consistency:** `TrackPlace` is defined once in `delivery-track.ts`; `GeoPoint` is defined in `sa-geo.ts` and structurally identical. `DeliveryJourney` passes exactly the props `LiveDeliveryMap` declares. `PackingScene` accepts the mapped `{ name, image }` shape used by both order pages. `FlyToBagDetail` carries viewport coordinates consumed by `FlightChip`.

**Placeholder scan:** No TBD/TODO steps; every code step contains the implementation and every verification step names the command and expected result.
