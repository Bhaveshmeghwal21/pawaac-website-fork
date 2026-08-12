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
import { motion } from "framer-motion";
import HeroHeadline from "@/components/ui/HeroHeadline";

export default function HomeHero() {
  return (
    <section className="relative flex min-h-[100dvh] items-end overflow-hidden bg-transparent px-6 pb-[12vh] pt-28 md:pb-[14vh] md:pt-36">
      {/* Oversized decorative wordmark */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-6 select-none text-center font-display text-[15vw] font-bold uppercase leading-none text-fg/[0.04] sm:text-[20vw] md:top-10"
      >
        PAWAAC
      </span>

      {/* Ambient top glow for depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[40vh]"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.025) 0%, transparent 70%)"
        }}
      />

      {/* Bottom gradient for text legibility over sky photo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55vh]"
        style={{
          background: "linear-gradient(to top, rgba(8,8,8,0.55) 0%, transparent 100%)"
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl text-left">
        {/* Eyebrow with pulse dot */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-5"
        >
          <span className="label inline-flex items-center gap-2.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-fg animate-pulse-dot" />
            Autonomous aerial systems
          </span>
        </motion.div>

        <HeroHeadline
          text="Autonomous|Systems that|Protect what|Matters"
          className="max-w-5xl font-display text-[clamp(2.5rem,5.5vw,5.25rem)] font-bold uppercase leading-[1.1] tracking-[-0.04em] text-white [text-shadow:0_3px_18px_rgba(0,0,0,0.7)]"
        />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-lg text-[1.05rem] font-body leading-relaxed text-fg/85 [text-shadow:0_2px_12px_rgba(0,0,0,0.65)]"
        >
          Fully autonomous surveillance drones for defense, police, and
          critical infrastructure.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-wrap items-center gap-5"
        >
          <a href="/product" className="btn-primary">
            See the platform
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a
            href="/contact"
            className="group inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-fg/70 underline underline-offset-4 decoration-fg/40 transition-all duration-300 hover:text-fg hover:decoration-fg"
          >
            Talk to us
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-fg/30">Scroll</span>
          <div className="h-8 w-px animate-bounce-down bg-fg/40" />
        </div>
      </motion.div>
    </section>
  );
}
