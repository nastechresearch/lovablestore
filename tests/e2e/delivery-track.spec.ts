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
    expect(formatKm(1264.7).replace(/\u00a0/g, " ")).toBe("1 265 km");
    expect(PROVINCE_SHAPES).toHaveLength(9);
    expect(PROVINCE_SHAPES.every((shape) => shape.path.startsWith("M "))).toBe(true);
    expect(distanceKm(STUDIO, STUDIO)).toBe(0);
  });
});
