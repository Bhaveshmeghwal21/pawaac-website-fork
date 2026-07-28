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
// ── Repositioned + reworded (homepage narrative-arc review, current
// session) ──────────────────────────────────────────────────────────────
//
// Moved from between HomeDeploymentsPreview and HomePlannerCTA to directly
// after HomeOperatingLoop (see page.tsx's header for the full diagnosis).
// This section's previous copy ("One stack: sense, decide, act" / "The same
// autonomy engine powers detection, planning, and dispatch") re-explained
// the same mechanism HomeOperatingLoop already covers concretely
// (dock/patrol/detect/alert/respond), three sections earlier — a reader who
// absorbed that section got nothing new here, just a more abstract
// restatement next to a concept mockup.
//
// Reworded to do a different job: illustrate, rather than re-explain, the
// specific claim HomeOperatingLoop's own closing line just made ("an
// operator stays in the loop for escalation by design") and its step 04
// ("Alert") already states ("An operator gets a located alert and taps in
// for live video only when there is something worth looking at"). This
// section is now the visual zoom-in on THAT moment specifically, using the
// same gcs.png concept mockup and the same Simulated_Label disclosure
// ("Concept interface (in development)") — no new claim, no new asset, just
// a headline/body that points at one beat instead of restating the whole
// loop. The oversized background word-mark changes from "STACK" (tied to
// the old "one stack" framing) to "ALERT" (tied to the new one) for the
// same reason.
//
// The CTA link to /autonomy is dropped: HomeOperatingLoop, immediately
// above this section in the new order, already ends with its own "See the
// autonomy stack" link to the same destination — a second consecutive link
// to the identical page read as redundant rather than as a second, distinct
// invitation.
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import ReticleFrame from "@/components/ui/ReticleFrame";

