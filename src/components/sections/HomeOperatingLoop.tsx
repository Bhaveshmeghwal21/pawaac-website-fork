"use client";

// HomeOperatingLoop — the drone-as-first-responder (DFR) operating cycle.
//
// Added per the homepage UX audit. Rationale: sections 3-9 of the Homepage
// carried ~91 words of body copy BETWEEN them (8-13 words each), so a visitor
// scrolled ~12.9 viewports and came away with six numerals and seven
// headlines. The page read as a table of contents rather than an argument,
// and the single most persuasive thing the company has — the dock -> patrol
// -> detect -> alert -> respond cycle the whole pitch rests on — appeared
// nowhere on it. This section spends the scroll budget reclaimed by
// un-jacking Pinned_Spec_Sheet (see PinnedSpecSheet.tsx: ~4,500px freed).
//
// ── Content governance ──────────────────────────────────────────────────
//
// No numerals anywhere in this section, so OCP-02 (which gates
// mission/uptime-style figures) is not engaged at all. No customer, partner,
// unit, or location is named, so Requirement 8.1 and OCP-04 are untouched.
//
// Every capability sentence is scoped to what this site ALREADY publishes:
//   - Step 02's failsafe wording (GPS waypoint autonomy inside a geofence,
//     return to home on low battery or signal loss) restates
//     AutonomySafeguards.tsx's published safeguard list ("Battery Failsafe /
//     Auto RTH on low power", "Geofence / Virtual boundary protection",
//     "Return to Home / Signal loss recovery").
//   - Steps 03-05 restate the detection-to-dispatch framing already
//     published by AutonomyDispatch.tsx.
//   - The "notices rather than records" framing is the site owner's own
//     positioning, not a new claim.
//
// Disclosure (following this codebase's convention — cf.
// HomeAutonomyTeaser.tsx's "Concept interface (in development)" caption and
// AutonomyDispatch.tsx's persistent illustrative label): the eyebrow reads
// "Operating concept". A second, explicit closing line ("Describes how the
// system is designed to operate, not a record of fielded deployments.") also
// carried this disclosure below the loop-closing row; removed at the site
// owner's explicit request (current session) — the eyebrow alone now carries
// this section's disclosure.
//
// Punctuation: no hyphens or dashes in on-page copy, per the standing
// site-owner request applied across the Homepage.
//
// ── Motion: continuous lerp field (second approach) ─────────────────────
//
// The FIRST implementation of this section used an event-based choreography:
// one scrubbed master timeline drew the rail, and a ScrollTrigger watched its
// own progress and PLAYED five discrete per-step timelines as the sweep
// crossed each node's threshold. The site owner asked for a different
// approach, referring to StringTune (fiddle.digital). This is that rewrite.
//
// StringTune's primitives are StringProgress (each element's own viewport
// position as 0..1), StringLerp / StringLerpTracker / StringDelayLerpTracker
// (drive a value toward that progress at a per-element rate), StringGlide
// (inertia), StringMagnetic (cursor attraction) and StringSplit (text
// splitting). That composes into a materially different behaviour, which
// src/lib/motion/scrollLerpField.ts implements against the existing GSAP +
// Lenis stack:
//
//   1. NOTHING FIRES. There are no thresholds and no "has this run" latch.
//      Every animated element continuously eases toward a progress value
//      derived from its own position, so the whole section is symmetric:
//      scroll back up and it unwinds proportionally instead of staying
//      resolved. The previous version could only ever resolve forward.
//
//   2. STAGGER COMES FROM DAMPING, NOT FROM AUTHORED DELAYS. Each element
//      carries its own `ease` constant (StringLerpTracker). Because the five
//      steps sit in ONE ROW on desktop they share a vertical position, so
//      position alone cannot stagger them — the cascade instead comes from
//      per-step damping plus per-step progress windows. Sibling elements
//      resolve at different rates without a single hardcoded delay.
//
//   3. VELOCITY IS PART OF THE OUTPUT (StringGlide). Easing toward a moving
//      target naturally opens a gap when scrolling fast and closes it on
//      stop, and the step copy carries an explicit velocity-proportional lag.
//      Scroll speed becomes visible, which suits an instrument readout.
//
//   4. THE DECODE IS CONTINUOUS, NOT A TIMED EFFECT. The step index
//      scrambles as a pure function of progress: unresolved digits re-roll
//      only while the value is actually moving, and freeze the moment the
//      reader stops. So the scramble intensity IS the scroll motion, and it
//      never flickers at a parked scroll position. The first version used
//      ScrambleTextPlugin on a one-shot timeline, which could not reverse and
//      was a timed event rather than a scroll-derived value.
//
//   5. NODES ARE COUPLED TO THE VISIBLE LINE. Rather than each node owning an
//      independent trigger, the rail's own damped progress drives all five
//      node states, so a node can never light before the line reaches it
//      regardless of scroll speed or direction. Continuous overshoot comes
//      from shaping the value through `gsap.parseEase("back.out(3)")` instead
//      of running a tween — an eased curve evaluated per frame, so it reads
//      as acquiring rather than appearing while staying reversible.
//
//   6. MAGNETIC NODES (StringMagnetic). The nodes drift slightly toward the
//      cursor when it is near the rail, so the graphic responds to the reader
//      rather than only to scroll. Fine-pointer only; skipped entirely for
//      coarse pointers, where there is no hover state to speak of.
//
// Why the StringTune MODEL and not the StringTune PACKAGE: the library ships
// its own smooth-scroll layer, which would sit alongside Lenis and compete
// for the same scroll ownership, and it is early-access from a small team.
// This site already has GSAP 3.15 with the full plugin set plus Lenis wired
// into ScrollTrigger in LenisProvider.tsx, and `gsap.ticker` is already the
// clock Lenis runs on — so implementing the model costs one small module and
// no new dependency or scroll-ownership conflict. If the owner wants the
// actual package, that is a separate call worth making deliberately.
//
// Deliberately NOT animating `filter: blur()` across every element: blur is
// paint-bound rather than compositor-bound, and this section can have ~25
// tracked elements on screen at once. Blur is limited to the five step names;
// everything else resolves through transform, opacity and mask clipping,
// which stay on the compositor.
//
// Reduced motion (Requirement 9.8): the entire field lives inside a
// `gsap.matchMedia()` context keyed to `(prefers-reduced-motion:
// no-preference)`. Under `reduce` NOTHING is created — no field, no
// SplitText, and critically no hidden start states, since every hidden state
// is written by JS and never by a CSS class. A reduced-motion or no-JS
// visitor gets the section fully visible with unsplit text.
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import {
  createScrollLerpField,
  type LerpTrackConfig,
  type ScrollLerpField,
} from "@/lib/motion/scrollLerpField";

