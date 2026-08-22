import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_DRONE_COUNT,
  DEFAULT_SITE_RADIUS_M,
  DRONE_COUNT_MAX,
  DRONE_COUNT_MIN,
  SITE_RADIUS_MAX_M,
  SITE_RADIUS_MIN_M,
  clampDroneCount,
  clampSiteRadius,
  destinationPoint,
  droneLayout,
  planDocks,
  requiredPatrolRadiusM,
  siteAreaM2,
  siteAt,
} from "./SystemDesigner";

// Spec: pawaac-design-language-evolution — Task 38.1 (Verify page-split
// migration and cross-page integration: Planner_Page coverage math)
// Requirements: 9.3
// Design: design.md -> Page Specifications -> Planner_Page
//
// The planner's coverage maths is exported from SystemDesigner.tsx as plain
// functions so it can be unit-tested directly, without rendering the
// SystemDesigner/MapCanvas tree (which depends on Leaflet and browser APIs like
// `navigator.geolocation` and DOM tile rendering).
//
// Site-owner request (current session) inverted the model: the visitor now picks
// how many drones they want, and the patrol radius each one must cover is
// derived. That makes `requiredPatrolRadiusM` the figure worth pinning hardest —
// it is published on screen as a metre value, and if it were too small the map
// would still draw a confident set of circles that quietly failed to cover the
// zone. The coverage property below re-derives it by an independent method.

const TEST_EARTH_M = 6371000;

// Independent of `destinationPoint`, which is equirectangular: verifying against
// a haversine written here proves the simplification holds at planner scale
// rather than restating the same formula back at itself.
function haversineM(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
): number {
  const toR = Math.PI / 180;
  const dLat = (bLat - aLat) * toR;
  const dLng = (bLng - aLng) * toR;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aLat * toR) * Math.cos(bLat * toR) * Math.sin(dLng / 2) ** 2;
  return 2 * TEST_EARTH_M * Math.asin(Math.sqrt(h));
}

const BENGALURU: [number, number] = [12.9716, 77.5946];

/**
 * Does `radius` really cover the whole disc from these stations?
 *
 * Deliberately samples in polar coordinates while the implementation samples a
 * square grid, so the two do not share blind spots. Rings are stepped finely and
 * the perimeter is included, since the worst-covered point is almost always on
 * the boundary.
 */
function discIsCovered(
  siteRadiusM: number,
  layout: { radiusM: number; bearingRad: number }[],
  radius: number,
): boolean {
  const stations = layout.map((p) => ({
    x: p.radiusM * Math.sin(p.bearingRad),
    y: p.radiusM * Math.cos(p.bearingRad),
  }));

  const rings = 60;
  // With one drone the worst point sits exactly at the covering radius, so an
  // exact comparison turns rounding in x*x + y*y into a false gap. A micrometre
  // of slack cannot hide a real one.
  const limitSq = (radius + 1e-6) ** 2;

  for (let i = 0; i <= rings; i++) {
    const r = (i / rings) * siteRadiusM;
    const steps = Math.max(24, Math.ceil((2 * Math.PI * r) / (siteRadiusM / 60)));
    for (let j = 0; j < steps; j++) {
      const theta = (j / steps) * 2 * Math.PI;
      const x = r * Math.cos(theta);
      const y = r * Math.sin(theta);
      const covered = stations.some(
        (s) => (x - s.x) ** 2 + (y - s.y) ** 2 <= limitSq,
      );
      if (!covered) return false;
    }
  }
  return true;
}

describe("siteAt / siteAreaM2 / clampSiteRadius (Requirement 9.3)", () => {
  it("centres the site on the given lat/lng and applies the default radius", () => {
    const s = siteAt(...BENGALURU);
    expect(s.lat).toBeCloseTo(BENGALURU[0], 6);
    expect(s.lng).toBeCloseTo(BENGALURU[1], 6);
    expect(s.radiusM).toBe(DEFAULT_SITE_RADIUS_M);
  });

  it("reports the area of the coverage circle, not of a bounding box", () => {
    const s = siteAt(...BENGALURU, 300);
    expect(siteAreaM2(s)).toBeCloseTo(Math.PI * 300 * 300, 6);
    expect(siteAreaM2(s)).toBeLessThan(600 * 600);
  });

  it("holds the site radius slider range at both ends", () => {
    expect(clampSiteRadius(SITE_RADIUS_MIN_M - 500)).toBe(SITE_RADIUS_MIN_M);
    expect(clampSiteRadius(SITE_RADIUS_MAX_M + 500)).toBe(SITE_RADIUS_MAX_M);
    expect(clampSiteRadius(400)).toBe(400);
  });
});

