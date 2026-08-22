"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Dock, Site } from "@/components/designer/MapCanvas";
import ReticleFrame from "@/components/ui/ReticleFrame";

const MapCanvas = dynamic(() => import("@/components/designer/MapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-bg-2 font-mono text-xs tracking-widest text-muted">
      INITIALIZING MAP
    </div>
  ),
});

const TO_R = Math.PI / 180;
const EARTH = 6371000;

const CORNERS = [
  "left-[-1px] top-[-1px] border-l border-t",
  "right-[-1px] top-[-1px] border-r border-t",
  "left-[-1px] bottom-[-1px] border-l border-b",
  "right-[-1px] bottom-[-1px] border-r border-b",
];

// ── Coverage model ────────────────────────────────────
//
// Spec: pawaac-design-language-evolution — Task 38.1 (Verify page-split
// migration: Planner_Page coverage math)
// Requirements: 9.3
//
// Site-owner request (current session): the outer perimeter was a square and
// is now a circle, sized by its own slider, with the per-dock patrol radius
// kept on a second slider.
//
// What changed, and why the old maths went with it: the zone used to be a
// corner-to-corner `Bounds` box, so `siteBounds(lat, lng)` built a ~400 m
// square and `dims(bounds)` converted its degree spans back into metres to
// get an area and a dock grid. A circle is defined by one radius in metres
// already, so both of those functions had nothing left to do and have been
// replaced by `siteAt`, `siteAreaM2` and `planDocks` below. Every one of them
// is still a plain exported function with no Leaflet or DOM dependency, for
// the same reason the originals were: SystemDesigner.test.ts unit-tests the
// coverage maths directly without rendering the map subtree.
//
// The dock layout changed shape with the zone. The old model tiled a square
// lattice of 2r x 2r cells across the box. Laid over a circle that leaves a
// square block of stations inside a round perimeter, with uncovered crescents
// at the edges, so `planDocks` places concentric rings instead: one station at
// the centre, then rings stepped outward by the same 2r pitch the old lattice
// used. The pitch convention is therefore unchanged — each station still owns
// a 2r footprint — but a ring fills a disc with fewer stations than a lattice
// does, so expect a lower suggested count than the square zone produced for a
// comparable area. That is the model being more efficient, not a figure being
// revised.

export const DEFAULT_SITE_RADIUS_M = 300;
export const SITE_RADIUS_MIN_M = 100;
export const SITE_RADIUS_MAX_M = 1500;
export const SITE_RADIUS_STEP_M = 50;

// Site-owner request (current session): "give the user ability to select number
// of drones instead of surveillance through each drone". The second slider used
// to set the patrol radius of each drone, and the station count fell out of it.
// That is now inverted: the visitor sets how many drones they want, and the
// patrol radius each one has to cover is the derived readout.
//
// Inverting the old ring model in place did not work, and the reason is worth
// recording. Its station count was a step function of the patrol radius — for a
// 300 m zone the reachable totals were 1, then 7, then 20 — so most positions on
// a "number of drones" slider had no radius that produced them. Dragging it
// would have jumped between a handful of layouts and sat dead in between.
//
// The first replacement attempted was Vogel's phyllotaxis spiral, which places
// any count with one formula. It was rejected after measuring it: the golden
// angle distributes points well in the large but leaves wide angular gaps at
// small counts, so four drones in a 600 m zone still needed the full 600 m of
// range — the same as one drone, which makes the slider look broken at exactly
// the counts a visitor is most likely to try first.
//
// What ships instead is a small search. Candidate layouts come from one family:
// an optional station at the centre plus one to three evenly spaced rings, with
// station counts split across rings in proportion to ring radius so density
// stays even. Each candidate is scored by the patrol radius it would require and
// the best is kept. The search is what makes the result good rather than the
// family being clever — it lands on the known optimal arrangements for three
// stations (0.866 R) and seven (0.5 R) on its own.
//
// This is explicitly a planning estimate, not a proof of optimality. Genuinely
// optimal circle coverings of a disc are known only for small counts and do not
// follow any ring pattern; at four stations this search returns about 0.707 R
// against a known best of 0.610 R. Presenting it as "the range this placement
// requires" is therefore accurate, while presenting it as the minimum possible
// would not be.
export const DEFAULT_DRONE_COUNT = 7;
export const DRONE_COUNT_MIN = 1;
export const DRONE_COUNT_MAX = 24;

