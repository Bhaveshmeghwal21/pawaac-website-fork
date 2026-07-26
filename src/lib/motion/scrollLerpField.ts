// scrollLerpField — a continuous per-element scroll-progress field with
// per-element damping.
//
// Written after reviewing StringTune (fiddle.digital) at the site owner's
// request, as a deliberate alternative to the event-based choreography in the
// first version of HomeOperatingLoop.tsx. This implements StringTune's model
// rather than adding the library — see the note at the bottom of this comment
// for why.
//
// ── The model ────────────────────────────────────────────────────────────
//
// StringTune's core primitives are StringProgress (an element's own position
// in the viewport, expressed 0..1), StringLerp / StringLerpTracker /
// StringDelayLerpTracker (drive a value toward that progress at a
// per-element rate), and StringGlide (inertia). Composed, they give a very
// different behaviour from a scrubbed master timeline:
//
//   - EVERY element computes its own progress from its own position. There is
//     no shared clock and no authored stagger — elements naturally trail each
//     other because they occupy different positions and carry different
//     damping constants.
//   - NOTHING FIRES. There are no thresholds and no "has this run yet" latch,
//     so the motion is fully continuous and symmetric: scroll back up and it
//     unwinds proportionally instead of staying resolved.
//   - VELOCITY IS PART OF THE OUTPUT. Because each element eases toward a
//     moving target, fast scrolling naturally opens a gap between target and
//     current, and stopping closes it. Scroll speed becomes visible.
//
// Why this is the better fit for a scroll-linked instrument graphic: the
// event-based version had to special-case every way a visitor can arrive
// mid-section (scroll restoration, hash link, back-navigation) by
// re-evaluating thresholds on refresh, and could never un-resolve. Here that
// entire class of problem does not exist — progress is a pure function of
// current layout position, so any arrival state is automatically correct on
// the first frame.
//
// ── Performance notes ────────────────────────────────────────────────────
//
// - Element offsets are measured ONCE per layout (on create and on resize)
//   and cached as absolute document positions. The per-frame path reads only
//   `window.scrollY` and does zero layout reads, so this never thrashes
//   layout no matter how many tracks are registered.
// - The loop runs on `gsap.ticker`, which LenisProvider.tsx already drives
//   and which already carries Lenis's smoothing — so this stays frame-synced
//   with the site's scroll rather than fighting it with a second rAF loop.
// - Damping is frame-rate normalised, so a 120Hz display does not resolve
//   roughly twice as fast as a 60Hz one.
// - `apply` callbacks are expected to write via `gsap.quickSetter` or direct
//   style writes. Prefer transform/opacity; avoid animating `filter` on more
//   than a handful of elements per frame, since blur is paint-bound rather
//   than compositor-bound.
import gsap from "gsap";

export type LerpTrackConfig = {
  el: HTMLElement;
  /**
   * Damping per frame at 60fps, 0..1. Lower trails further behind the
   * scroll; higher snaps closer to it. This is the per-element knob that
   * replaces an authored stagger — give sibling elements slightly different
   * values and they resolve at different rates on their own.
   */
  ease: number;
  /**
   * Viewport fraction (0 = top of viewport, 1 = bottom) at which this
   * element's progress reads 0, measured against the element's own top edge.
   * Defaults to 0.92 — just inside the bottom of the viewport.
   */
  from?: number;
  /** Viewport fraction at which progress reads 1. Defaults to 0.55. */
  to?: number;
  /**
   * Receives the damped progress plus frame context. `velocity` is in
   * px/frame, normalised to 60fps, and signed (positive scrolling down).
   */
  apply: (progress: number, ctx: { velocity: number; settled: boolean }) => void;
};

type Track = LerpTrackConfig & {
  from: number;
  to: number;
  absTop: number;
  current: number;
  previous: number;
};

export type ScrollLerpField = {
  /** Re-measure cached element offsets. Call after a layout change. */
  refresh: () => void;
  /** Stop the loop and remove listeners. */
  destroy: () => void;
};

const clamp01 = gsap.utils.clamp(0, 1);

export function createScrollLerpField(configs: LerpTrackConfig[]): ScrollLerpField {
  const tracks: Track[] = configs.map((c) => ({
    ...c,
    from: c.from ?? 0.92,
    to: c.to ?? 0.55,
    absTop: 0,
    current: 0,
    previous: 0,
  }));

  function refresh() {
    // The single layout read, amortised across every track.
    const scrollY = window.scrollY;
    for (const t of tracks) {
      t.absTop = t.el.getBoundingClientRect().top + scrollY;
    }
  }

  let lastScrollY = window.scrollY;
  let velocity = 0;

  function tick(_time: number, deltaMs: number) {
    const vh = window.innerHeight;
    const scrollY = window.scrollY;

    // Frame-rate normalisation factor: 1 at 60fps.
    const frames = Math.min(4, Math.max(0.2, deltaMs / (1000 / 60)));

    const rawVelocity = (scrollY - lastScrollY) / frames;
    lastScrollY = scrollY;
    // Smooth the velocity so a single jumpy frame does not spike it.
    velocity += (rawVelocity - velocity) * 0.18;

    for (const t of tracks) {
      const top = t.absTop - scrollY;
      const span = (t.from - t.to) * vh;
      const target = span === 0 ? 1 : clamp01((t.from * vh - top) / span);

      // Frame-rate-independent exponential smoothing toward the target.
      const factor = 1 - Math.pow(1 - t.ease, frames);
      t.current += (target - t.current) * factor;

      const moved = Math.abs(t.current - t.previous);
      const settled = moved < 0.0004;
      t.previous = t.current;

      t.apply(t.current, { velocity, settled });
    }
  }

  refresh();
  // Prime one frame so elements start at their correct position-derived state
  // rather than at 0 — this is what makes deep links and scroll restoration
  // land correctly with no extra bookkeeping.
  for (const t of tracks) {
    const top = t.absTop - window.scrollY;
    const span = (t.from - t.to) * window.innerHeight;
    t.current = span === 0 ? 1 : clamp01((t.from * window.innerHeight - top) / span);
    t.previous = t.current;
    t.apply(t.current, { velocity: 0, settled: true });
  }

  gsap.ticker.add(tick);
  window.addEventListener("resize", refresh);

  return {
    refresh,
    destroy() {
      gsap.ticker.remove(tick);
      window.removeEventListener("resize", refresh);
    },
  };
}
