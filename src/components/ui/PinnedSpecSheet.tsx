"use client";

// Spec: pawaac-design-language-evolution — Task 7 (Pinned_Spec_Sheet)
// Requirements: 4.4, 7.2, 8.3, 9.8
// Design: design.md -> Shared Components -> Pinned_Spec_Sheet;
//         Reduced-Motion Fallback Matrix
//
// Renders a set of confirmed hardware specs as a single-screen spec rail:
// one responsive grid, every panel visible at once, aligned to the site's
// `max-w-7xl` content grid. Each panel shows exactly one large standalone
// Display-scale numeral (never inline in a sentence, per Requirement 4.4),
// a Technical_Data unit/label above it, and at most one supporting sentence
// (<=140 chars) below.
//
// Where a page shows specs for more than one airframe, render one instance per
// airframe and pass `eyebrow` — see its doc comment below for why mixing both
// platforms into a single ungrouped rail is a correctness problem and not just
// an ordering preference.
//
// Numeral slot: real numerals are only populated once a linked
// Change_Proposal is recorded `approved` (Requirement 7.2); until then,
// callers should leave `numeral` empty/undefined and this component renders
// an explicit "Pending confirmation" Technical_Data placeholder rather than
// a fabricated figure (Requirement 8.3).
//
// ── Scroll-jacking removed (homepage UX audit) ───────────────────────────
//
// This component previously had three layout branches: a sticky-pinned,
// horizontally-translating filmstrip (`ScrollJackedTrack`) for desktop, a
// plain vertical `StaticStack` for `prefers-reduced-motion`, and a 2-column
// `PanelGrid` below md. All three are collapsed into the single grid below.
//
// Why the filmstrip is gone rather than just tuned:
//
//   1. It clipped panel text at BOTH viewport edges mid-transition on
//      DESKTOP, not only on mobile. Confirmed live at 1440x900: a numeral
//      was cut off at the left edge ("00+" of "700+") while the next
//      panel's numeral and sentence were simultaneously cut at the right
//      ("45", "Knots of all w..."). A prior note in PAWAAC_CONTEXT.md
//      recorded desktop as "isn't clipping anything" — that was inaccurate;
//      `min-w-full` made every panel exactly viewport-width, so any
//      intermediate translateX position necessarily bled two half-panels off
//      both edges.
//   2. It cost `panels.length * 100vh` of scroll. On the Homepage that was
//      5400px of an 11582px page — the spec section alone was 51% of the
//      page, and 1.5x the height of all seven other content sections
//      combined, to deliver six numerals.
//   3. Panels used a bare `px-6` on a full-viewport-width slide, so the
//      numerals sat 24px from the viewport edge while every other section
//      aligns to `mx-auto max-w-7xl px-6`. The specs visibly broke the
//      page's left alignment grid.
//
// Naming note: the exported name is kept as `PinnedSpecSheet` so the three
// existing call sites (HomeSpecSheet, HawkAISpecs, SentrivionSpecs) and the
// design-doc term Pinned_Spec_Sheet still resolve. Nothing pins any more —
// a rename to `SpecRail` is a reasonable follow-up.
//
// ── Motion: continuous lerp field ────────────────────────────────────────
//
// Site-owner request: apply the same treatment built for HomeOperatingLoop.
// The panels previously used Reveal_On_Scroll (a framer-motion clip-path
// wipe) per cell, which is the plain fade this was meant to replace.
//
// Same model, same engine — src/lib/motion/scrollLerpField.ts. See
// HomeOperatingLoop.tsx's header for the full rationale; the short version is
// that every element derives its own 0..1 progress from its own position and
// eases toward it with its own damping constant, so nothing "fires", the
// motion is symmetric (scroll up and it unwinds), and any arrival state
// (scroll restoration, hash link, back-navigation) is automatically correct
// on the first frame.
//
// What this layout gets that the single-row rail did not: the panels sit in a
// 3x2 grid, so the two ROWS occupy genuinely different vertical positions and
// the row-to-row cascade falls out of position alone. Only the within-row
// cascade needs help, and that comes from per-column progress windows plus
// per-column damping — no authored delays anywhere.
//
// Per-panel choreography:
//   - The dim top rule brightens by drawing left to right (scaleX from 0),
//     deliberately echoing HomeOperatingLoop's rail sweep so the two sections
//     read as one system. Drawn to `bg-fg/45` rather than full `bg-fg`:
//     six rules at full brightness would be far heavier than that section's
//     single rail.
//   - The label rises out of a mask.
//   - The numeral rises with a blur-to-focus settle AND decodes through a
//     progress-derived digit scramble. Only DIGITS scramble — the "+", "<"
//     characters in "80+", "<10", "700+", "<5" are structural, not data, so
//     they hold position while the digits resolve. Unresolved digits re-roll
//     only while the value is actually moving, so a parked scroll position
//     never flickers.
//   - The sentence rises out of a mask with lighter damping, so it trails the
//     numeral rather than arriving with it.
//
// The numeral is NOT clip-masked (unlike the label and sentence): at
// clamp(2.5rem, 5.5vw, 5rem) with tight leading, a hard clip risks shaving
// glyph overshoot. It rises with transform + opacity + blur instead, which
// needs no clip.
//
// `tabular-nums` on the numeral keeps the scramble from shimmying: Space
// Grotesk's proportional digits have different advance widths, so a
// scrambling readout would visibly jitter horizontally without fixed-width
// figures.
//
// Reduced motion (Requirement 9.8): the whole field lives inside a
// `gsap.matchMedia()` context keyed to `(prefers-reduced-motion:
// no-preference)`. Under `reduce` NOTHING is created and no hidden start
// state is written, so the grid renders fully visible with real numerals —
// every hidden state below comes from JS, never from a CSS class.
import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
  createScrollLerpField,
  type LerpTrackConfig,
  type ScrollLerpField,
} from "@/lib/motion/scrollLerpField";