export function siteAt(
  lat: number,
  lng: number,
  radiusM: number = DEFAULT_SITE_RADIUS_M,
): Site {
  return { lat, lng, radiusM };
}

export function siteAreaM2(site: Site): number {
  return Math.PI * site.radiusM * site.radiusM;
}

export function clampSiteRadius(radiusM: number): number {
  return Math.min(SITE_RADIUS_MAX_M, Math.max(SITE_RADIUS_MIN_M, radiusM));
}

// Point `distanceM` away from (lat, lng) on `bearingRad`, measured clockwise
// from north. Equirectangular rather than great-circle: at the scale this
// planner works over (hundreds of metres, low single-digit kilometres at most)
// the two agree to well under a metre, and the cos(lat) longitude correction is
// the only term that matters. The 0.01 floor keeps the division finite at the
// poles, mirroring the guard the old `siteBounds` used.
export function destinationPoint(
  lat: number,
  lng: number,
  distanceM: number,
  bearingRad: number,
): { lat: number; lng: number } {
  const dLatDeg = distanceM * Math.cos(bearingRad) / EARTH / TO_R;
  const dLngDeg =
    distanceM *
    Math.sin(bearingRad) /
    (EARTH * Math.max(0.01, Math.cos(lat * TO_R))) /
    TO_R;
  return { lat: lat + dLatDeg, lng: lng + dLngDeg };
}

/** A station's position relative to the site centre, in polar form. */
export type DronePlacement = { radiusM: number; bearingRad: number };

export function clampDroneCount(droneCount: number): number {
  return Math.min(
    DRONE_COUNT_MAX,
    Math.max(DRONE_COUNT_MIN, Math.round(droneCount)),
  );
}

// Sample resolution across the bounding square of the site circle. The search
// scores dozens of candidates, so it uses the coarse grid; the figure actually
// published is remeasured on the fine one.
const SEARCH_SAMPLES = 34;
const PUBLISH_SAMPLES = 96;

// Radial scale candidates: how far out the outermost ring sits, as a fraction of
// the site radius. Coverage is surprisingly sensitive to this — a ring of six
// around a centre station needs 0.5 R at a scale of 0.866 and appreciably more
// either side of it — so it is searched rather than guessed.
const SCALE_CANDIDATES = [
  0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1,
];

type RingStructure = { centre: boolean; ringCounts: number[] };

/**
 * Splits `count` stations across `ringCount` rings in proportion to ring radius,
 * so the number of stations per unit of ring length is the same on every ring.
 * Returns null when there are not enough stations to give every ring at least
 * one.
 */
function splitAcrossRings(count: number, ringCount: number): number[] | null {
  if (count < ringCount) return null;

  const weightTotal = (ringCount * (ringCount + 1)) / 2;
  const counts: number[] = [];
  let assigned = 0;

  for (let j = 1; j <= ringCount; j++) {
    const share = Math.max(1, Math.floor((count * j) / weightTotal));
    counts.push(share);
    assigned += share;
  }

  // Hand any rounding remainder to the outermost rings, which have the most
  // circumference to cover and therefore gain the most from an extra station.
  let remainder = count - assigned;
  for (let j = counts.length - 1; remainder > 0; j = j === 0 ? counts.length - 1 : j - 1) {
    counts[j] += 1;
    remainder -= 1;
  }
  // And take any overshoot back off the innermost rings, never below one.
  for (let j = 0; remainder < 0; j = (j + 1) % counts.length) {
    if (counts[j] > 1) {
      counts[j] -= 1;
      remainder += 1;
    } else if (counts.every((c) => c <= 1)) {
      return null;
    }
  }

  return counts;
}