const STEPS = [
  {
    index: "01",
    name: "Dock",
    body:
      "Aircraft sit docked and charging at the station or facility they cover. No separate launch site, no crew callout to get airborne.",
  },
  {
    index: "02",
    name: "Patrol",
    body:
      "Scheduled and on demand loops fly on GPS waypoint autonomy inside a geofence, with return to home on low battery or loss of signal.",
  },
  {
    index: "03",
    name: "Detect",
    body:
      "Onboard vision classifies and tracks entities during the flight, so what comes back is events to act on rather than hours of footage to review.",
  },
  {
    index: "04",
    name: "Alert",
    body:
      "An operator gets a located alert and taps in for live video only when there is something worth looking at.",
  },
  {
    index: "05",
    name: "Respond",
    body:
      "The aircraft holds overwatch while responders move, then returns to the dock and recharges for the next loop.",
  },
];

const clamp01 = gsap.utils.clamp(0, 1);
const DIGITS = "0123456789";
/** Radius in px within which a node drifts toward the cursor. */
const MAGNET_RADIUS = 130;
const MAGNET_MAX_PULL = 7;
/**
 * How much of the rail's 0..1 progress a single node takes to go from dark to
 * fully acquired. Node start positions are compressed into
 * `1 - NODE_WINDOW` so the LAST node still completes exactly at progress 1 —
 * spacing them evenly across the full 0..1 range instead would put the final
 * node's window at [1, 1.16], which progress can never reach, leaving it
 * permanently dark. (Caught in verification: node 05 never lit.)
 */
const NODE_WINDOW = 0.16;