export default function HomeAutonomyTeaser() {
  // Tap-to-zoom lightbox: the inline media box was originally sized for
  // desktop legibility on its own (max-w-4xl, 896px), but the site owner
  // then asked (current session) for this section to match
  // HomeEnterpriseFraming's compact side-by-side layout instead of
  // stacking full width -- see the Layout comment below. Once the inline
  // box shrinks to fit a column alongside the text, NEITHER breakpoint can
  // render the embedded readout text (target IDs, ARMED status, flight
  // commands -- the entire point of this image per the file header above)
  // at a reliably legible size on its own. This modal, which renders the
  // image at its native 1198x684 resolution inside a scrollable overlay,
  // is what makes shrinking the inline box safe: it doesn't need to fit the
  // whole image on screen at once, the reader taps in and pans/scrolls to
  // read whichever part they want at full source detail, same interaction
  // shape as tapping a photo full-size in a chat app. Originally added for
  // the ~390px mobile case specifically; now load-bearing at every
  // breakpoint since the inline box is compact everywhere.
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!zoomed) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [zoomed]);

  return (
    // bg-bg/80 -> bg-bg/50: SkyScenery's contrast fix (see SkyScenery.tsx)
    // now makes the sky genuinely visible, so this section's tint is
    // loosened further to let more of it show through.
    <section className="relative overflow-hidden bg-bg/50 px-6 py-28 md:py-36">
      {/* Oversized word-fragment background texture (Pattern 1), purely
          decorative — hidden from assistive technology per Requirement 10.6.
          Capped at 15vw below sm (mobile audit, current session): at 18vw
          flat across every breakpoint, five bold uppercase characters ran
          close to the section's own edges on narrow phones; the opacity is
          already low enough (0.04) that the size difference is not a visual
          identity change, just headroom against clipping on the narrowest
          supported widths. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-4 select-none text-center font-display text-[15vw] font-bold uppercase leading-none text-fg/[0.04] sm:text-[18vw] md:top-8"
      >
        ALERT
      </span>

      {/* Layout (site-owner request, current session, superseding the prior
          "distinct silhouettes" pass described below): the stacked
          treatment made this section run tall enough that the heading and
          the whole interface image could not both fit in one screen — the
          site owner pointed at HomeEnterpriseFraming's compact
          text-left/image-right split as the model to match instead, so this
          now uses that section's exact grid shape (same 5fr/7fr split, same
          gap scale) rather than stacking.

          The "three consecutive similar blocks" concern noted here
          previously (this section, HomePlannerCTA, HomeEnterpriseFraming
          all sharing a two-column shape back to back) no longer applies:
          the narrative-arc re-sequencing above (see page.tsx's header)
          moved this section to sit between HomeOperatingLoop (a single
          full-width instrument rail, not a two-column grid) and
          HomeSpecSheet (two full-bleed dark panels, not a two-column grid
          either), so this is no longer adjacent to either HomePlannerCTA or
          HomeEnterpriseFraming at all.

          The original full-width justification (gcs.png's on-screen
          readouts need to be legible inline) no longer applies now that the
          tap-to-zoom modal above exists -- that modal is what makes this
          resize safe rather than a legibility regression. See the state
          comment above. */}
      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-start md:gap-16">
        <Reveal>
          <p className="label">Escalation</p>
          <h2 className="mt-3 text-heading font-display text-fg">
            One tap from alert to oversight
          </h2>
          <p className="mt-4 max-w-md text-body font-body text-muted">
            The system flags what is worth a look, not a live feed to sit
            and watch. An operator taps in for video and status only when
            it counts, then decides what happens next.
          </p>
        </Reveal>

        {/* max-w-2xl (672px), matching HomeEnterpriseFraming's image cap
            exactly (see that file's own comment on why 672px fills its 7fr
            column at the max-w-7xl ceiling without a gutter). At gcs.png's
            1198/684 aspect ratio that renders ~384px tall, comparable to
            Enterprise's 16:9 image at the same width. */}
        <Reveal delay={0.12} y={-20}>
          {/* -mx-6 sm:mx-0 (mobile audit, current session): cancels the
              section's own px-6 padding below sm so the inline box uses the
              full viewport width rather than viewport minus 48px on the
              single-column mobile layout, before the grid above takes over
              at md. Applied on its own wrapper, not merged onto the
              max-w-2xl/mx-auto div below, so the negative and auto margins
              never fight over the same element. */}
          <div className="-mx-6 sm:mx-0">
            <div className="mx-auto w-full max-w-2xl md:mx-0">
              <button
                type="button"
                onClick={() => setZoomed(true)}
                aria-label="View the concept interface at full size"
                className="group relative block w-full border border-grey-800 bg-bg text-left"
                style={{ aspectRatio: "1198 / 684" }}
              >
                <Image
                  src="/images/gcs.png"
                  alt="Concept ground-control-station interface showing target tracking and flight commands"
                  fill
                  sizes="(min-width: 768px) 672px, 100vw"
                  className="object-contain"
                />
                <ReticleFrame variant="dark" />
                <span className="absolute bottom-2 right-2 rounded-sm bg-bg/80 px-2 py-1 font-mono text-[10px] text-muted backdrop-blur-sm transition-colors group-hover:text-fg">
                  Tap to enlarge &#10530;
                </span>
              </button>
            </div>
          </div>
          {/* Simulated_Label (Requirement 8.1 / simulatedLabel.ts
              convention): explicit, visible disclosure that this is a
              concept composite, not a live/working system screenshot. Kept
              directly under the image (not a separately-positioned block) so
              the two read as one unit. px-6 sm:px-0 counters the -mx-6 on
              the box above so the caption text itself still respects the
              section's normal reading margin instead of touching the
              viewport edge. */}
          <p className="technical-data mx-auto mt-2 max-w-2xl px-6 text-center text-muted sm:px-0 md:mx-0 md:text-left">
            Concept interface (in development)
          </p>
        </Reveal>
      </div>

      {/* Zoom lightbox. Deliberately NOT nested inside the Reveal above (or
          any other motion.div): framer-motion writes an inline `transform`
          even at an animation's resting state, and a `transform` on an
          ancestor creates a new containing block for `position: fixed`
          descendants, which would scope this modal to that element's box
          instead of the real viewport. Rendered here as a direct child of
          `<section>` (which has no transform of its own), so `fixed
          inset-0` measures against the viewport as intended. The section's
          own `overflow-hidden` does not clip it either: overflow only clips
          descendants that participate in that ancestor's own layout box,
          which a `position: fixed` element does not. */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/95"
            onClick={() => setZoomed(false)}
          >
            <button
              type="button"
              className="fixed right-6 top-6 z-[111] font-mono text-sm text-muted hover:text-fg"
              onClick={() => setZoomed(false)}
            >
              CLOSE &#10005;
            </button>
            {/* overflow-auto, not centered-and-contained: the image below
                renders at its native 1198x684 pixel size regardless of
                viewport, so on a phone it is WIDER than the screen on
                purpose — the reader pans/scrolls (native touch-scroll,
                pinch-zoom still works too) to read any part of it at full
                source detail, the only way to actually raise resolution
                past the viewport-width ceiling described in the state
                comment above. */}
            <div className="h-full w-full overflow-auto overscroll-contain">
              <div className="flex min-h-full items-center justify-center p-6">
                <div
                  className="relative shrink-0"
                  style={{ width: 1198, height: 684 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src="/images/gcs.png"
                    alt="Concept ground-control-station interface showing target tracking and flight commands, at full detail"
                    fill
                    sizes="1198px"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