function buildPlacements(
  siteRadiusM: number,
  structure: RingStructure,
  scale: number,
): DronePlacement[] {
  const placements: DronePlacement[] = [];
  if (structure.centre) placements.push({ radiusM: 0, bearingRad: 0 });

  const rings = structure.ringCounts.length;
  structure.ringCounts.forEach((count, index) => {
    const j = index + 1;
    const radiusM = (siteRadiusM * scale * j) / rings;
    // Stagger every other ring by half a step so adjacent rings interleave
    // instead of lining up into spokes, which leaves smaller gaps between them.
    const offset = j % 2 === 0 ? Math.PI / count : 0;

    for (let k = 0; k < count; k++) {
      placements.push({
        radiusM,
        bearingRad: offset + (k / count) * 2 * Math.PI,
      });
    }
  });

  return placements;
}

/**
 * Split variants around the proportional one, produced by shifting a single
 * station between the innermost and outermost ring. Widens the family cheaply so
 * the search has more than one shape per ring count to compare.
 */
function splitVariants(count: number, ringCount: number): number[][] {
  const base = splitAcrossRings(count, ringCount);
  if (!base) return [];
  if (ringCount === 1) return [base];

  const variants = [base];
  const last = base.length - 1;

  if (base[0] > 1) {
    const outward = [...base];
    outward[0] -= 1;
    outward[last] += 1;
    variants.push(outward);
  }
  if (base[last] > 1) {
    const inward = [...base];
    inward[last] -= 1;
    inward[0] += 1;
    variants.push(inward);
  }

  return variants;
}

/**
 * Worst-covered point in the unit disc for a unit-radius layout, and how far it
 * sits from its nearest station.
 *
 * Everything below works on a unit disc because the geometry is scale invariant:
 * scaling a layout by R scales every distance by R, so the best arrangement for a
 * 300 m zone is the best arrangement for a 1500 m zone. That is what makes it
 * affordable to search properly — the answer depends only on the drone count, so
 * it is computed once per count and then reused at any site radius.
 */
function worstCoverage(
  layout: DronePlacement[],
  samples: number,
): { radius: number; x: number; y: number } {
  const stations = layout.map((p) => ({
    x: p.radiusM * Math.sin(p.bearingRad),
    y: p.radiusM * Math.cos(p.bearingRad),
  }));

  const step = 2 / samples;
  let worstSq = -1;
  let worstX = 1;
  let worstY = 0;

  for (let i = 0; i <= samples; i++) {
    const x = -1 + i * step;
    for (let j = 0; j <= samples; j++) {
      const y = -1 + j * step;
      if (x * x + y * y > 1) continue;

      let nearestSq = Infinity;
      for (const s of stations) {
        const d = (x - s.x) ** 2 + (y - s.y) ** 2;
        if (d < nearestSq) nearestSq = d;
      }
      if (nearestSq > worstSq) {
        worstSq = nearestSq;
        worstX = x;
        worstY = y;
      }
    }
  }

  // A grid can miss the true worst point by up to half a diagonal step, and the
  // perimeter is where that point almost always sits, so add that back. Sampling
  // converges from below and this keeps the result on the safe side.
  //
  // Deliberately NOT clamped to 1. Clamping would make every candidate needing at
  // least the full radius score identically, and the search would then pick
  // whichever it evaluated first rather than the best. That is a real case: with
  // two stations, two placed off centre need more than the full radius while one
  // at the centre plus one anywhere needs exactly it, and a clamped score cannot
  // tell those apart. The clamp belongs on the published figure instead.
  const margin = (step * Math.SQRT2) / 2;
  return { radius: Math.sqrt(Math.max(0, worstSq)) + margin, x: worstX, y: worstY };
}

type NormalizedLayout = { placements: DronePlacement[]; coveringRadius: number };

// Best known arrangement per drone count on the unit disc. Populated lazily and
// kept for the lifetime of the module: the search is affordable precisely because
// scale invariance means it never has to run again for a different site radius.
const NORMALIZED_CACHE = new Map<number, NormalizedLayout>();

// Precision used when comparing a count against its predecessor. Finer than the
// search grid so the monotonicity check is not decided by sampling noise, coarser
// than the published measurement so it stays cheap.
const COMPARE_SAMPLES = 56;

