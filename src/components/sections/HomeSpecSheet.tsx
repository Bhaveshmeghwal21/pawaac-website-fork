"use client";

// Spec: pawaac-design-language-evolution — Task 16 (Homepage Section 2)
// Requirements: 4.1, 4.3, 4.4
// Design: design.md -> Page Specifications -> Homepage, Section 2
//         (Field-readiness spec sheet); Shared Components -> Pinned_Spec_Sheet
//
// Persona: Defense_Police_Persona.
//
// Site-owner-delegated resolution of OCP-02 (no new Change_Proposal
// approval fabricated): the site owner has explicitly said not to publish
// other-drone-line mission/uptime-style figures (e.g. "missions flown",
// "uptime %") since Pawaac hasn't sold its own USPs yet. Rather than
// leaving this panel as an indefinite "Pending confirmation" placeholder,
// this panel is repurposed to surface REAL, already-published hardware
// numerals that already appear on /product/hawkai (HawkAISpecs.tsx) and
// /product/sentrivion (SentrivionSpecs.tsx) — no new fact is disclosed
// here beyond what those two sub-pages already publish verbatim from the
// HawkAI Plus and Sentrivion brochures. These are confirmed ENGINEERING
// SPECS, not field-deployment/mission statistics, and the supporting
// sentence below is worded to make that distinction explicit.
//
// UX fix (homepage first-time-visitor audit, Requirements 4.1, 4.3): the
// six panels below named numerals ("80+", "15", ...) before a visitor had
// been told what HawkAI Plus or Sentrivion are. Extends the existing
// supporting sentence with a plain-language bridging clause naming both
// platforms, worded from their own sub-page headlines/hero copy
// (HawkAIHero.tsx, SentrivionHero.tsx) rather than new descriptive claims,
// per the no-fabrication convention noted above. No numerals were added or
// changed.
//
// Punctuation fix (site-owner request: no hyphens on the homepage): the
// bridging sentence above and the "all-weather" panel sentence below were
// reworded to drop their hyphens/dashes without changing what they say.
//
// Background layer (site-owner request, current session): this was the only
// dark Homepage section with no decorative layer of its own — HomeHero and
// HomeAutonomyTeaser both carry an oversized Display_Type word-mark texture,
// and this section had bare type over SkyScenery. It now hosts the top-down
// HawkAI Plus plan view (see AirframeGhost.tsx for how the cutouts were made
// and why the layer is static and scrimmed). That pairing is the reason this
// section gets the plan view specifically rather than either of the other two
// cutouts: the six numerals below are airframe specs, so an engineering-style
// plan view behind them is substantive rather than ornamental.
//
// Follow-up (site-owner request, same session): "make the quad one bigger and
// brighter than the original sky background for just this section". Both the
// plan view here and the three-quarter view in HomeCompanyStrip were stepped
// up; the Sentrivion in HomeClosingVision was deliberately left alone, so
// these two now sit far brighter than that one on purpose.
//
// Raising `opacity` alone does not do what was asked. Normal blending pulls the
// layer TOWARD the backdrop, so a more opaque airframe over an unchanged sunset
// just blends harder into it and still never out-reads the sky's own bright sun
// region. Darkening and blurring the sky (see the section element below) is what
// actually separates them, and it is why `scrim` could then come back DOWN from
// 0.8 to 0.5 — the section no longer needs a black wedge to calm the photo, and
// a lighter scrim keeps the right side from going dead flat.
//
// With that backdrop the airframe opacity re-solved from 0.58 to 0.72 and the
// bleed from 0.38 to 0.46. Pushing more of the layer off-canvas is what buys the
// opacity: it moves the airframe's bright body away from the third column's
// labels, so the quad reads clearer while the text over it gets easier, not
// harder. Contrast was re-measured rather than assumed, and the binding
// constraint is neither the large numerals nor the text-fg/85 sentences but the
// 12px --color-muted (#8a8a8a) labels, which need a near-black backdrop at that
// size. Mobile solves separately (see the class list): the two-column grid puts
// different labels under the layer, so it carries its own opacity and offset.
//
// `fade` and the layer's max-width/pixel bottom offset are both load-bearing:
//
//   - `fade` ramps the layer up toward the bleed edge so full brightness lands
//     out past the content rather than under the third column's labels. Without
//     it, opacity 0.32 put "Payload swap time" at 2.42:1.
//   - `max-w` + `md:bottom-[-126px]` stop the layer drifting. It is sized in vw
//     but the section height and grid gutters step independently, so an
//     uncapped layer grows faster than its section and rides upward into the
//     heading as the viewport widens. A version that measured clean at a 1265px
//     layout had "Payload swap time" at 4.00:1 and the intro copy at 2.05:1
//     once checked at 1441px.
//
// These values come from a search scored at BOTH widths simultaneously, so one
// width cannot pass at the other's expense. Two muted runs above the panels
// ("Defense & police", "Two platforms...") still fail at 1441px, but they fail
// against the bare sky photo with no airframe present at all (2.59 and 1.83) —
// a pre-existing SkyScenery contrast problem this layer slightly improves
// rather than causes.
import AirframeGhost from "@/components/ui/AirframeGhost";
import PinnedSpecSheet, { SpecPanel } from "@/components/ui/PinnedSpecSheet";
import StaggerHeading from "@/components/ui/StaggerHeading";

