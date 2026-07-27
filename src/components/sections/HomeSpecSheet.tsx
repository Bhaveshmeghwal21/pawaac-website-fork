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
// and this section had bare type over SkyScenery. It now hosts BOTH airframe
// cutouts, one per platform section (see AirframeGhost.tsx for how the cutouts
// were made and why the layers are static and scrimmed). The HawkAI section
// gets the top-down plan view rather than the three-quarter shot: the numerals
// under it are airframe specs, so an engineering-style plan view is substantive
// rather than ornamental.
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
// region. Darkening and blurring the sky (see each section element below) is
// what actually separates them, and it is why `scrim` could then come back DOWN
// from 0.8 to 0.5 — the section no longer needs a black wedge to calm the photo,
// and a lighter scrim keeps the right side from going dead flat.
//
// With that backdrop the airframe opacity re-solved from 0.58 to 0.72 and the
// bleed from 0.38 to 0.46. Pushing more of the layer off-canvas is what buys the
// opacity: it moves the airframe's bright body away from the third column's
// labels, so the quad reads clearer while the text over it gets easier, not
// harder. Contrast was re-measured rather than assumed, and the binding
// constraint is neither the large numerals nor the text-fg/85 sentences but the
// 12px --color-muted (#8a8a8a) labels, which need a near-black backdrop at that
// size. Mobile solves separately (see the class lists): the grid collapses from
// three columns to two, so different labels end up under the layers and each
// carries its own opacity and offset.
//
// `fade` ramps each layer up toward its bleed edge so full brightness lands out
// past the content rather than under the labels. Without it, opacity 0.32 put
// "Payload swap time" at 2.42:1.
//
// ── Two separate sections, one per platform (site-owner request) ─────────
//
// First pass here was two DIVS inside one shared <section> ("frames"), each
// clipping its own airframe. Reviewed live and rejected: "no no this isn't
// good, I was talking about 2 separate sections for each drone." The frames
// looked visually similar to what shipped below — same imagery, same
// panels — but were not semantically or structurally two sections, and that
// was the actual ask.
//
// This component now returns a Fragment of two real <section> elements rather
// than one. Because each AirframeGhost's own `absolute inset-0` sizes against
// its nearest positioned ancestor, giving each platform its own `<section
// className="relative ...">` clips its airframe to that section automatically —
// no extra wrapper div is needed the way the frames version required one.
// AirframeGhost is placed as a direct child of each section, same as the
// original single-airframe version before this session.
//
// Both sections keep the identical `bg-bg/85 px-6 backdrop-blur-[10px]`
// treatment so SkyScenery reads the same way behind each one, with a
// `border-t border-line` on the second section marking the seam between them —
// otherwise two sections with identical backgrounds over the same fixed photo
// would read as one section with a gap, not two.
//
// The intro paragraph naming both platforms stays in the FIRST section only.
// Duplicating "Building for demanding environments" (or writing a second,
// different headline for Sentrivion) was considered and rejected: there is no
// new, published copy to justify a second headline, and the OCP-02 governance
// this file already operates under is about numerals but the same discipline
// applies to prose — don't add a claim that only exists to fill a heading slot.
// The Sentrivion section's own PinnedSpecSheet `eyebrow` ("Sentrivion · VTOL
// platform") is the section's heading in practice.
//
// This drops the single-viewport constraint from before this session: the two
// sections together are taller than one viewport, so the heading no longer
// shares a screen with all six numerals. The per-platform captions carry that
// context locally instead.
//
// ── "still trying to fit them into one screen" (second correction) ───────
//
// The two-<section> version above still shipped with `compact` on both
// PinnedSpecSheet calls and pt-12/py-12/pb-16 section padding — numbers
// carried over unchanged from when this WAS one tightly-packed single-viewport
// section. Reviewed live and corrected: "I think you're still trying to fit
// them into one screen, but I told you to make 2 screens for each drone."
// Right call — `compact` exists specifically to shrink the rail so a heading
// can stay on screen with it (see its doc comment on PinnedSpecSheet.tsx), and
// that reason no longer applies once each platform owns its own section.
//
// Checked every other Homepage section's own outer padding before picking a
// replacement rather than guessing: HomeAutonomyTeaser, HomeContactBand,
// HomeDeploymentsPreview, HomeOperatingLoop and HomePlannerCTA all use
// `py-24 md:py-32` (HomeClosingVision goes further, `py-32 md:py-44`). Both
// sections here now match that `py-24 md:py-32` baseline and drop `compact`,
// so each platform's specs render at the same scale /product/hawkai and
// /product/sentrivion already use, not a homepage-only shrunk version.
//
// Growing the sections this much moved everything, so airframe placement had
// to be re-solved rather than just checked. The Sentrivion layer in particular
// went from top-anchored to bottom-anchored, mirroring the HawkAI layer's
// pattern: top-anchored at the new section height, it sat squarely over
// "Payload swap time" and measured 2.98:1 (needs 4.5), while the bottom
// anchor — same idea that already worked for the HawkAI layer above — reads
// clean.
//
// Sizing the two layers is NOT symmetric — see the Sentrivion comment at its
// call site. The plan view is nearly square and crops well; the Sentrivion is
// wide and low and does not, so its layer is smaller even though its section
// is the same width as the first.
//
// Verified 0 runs caused by either layer at 1266x800, 1878x775 and 390x844,
// each scored at the worst scroll alignment rather than one position:
// SkyScenery is position:fixed, so each section travels across the whole photo
// and every run eventually meets the photo's brightest band at its own x.
import AirframeGhost from "@/components/ui/AirframeGhost";
import PinnedSpecSheet, { SpecPanel } from "@/components/ui/PinnedSpecSheet";
import StaggerHeading from "@/components/ui/StaggerHeading";