export type SpecPanel = {
  label: string;
  numeral: string;
  supportingSentence: string;
};

/**
 * Optional caption naming which platform a group of panels belongs to.
 *
 * Added because the Homepage rail mixes both airframes. Six panels in one
 * undifferentiated grid, with a HawkAI Plus plan view filling the section
 * background, read as six HawkAI Plus specs — but three of them are
 * Sentrivion's. That is the same class of problem as publishing an
 * unconfirmed figure (Requirement 8.3 / OCP-02): the numerals are all real,
 * yet the layout attributes half of them to the wrong airframe. Attribution
 * lived only in each panel's supporting sentence at 13px, which does not
 * out-argue a large image of a quadcopter.
 *
 * Rendered brighter than the panels' own `technical-data` labels (text-fg vs
 * text-muted) so it reads as a heading OVER them rather than a seventh label
 * among them. That also keeps it clear of the contrast constraint documented
 * in HomeSpecSheet.tsx, where the 12px muted labels are the binding case
 * against the airframe layer.
 *
 * Single-platform call sites (/product/hawkai, /product/sentrivion) omit it —
 * their page already names the airframe, so a caption would be noise.
 */

const MAX_SUPPORTING_SENTENCE_LENGTH = 140;
const COLUMNS = 3;
const DIGITS = "0123456789";
const clamp01 = gsap.utils.clamp(0, 1);

/**
 * Scroll speed (px/frame, normalised to 60fps) below which the readout stops
 * scrambling and shows its real value.
 *
 * This exists for correctness, not feel. The scramble substitutes random digits
 * for unresolved ones, so any paused mid-reveal position displays a WRONG
 * NUMBER — reported live at ~87% progress showing "<16" for a real "<10" and
 * "777+" for a real "700+". Every numeral on this site has to trace to a
 * confirmed published figure (Requirement 8.3 / OCP-02), and a reader who stops
 * scrolling and reads "<16" has been shown a fabricated spec, however briefly it
 * was meant to last. Gating on velocity means the scramble only ever plays while
 * the page is actually moving and the value is always true at rest.
 */
const SCRAMBLE_MIN_VELOCITY = 0.6;

