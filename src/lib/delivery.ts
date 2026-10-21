export type DeliveryMode = "LOCAL" | "GLOBAL" | "MIXED";
export type DeliveryVehicle = "bike" | "car" | "plane" | "mixed";

export type DeliveryReason = { title: string; body: string };
export type DeliveryStep = {
  label: string;
  detail: string;
  dateISO: string;
};

export type DeliveryPlan = {
  mode: DeliveryMode;
  modeLabel: string;
  vehicle: DeliveryVehicle;
  dispatchISO: string;
  earliestISO: string;
  latestISO: string;
  minBusinessDays: number;
  maxBusinessDays: number;
  windowLabel: string;
  dispatchLabel: string;
  summary: string;
  reasons: DeliveryReason[];
  steps: DeliveryStep[];
  cutoffHour: number;
};

const SAST_OFFSET_MS = 2 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const SA_HOLIDAYS: Record<string, string> = {
  "2026-01-01": "New Year's Day",
  "2026-03-21": "Human Rights Day",
  "2026-04-03": "Good Friday",
  "2026-04-06": "Family Day",
  "2026-04-27": "Freedom Day",
  "2026-05-01": "Workers' Day",
  "2026-06-16": "Youth Day",
  "2026-08-09": "Women's Day",
  "2026-08-10": "Women's Day (observed)",
  "2026-09-24": "Heritage Day",
  "2026-12-16": "Day of Reconciliation",
  "2026-12-25": "Christmas Day",
  "2026-12-26": "Day of Goodwill",
  "2027-01-01": "New Year's Day",
  "2027-03-21": "Human Rights Day",
  "2027-03-22": "Human Rights Day (observed)",
  "2027-03-26": "Good Friday",
  "2027-03-29": "Family Day",
  "2027-04-27": "Freedom Day",
  "2027-05-01": "Workers' Day",
  "2027-06-16": "Youth Day",
  "2027-08-09": "Women's Day",
  "2027-09-24": "Heritage Day",
  "2027-12-16": "Day of Reconciliation",
  "2027-12-25": "Christmas Day",
  "2027-12-26": "Day of Goodwill",
  "2027-12-27": "Day of Goodwill (observed)",
};

function sastCalendar(date: Date) {
  const shifted = new Date(date.getTime() + SAST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
  };
}

function keyFor(date: Date): string {
  const parts = sastCalendar(date);
  return `${parts.year}-${String(parts.month + 1).padStart(2, "0")}-${String(
    parts.day,
  ).padStart(2, "0")}`;
}

function sastNoon(date: Date): Date {
  const parts = sastCalendar(date);
  return new Date(Date.UTC(parts.year, parts.month, parts.day, 10, 0, 0));
}

export function isBusinessDay(date: Date): boolean {
  const parts = sastCalendar(date);
  const weekday = new Date(
    Date.UTC(parts.year, parts.month, parts.day),
  ).getUTCDay();
  if (weekday === 0 || weekday === 6) return false;
  return !SA_HOLIDAYS[keyFor(date)];
}

function addBusinessDays(start: Date, days: number): Date {
  let cursor = new Date(start.getTime());
  let remaining = days;
  while (remaining > 0) {
    cursor = new Date(cursor.getTime() + DAY_MS);
    if (isBusinessDay(cursor)) remaining -= 1;
  }
  return cursor;
}

function nextBusinessDay(start: Date): Date {
  let cursor = new Date(start.getTime());
  for (let guard = 0; guard < 10; guard += 1) {
    cursor = new Date(cursor.getTime() + DAY_MS);
    if (isBusinessDay(cursor)) return cursor;
  }
  return cursor;
}

function dispatchDay(createdAt: Date, cutoffHour: number): Date {
  const parts = sastCalendar(createdAt);
  if (isBusinessDay(createdAt) && parts.hour < cutoffHour) {
    return sastNoon(createdAt);
  }
  return nextBusinessDay(sastNoon(createdAt));
}

const shortDate = new Intl.DateTimeFormat("en-ZA", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Africa/Johannesburg",
});

const longDate = new Intl.DateTimeFormat("en-ZA", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "Africa/Johannesburg",
});

export function formatDeliveryDate(date: Date): string {
  return shortDate.format(date);
}

function holidaysBetween(start: Date, end: Date): string[] {
  const found: string[] = [];
  let cursor = sastNoon(start);
  while (cursor <= end && found.length < 4) {
    const name = SA_HOLIDAYS[keyFor(cursor)];
    if (name) found.push(name);
    cursor = new Date(cursor.getTime() + DAY_MS);
  }
  return [...new Set(found)];
}

export function deliveryModeFromKinds(kinds: string[]): DeliveryMode {
  const unique = [...new Set(kinds.filter(Boolean))];
  const local = unique.includes("LOCAL");
  const global = unique.some((kind) => kind !== "LOCAL");
  if (local && global) return "MIXED";
  return global ? "GLOBAL" : "LOCAL";
}

