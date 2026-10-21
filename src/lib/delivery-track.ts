import { PROVINCE_CENTROIDS } from "./sa-geo";
import type { GeoPoint } from "./sa-geo";
import { findPlace } from "./sa-locations";

export type { GeoPoint } from "./sa-geo";

export const MAP_WIDTH = 900;
export const MAP_HEIGHT = 640;
export const SA_BOUNDS = { minLng: 16, maxLng: 33, minLat: -35, maxLat: -22 };

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