/**
 * Progress-derived scramble that resolves left to right. Non-digit characters
 * ("+", "<") are structural rather than data and always hold their final
 * value; only digits scramble.
 *
 * Exported for test only. This is the one piece of pure logic here that could
 * silently misrepresent a published hardware spec (Requirement 8.3 /
 * OCP-02 territory — every numeral on this site has to trace to a real
 * confirmed figure), so it is covered directly in PinnedSpecSheet.test.tsx
 * rather than left to visual inspection.
 */
export function scrambleNumeral(target: string, progress: number): string {
  const locked = Math.floor(progress * target.length * 1.0001);
  let out = "";
  for (let i = 0; i < target.length; i++) {
    const ch = target[i];
    out +=
      i < locked || !(ch >= "0" && ch <= "9")
        ? ch
        : DIGITS[(Math.random() * 10) | 0];
  }
  return out;
}

/**
 * What the readout should actually display for a given progress and scroll
 * velocity. Returns the REAL value whenever the reveal is complete or the page
 * is not moving, and only scrambles in between.
 *
 * Exported for test: this is the guard that keeps a paused scroll position from
 * displaying a fabricated hardware spec, so the invariant "at rest, always the
 * true value, at every progress" is asserted directly in
 * PinnedSpecSheet.test.tsx rather than left to visual inspection.
 */
export function readoutText(target: string, progress: number, velocity: number): string {
  if (!target) return "";
  if (progress >= 0.9999 || Math.abs(velocity) <= SCRAMBLE_MIN_VELOCITY) {
    return target;
  }
  return scrambleNumeral(target, progress);
}

function Panel({ panel, compact }: { panel: SpecPanel; compact: boolean }) {
  const sentence = panel.supportingSentence.slice(0, MAX_SUPPORTING_SENTENCE_LENGTH);
  return (
    // `border-t` top-rule per cell rather than a full boxed border — the
    // same divider treatment HomeCompanyStrip.tsx uses, so the rail reads
    // as an airy list-in-a-grid rather than six packed tiles.
    <div
      data-panel
      className={`relative flex h-full flex-col items-start border-t border-line ${
        compact ? "pt-4" : "pt-5"
      }`}
    >
      {/* Draws left to right over the dim rule. Purely decorative. */}
      <span
        aria-hidden="true"
        data-panel-rule
        className="pointer-events-none absolute -top-px left-0 h-px w-full origin-left bg-fg/45"
      />

      <div className="overflow-hidden">
        <p data-panel-label className="technical-data text-muted">
          {panel.label}
        </p>
      </div>

      <div className={compact ? "mt-2" : "mt-3"}>
        {panel.numeral ? (
          // Sized for a 3-across grid cell rather than a full-viewport
          // slide: `--text-display`'s clamp tops out at 14rem, which only
          // makes sense for a numeral that owns an entire screen. The compact
          // ceiling drops 5rem -> 4.5rem, which is what buys the last ~16px per
          // row needed to keep all six panels and the heading in one frame on a
          // ~700px-tall viewport.
          <p
            data-panel-numeral
            data-value={panel.numeral}
            className={`font-display font-bold leading-none tracking-[-0.02em] tabular-nums text-fg ${
              compact
                ? "text-[clamp(2.25rem,4.8vw,4.5rem)]"
                : "text-[clamp(2.5rem,5.5vw,5rem)]"
            }`}
          >
            {panel.numeral}
          </p>
        ) : (
          <p
            data-panel-numeral
            className="technical-data text-muted"
            aria-label="Pending confirmation"
          >
            Pending confirmation
          </p>
        )}
      </div>

      {sentence && (
        <div className={`overflow-hidden ${compact ? "mt-2" : "mt-3"}`}>
          <p
            data-panel-body
            className="max-w-xs text-[13px] font-body leading-snug text-fg/85 md:text-sm"
          >
            {sentence}
          </p>
        </div>
      )}
    </div>
  );
}