describe("destinationPoint (Requirement 9.3)", () => {
  it("moves north on bearing 0 and east on bearing 90 degrees", () => {
    const [lat, lng] = BENGALURU;
    const north = destinationPoint(lat, lng, 500, 0);
    expect(north.lat).toBeGreaterThan(lat);
    expect(north.lng).toBeCloseTo(lng, 9);

    const east = destinationPoint(lat, lng, 500, Math.PI / 2);
    expect(east.lng).toBeGreaterThan(lng);
    expect(east.lat).toBeCloseTo(lat, 9);
  });

  it("lands the requested distance away, measured independently", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10, max: SITE_RADIUS_MAX_M }),
        fc.integer({ min: 0, max: 359 }),
        (distanceM, bearingDeg) => {
          const [lat, lng] = BENGALURU;
          const p = destinationPoint(
            lat,
            lng,
            distanceM,
            bearingDeg * (Math.PI / 180),
          );
          return Math.abs(haversineM(lat, lng, p.lat, p.lng) - distanceM) < 1;
        },
      ),
    );
  });
});

describe("clampDroneCount", () => {
  it("holds the slider range and snaps to whole drones", () => {
    expect(clampDroneCount(0)).toBe(DRONE_COUNT_MIN);
    expect(clampDroneCount(-5)).toBe(DRONE_COUNT_MIN);
    expect(clampDroneCount(DRONE_COUNT_MAX + 10)).toBe(DRONE_COUNT_MAX);
    expect(clampDroneCount(6.4)).toBe(6);
    expect(clampDroneCount(6.6)).toBe(7);
  });
});

describe("droneLayout (Requirement 9.3)", () => {
  it("places exactly the requested number of drones", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: DRONE_COUNT_MIN, max: DRONE_COUNT_MAX }),
        (n) => droneLayout(300, n).length === n,
      ),
      { numRuns: 25 },
    );
  });

  it("puts a single drone at the centre rather than off to one side", () => {
    expect(droneLayout(300, 1)).toEqual([{ radiusM: 0, bearingRad: 0 }]);
  });

  it("keeps every station inside the perimeter", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: SITE_RADIUS_MIN_M, max: SITE_RADIUS_MAX_M }),
        fc.integer({ min: DRONE_COUNT_MIN, max: DRONE_COUNT_MAX }),
        (siteRadiusM, n) =>
          droneLayout(siteRadiusM, n).every(
            (p) => p.radiusM <= siteRadiusM + 1e-9,
          ),
      ),
      { numRuns: 25 },
    );
  });

  it("is deterministic, so the same inputs always draw the same map", () => {
    expect(droneLayout(600, 11)).toEqual(droneLayout(600, 11));
  });

  it("spaces the stations on each ring evenly around it", () => {
    const layout = droneLayout(600, 13);
    const byRing = new Map<number, number[]>();

    for (const p of layout) {
      const key = Math.round(p.radiusM * 1e6) / 1e6;
      byRing.set(key, [...(byRing.get(key) ?? []), p.bearingRad]);
    }

    for (const [radius, bearings] of byRing) {
      if (radius === 0 || bearings.length < 2) continue;
      const sorted = [...bearings].sort((a, b) => a - b);
      const gaps = sorted.slice(1).map((b, i) => b - sorted[i]);
      // Every gap on a ring is the same, i.e. the ring is evenly divided.
      for (const gap of gaps) {
        expect(gap).toBeCloseTo((2 * Math.PI) / bearings.length, 9);
      }
    }
  });
});