function searchNormalized(n: number): NormalizedLayout {
  let best: DronePlacement[] | null = null;
  let bestRadius = Infinity;

  for (const centre of [false, true]) {
    const ringBudget = n - (centre ? 1 : 0);
    if (ringBudget < 1) continue;

    for (let rings = 1; rings <= 4; rings++) {
      for (const ringCounts of splitVariants(ringBudget, rings)) {
        for (const scale of SCALE_CANDIDATES) {
          const placements = buildPlacements(1, { centre, ringCounts }, scale);
          const { radius } = worstCoverage(placements, SEARCH_SAMPLES);
          if (radius < bestRadius) {
            bestRadius = radius;
            best = placements;
          }
        }
      }
    }
  }

  const placements = best ?? [{ radiusM: 0, bearingRad: 0 }];
  return {
    placements,
    coveringRadius: worstCoverage(placements, COMPARE_SAMPLES).radius,
  };
}

/**
 * The best arrangement of `n` stations on the unit disc, guaranteed never to need
 * more range than `n - 1` stations do.
 *
 * That guarantee is not cosmetic and not a clamp on the number. Widening the
 * candidate family removed most of the artefacts but not all of them: at fourteen
 * drones the family's best arrangement genuinely needs slightly more range than
 * its best at thirteen, which would show the visitor a radius going up as they
 * add a drone, contradicting the panel's own explanation. The true optimum cannot
 * behave that way, because n stations can always reproduce the best n - 1
 * arrangement and leave one station redundant. So when the search comes back
 * worse, that is exactly what happens here: the previous arrangement is reused and
 * the spare station is placed at its worst-covered point, which is both the
 * honest place to add capacity and where it does the most good.
 */
function normalizedLayout(n: number): NormalizedLayout {
  const cached = NORMALIZED_CACHE.get(n);
  if (cached) return cached;

  let result: NormalizedLayout;

  if (n <= 1) {
    const placements: DronePlacement[] = [{ radiusM: 0, bearingRad: 0 }];
    result = {
      placements,
      coveringRadius: worstCoverage(placements, COMPARE_SAMPLES).radius,
    };
  } else {
    const searched = searchNormalized(n);
    const previous = normalizedLayout(n - 1);

    if (searched.coveringRadius <= previous.coveringRadius) {
      result = searched;
    } else {
      const gap = worstCoverage(previous.placements, COMPARE_SAMPLES);
      const placements: DronePlacement[] = [
        ...previous.placements,
        {
          radiusM: Math.hypot(gap.x, gap.y),
          bearingRad: Math.atan2(gap.x, gap.y),
        },
      ];
      result = {
        placements,
        coveringRadius: worstCoverage(placements, COMPARE_SAMPLES).radius,
      };
    }
  }

  NORMALIZED_CACHE.set(n, result);
  return result;
}

/**
 * Places exactly `droneCount` stations across the site circle, choosing the
 * arrangement that needs the least range per drone.
 *
 * Returned in local polar coordinates and free of any lat/lng so the geometry can
 * be reasoned about and tested as plane geometry.
 */
export function droneLayout(
  siteRadiusM: number,
  droneCount: number,
): DronePlacement[] {
  const n = clampDroneCount(droneCount);
  return normalizedLayout(n).placements.map((p) => ({
    radiusM: p.radiusM * siteRadiusM,
    bearingRad: p.bearingRad,
  }));
}

/**
 * The greatest distance from any point inside the site circle to its nearest
 * station, measured by sampling a grid over the circle.
 *
 * Measured rather than solved in closed form: the exact quantity is the largest
 * empty circle within a bounded region, which for an arbitrary point set means a
 * Voronoi diagram clipped to the disc — far more machinery than a planning
 * estimate needs.
 */
function coveringRadiusM(
  siteRadiusM: number,
  layout: DronePlacement[],
  samples: number,
): number {
  if (layout.length === 0) return siteRadiusM;
  if (siteRadiusM <= 0) return 0;

  // Normalise, measure on the unit disc, scale the answer back. Scale invariance
  // means this is exact, not an approximation, and it keeps one sampling loop in
  // the module instead of two that could drift apart.
  const unit = layout.map((p) => ({
    radiusM: p.radiusM / siteRadiusM,
    bearingRad: p.bearingRad,
  }));

  return worstCoverage(unit, samples).radius * siteRadiusM;
}