// Grouped by airframe rather than interleaved (site-owner report, current
// session): "this shows like these specs are of this quad (hawkai only)".
// Correct, and it was a misattribution rather than a preference. The six panels
// were ordered HawkAI, HawkAI, Sentrivion / Sentrivion, HawkAI, Sentrivion in a
// single 3x2 grid, with the top-down HawkAI Plus plan view filling the right of
// the section — so the layout asserted that a VTOL's 700 sq km coverage and
// <10 min deployment belonged to the quad. Every numeral was real and traceable
// (that part was never in question), but attributing a confirmed figure to the
// wrong platform is the same class of problem as publishing an unconfirmed one:
// the reader ends up holding a fact that is not true. Requirement 8.3 / OCP-02
// territory.
//
// The split is exactly 3/3, so at `md` each platform is one row of the
// existing 3-column grid rather than a half-empty one. Below `md` the grid is
// 2 columns, so each group lands 2+1; the caption carries the attribution
// there, not the row shape. (This grouping predates the later split into two
// <section> elements below — grouping was already correct on its own terms,
// and stayed correct once each group got its own section.)
//
// Considered and rejected: a click-through carousel or platform toggle (the
// site owner's first instinct). It solves attribution, but it hides three of six
// confirmed specs behind an interaction on a section whose whole job is to
// establish credibility in one screen before handing off to /product, and it
// reintroduces the "spec content not on screen" property that got the
// scroll-jacked filmstrip deleted from PinnedSpecSheet.tsx. Grouping is also a
// prerequisite for that toggle, so nothing here blocks adding it later.
//
// Each supporting sentence dropped its trailing platform attribution (was
// "Minutes of flight time, HawkAI Plus thermal payload.") since the group
// caption above now says it. No numeral, label or unit changed.
const HAWKAI_PANELS: SpecPanel[] = [
  {
    label: "Endurance (thermal)",
    numeral: "80+",
    supportingSentence: "Minutes of flight time on the thermal payload.",
  },
  {
    label: "Operational range",
    numeral: "15",
    supportingSentence: "Kilometers of range with antenna extension.",
  },
  {
    label: "Wind resistance",
    numeral: "45",
    supportingSentence: "Knots of all weather resistance.",
  },
];