describe("requiredPatrolRadiusM (Requirement 9.3)", () => {
  it("asks one drone to cover the whole site radius", () => {
    expect(requiredPatrolRadiusM(300, droneLayout(300, 1))).toBe(300);
  });

  it("never asks for more range than the site radius", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: SITE_RADIUS_MIN_M, max: SITE_RADIUS_MAX_M }),
        fc.integer({ min: DRONE_COUNT_MIN, max: DRONE_COUNT_MAX }),
        (siteRadiusM, n) =>
          requiredPatrolRadiusM(siteRadiusM, droneLayout(siteRadiusM, n)) <=
          siteRadiusM,
      ),
      { numRuns: 25 },
    );
  });

  // The published figure has to be true: at this radius the stations' coverage
  // circles must union to the entire zone, with no unwatched pocket.
  it("publishes a radius that genuinely leaves no gap, verified independently", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: SITE_RADIUS_MIN_M, max: SITE_RADIUS_MAX_M }),
        fc.integer({ min: DRONE_COUNT_MIN, max: DRONE_COUNT_MAX }),
        (siteRadiusM, n) => {
          const layout = droneLayout(siteRadiusM, n);
          const radius = requiredPatrolRadiusM(siteRadiusM, layout);
          return discIsCovered(siteRadiusM, layout, radius);
        },
      ),
      { numRuns: 20 },
    );
  });

  // Two known optimal circle coverings of a disc. The search is not told about
  // either, so matching them is evidence that it explores a sensible family
  // rather than that the answer was hardcoded. Tolerances allow for the 5 m
  // rounding and the sampling margin.
  it("finds the known best arrangement for three drones (0.866 R)", () => {
    const r = requiredPatrolRadiusM(1000, droneLayout(1000, 3));
    expect(r).toBeGreaterThanOrEqual(860);
    expect(r).toBeLessThanOrEqual(900);
  });

  it("finds the known best arrangement for seven drones (0.5 R)", () => {
    const r = requiredPatrolRadiusM(1000, droneLayout(1000, 7));
    expect(r).toBeGreaterThanOrEqual(495);
    expect(r).toBeLessThanOrEqual(545);
  });

  it("asks less of each drone as more drones are added", () => {
    const r = (n: number) => requiredPatrolRadiusM(600, droneLayout(600, n));

    expect(r(1)).toBeGreaterThan(r(4));
    expect(r(4)).toBeGreaterThan(r(12));
    expect(r(12)).toBeGreaterThan(r(DRONE_COUNT_MAX));
  });

  // The panel tells the visitor that more drones means each one covers less
  // ground, so the figure must never rise as the slider moves right. This is the
  // assertion that two earlier layout attempts failed: the phyllotaxis spiral left
  // four drones needing the full site radius, and the first ring search regressed
  // by one 5 m step going from thirteen drones to fourteen. Walked across the
  // whole slider range at three zone sizes rather than sampled, because the
  // failures were at specific counts rather than random ones.
  it.each([300, 600, SITE_RADIUS_MAX_M])(
    "never increases the required radius when a drone is added, at a %i m zone",
    (siteRadiusM) => {
      let previous = Infinity;

      for (let n = DRONE_COUNT_MIN; n <= DRONE_COUNT_MAX; n++) {
        const radius = requiredPatrolRadiusM(
          siteRadiusM,
          droneLayout(siteRadiusM, n),
        );
        expect(radius, `${n} drones needed more range than ${n - 1}`).toBeLessThanOrEqual(
          previous,
        );
        previous = radius;
      }
    },
  );

  it("scales with the site radius at a fixed drone count", () => {
    const small = requiredPatrolRadiusM(300, droneLayout(300, 12));
    const large = requiredPatrolRadiusM(900, droneLayout(900, 12));
    expect(large).toBeGreaterThan(small);
  });
});

describe("planDocks (Requirement 9.3)", () => {
  it("returns one marker per drone with unique, sequential ids", () => {
    const docks = planDocks(siteAt(...BENGALURU, 600), 9);

    expect(docks).toHaveLength(9);
    const ids = docks.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(ids.map((_, i) => i));
  });

  it("places every marker inside the perimeter, measured on the sphere", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: SITE_RADIUS_MIN_M, max: SITE_RADIUS_MAX_M }),
        fc.integer({ min: DRONE_COUNT_MIN, max: DRONE_COUNT_MAX }),
        (siteRadiusM, n) => {
          const s = siteAt(...BENGALURU, siteRadiusM);
          return planDocks(s, n).every(
            (d) => haversineM(s.lat, s.lng, d.lat, d.lng) <= siteRadiusM + 1,
          );
        },
      ),
    );
  });

  it("puts the single drone case exactly on the site centre", () => {
    const s = siteAt(...BENGALURU, 400);
    const [only] = planDocks(s, 1);
    expect(only.lat).toBeCloseTo(s.lat, 9);
    expect(only.lng).toBeCloseTo(s.lng, 9);
  });

  it("uses a default drone count inside the slider range", () => {
    expect(DEFAULT_DRONE_COUNT).toBeGreaterThanOrEqual(DRONE_COUNT_MIN);
    expect(DEFAULT_DRONE_COUNT).toBeLessThanOrEqual(DRONE_COUNT_MAX);
  });
});