export default function HomeOperatingLoop() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // Defensive guard matching usePrefersReducedMotion.ts and SkyScenery.tsx:
    // gsap.matchMedia probes window.matchMedia, which jsdom lacks.
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    gsap.registerPlugin(SplitText);

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(root);
      const rail = q("[data-rail]")[0] as HTMLElement | undefined;
      const glyph = q("[data-loop-glyph]")[0] as HTMLElement | undefined;
      const stepEls = q("[data-step]") as HTMLElement[];
      const backOut = gsap.parseEase("back.out(3)");

      // ── Cursor tracking for the magnetic nodes (StringMagnetic) ──────
      const finePointer = window.matchMedia("(pointer: fine)").matches;
      const cursor = { x: -9999, y: -9999 };
      const onPointerMove = (e: PointerEvent) => {
        cursor.x = e.clientX;
        cursor.y = e.clientY;
      };
      if (finePointer) {
        window.addEventListener("pointermove", onPointerMove, { passive: true });
      }

      // ── Text splitting (StringSplit) ─────────────────────────────────
      // autoSplit re-splits on resize and on webfont load (Space Grotesk and
      // Inter are next/font, so first paint reflows). Every re-split produces
      // brand new line elements, so the field has to be rebuilt around them —
      // hence the debounced rebuild rather than a one-time build.
      let field: ScrollLerpField | null = null;
      let rebuildQueued = false;

      const splits = (q("[data-split]") as HTMLElement[]).map((el) =>
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit: () => queueRebuild(),
        }),
      );

      function queueRebuild() {
        if (rebuildQueued) return;
        rebuildQueued = true;
        // Defer so both split targets finish before one rebuild covers them.
        window.setTimeout(() => {
          rebuildQueued = false;
          build();
        }, 0);
      }

      /** Masked line rise: the line translates up out of its own clip. */
      function lineTrack(line: HTMLElement, ease: number, order: number): LerpTrackConfig {
        line.style.willChange = "transform, opacity";
        return {
          el: line,
          ease,
          from: 0.95 - order * 0.012,
          to: 0.62 - order * 0.012,
          apply(p) {
            line.style.transform = `translate3d(0, ${((1 - p) * 108).toFixed(2)}%, 0) rotate(${((1 - p) * 1.5).toFixed(2)}deg)`;
            line.style.opacity = String(clamp01(p * 1.8));
          },
        };
      }

      function build() {
        field?.destroy();

        const configs: LerpTrackConfig[] = [];

        // True for the single shared row (`lg:grid-cols-5`, 1024px+),
        // false for the stacked base/sm layouts where each step is its own
        // full width block scrolled past individually. Recomputed on every
        // rebuild (queueRebuild fires on resize via SplitText's autoSplit,
        // see above) so a live resize across `lg` re-derives it rather than
        // freezing whatever was true on first paint.
        const isRow = window.innerWidth >= 1024;

        // Heading and lead lines. Each line gets slightly heavier damping
        // than the one before, so later lines trail — the stagger emerges
        // from the damping constants rather than from authored delays.
        let lineOrder = 0;
        for (const split of splits) {
          const lines = (split.lines as HTMLElement[]) ?? [];
          lines.forEach((line, i) => {
            configs.push(lineTrack(line, 0.13 - Math.min(0.05, i * 0.012), lineOrder));
            lineOrder += 1;
          });
        }

        // ── The rail, which also drives every node ────────────────────
        if (rail) {
          rail.style.willChange = "transform";
          const nodes = stepEls
            .map((s) => s.querySelector("[data-node]") as HTMLElement | null)
            .filter((n): n is HTMLElement => Boolean(n));
          const nodeStates = nodes.map((el) => {
            el.style.willChange = "transform, opacity";
            // Per-node magnetic offset, lerped so it eases in and out rather
            // than snapping to the cursor.
            return { el, mx: 0, my: 0 };
          });
          // Start offset per node, compressed so the last node's window ends
          // at exactly progress 1 (see NODE_WINDOW).
          const nodeStride =
            nodes.length > 1 ? (1 - NODE_WINDOW) / (nodes.length - 1) : 0;

          // Retimed alongside the per-step text schedule below (see that
          // comment for the measured root cause). Left at the old 0.34, the
          // rail would now complete at scrollY~978 while the retimed text
          // finishes at scrollY~850 — a 128px gap where step 5's copy reads
          // sharp while its node is still visibly dim/small, inverting "a node
          // can never light before the line reaches it" into the reverse.
          //
          // `to` is set to match step 5's OWN `to` (0.50) exactly, so the rail
          // finishes its sweep and the last node fully acquires at the same
          // scroll position the last step's copy does — measured at
          // scrollY=850, heading top=107px, clear of the 64px nav. An earlier
          // pass shifted this by the same flat +0.12 used below (giving
          // `to=0.46`), which measured out to just 11px of heading clearance —
          // technically inside the safe zone but thin enough that scroll
          // jitter or a slightly taller heading (a copy edit, a font swap)
          // could tip it under the nav. Matching step 5 exactly removes that
          // margin risk instead of trusting an arbitrary buffer.
          configs.push({
            el: rail,
            ease: 0.14,
            from: 1.02,
            to: 0.5,
            apply(p) {
              rail.style.transform = `scaleX(${p.toFixed(4)})`;
              for (let i = 0; i < nodeStates.length; i++) {
                const n = nodeStates[i];
                // How far the line has reached THIS node, 0..1 over a short
                // window, then shaped through back.out for overshoot.
                const local = clamp01((p - i * nodeStride) / NODE_WINDOW);

                let targetX = 0;
                let targetY = 0;
                if (finePointer && local > 0.5) {
                  const r = n.el.getBoundingClientRect();
                  const dx = cursor.x - (r.left + r.width / 2);
                  const dy = cursor.y - (r.top + r.height / 2);
                  const dist = Math.hypot(dx, dy);
                  if (dist < MAGNET_RADIUS && dist > 0.001) {
                    const pull = (1 - dist / MAGNET_RADIUS) * MAGNET_MAX_PULL;
                    targetX = (dx / dist) * pull;
                    targetY = (dy / dist) * pull;
                  }
                }
                n.mx += (targetX - n.mx) * 0.12;
                n.my += (targetY - n.my) * 0.12;

                n.el.style.transform = `translate3d(${n.mx.toFixed(2)}px, ${n.my.toFixed(2)}px, 0) scale(${backOut(local).toFixed(3)})`;
                n.el.style.opacity = String(local);
              }
            },
          });
        }

        // ── Per-step copy ─────────────────────────────────────────────
        stepEls.forEach((step, i) => {
          const idx = step.querySelector("[data-index]") as HTMLElement | null;
          const name = step.querySelector("[data-name]") as HTMLElement | null;
          const body = step.querySelector("[data-body]") as HTMLElement | null;

          // Progress windows shift later per step, and damping gets heavier
          // per step, so the row resolves left to right behind the line.
          //
          // Site-owner report (live, 1265px layout): "the text is not
          // appearing for that to appear i have to scroll more but that will
          // remove the heading and upper text." Confirmed by measuring the
          // real DOM rather than guessing: the heading (absTop 957) sits only
          // 293px above the step row (absTop 1250), and the ORIGINAL last-step
          // window (`to = 0.38`) only reached progress 1 once the row's own
          // top had scrolled up to 38% of a 800px viewport (304px) — which
          // requires scrollY=946, by which point the heading's top has
          // scrolled to just 11px, underneath the persistent 64px nav. So the
          // step 5 copy could only ever fully resolve once the heading it
          // depends on for context was already gone.
          //
          // Both `from` and `to` are raised by a flat +0.12 (0.93->1.05,
          // 0.6->0.72), keeping the existing 0.33 window width and the
          // existing per-step stride (`i * 0.055`) that gives the row its
          // left-to-right cascade — only WHEN the whole schedule sits within
          // the scroll timeline moves. With `to` at 0.50 for the last step
          // (i=4), full reveal now completes at scrollY=850, where the
          // heading's top is still at 107px — comfortably clear of the nav,
          // with room to spare. This is the same fix already applied to
          // PinnedSpecSheet.tsx for the identical symptom on the spec rail.
          //
          // Below `lg` this row-based stagger does not apply (see `isRow`
          // above): the site owner reported "we have to work a lot on
          // mobile...may have to redesign positions," and measuring the
          // live 390x844 layout (hard reload) showed why the row formula
          // was actively wrong there rather than just imprecise. Below
          // `lg` the grid has no column count at base width, so all five
          // steps stack full width, one per row, roughly 200px apart
          // (measured stepAbsTop deltas: 203, 202, 202, 181px) — nothing
          // like a shared row. Reusing `i * 0.055` there made LATER steps
          // need MORE additional scroll past their OWN natural entry
          // (smaller `to` -> later completion), compounding on top of them
          // already sitting much further down the page: step 4 (Respond)
          // needed scrollY=1649 to fully resolve while its own top only
          // reached absTop=2071 — two thirds of a screen height of scroll
          // AFTER the block had already appeared before its text read
          // clearly.
          //
          // Every step below `lg` instead shares one window, sized to a
          // block's own natural entry rather than to a row position that
          // does not exist at this layout: `to=0.55` completes the reveal
          // once a block's own top has scrolled to a little past half the
          // viewport height, i.e. shortly after it is comfortably on
          // screen. That yields the same ~380px of post-entry scroll for
          // EVERY step regardless of index (verified against the measured
          // absTop values above), instead of a gap that grows with each
          // step.
          let from: number;
          let to: number;
          if (isRow) {
            from = 1.05 - i * 0.055;
            to = 0.72 - i * 0.055;
          } else {
            from = 0.9;
            to = 0.55;
          }
          const stepEase = 0.16 - i * 0.012;

          if (idx) {
            const target = idx.dataset.value ?? "";
            let printed = "";
            configs.push({
              el: idx,
              ease: stepEase,
              from,
              to,
              apply(p, ctx) {
                idx.style.opacity = String(clamp01(p * 2));
                const locked = Math.floor(p * target.length * 1.0001);
                if (locked >= target.length) {
                  if (printed !== target) {
                    idx.textContent = target;
                    printed = target;
                  }
                  return;
                }
                // Freeze the scramble whenever the value has stopped moving,
                // so a parked scroll position never flickers forever.
                if (ctx.settled) return;
                let out = "";
                for (let c = 0; c < target.length; c++) {
                  out +=
                    c < locked ? target[c] : DIGITS[(Math.random() * 10) | 0];
                }
                idx.textContent = out;
                printed = out;
              },
            });
          }

          if (name) {
            name.style.willChange = "transform, opacity, filter";
            configs.push({
              el: name,
              ease: stepEase,
              from,
              to,
              apply(p, ctx) {
                // Velocity lag (StringGlide): the copy sits a little further
                // behind while the reader is moving fast, and closes up when
                // they slow down.
                const lag = gsap.utils.clamp(-10, 10, ctx.velocity * 0.22);
                const y = (1 - p) * 65 + lag * (1 - p);
                name.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`;
                name.style.opacity = String(clamp01(p * 1.7));
                // The only per-frame blur in this section — five elements.
                name.style.filter =
                  p > 0.995 ? "none" : `blur(${((1 - p) * 9).toFixed(2)}px)`;
              },
            });
          }

          if (body) {
            body.style.willChange = "transform, opacity";
            configs.push({
              // Lighter damping than the name above, so the body trails it.
              el: body,
              ease: stepEase - 0.045,
              from,
              to,
              apply(p, ctx) {
                const lag = gsap.utils.clamp(-14, 14, ctx.velocity * 0.3);
                const y = (1 - p) * 70 + lag * (1 - p);
                body.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`;
                body.style.opacity = String(clamp01(p * 1.6));
              },
            });
          }
        });

        // ── Loop glyph: one full revolution across the section ─────────
        if (glyph) {
          glyph.style.willChange = "transform";
          configs.push({
            el: glyph,
            ease: 0.1,
            from: 1.0,
            to: 0.3,
            apply(p) {
              glyph.style.transform = `rotate(${(p * 360).toFixed(2)}deg)`;
            },
          });
        }

        field = createScrollLerpField(configs);
      }

      build();

      return () => {
        if (finePointer) window.removeEventListener("pointermove", onPointerMove);
        field?.destroy();
        // matchMedia reverts the gsap state it created, but SplitText's DOM
        // surgery and its resize/font listeners need an explicit revert.
        splits.forEach((s) => s.revert());
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section className="relative overflow-hidden bg-bg/50 px-6 py-24 md:py-32">
      <div ref={rootRef} className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="label">Operating concept</p>
          <h2 data-split className="mt-3 text-heading font-display text-fg">
            Surveillance that notices, not just records
          </h2>
          {/* Lead-scale supporting copy (not the 16px text-muted used
              elsewhere on the page): this is the one paragraph on the
              Homepage that has to actually land, so it is sized up and set in
              text-fg rather than the muted grey every other section uses. */}
          <p
            data-split
            className="mt-5 max-w-2xl text-[1.0625rem] font-body leading-relaxed text-fg/90 md:text-xl"
          >
            A conventional camera network records everything and depends on
            someone watching it. Pawaac turns that around: the system spends
            its effort noticing, so your people can spend theirs responding.
          </p>
        </div>

        {/* Numbered instrument rail. The dim base rule lives on this
            container at lg (where the five steps sit in one row); below lg
            each step carries its own top rule, so the two never double up on
            the first cell.

            gap-y is tightened below lg (7 -> 40px at lg, matching the
            original) as part of the mobile compaction pass below: with five
            steps stacked full width instead of sharing one row, the vertical
            gap multiplies by up to four gaps in a row, so trimming it here
            is the single biggest lever on the stack's total height. See the
            per-step block and the isRow reveal-schedule branch below for the
            rest of that pass. */}
        <div className="relative mt-14 grid gap-x-6 gap-y-7 sm:grid-cols-2 lg:mt-16 lg:grid-cols-5 lg:gap-y-10 lg:border-t lg:border-line">
          {/* The sweep. Sits on the dim base rule and scales on x, so it
              reads as the rule lighting up from the left. Purely decorative,
              and only rendered at lg where the continuous rail exists. */}
          <span
            aria-hidden="true"
            data-rail
            className="pointer-events-none absolute -top-px left-0 hidden h-px w-full origin-left bg-fg lg:block"
          />

          {STEPS.map((step) => (
            <div
              key={step.index}
              data-step
              className="relative h-full border-t border-line pt-5 lg:border-t-0 lg:pt-6"
            >
              {/* Node straddling the rail. Centred on the rule with a `top`
                  offset rather than `-translate-y-1/2` on purpose: the motion
                  field writes `transform` on this element every frame, and
                  Tailwind v4 compiles `-translate-y-1/2` to the INDEPENDENT
                  `translate` CSS property, which composes on top of
                  `transform` instead of being replaced by it — so the two
                  would both apply and the node would sit 2.5px low. Keeping
                  the centring in `top` leaves `transform` with a single
                  owner. Decorative HUD cue consistent with
                  ReticleFrame/HudFrame. lg only, with the rail. */}
              <span
                aria-hidden="true"
                data-node
                className="absolute left-0 top-[-3px] hidden h-[5px] w-[5px] bg-fg lg:block"
              />

              {/* Index and name share a row below lg, where every step is
                  its own full width block: pairing "01" beside "Dock" reads
                  as a numbered list marker and removes a whole text line's
                  worth of height per step (part of the same mobile
                  compaction pass as the gap-y trim above and the isRow
                  reveal-schedule branch below). At lg they revert to the
                  original stacked treatment, matching the shared row's
                  established rhythm.

                  The overflow-hidden wrapper is what makes the name RISE OUT
                  of the rule rather than fade in place; it is inert under
                  reduced motion since the inner element's transform is only
                  ever written by the matchMedia branch. */}
              <div className="flex items-center gap-3 lg:block">
                <p
                  data-index
                  data-value={step.index}
                  className="technical-data text-muted"
                >
                  {step.index}
                </p>
                <div className="overflow-hidden lg:mt-3">
                  <h3
                    data-name
                    className="font-display text-2xl font-bold tracking-[-0.01em] text-fg"
                  >
                    {step.name}
                  </h3>
                </div>
              </div>
              <div className="mt-2 overflow-hidden lg:mt-3">
                <p
                  data-body
                  className="text-[13px] font-body leading-relaxed text-fg/85 md:text-sm"
                >
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Loop-closing row: the point of the cycle is that step 05 returns
            to step 01. The second, explicit disclosure line that used to sit
            here was removed at the site owner's explicit request (current
            session) — see the file header's Content governance note. */}
        <div className="mt-12 border-t border-line pt-6">
          <p className="flex items-start gap-3 text-body font-body text-fg/90">
            <span
              aria-hidden="true"
              data-loop-glyph
              className="inline-block font-mono text-fg"
            >
              &#8635;
            </span>
            The cycle repeats without a pilot at the controls, and an operator
            stays in the loop for escalation by design.
          </p>
        </div>

        <a
          href="/autonomy"
          className="group mt-8 inline-flex items-center gap-2 font-mono text-sm text-fg"
        >
          See the autonomy stack
          <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
        </a>
      </div>
    </section>
  );
}