export function buildDeliveryPlan(input: {
  createdAt?: Date;
  mode?: DeliveryMode;
  leadTimeMin?: number;
  leadTimeMax?: number;
  cutoffHour?: number;
  origin?: string;
}): DeliveryPlan {
  const createdAt = input.createdAt ?? new Date();
  const cutoffHour = input.cutoffHour ?? 14;
  const mode = input.mode ?? "LOCAL";
  const leadMin = Math.max(0, input.leadTimeMin ?? (mode === "GLOBAL" ? 10 : 2));
  const leadMax = Math.max(leadMin, input.leadTimeMax ?? (mode === "GLOBAL" ? 18 : 5));

  const dispatch = dispatchDay(createdAt, cutoffHour);
  const earliest = addBusinessDays(dispatch, leadMin);
  const latest = addBusinessDays(dispatch, leadMax);
  const vehicle: DeliveryVehicle =
    mode === "MIXED"
      ? "mixed"
      : mode === "GLOBAL"
        ? "plane"
        : leadMax <= 2
          ? "bike"
          : "car";

  const modeLabel =
    mode === "GLOBAL"
      ? "Global atelier"
      : mode === "MIXED"
        ? "Local + global pieces"
        : "Local South African partner";

  const dispatchSameDay =
    dispatch.getTime() === sastNoon(createdAt).getTime();
  const holidayNames = holidaysBetween(createdAt, latest);

  const reasons: DeliveryReason[] = [
    {
      title: dispatchSameDay
        ? `Packed today, before the ${cutoffHour}:00 cutoff`
        : `Dispatch on ${longDate.format(dispatch)}`,
      body: dispatchSameDay
        ? `Orders paid before ${cutoffHour}:00 SAST on a business day are picked, packed and handed to the courier the same day.`
        : `This order was placed after the ${cutoffHour}:00 SAST cutoff or on a weekend/holiday, so packing starts on the next business day.`,
    },
    {
      title: `${leadMin}–${leadMax} business days in transit`,
      body:
        "Working days exclude weekends and South African public holidays. Couriers deliver Monday to Saturday in metro areas.",
    },
  ];

  if (mode === "GLOBAL") {
    reasons.push({
      title: "International flight + customs clearance",
      body:
        "This piece is stocked by a vetted global partner. The window includes export handling, the flight into OR Tambo, customs clearance and the local last-mile courier.",
    });
  } else if (mode === "MIXED") {
    reasons.push({
      title: "Two parcels, one tracking page",
      body:
        "Your bag mixes local and imported pieces. We consolidate where possible, but a customs hold can make one parcel arrive a day or two earlier than the other.",
    });
  } else {
    reasons.push({
      title: `Ships from ${input.origin ?? "our Johannesburg studio"}`,
      body:
        "Local stock is already in South Africa — no customs, no import duty and no international leg on this delivery.",
    });
  }

  if (holidayNames.length > 0) {
    reasons.push({
      title: "Public holidays excluded",
      body: `Your window skips ${holidayNames.join(", ")}. Couriers resume the next business day.`,
    });
  }

  const steps: DeliveryStep[] = [
    {
      label: "Order received",
      detail: "Payment confirmed and sent to the packing floor.",
      dateISO: createdAt.toISOString(),
    },
    {
      label: "Packed & labelled",
      detail: "Quality checked, gift wrapped and courier label printed.",
      dateISO: dispatch.toISOString(),
    },
  ];

  if (mode === "GLOBAL" || mode === "MIXED") {
    steps.push({
      label: "Customs cleared",
      detail: "Imported parcel released for last-mile delivery.",
      dateISO: addBusinessDays(dispatch, Math.max(1, Math.round(leadMax / 2))).toISOString(),
    });
  }

  steps.push({
    label: "Out for delivery",
    detail: "Your courier is on the route to your address.",
    dateISO: addBusinessDays(dispatch, Math.max(1, leadMax - 1)).toISOString(),
  });
  steps.push({
    label: "Delivered",
    detail: "Signed for at your door — or with your building concierge.",
    dateISO: latest.toISOString(),
  });

  const windowLabel =
    leadMin === leadMax
      ? `Arrives ${formatDeliveryDate(earliest)}`
      : `Arrives ${formatDeliveryDate(earliest)} – ${formatDeliveryDate(latest)}`;

  return {
    mode,
    modeLabel,
    vehicle,
    dispatchISO: dispatch.toISOString(),
    earliestISO: earliest.toISOString(),
    latestISO: latest.toISOString(),
    minBusinessDays: leadMin,
    maxBusinessDays: leadMax,
    windowLabel,
    dispatchLabel: `Dispatch ${longDate.format(dispatch)}`,
    summary: `${modeLabel} · ${leadMin}–${leadMax} business days`,
    reasons,
    steps,
    cutoffHour,
  };
}