/**
 * The patrol radius each drone has to be able to fly, given where the stations
 * sit. Below this figure some part of the zone is unwatched; at it, the stations'
 * coverage circles union to the whole zone.
 *
 * Rounded up to a whole 5 m so the published figure reads as a spec rather than a
 * raw measurement. Held at the site radius as a ceiling, which is sound because
 * the search always has a centre station candidate available and a station at the
 * centre reaches every point in the zone from a radius of R: the cap therefore
 * only trims the sampling margin's overshoot past a value already known to be
 * achievable, never a genuine requirement.
 */
export function requiredPatrolRadiusM(
  siteRadiusM: number,
  layout: DronePlacement[],
): number {
  const radius = coveringRadiusM(siteRadiusM, layout, PUBLISH_SAMPLES);
  return Math.min(siteRadiusM, Math.ceil(radius / 5) * 5);
}

/** Converts an already-computed layout into map markers. */
export function placementsToDocks(
  site: Site,
  layout: DronePlacement[],
): Dock[] {
  return layout.map((p, k) => {
    const { lat, lng } = destinationPoint(
      site.lat,
      site.lng,
      p.radiusM,
      p.bearingRad,
    );
    return { id: k, lat, lng };
  });
}

/**
 * Layout plus conversion in one call. The component deliberately does not use
 * this: it holds the layout itself so the search behind `droneLayout` runs once
 * per change rather than once for the markers and again for the radius.
 */
export function planDocks(site: Site, droneCount: number): Dock[] {
  return placementsToDocks(site, droneLayout(site.radiusM, droneCount));
}

