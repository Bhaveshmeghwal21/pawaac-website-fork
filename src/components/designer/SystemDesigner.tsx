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

export const DEFAULT_PATROL_RADIUS_M = 150;
export const PATROL_RADIUS_MIN_M = 50;
export const PATROL_RADIUS_MAX_M = 400;
export const PATROL_RADIUS_STEP_M = 25;

// Hard ceiling on how many stations are placed, so an extreme slider
// combination (a 1500 m zone at a 50 m patrol radius asks for several hundred)
// cannot bury the map under markers. The previous lattice model had the same
// guard as `Math.min(15, …)` on its row and column counts, which capped it at
// 225 silently. This cap is surfaced instead: `planDocks` reports `capped`, and
// the readout renders "120+" rather than a flat 120, so the number on screen is
// never a smaller figure than the model actually asked for.
export const MAX_DOCKS = 120;

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

export type DockPlan = { docks: Dock[]; capped: boolean };

// Concentric-ring fill of the site circle.
//
// One station at the centre, then rings at radial pitch 2r out to the point
// where the outermost ring's own coverage reaches the perimeter. Each ring
// holds as many stations as fit at the same 2r pitch along its circumference,
// and even-numbered rings are rotated by half a step so stations do not line up
// into radial spokes.
//
// The outermost ring is clamped to the perimeter itself. Without that clamp the
// last ring can land outside the zone (a 1500 m site at a 400 m patrol radius
// wants rings at 800 m and 1600 m), which is defensible as coverage maths but
// reads as a planner suggesting stations on someone else's land. Clamping is
// safe because only the last ring can ever exceed the radius — ring n-1 sits at
// (n-1)·2r, which is strictly inside R by the definition of the ring count — so
// no two rings collapse onto the same radius, and the radial coverage stays
// continuous either way.
export function planDocks(site: Site, patrolRadiusM: number): DockPlan {
  const r = Math.max(1, patrolRadiusM);
  const pitch = 2 * r;

  // A patrol radius at or above the site radius is covered by one station, so
  // the ring count floors at 0 rather than going negative.
  const ringCount = Math.max(0, Math.ceil((site.radiusM - r) / pitch));

  const docks: Dock[] = [{ id: 0, lat: site.lat, lng: site.lng }];
  let id = 1;

  for (let ring = 1; ring <= ringCount; ring++) {
    const ringRadius = Math.min(ring * pitch, site.radiusM);
    const count = Math.max(1, Math.round((2 * Math.PI * ringRadius) / pitch));
    const offset = ring % 2 === 0 ? Math.PI / count : 0;

    for (let k = 0; k < count; k++) {
      if (docks.length >= MAX_DOCKS) return { docks, capped: true };
      const bearing = offset + (k / count) * 2 * Math.PI;
      const p = destinationPoint(site.lat, site.lng, ringRadius, bearing);
      docks.push({ id: id++, lat: p.lat, lng: p.lng });
    }
  }

  return { docks, capped: false };
}

export default function SystemDesigner() {
  const [site, setSite] = useState<Site | null>(null);
  const [patrolRadiusM, setPatrolRadiusM] = useState(DEFAULT_PATROL_RADIUS_M);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const areaKm2 = site ? siteAreaM2(site) / 1e6 : 0;

  // The station layout is fully derived from the site and the patrol radius.
  //
  // This used to be `useState` written from inside a `useEffect`, which
  // `react-hooks/set-state-in-effect` reports as an error — it renders once
  // with a stale layout, then immediately re-renders with the real one, and the
  // subtree being re-rendered here contains the Leaflet map. Deriving it during
  // render removes that second pass. User drags are kept separately in `moved`
  // and layered on top, which preserves the previous behaviour that
  // re-generating the layout discards any hand placement.
  const plan = useMemo<DockPlan>(
    () => (site ? planDocks(site, patrolRadiusM) : { docks: [], capped: false }),
    [site, patrolRadiusM],
  );

  const [moved, setMoved] = useState<Record<number, Dock>>({});
  // Reset hand placements when a new layout is generated. Adjusting state during
  // render (rather than in an effect) is the pattern React documents for
  // "state derived from a changing input": it happens before the component's
  // children render, so no extra pass reaches the map.
  const [movedFor, setMovedFor] = useState(plan);
  if (movedFor !== plan) {
    setMovedFor(plan);
    setMoved({});
  }

  const docks = useMemo(
    () => plan.docks.map((d) => moved[d.id] ?? d),
    [plan, moved],
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

          {/* Slider 2 — the per-station patrol radius. */}
          <div className="mt-4">
            <label
              htmlFor="patrol-radius"
              className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest"
            >
              <span className="text-muted">Patrol radius / dock</span>
              <span className="text-fg">{patrolRadiusM} m</span>
            </label>
            <input
              id="patrol-radius"
              type="range"
              min={PATROL_RADIUS_MIN_M}
              max={PATROL_RADIUS_MAX_M}
              step={PATROL_RADIUS_STEP_M}
              value={patrolRadiusM}
              onChange={(e) => setPatrolRadiusM(parseInt(e.target.value))}
              className="mt-2 w-full accent-white"
            />
            <p className="mt-2 font-mono text-[9px] leading-relaxed text-muted">
              Longer drone range means each station covers more ground, so fewer stations
              are needed.
            </p>
          </div>

          <div className="mt-5 border-t border-line pt-4">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
              Docking stations
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-5xl font-bold text-white">
                {docks.length}
                {plan.capped ? "+" : ""}
              </span>
              <span className="font-mono text-[11px] text-muted">suggested</span>
            </div>
            <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted">
              Each station autonomously charges and swaps drone batteries to sustain 24x7
              coverage within its radius.
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
