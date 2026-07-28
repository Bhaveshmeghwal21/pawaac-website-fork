"use client";

// Spec: pawaac-design-language-evolution — Task 16 (Homepage Section 5)
// Requirements: 4.1, 4.3, 6.1, 6.3, 6.4
// Design: design.md -> Page Specifications -> Homepage, Section 5
//         (Coverage planner CTA)
//
// Persona: Both. Real screenshot of the live Planner_Page (/designer)
// tool, Reticle_Frame (P4), linking to Planner_Page (existing route).
//
// Media update (site-owner-supplied asset, current session): the abstract
// geometric map-sketch Placeholder_Media is replaced with planner.jpeg —
// an actual screenshot of the site's own /designer coverage-planning tool
// (survey zone, patrol-radius circles, docking-station markers, and the
// real "Design your coverage" side panel with survey-area/station-count
// stats). Since /designer is a genuinely live, working feature on this
// site (not a mockup of a future capability), this is a real screenshot,
// not a Placeholder_Media/Simulated_Label case — no "concept" or
// "illustrative" caption is needed here.
//
// Mobile stacking order (site-owner feedback: section-to-section rhythm on
// mobile felt monotonous — every 2-column text/image section collapses to
// the same "text block, then image" stack). This section originally sat
// directly after HomeAutonomyTeaser, so on mobile the two stacked
// back-to-back read as the same block repeated twice. `order-1`/`order-2`
// flips this section's stack to image-first/text-second below md.
//
// Desktop layout (homepage UX audit, current session): the mobile-only fix
// above was carried up to desktop as well, because the same monotony was
// confirmed on desktop — this section, HomeAutonomyTeaser above it, and
// HomeEnterpriseFraming below it were three CONSECUTIVE text-left/
// image-right two-column blocks. The media column sits LEFT and the copy
// RIGHT at md+ (`md:order-*` instead of the previous `md:order-none`),
// which also means the mobile and desktop orders agree with each other
// (image first in both) rather than inverting at the breakpoint.
//
// Position (narrative-arc re-sequencing, current session, see page.tsx's
// header): this section moves DOWN to close out the proof arc (Specs ->
// Sectors -> Enterprise -> Planner), now following HomeEnterpriseFraming
// directly and preceding HomeCompanyStrip (a trust/metadata strip with no
// image column at all, so no repeated-shape concern there). The
// image-left/text-right order kept here still alternates against
// HomeEnterpriseFraming's image-right/text-left order immediately above it,
// so the two remaining adjacent two-column blocks read as different shapes
// rather than a repeat. Copy, CTA, destination, and imagery are unchanged.
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import ReticleFrame from "@/components/ui/ReticleFrame";

export default function HomePlannerCTA() {
  return (
    // bg-bg/80 -> bg-bg/50: SkyScenery's contrast fix (see SkyScenery.tsx)
    // now makes the sky genuinely visible, so this section's tint is
    // loosened further to let more of it show through.
    <section className="relative overflow-hidden bg-bg/50 px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
        <Reveal className="order-2 md:order-2">
          <p className="label">Planner</p>
          <h2 className="mt-3 text-heading font-display text-fg">
            Model your own coverage area
          </h2>
          <p className="mt-4 max-w-md text-body font-body text-muted">
            Try the interactive planner used in real deployment design.
          </p>
          <a
            href="/designer"
            className="mt-6 inline-block border border-fg px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-fg transition-colors hover:bg-fg hover:text-bg"
          >
            Open the planner
          </a>
        </Reveal>

        <Reveal delay={0.16} className="order-1 md:order-1">
          <div
            className="relative mx-auto w-full max-w-2xl grayscale"
            style={{ aspectRatio: "16 / 9" }}
          >
            <Image
              src="/images/planner.jpeg"
              alt="Screenshot of the Pawaac coverage planner showing patrol-radius circles and docking-station markers over a map"
              fill
              sizes="(min-width: 768px) 672px, 90vw"
              className="object-cover"
            />
            <ReticleFrame variant="dark" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