export default function SystemDesigner() {
  const [site, setSite] = useState<Site | null>(null);
  const [droneCount, setDroneCount] = useState(DEFAULT_DRONE_COUNT);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const areaKm2 = site ? siteAreaM2(site) / 1e6 : 0;

  // The station layout is fully derived from the site and the drone count, and
  // the patrol radius each drone needs is in turn derived from that layout. The
  // direction of derivation is the whole change here: the count used to be the
  // output and the radius the input.
  //
  // The layout is memoised on its own, above the two things that read it, because
  // `droneLayout` runs a search over candidate arrangements. Deriving the markers
  // and the radius from one layout runs that search once per change instead of
  // once each.
  //
  // These used to be `useState` written from inside a `useEffect`, which
  // `react-hooks/set-state-in-effect` reports as an error — it renders once
  // with a stale layout, then immediately re-renders with the real one, and the
  // subtree being re-rendered here contains the Leaflet map. Deriving during
  // render removes that second pass. User drags are kept separately in `moved`
  // and layered on top, which preserves the previous behaviour that
  // re-generating the layout discards any hand placement.
  const layout = useMemo(
    () => (site ? droneLayout(site.radiusM, droneCount) : []),
    [site, droneCount],
  );

  const generated = useMemo<Dock[]>(
    () => (site ? placementsToDocks(site, layout) : []),
    [site, layout],
  );

  // Measured against the generated layout, not against hand-dragged positions:
  // this is the radius the suggested placement requires, and remeasuring it on
  // every frame of a marker drag would run the sampling loop continuously.
  const patrolRadiusM = useMemo(
    () => (site ? requiredPatrolRadiusM(site.radiusM, layout) : 0),
    [site, layout],
  );

  const [moved, setMoved] = useState<Record<number, Dock>>({});
  // Reset hand placements when a new layout is generated. Adjusting state during
  // render (rather than in an effect) is the pattern React documents for
  // "state derived from a changing input": it happens before the component's
  // children render, so no extra pass reaches the map.
  const [movedFor, setMovedFor] = useState(generated);
  if (movedFor !== generated) {
    setMovedFor(generated);
    setMoved({});
  }

  const docks = useMemo(
    () => generated.map((d) => moved[d.id] ?? d),
    [generated, moved],
  );

  const moveDock = (id: number, lat: number, lng: number) =>
    setMoved((m) => ({ ...m, [id]: { id, lat, lng } }));

  function requestLocation() {
    if (!navigator.geolocation) {
      setStatus("Geolocation is not supported. Enter an address instead.");
      return;
    }
    setStatus("Locating");
    navigator.geolocation.getCurrentPosition(
      (p) => setSite(siteAt(p.coords.latitude, p.coords.longitude)),
      () => setStatus("Location access denied. Enter an address instead.")
    );
  }

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setStatus("Searching");
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
        { headers: { "Accept-Language": "en" } }
      );
      const j = await r.json();
      if (j?.[0]) setSite(siteAt(parseFloat(j[0].lat), parseFloat(j[0].lon)));
      else setStatus("Address not found. Try a different search.");
    } catch {
      setStatus("Search failed. Check your connection.");
    }
  }

  // ── Step 1: choose the area ───────────────────────────
  if (!site) {
    return (
      <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-bg px-6">
        {/* Display_Type oversized background texture (Pattern 1), purely
            decorative — hidden from assistive technology per Requirement 10.6.
            Spec: pawaac-design-language-evolution — Task 20 (Planner_Page
            Section 1). Requirements: 4.1, 4.3, 9.3, 9.4, 9.5. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none text-center font-display text-[22vw] font-bold uppercase leading-none text-fg/[0.04]"
        >
          PLANNER
        </span>
        <div className="relative w-full max-w-md border border-line bg-surface/70 p-8 backdrop-blur-md">
          {CORNERS.map((c) => (
            <span key={c} className={`absolute h-2.5 w-2.5 border-fg/60 ${c}`} />
          ))}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] tracking-widest text-fg">[ SYS ]</span>
            <span className="h-px w-8 bg-fg/40" />
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
              Coverage Planner
            </span>
          </div>

          <h1 className="mt-5 font-display text-2xl font-bold text-fg">Choose your site</h1>
          <p className="mt-2 font-mono text-[12px] leading-relaxed text-muted">
            Allow location access, or enter the address of the property you want to protect.
            Then you will size the coverage circle and place docking stations.
          </p>

          <button
            onClick={requestLocation}
            className="mt-6 w-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-interactive"
          >
            Use my current location
          </button>

          <div className="my-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-muted">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={search} className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter an address or city"
              className="w-full border border-line bg-bg px-3 py-2.5 font-mono text-sm text-fg outline-none transition placeholder:text-muted focus:border-interactive"
            />
            <button
              type="submit"
              className="shrink-0 border border-fg/30 px-4 text-sm font-semibold text-fg transition hover:bg-fg/10"
            >
              Go
            </button>
          </form>

          {status && <p className="mt-3 font-mono text-[11px] text-fg">{status}</p>}
        </div>
      </div>
    );
  }

  // ── Step 2: design the docking system ─────────────────
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-bg">
      {/* Display_Type oversized background texture (Pattern 1), purely
          decorative — hidden from assistive technology per Requirement 10.6.
          Spec: pawaac-design-language-evolution — Task 20 (Planner_Page
          Section 1). Requirements: 4.1, 4.3, 9.3, 9.4, 9.5. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 z-[1] -translate-y-1/2 select-none text-center font-display text-[22vw] font-bold uppercase leading-none text-fg/[0.03]"
      >
        PLANNER
      </span>

      {/* Map/tool container — Reticle_Frame (P4) wraps the interactive map
          shell per Task 20. Existing SystemDesigner/MapCanvas coverage
          math, address search, and drag-reposition logic below are
          unchanged (Requirement 9.3-9.5); this only adds a decorative,
          aria-hidden corner-frame overlay. */}
      <div className="absolute inset-0 z-0">
        <MapCanvas
          site={site}
          docks={docks}
          patrolRadiusM={patrolRadiusM}
          onSiteChange={setSite}
          onDockMove={moveDock}
        />
        <ReticleFrame variant="dark" />
      </div>

      <div className="pointer-events-none absolute left-6 top-20 z-[400] flex items-center gap-3">
        <span className="font-mono text-[11px] tracking-widest text-fg">[ SYS ]</span>
        <span className="h-px w-8 bg-fg/40" />
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          Coverage Planner
        </span>
      </div>

      {/*
        Mobile height guard. Adding the second slider made this panel roughly 80px
        taller, which on a short phone viewport pushed "Request this deployment"
        off the bottom of the screen — the one control on this page that has to
        stay reachable. It now starts higher on mobile (clear of the 64px fixed
        header) and scrolls if it still does not fit, rather than clipping. The
        constraint is lifted at md, where there is room and where a scrollbar
        inside the panel would cut across the corner brackets.
      */}
      <div className="absolute right-4 top-20 z-[400] max-h-[calc(100dvh-6.5rem)] w-[300px] max-w-[calc(100vw-2rem)] overflow-y-auto md:top-28 md:max-h-none md:overflow-visible">
        <div className="relative border border-line bg-surface/85 p-4 backdrop-blur-md md:p-5">
          {CORNERS.map((c) => (
            <span key={c} className={`absolute h-2.5 w-2.5 border-fg/60 ${c}`} />
          ))}

          <div className="flex items-start justify-between">
            <h1 className="font-display text-xl font-bold text-fg">Design your coverage</h1>
            <button
              onClick={() => {
                setSite(null);
                setStatus("");
              }}
              className="mt-1 shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted transition hover:text-fg"
            >
              Change site
            </button>
          </div>
          <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted">
            Drag the center marker to move the zone, use the two sliders to size it, and drag
            any station to reposition it.
          </p>

          <div className="mt-5 flex items-end justify-between border-t border-line pt-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
              Survey area
            </span>
            <span className="font-mono text-sm text-fg">
              {areaKm2 >= 1 ? areaKm2.toFixed(1) : (areaKm2 * 100).toFixed(1)}
              <span className="ml-1 text-[9px] text-muted">{areaKm2 >= 1 ? "km2" : "ha"}</span>
            </span>
          </div>

          {/* Slider 1 — the outer perimeter circle. */}
          <div className="mt-4">
            <label
              htmlFor="site-radius"
              className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest"
            >
              <span className="text-muted">Coverage radius</span>
              <span className="text-fg">{site.radiusM} m</span>
            </label>
            <input
              id="site-radius"
              type="range"
              min={SITE_RADIUS_MIN_M}
              max={SITE_RADIUS_MAX_M}
              step={SITE_RADIUS_STEP_M}
              value={site.radiusM}
              onChange={(e) =>
                setSite((s) =>
                  s
                    ? { ...s, radiusM: clampSiteRadius(parseInt(e.target.value)) }
                    : s,
                )
              }
              className="mt-2 w-full accent-white"
            />
            <p className="mt-2 font-mono text-[9px] leading-relaxed text-muted">
              Sets the outer perimeter you want watched, measured outward from the center
              marker.
            </p>
          </div>

          {/* Slider 2 — how many drones. The count is now the input; the radius
              each one has to cover is the readout below. */}
          <div className="mt-4">
            <label
              htmlFor="drone-count"
              className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest"
            >
              <span className="text-muted">Drones</span>
              <span className="text-fg">{droneCount}</span>
            </label>
            <input
              id="drone-count"
              type="range"
              min={DRONE_COUNT_MIN}
              max={DRONE_COUNT_MAX}
              step={1}
              value={droneCount}
              onChange={(e) => setDroneCount(clampDroneCount(parseInt(e.target.value)))}
              className="mt-2 w-full accent-white"
            />
            <p className="mt-2 font-mono text-[9px] leading-relaxed text-muted">
              Stations are spread evenly across the zone, so more drones means each
              one covers less ground.
            </p>
          </div>

          <div className="mt-5 border-t border-line pt-4">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
              Patrol radius / drone
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-5xl font-bold text-white">
                {patrolRadiusM}
              </span>
              <span className="font-mono text-[11px] text-muted">m required</span>
            </div>
            <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted">
              The farthest any point in the zone sits from its nearest station, so
              the range each drone needs to leave no gap. Each station
              autonomously swaps drone batteries to sustain 24x7 coverage within
              that radius.
            </p>
          </div>

          <Link
            href="/contact"
            className="mt-5 block bg-white px-5 py-3 text-center text-sm font-semibold text-black transition hover:bg-interactive"
          >
            Request this deployment
          </Link>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[400] hidden items-center gap-4 border border-line bg-surface/80 px-4 py-2 font-mono text-[10px] text-muted backdrop-blur-md sm:flex">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-white" /> Docking station
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-fg/60 bg-fg/10" /> Drone coverage
        </span>
        <span className="flex items-center gap-1.5">
          {/* Swatch follows the zone: a dashed circle, not a dashed rectangle. */}
          <span className="h-3 w-3 rounded-full border border-dashed border-fg/60" /> Survey zone
        </span>
      </div>
    </div>
  );
}
