"use client";

// Spec: pawaac-design-language-evolution — Task 16 (Homepage Section 4)
// Requirements: 4.1, 4.3, 6.1, 6.3, 6.4
// Design: design.md -> Page Specifications -> Homepage, Section 4
//         (Autonomy stack teaser)
//
// Persona: Both. Oversized numeral/word-fragment background texture (P1),
// Reticle_Frame on the media block (P4), linking to Autonomy_Page
// (/autonomy, task 11). No Change_Proposal gates this section.
//
// Media update (site-owner-supplied asset, current session): the abstract
// Sense/Decide/Act node-diagram Placeholder_Media is replaced with
// gcs.png — a composite concept image (real drone/ground footage combined
// with a designed ground-control-station UI overlay) showing target
// tracking IDs, an "ARMED" weapons-status indicator, and flight commands
// (TAKEOFF/HOLD/RTL/LAND). Site-owner-confirmed: this is NOT a screenshot
// of an existing, working system — it is a composite mockup of where the
// product is heading. Per this codebase's existing Simulated_Label
// convention (src/lib/validators/simulatedLabel.ts — any UI-like readout
// that could be mistaken for a live/working capability must be explicitly
// labeled), a visible "Concept interface (in development)" caption is
// rendered directly under the image (same wrapper, not a separately
// positioned block) so it cannot be read as an existing capability claim,
// which matters in particular for the "ARMED"/weapons framing shown in
// the mockup. Punctuation follow-up (site-owner request: no hyphens/dashes
// on the homepage): the caption previously used an em dash ("Concept
// interface — in development"); reworded to parentheses instead, same
// meaning. The media box's aspect-ratio matches the source image's
// real 1198x684 dimensions with object-contain (not object-cover), so the
// UI overlay is never cropped or squashed. Not grayscale-filtered here
// (unlike most other real photos on the site): the mockup's green
// detection-box color-coding and red status indicators are meaningful UI
// semantics, not incidental photo color — the same kind of deliberate,
// reasoned exception already used for SkyScenery.tsx's real sky photo.
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import ReticleFrame from "@/components/ui/ReticleFrame";

export default function HomeAutonomyTeaser() {
  return (
    // bg-bg/80 -> bg-bg/50: SkyScenery's contrast fix (see SkyScenery.tsx)
    // now makes the sky genuinely visible, so this section's tint is
    // loosened further to let more of it show through.
    <section className="relative overflow-hidden bg-bg/50 px-6 py-28 md:py-36">
      {/* Oversized word-fragment background texture (Pattern 1), purely
          decorative — hidden from assistive technology per Requirement 10.6 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-4 select-none text-center font-display text-[18vw] font-bold uppercase leading-none text-fg/[0.04] md:top-8"
      >
        STACK
      </span>

      {/* Layout (homepage UX audit, current session): this section,
          HomePlannerCTA, and HomeEnterpriseFraming were three CONSECUTIVE
          `md:grid-cols-2` text-left/image-right blocks, so on both desktop
          and mobile they read as the same block repeated three times. The
          three are now given three distinct silhouettes: this one stacks
          (copy above, wide media below), HomePlannerCTA flips to
          image-left/text-right, and HomeEnterpriseFraming uses an
          asymmetric split. Content is unchanged in all three.

          Stacking (rather than flipping) is the right variant for THIS
          section specifically: gcs.png is a wide 1198x684 ground-control
          interface whose small on-screen readouts were being rendered into
          a 576px half-column. Given the whole point of the image is that a
          viewer can see what the interface shows, it belongs at full
          content width. */}
      <div className="relative z-10 mx-auto max-w-7xl">
        <Reveal className="max-w-2xl">
          <p className="label">Autonomy</p>
          <h2 className="mt-3 text-heading font-display text-fg">
            One stack: sense, decide, act
          </h2>
          <p className="mt-4 max-w-md text-body font-body text-muted">
            The same autonomy engine powers detection, planning, and
            dispatch.
          </p>
          <a
            href="/autonomy"
            className="group mt-6 inline-flex items-center gap-2 font-mono text-sm text-fg"
          >
            See how it works
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </Reveal>

        {/* max-w-4xl (896px), not max-w-5xl: at 1198/684 a 1024px-wide
            render is 585px tall, which pushed this section to ~1200px and
            made it impossible to see the heading and the whole interface in
            one 900px viewport. 896px is still +55% on the 576px half-column
            this replaced, and keeps the section close to a single screen. */}
        <Reveal delay={0.12} y={-24} className="mt-12">
          <div className="mx-auto w-full max-w-4xl">
            <div
              className="relative w-full border border-grey-800 bg-bg"
              style={{ aspectRatio: "1198 / 684" }}
            >
              <Image
                src="/images/gcs.png"
                alt="Concept ground-control-station interface showing target tracking and flight commands"
                fill
                sizes="(min-width: 896px) 896px, 90vw"
                className="object-contain"
              />
              <ReticleFrame variant="dark" />
            </div>
            {/* Simulated_Label (Requirement 8.1 / simulatedLabel.ts
                convention): explicit, visible disclosure that this is a
                concept composite, not a live/working system screenshot.
                Kept directly under the image (not a separately-positioned
                block) so the two read as one unit. */}
            <p className="technical-data mt-2 text-center text-muted">
              Concept interface (in development)
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
