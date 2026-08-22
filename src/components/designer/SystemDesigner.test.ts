import fc from "fast-check";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_PATROL_RADIUS_M,
  DEFAULT_SITE_RADIUS_M,
  MAX_DOCKS,
  PATROL_RADIUS_MAX_M,
  PATROL_RADIUS_MIN_M,
  SITE_RADIUS_MAX_M,
  SITE_RADIUS_MIN_M,
  clampSiteRadius,
  destinationPoint,
  planDocks,
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
// `navigator.geolocation` and DOM tile rendering). This file replaces the
// previous `siteBounds`/`dims` suite: the survey zone became a circle at the
// site owner's request, so the box-corner and width/height-in-metres maths those
// two functions existed for no longer has a caller. What is worth pinning is now
// the ring layout, because a bug there is silent — it would still draw a
// plausible-looking set of circles while leaving the zone partly unwatched.

const TEST_EARTH_M = 6371000;

// Deliberately an independent implementation, not a re-export: `destinationPoint`
// is equirectangular, so verifying it against a haversine written here proves the
// simplification holds at the scale the planner works over rather than just
// restating the same formula back at itself.
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

describe("siteAt (Requirement 9.3)", () => {
  it("centres the site on the given lat/lng and applies the default radius", () => {
    const s = siteAt(...BENGALURU);
    expect(s.lat).toBeCloseTo(BENGALURU[0], 6);
    expect(s.lng).toBeCloseTo(BENGALURU[1], 6);
    expect(s.radiusM).toBe(DEFAULT_SITE_RADIUS_M);
  });

  it("accepts an explicit radius", () => {
    expect(siteAt(...BENGALURU, 750).radiusM).toBe(750);
  });
});

describe("siteAreaM2 (Requirement 9.3)", () => {
  it("is the area of the coverage circle, not of a bounding box", () => {
    const s = siteAt(...BENGALURU, 300);
    expect(siteAreaM2(s)).toBeCloseTo(Math.PI * 300 * 300, 6);
    // The square zone this replaced would have reported (2r)^2 for the same
    // radius, which is where the visible "survey area" figure drops by pi/4.
    expect(siteAreaM2(s)).toBeLessThan(600 * 600);
  });

  it("grows with the radius", () => {
    expect(siteAreaM2(siteAt(...BENGALURU, 600))).toBeGreaterThan(
      siteAreaM2(siteAt(...BENGALURU, 300)),
    );
  });
});

describe("clampSiteRadius", () => {
  it("holds the slider range at both ends and passes values through inside it", () => {
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
          // Sub-metre agreement with a great-circle measurement over the
          // hundreds-of-metres range this planner covers.
          return Math.abs(haversineM(lat, lng, p.lat, p.lng) - distanceM) < 1;
        },
      ),
    );
  });
});

describe("planDocks (Requirement 9.3)", () => {
  it("places a single station when one drone already covers the whole site", () => {
    const s = siteAt(...BENGALURU, 200);
    const plan = planDocks(s, 400);
    expect(plan.docks).toHaveLength(1);
    expect(plan.capped).toBe(false);
    expect(plan.docks[0].lat).toBeCloseTo(s.lat, 9);
    expect(plan.docks[0].lng).toBeCloseTo(s.lng, 9);
  });

  it("places a centre station plus one ring at the default slider settings", () => {
    const plan = planDocks(
      siteAt(...BENGALURU, DEFAULT_SITE_RADIUS_M),
      DEFAULT_PATROL_RADIUS_M,
    );
    // 300 m zone, 150 m patrol radius: one ring at 300 m holding six stations.
    expect(plan.docks).toHaveLength(7);
    expect(plan.capped).toBe(false);
  });

  it("issues unique, sequential ids so hand placements key correctly", () => {
    const plan = planDocks(siteAt(...BENGALURU, 900), 150);
    const ids = plan.docks.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual(ids.map((_, i) => i));
  });

  it("never places a station outside the perimeter", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: SITE_RADIUS_MIN_M, max: SITE_RADIUS_MAX_M }),
        fc.integer({ min: PATROL_RADIUS_MIN_M, max: PATROL_RADIUS_MAX_M }),
        (siteRadiusM, patrolRadiusM) => {
          const s = siteAt(...BENGALURU, siteRadiusM);
          return planDocks(s, patrolRadiusM).docks.every(
            (d) => haversineM(s.lat, s.lng, d.lat, d.lng) <= siteRadiusM + 1,
          );
        },
      ),
    );
  });

  it("leaves no unwatched band between the centre and the perimeter", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: SITE_RADIUS_MIN_M, max: SITE_RADIUS_MAX_M }),
        fc.integer({ min: PATROL_RADIUS_MIN_M, max: PATROL_RADIUS_MAX_M }),
        (siteRadiusM, patrolRadiusM) => {
          const s = siteAt(...BENGALURU, siteRadiusM);
          const plan = planDocks(s, patrolRadiusM);
          // A capped plan is knowingly incomplete — that is what the "+" on the
          // readout says — so the coverage claim only applies to full plans.
          if (plan.capped) return true;

          const radii = [
            ...new Set(
              plan.docks.map((d) =>
                Math.round(haversineM(s.lat, s.lng, d.lat, d.lng)),
              ),
            ),
          ].sort((a, b) => a - b);

          // Consecutive rings must overlap radially, and the outermost ring's
          // coverage must reach the perimeter.
          for (let i = 1; i < radii.length; i++) {
            if (radii[i] - radii[i - 1] > 2 * patrolRadiusM + 1) return false;
          }
          return radii[radii.length - 1] + patrolRadiusM + 1 >= siteRadiusM;
        },
      ),
    );
  });

  it("needs fewer stations as the per dock patrol radius grows", () => {
    const s = siteAt(...BENGALURU, 1500);
    expect(planDocks(s, 150).docks.length).toBeGreaterThan(
      planDocks(s, 300).docks.length,
    );

    const small = siteAt(...BENGALURU, 600);
    expect(planDocks(small, 100).docks.length).toBeGreaterThan(
      planDocks(small, 300).docks.length,
    );
  });

  it("needs more stations as the coverage radius grows", () => {
    expect(planDocks(siteAt(...BENGALURU, 1200), 150).docks.length).toBeGreaterThan(
      planDocks(siteAt(...BENGALURU, 400), 150).docks.length,
    );
  });

  it("reports a capped plan rather than silently under counting", () => {
    // The most demanding combination the two sliders allow.
    const plan = planDocks(
      siteAt(...BENGALURU, SITE_RADIUS_MAX_M),
      PATROL_RADIUS_MIN_M,
    );
    expect(plan.capped).toBe(true);
    expect(plan.docks).toHaveLength(MAX_DOCKS);
  });

  it("does not report a cap for plans that fit inside it", () => {
    const plan = planDocks(siteAt(...BENGALURU, SITE_RADIUS_MAX_M), 150);
    expect(plan.capped).toBe(false);
    expect(plan.docks.length).toBeLessThan(MAX_DOCKS);
  });
});