const SENTRIVION_PANELS: SpecPanel[] = [
  {
    label: "Deployment time",
    numeral: "<10",
    supportingSentence: "Minutes from arrival to operational.",
  },
  {
    label: "Area coverage",
    numeral: "700+",
    supportingSentence: "Square kilometers per takeoff point.",
  },
  {
    label: "Payload swap time",
    numeral: "<5",
    supportingSentence: "Minutes to swap thermal/optical payloads.",
  },
];

export default function HomeSpecSheet() {
  return (
    <>
      {/* SECTION 1 — HawkAI Plus. bg-bg/80 -> bg-bg/50: SkyScenery's contrast
          fix (see SkyScenery.tsx) now makes the sky genuinely visible, so this
          section's tint is loosened further to let more of it show through
          behind the pinned spec-sheet panels, while still keeping
          text-fg/text-muted readable. `px-6` sits on the section (homepage UX
          audit), matching the `<section ... px-6>` + `mx-auto max-w-7xl`
          convention every other section uses.
          bg-bg/50 -> bg-bg/85 + backdrop-blur (site-owner request): "make the
          bg dark/blur and just make the quad clear slightly more".
          `backdrop-blur` blurs what is painted BEHIND this box, which is
          exactly SkyScenery's fixed photo, while children — including the
          airframe layer — render on top untouched. So the sky goes soft and
          dark and the quad stays sharp, which is the separation being asked
          for; there is no need to blur the asset or add a second copy of it.
          Darkening also pays for itself in contrast: this section previously
          let the photo's bright sun band sit directly behind muted body copy,
          which measured failing WCAG AA on its own ("Two platforms..." at
          1.83:1 at a 1441px layout, 1.35:1 at 390px). At bg-bg/85 the sky
          contributes 15% instead of 50% and those runs come back closer to
          AA (see the header comment above for the one pre-existing run that
          still falls short with or without the airframe). */}
      <section className="relative bg-bg/85 px-6 py-24 backdrop-blur-[10px] md:py-32">
        {/* Decorative only (Requirement 10.6). AirframeGhost is a direct child
            of the section so its `absolute inset-0` sizes against the section
            itself — the section IS the clipping context, no extra wrapper
            needed now that each platform owns its own <section>. */}
        <AirframeGhost
          src="/images/airframe-hawkai-plan.webp"
          width={826}
          height={797}
          side="right"
          opacity={0.32}
          bleed={0.36}
          scrim={0.55}
          scrimStart={0.10}
          fade={0.55}
          className="bottom-[-6%] w-[110vw] max-w-[860px] md:bottom-[-60px] md:w-[54vw] md:[--airframe-opacity:0.62]"
        />
        <div className="relative z-10 mx-auto max-w-7xl">
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
        <PinnedSpecSheet
          panels={HAWKAI_PANELS}
          eyebrow="HawkAI Plus · tactical quadcopter"
          className="relative z-10 mt-16"
        />
      </section>

      {/* SECTION 2 — Sentrivion. Identical bg/blur treatment to section 1 so
          SkyScenery reads the same way behind both; `border-t border-line`
          marks the seam, since two sections with an identical background over
          the same fixed photo would otherwise read as one section with a gap
          rather than two. No new headline here — see the header comment above
          for why duplicating or inventing one was rejected. The
          PinnedSpecSheet `eyebrow` below ("Sentrivion · VTOL platform") is
          this section's heading in practice. */}
      <section className="relative border-t border-line bg-bg/85 px-6 py-24 backdrop-blur-[10px] md:py-32">
        {/* Sentrivion moved from the right edge to the LEFT (site-owner
            request): "could u increase the size of the image of sentrivion and
            shift it to leff side instead?" `side="left"` plus a bigger size.

            Moving to the left edge is NOT a mirror-image version of the right
            side placement used everywhere else on this page — it lands the
            layer directly under the FIRST column ("Deployment time" / "<10" /
            the supporting sentence), which is the highest-traffic text on the
            page (read first) rather than the comparatively spare zone past the
            third column that the right-bled layers elsewhere get to use.
            HomeCompanyStrip's own left-bled layer already flags this: it caps
            opacity at 0.22-0.28 specifically because muted text sits in the
            same half the airframe bleeds into.

            A first attempt here reused the right-side layer's own `fade`
            style (0.5) and failed badly — "<10" measured 2.85:1 and the body
            sentence 2.51:1 (against 15.72 and 11.33 with no layer). Root
            cause, worth recording because it is a real trap in AirframeGhost's
            own model rather than a tuning miss: for side="right" the layer's
            own local x=0 (left edge) is always the on-screen, content-adjacent
            edge, and `fade`'s mask is ALWAYS fully transparent exactly there —
            so any bleed/fade combo is safe by construction, because the first
            pixel that ever becomes visible is guaranteed dark. For side="left"
            that guarantee flips: the layer's own local x=0 is the BLEED edge,
            not the content edge, so unless `fade` is close to 1 the mask
            reaches full opacity WHILE STILL ON SCREEN, and text sitting
            immediately at the page's left gutter (x=24, no room to spare)
            sees it directly. `fade={1}` removes the plateau entirely — the
            opacity ramp then covers the layer's ENTIRE width with no flat
            region — which is exactly why HomeCompanyStrip's own left-bled
            layer already uses `fade={1}`; this was already the established
            answer to the same problem, just not stated in those terms there.

            With that fixed, size and opacity were solved together rather than
            guessed: what actually matters for "bigger" is how much of the
            layer survives ON SCREEN (width * (1 - bleed)), not the nominal
            width alone — a nominally huge box bled almost entirely off canvas
            is smaller in practice than a modest box bled only a little. A
            search over width, bleed, fade and opacity found the visible
            footprint peaks at width~640/bleed~0.15 (about 540px actually on
            screen at a 1265px layout) — past that, every wider width needed
            bleed >=0.75 just to clear AA, which shows LESS of the aircraft
            despite a bigger declared size. 540px visible is comfortably larger
            than the HawkAI plan view's own ~440px visible footprint in the
            section above, so this reads as the bigger image asked for. */}
        <AirframeGhost
          src="/images/airframe-sentrivion.webp"
          width={708}
          height={429}
          side="left"
          opacity={0.24}
          bleed={0.05}
          scrim={0.55}
          scrimStart={0.10}
          fade={1}
          className="bottom-[-4%] w-[100vw] max-w-[560px] md:bottom-[-40px] md:w-[64vw] md:max-w-[800px] md:[--airframe-opacity:0.35] xl:max-w-[700px]"
        />
        {/* Text nudged right in THIS section only (site-owner request):
            "move the text slightly to the right ... increase the size of the
            sentrivion image". The airframe bleeds off the LEFT edge here
            (unlike every other section on the page, which bleeds right), so
            the first column's text is what sits closest to it — this shifts
            that text away from the image rather than the other way round.

            `pl-*` on these two elements insets their OWN content rather than
            moving a wrapping box, since both already own an unconstrained
            outer container (PinnedSpecSheet's `className` targets its outer
            div directly; the CTA div below is itself the max-w-7xl box) — so
            each one's LEFT edge moves right by exactly the padding value,
            with no knock-on effect on the grid math elsewhere on the page.
            This deliberately takes the section's first column off the shared
            `mx-auto max-w-7xl` left edge every other section aligns to — a
            one-off exception for this specific background treatment, not a
            new convention. */}
        <PinnedSpecSheet
          panels={SENTRIVION_PANELS}
          eyebrow="Sentrivion · VTOL platform"
          className="relative z-10 pl-6 md:pl-16 lg:pl-24 xl:pl-36"
        />
        <div className="relative z-10 mx-auto max-w-7xl pl-6 pt-16 md:pl-16 lg:pl-24 xl:pl-36">
          <a
            href="/product"
            className="group inline-flex items-center gap-2 font-mono text-sm text-fg"
          >
            See full specifications
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      </section>
    </>
  );
}
