"use client";

// Spec: pawaac-design-language-evolution — Task 16 (Homepage Section 1)
// Requirements: 4.1, 4.3, 4.4, 5.1, 5.4, 6.1, 6.3, 6.4
// Design: design.md -> Page Specifications -> Homepage, Section 1 (Hero)
//
// Persona: Defense_Police_Persona. Replaces the old, unstyled
// `Hero.tsx` on the Homepage render tree (that file is left on disk,
// unused, per the same "don't break things, don't delete" convention
// used for DroneShowcase/VisionAI/DecisionOS/Traction/Contact) with a
// net-new hero matching design.md's exact Homepage table copy:
// oversized Display_Type word-mark texture behind the hero media (P1),
// Reveal_On_Scroll clip-path entrance (P5). Real hero photography/video
// (OCP-18) stays blocked pending site-owner approval.
//
// Positioning/typography/motion pass (site-owner request): the headline
// is anchored to the site's left content grid in the lower third of the
// frame, below where the drone silhouette sits in the sky photo — a
// deliberate cinematic lower-third rather than free-floating centered copy.
//
// Follow-up sizing/font pass (site-owner request): the headline was sized
// too large/dominant relative to the sky photo and drone silhouette, so
// the scale is brought down from a clamp(...,5.5rem) ceiling to
// clamp(...,3.5rem) — still clearly a hero statement, but no longer
// overwhelming the frame.
//
// Font follow-up (site-owner request): switched back from Inter
// (font-body) to Space Grotesk (font-display) — the same font already
// used for "Building for demanding environments" (HomeSpecSheet.tsx) and
// every other in-page heading — so the hero headline now matches that
// heading's font family exactly, rather than using a different typeface
// for this one section.
//
// Case follow-up (site-owner request, reverted from the prior sentence-case
// change): the headline is uppercase again, per explicit request after
// reviewing the sentence-case version live.
//
// Motion: swapped from Reveal_On_Scroll (Framer Motion clip-path wipe,
// designed for in-page scroll-triggered content) to HeroHeadline.tsx (GSAP
// word-stagger, blur-to-focus + rise), since this is a mount-time hero
// moment rather than a scroll-triggered reveal — see HeroHeadline.tsx.
//
// UX fix (homepage first-time-visitor audit, Requirements 4.1, 5.1, 5.4):
// the hero previously rendered only the headline — no supporting sentence
// and no CTA — so a first-time visitor had no way to tell drones were
// involved, or what to do next, until several sections later. Adds one
// supporting sentence under the headline naming what PAWAAC actually does,
// plus a primary CTA link, into the hero itself. HeroHeadline and its GSAP
// entrance above are untouched; the new content is added around it in the
// same left-aligned content column.
import HeroHeadline from "@/components/ui/HeroHeadline";
import SkyScenery from "@/components/ui/SkyScenery";
import Link from "next/link";

export default function HomeHero() {
  return (
    // The hero owns its scenery so the absolute layer cannot escape into
    // the rest of the page.
    <section data-home-hero className="relative flex min-h-[100dvh] items-end overflow-hidden bg-transparent px-6 pb-[14vh] pt-28 md:pb-[16vh] md:pt-36">
      <SkyScenery />

      {/* Display_Type oversized word-mark texture behind hero media
          (Pattern 1), purely decorative — hidden from assistive
          technology per Requirement 10.6. Capped at 15vw below sm (mobile
          audit, current session): same fix as HomeAutonomyTeaser's "STACK"
          span — at a flat 20vw, six bold uppercase characters ran close to
          the section's own edges on narrow phones; opacity is already low
          (0.04) so the size difference is headroom against clipping, not a
          visual identity change. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-6 select-none text-center font-display text-[15vw] font-bold uppercase leading-none text-fg/[0.04] sm:text-[20vw] md:top-10"
      >
        PAWAAC
      </span>

      <div className="relative z-10 mx-auto w-full max-w-7xl text-left">
        <HeroHeadline
          text="Autonomous systems that protect what matters"
          className="max-w-5xl font-display text-[clamp(2.25rem,4.8vw,4.75rem)] font-bold uppercase leading-[0.94] tracking-[-0.035em] text-fg [text-wrap:balance] [text-shadow:0_3px_18px_rgba(0,0,0,0.7)]"
        />

        {/* Supporting sentence + CTA (UX fix, see file header). Section
            background is bg-transparent (the raw SkyScenery photo shows
            through directly, not a tinted panel), so both carry the same
            drop-shadow treatment as the headline above for legibility
            against the photo, rather than a new backdrop scrim.
            Second sentence added per finding F1
            (docs/superpowers/plans/2026-08-20-homepage-problem-framing.md):
            the first names what this is and who it is for, the second names
            the differentiator, so the gap HomeProblemFraming then opens is
            already hinted at above the fold. Kept to one short clause so the
            hero stays a hero and does not become the problem section. */}
        <div data-hero-support>
          <p className="mt-5 max-w-lg text-body font-body text-fg/90 [text-shadow:0_2px_12px_rgba(0,0,0,0.65)]">
            Fully autonomous surveillance drones for defense, police, and
            critical infrastructure. Continuous coverage, with no pilot on
            site.
          </p>
          <Link
            href="/product"
            className="mt-6 inline-block border border-fg px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-fg drop-shadow-[0_3px_10px_rgba(0,0,0,0.55)] transition-colors hover:bg-fg hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            See the platform
          </Link>
        </div>
      </div>
    </section>
  );
}