const PANELS: SpecPanel[] = [
  {
    label: "Endurance (thermal)",
    numeral: "80+",
    supportingSentence: "Minutes of flight time, HawkAI Plus thermal payload.",
  },
  {
    label: "Operational range",
    numeral: "15",
    supportingSentence: "Kilometers, HawkAI Plus with antenna extension.",
  },
  {
    label: "Deployment time",
    numeral: "<10",
    supportingSentence: "Minutes from arrival to operational, Sentrivion.",
  },
  {
    label: "Area coverage",
    numeral: "700+",
    supportingSentence: "Square kilometers per takeoff point, Sentrivion.",
  },
  {
    label: "Wind resistance",
    numeral: "45",
    supportingSentence: "Knots of all weather resistance, HawkAI Plus.",
  },
  {
    label: "Payload swap time",
    numeral: "<5",
    supportingSentence: "Minutes to swap thermal/optical payloads, Sentrivion.",
  },
];

export default function HomeSpecSheet() {
  return (
    // bg-bg/80 -> bg-bg/50: SkyScenery's contrast fix (see SkyScenery.tsx)
    // now makes the sky genuinely visible, so this section's tint is
    // loosened further to let more of it show through behind the pinned
    // spec-sheet panels, while still keeping text-fg/text-muted readable.
    // `px-6` moved from the inner wrappers onto the section (homepage UX
    // audit, current session), matching the `<section ... px-6>` +
    // `mx-auto max-w-7xl` convention every other section uses. With the
    // gutter nested inside max-w-7xl this section's content sat 24px further
    // in than the rest of the page above ~1328px wide (x=96 vs x=72 measured
    // at 1440) — the only left-aligned section on the Homepage off the grid.
    // bg-bg/50 -> bg-bg/85 + backdrop-blur (site-owner request, current
    // session): "make the bg dark/blur and just make the quad clear slightly
    // more". `backdrop-blur` blurs what is painted BEHIND this box, which is
    // exactly SkyScenery's fixed photo, while children — including the airframe
    // layer — render on top untouched. So the sky goes soft and dark and the
    // quad stays sharp, which is the separation being asked for; there is no
    // need to blur the asset or add a second copy of it.
    //
    // Darkening also pays for itself in contrast. This section previously let
    // the photo's bright sun band sit directly behind muted body copy, which was
    // measured failing WCAG AA on its own ("Two platforms..." at 1.83:1 at a
    // 1441px layout, 1.35:1 at 390px). At bg-bg/85 the sky contributes 15%
    // instead of 50% and those runs come back inside AA, and the extra headroom
    // is what lets the airframe opacity go up rather than down.
    <section className="relative bg-bg/85 px-6 backdrop-blur-[10px]">
      {/* Decorative only (Requirement 10.6) — biased low and to the right so
          it sits behind the spec rail's third column rather than behind the
          heading, and away from the upper-centre of the viewport where
          SkyScenery's own drone silhouette is fixed. */}
      <AirframeGhost
        src="/images/airframe-hawkai-plan.webp"
        width={826}
        height={797}
        side="right"
        opacity={0.34}
        bleed={0.46}
        scrim={0.5}
        scrimStart={0.12}
        fade={0.55}
        className="bottom-[-22%] w-[124vw] max-w-[940px] md:bottom-[-100px] md:w-[73vw] md:[--airframe-opacity:0.72]"
      />
      {/* Vertical rhythm is tightened against the rest of the page (pt-12 not
          pt-24, mt-6 not mt-10, max-w-2xl not max-w-lg) for one reason: the
          heading and all six numerals have to be readable WITHOUT scrolling the
          heading away. Measured at a 1265px layout the heading block plus rail
          came to 730px against 736px of usable height under the fixed 64px nav,
          and at a wider layout where the type hits its clamp ceiling it grew to
          ~755px against ~711px — so the second row fell off the bottom. Widening
          the intro to max-w-2xl drops it from four lines to three, which is the
          single largest saving here and costs nothing but measure. */}
      <div className="relative z-10 mx-auto max-w-7xl pt-12">
        <p className="label">Defense &amp; police</p>
        <StaggerHeading
          text="Building for demanding environments"
          className="mt-3 text-heading font-display text-fg"
        />
        <p className="mt-4 max-w-2xl text-body font-body text-muted">
          Two platforms: HawkAI Plus, a tactical UAV built for long
          endurance, and Sentrivion, a VTOL built for rapid deployment.
          Confirmed platform specs below, not field deployment or mission
          stats.
        </p>
      </div>
      <PinnedSpecSheet panels={PANELS} compact className="relative z-10 mt-6" />
      <div className="relative z-10 mx-auto max-w-7xl pb-16 pt-6">
        <a
          href="/product"
          className="group inline-flex items-center gap-2 font-mono text-sm text-fg"
        >
          See full specifications
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </a>
      </div>
    </section>
  );
}
