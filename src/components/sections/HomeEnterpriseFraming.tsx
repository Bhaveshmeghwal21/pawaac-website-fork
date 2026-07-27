"use client";

// Spec: pawaac-design-language-evolution — Task 16 (Homepage Section 6)
// Requirements: 4.1, 4.3, 6.1, 6.3, 6.4
// Design: design.md -> Page Specifications -> Homepage, Section 6
//         (Enterprise & critical-infrastructure framing)
//
// Persona: Enterprise_Persona. Grayscale imagery Placeholder_Media (P7),
// Label_Caps eyebrow (P2). This is the ONLY Enterprise_Persona-only
// section on the Homepage (Property 7 / Requirement 6.1, 6.3): it renders
// after every Defense_Police_Persona section (1-3) in scroll order. OCP-04
// (enterprise case reference) stays open — no case reference is added
// here (Requirement 8.2); this section renders only the fixed
// headline/supporting sentence.
//
// Resolved via site-owner-delegated judgment (no new Change_Proposal
// approval fabricated, OCP-04 itself stays rejected/as-is — no case
// reference is added): the abstract geometric facility placeholder is
// replaced with the real, generic `public/images/rawimage3.jpg`
// (city/traffic scene) — a non-identifying urban/infrastructure image
// that fits this section's industrial/critical-infrastructure persona far
// better than an abstract icon, while disclosing no customer/partner
// identity. Rendered with the site's standard grayscale filter and
// Reticle_Frame treatment (P4/P7), consistent with every other real photo
// on the site.
//
// UX fix (homepage first-time-visitor audit, Requirements 4.1, 6.1): the
// solid bg-white below is kept exactly as-is (see the comment on the
// <section> below for why) — but on a fast scroll, the jump straight from
// the dark SkyScenery-backed sections above into solid white read as a
// rendering glitch rather than an intentional light "panel." Adds a short
// decorative gradient across the section's own top padding, from
// --color-bg (an opaque approximation of the dark backdrop above — not a
// pixel-sampled match of the SkyScenery photo, kept simple per this being
// a polish fix) fading to transparent, so the seam reads as a deliberate
// transition. Purely decorative/aria-hidden; does not change the
// bg-white section background itself.
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import ReticleFrame from "@/components/ui/ReticleFrame";

export default function HomeEnterpriseFraming() {
  return (
    // Kept solid `bg-white` (NOT made semi-transparent like the dark
    // sections) despite the site-owner-requested full-bleed SkyScenery
    // backdrop in page.tsx: this is the one light/white section on the
    // Homepage, and letting a dark sky gradient bleed through a
    // semi-transparent white background would either wash out the sky or
    // muddy this section's text contrast (Requirement 3.6-3.8). Solid white
    // here reads as an intentional light "panel" over the dark backdrop.
    <section className="relative overflow-hidden bg-white px-6 py-24 text-[#080808] md:py-32">
      {/* Transition device (UX fix, see file header): dark-to-transparent
          gradient sized to exactly match this section's own top padding
          (h-24/md:h-32 <-> py-24/md:py-32), so it bridges the seam without
          overlapping the heading content below it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg to-transparent md:h-32"
      />

      {/* Layout (homepage UX audit, current session): this was the third of
          three CONSECUTIVE `md:grid-cols-2 md:items-center`
          text-left/image-right blocks (HomeAutonomyTeaser, HomePlannerCTA,
          this one), which read as the same block three times running. Those
          two now stack and flip respectively; this one takes an asymmetric
          5/7 split with top alignment instead of an even, vertically
          centered two-column. That also serves the content: this section has
          the shortest copy on the page (8 words of supporting text), so an
          even 50/50 split left its text column conspicuously empty, while
          the wider media column gives the one real photo here more presence.
          Copy, CTA, destination, and imagery are unchanged. */}
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-start md:gap-16">
        <Reveal>
          <p className="label text-[#6b6b6b]">Enterprise &amp; critical infrastructure</p>
          <h2 className="mt-3 text-heading font-display text-[#080808]">
            Security autonomy for critical sites
          </h2>
          <p className="mt-4 max-w-md text-body font-body text-[#454545]">
            The same platform secures industrial and infrastructure
            perimeters.
          </p>
          <a
            href="/product"
            className="group mt-6 inline-flex items-center gap-2 font-mono text-sm text-[#080808]"
          >
            Explore the platform
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </Reveal>

        <Reveal delay={0.14} y={-20}>
          {/* -mx-6 sm:mx-0 (mobile audit, current session): the grid was
              only ever given a plain "collapse to 1 column" treatment below
              md, with no further mobile-specific adaptation. Reading order
              already works as-is (text card then photo, no CSS order needed
              — unlike HomePlannerCTA's flipped desktop layout, this one is
              already text-left/image-right, so DOM order matches a sensible
              mobile reading order without changes). What mobile WAS missing
              is the same free width gain used on HomeAutonomyTeaser's media
              box: cancels the section's own px-6 so this section's one real
              photo (the file header above already calls out wanting it to
              have "more presence") uses the full viewport width instead of
              viewport minus 48px, rather than sitting inset like every other
              piece of body copy on the page. */}
          <div className="-mx-6 sm:mx-0">
            <div
              className="relative mx-auto w-full max-w-2xl border border-[#d6d6d6]"
              style={{ aspectRatio: "16 / 9" }}
            >
              {/* Real, generic (non-identifying) urban/infrastructure scene —
                  grayscale resting-state filter matching every other real
                  photo on the site (Requirement 3.1-3.2). No case reference,
                  no customer/partner identity (OCP-04 stays rejected/as-is).
                  Sized up from max-w-sm (384px) to max-w-xl (576px) per
                  site-owner request to make this image bigger/more
                  prominent, then to max-w-2xl (672px) when this section moved
                  to the asymmetric 5/7 split above — the wider media column is
                  ~709px at the max-w-7xl ceiling, so max-w-xl would have left
                  a visible gutter inside its own column. */}
              <Image
                src="/images/rawimage3.jpg"
                alt="Generic urban street and traffic scene representing critical infrastructure"
                fill
                sizes="(min-width: 768px) 672px, 100vw"
                className="object-cover grayscale"
              />
              <ReticleFrame variant="light" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