export default function PinnedSpecSheet({
  panels,
  className = "",
  compact = false,
  eyebrow,
}: {
  panels: SpecPanel[];
  className?: string;
  /**
   * Tightens the numeral ceiling, the row gap and the in-panel spacing so the
   * whole rail plus its section heading fits in a single viewport.
   *
   * Opt-in rather than the default because it only matters where the rail shares
   * a screen with other content: on the Homepage the heading has to stay visible
   * while all six numerals are read. The dedicated /product/hawkai and
   * /product/sentrivion rails own their scroll and keep the larger scale.
   */
  compact?: boolean;
  /** Platform caption for this group of panels. See SpecPanel above. */
  eyebrow?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // Defensive guard matching usePrefersReducedMotion.ts and SkyScenery.tsx:
    // gsap.matchMedia probes window.matchMedia, which jsdom does not provide.
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const q = gsap.utils.selector(root);
      const panelEls = q("[data-panel]") as HTMLElement[];
      const configs: LerpTrackConfig[] = [];

      // Same window and damping as column 0 below, so the caption leads its own
      // row rather than arriving with it.
      const eyebrowEl = q("[data-group-eyebrow]")[0] as HTMLElement | undefined;
      if (eyebrowEl) {
        eyebrowEl.style.willChange = "transform, opacity";
        configs.push({
          el: eyebrowEl,
          ease: 0.15,
          from: 1.02,
          to: 0.78,
          apply(p) {
            eyebrowEl.style.transform = `translate3d(0, ${((1 - p) * 110).toFixed(2)}%, 0)`;
            eyebrowEl.style.opacity = String(clamp01(p * 1.9));
          },
        });
      }

      panelEls.forEach((panelEl, i) => {
        // Row position is already encoded in the element's own offset, so
        // only the within-row (column) cascade needs an explicit offset.
        const column = i % COLUMNS;
        // Resolve HIGH in the viewport (`to` 0.78 rather than 0.62), because a
        // panel that only completes once its top reaches 62% of the viewport
        // cannot finish while the section heading is still on screen: the second
        // row sits ~450px below the section top, so at a typical viewport it was
        // stalling around 87% progress — visibly mid-scramble — and reaching 100%
        // only after the heading had scrolled away. Reported as the readout
        // feeling "delayed", needing extra scroll to read the specs, and losing
        // the heading in the process.
        //
        // The window is still 0.24vh of travel, so the reveal is just as long; it
        // simply happens earlier in the panel's pass through the viewport.
        const from = 1.02 - column * 0.035;
        const to = 0.78 - column * 0.035;
        const ease = 0.15 - column * 0.015;

        const rule = panelEl.querySelector("[data-panel-rule]") as HTMLElement | null;
        const label = panelEl.querySelector("[data-panel-label]") as HTMLElement | null;
        const numeral = panelEl.querySelector(
          "[data-panel-numeral]",
        ) as HTMLElement | null;
        const body = panelEl.querySelector("[data-panel-body]") as HTMLElement | null;

        if (rule) {
          rule.style.willChange = "transform";
          configs.push({
            el: rule,
            // Slightly crisper than the copy so the rule leads it.
            ease: ease + 0.03,
            from,
            to,
            apply(p) {
              rule.style.transform = `scaleX(${p.toFixed(4)})`;
            },
          });
        }

        if (label) {
          label.style.willChange = "transform, opacity";
          configs.push({
            el: label,
            ease,
            from,
            to,
            apply(p) {
              label.style.transform = `translate3d(0, ${((1 - p) * 110).toFixed(2)}%, 0)`;
              label.style.opacity = String(clamp01(p * 1.9));
            },
          });
        }

        if (numeral) {
          const target = numeral.dataset.value ?? "";
          numeral.style.willChange = "transform, opacity, filter";
          let printed = target;
          configs.push({
            el: numeral,
            ease,
            from,
            to,
            apply(p, ctx) {
              // Velocity lag (StringGlide): the readout sits further behind
              // while the reader is moving fast, and closes up on slowing.
              const lag = gsap.utils.clamp(-12, 12, ctx.velocity * 0.25);
              const y = (1 - p) * 42 + lag * (1 - p);
              numeral.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`;
              numeral.style.opacity = String(clamp01(p * 1.7));
              numeral.style.filter =
                p > 0.995 ? "none" : `blur(${((1 - p) * 10).toFixed(2)}px)`;

              // No `data-value` means this is the "Pending confirmation"
              // placeholder (Requirement 8.3) — it reveals like everything
              // else but must never be scrambled into gibberish.
              if (!target) return;
              // readoutText resolves to the real value once the reveal is done
              // OR whenever the page is not moving, so a parked scroll position
              // can never sit on a scrambled (i.e. wrong) figure. The previous
              // version only froze the scramble on settle, which left the last
              // random digits on screen — that is what rendered "<16" for a real
              // "<10". See SCRAMBLE_MIN_VELOCITY.
              const out = readoutText(target, p, ctx.velocity);
              if (out !== printed) {
                numeral.textContent = out;
                printed = out;
              }
            },
          });
        }

        if (body) {
          body.style.willChange = "transform, opacity";
          configs.push({
            // Lighter damping than the numeral, so the sentence trails it.
            el: body,
            ease: ease - 0.045,
            from,
            to,
            apply(p, ctx) {
              const lag = gsap.utils.clamp(-14, 14, ctx.velocity * 0.3);
              const y = (1 - p) * 115 + lag * (1 - p);
              body.style.transform = `translate3d(0, ${y.toFixed(2)}%, 0)`;
              body.style.opacity = String(clamp01(p * 1.6));
            },
          });
        }
      });

      const field: ScrollLerpField = createScrollLerpField(configs);
      return () => field.destroy();
    });

    return () => mm.revert();
  }, [panels, eyebrow]);

  if (panels.length === 0) return null;

  return (
    <div ref={rootRef} className={className}>
      {eyebrow && (
        // Aligned to the same max-w-7xl grid as the panels below it, and
        // clip-masked like the panel labels so it rises out of the rule rather
        // than fading in place.
        <div className="mx-auto max-w-7xl overflow-hidden">
          {/* Spells out the Technical_Data utilities rather than using the
              `.technical-data` class: that class hard-codes
              `color: var(--color-muted)` as a plain (unlayered) rule, so it wins
              over Tailwind's `text-fg` utility and the caption rendered at the
              same #8a8a8a as the panel labels underneath it — verified live.
              Everything else here matches `.technical-data` except size.
              Site-owner request (current session): "increase the font size of
              Sentrivion · VTOL platform / HawkAI Plus · tactical quadcopter" —
              bumped from the 12px `.technical-data` scale to 16px/20px so it
              reads as a section heading rather than a seventh panel label, which
              is the role it plays now that each platform owns its own
              full-size <section> (see HomeSpecSheet.tsx). text-fg keeps its own
              contrast margin regardless of size (13:1+ measured throughout,
              nowhere near the 4.5:1 floor), so this is a type-scale change only,
              nothing to re-verify for contrast. */}
          <p
            data-group-eyebrow
            className="font-mono text-[16px] uppercase tracking-[0.1em] text-fg md:text-[20px]"
          >
            {eyebrow}
          </p>
        </div>
      )}
      {/* Horizontal gutter is intentionally NOT set here — it comes from the
          calling <section>'s own `px-6`, which is the convention every other
          section on the site follows (`<section ... px-6>` wrapping
          `mx-auto max-w-7xl`). Setting `px-6` on this inner container instead
          would nest the gutter INSIDE max-w-7xl and inset the rail an extra
          24px past the page's content grid above ~1328px: measured live at
          1440, that put the spec section's left edge at x=96 while every
          other left-aligned section heading sat at x=72. All three call sites
          (HomeSpecSheet, HawkAISpecs, SentrivionSpecs) carry `px-6` on their
          section. */}
      <div
        className={`mx-auto grid max-w-7xl grid-cols-2 gap-x-8 md:grid-cols-3 md:gap-x-10 ${
          compact ? "gap-y-8 md:gap-y-8" : "gap-y-10 md:gap-y-12"
        } ${eyebrow ? "mt-3" : ""}`}
      >
        {panels.map((panel, i) => (
          <Panel key={`${panel.label}-${i}`} panel={panel} compact={compact} />
        ))}
      </div>
    </div>
  );
}
