// Spec: pawaac-design-language-evolution — Task 70 (Homepage Section 7, supersedes Task 16)
// Requirements: 4.4
// Design: design.md -> Page Specifications -> Homepage, Section 7
//         (Company / trust strip) — partially resolved OCP-05
//
// Persona: Both. Technical_Data metadata row (P2), linking to
// Company_Page (/company, task 13). OCP-05 is now PARTIALLY resolved: the
// founding year (2025) is approved for public display and is added below
// as the third item in the existing metadata row. Team size and HQ
// location remain open/undisclosed (narrowed OCP-05 — see task 44) and are
// intentionally NOT added here.
//
// Entrance motion: this was the only Homepage section with no scroll
// entrance at all, breaking the page's motion rhythm right before the
// closing HomeContactBand. Wrapped in Reveal_On_Scroll (same shared
// component/fallback every other section already uses) rather than a new
// pattern — the metadata row gets a slight extra delay so it settles in
// just after the heading/CTA row above it.
//
// Background layer (site-owner request, current session): hosts the HawkAI
// Plus three-quarter view as a decorative airframe cutout bleeding off the
// LEFT edge — see AirframeGhost.tsx for how the cutouts were made and why the
// layer is static and scrimmed. This section is the right host for the
// "here is the aircraft" shot specifically because its copy is the company
// claim ("Built by Bajrang Dronetech Pvt Ltd", "Engineering and operations
// based in India"), and it was previously bare type over SkyScenery. Bleeding
// left, while HomeSpecSheet above bleeds right, keeps the two from reading as
// the same treatment repeated.
//
// Follow-up (site-owner request, same session): stepped up in size alongside
// the plan view in HomeSpecSheet — see that file's header for why the scrim has
// to be raised with the opacity rather than the opacity being raised alone.
//
// BRIGHTNESS IS CAPPED HERE, and that is a hard constraint rather than a taste
// call. This section is the tightest on the page for contrast: it is short
// (~491px), and its 11px "Company" label, 16px supporting sentence and 12px
// technical-data row are all --color-muted (#8a8a8a) spread across the same
// left half the airframe bleeds into. #8a8a8a needs a near-black backdrop to
// clear AA at those sizes, so there is very little brightness budget here.
//
// A search over layer width, bleed, opacity, fade and vertical offset — scored
// against WCAG ratios measured on the real composite at TWO viewport widths at
// once, and required both to reach AA where the bare sky already does and never
// to worsen a run the bare sky already fails — leaves only 5 viable
// configurations, and EVERY one of them sits at opacity 0.22. Opacity 0.30
// looked viable until the no-worsening rule was added: it passed at 1441px
// while quietly pushing the "Company" label from 4.45 to 3.96 at 1265px.
//
// Opacity 0.22 -> 0.26, section tint bg-bg/50 -> bg-bg/55 (site-owner
// request, current session: "make the drone image slightly brighter... you
// may decrease the brightness of sky image"). The prior search varied the
// AIRFRAME's own knobs (width/bleed/opacity/fade/offset) against a FIXED
// section tint; it never tried raising the section's own tint jointly with
// opacity, which is what actually reopens the brightness budget here: a
// darker base sky gives the same 0.26-opacity airframe more headroom before
// the muted runs behind it fail, rather than fighting the airframe's
// opacity in isolation. Re-verified against the real composite the same
// way as before (worst case across many simulated SkyScenery scroll
// alignments, since it is `position: fixed`), at THREE breakpoints this
// time (1265px, 1878px, and 390px mobile, which keeps its own separate
// opacity below but shares this tint) -- every one of the 7 text runs
// improved at every breakpoint versus the previously-shipped tint=0.50/
// opacity=0.22, none regressed. Script in the working session's
// scratchpad (company_strip_sweep.py) if this needs revisiting.
//
// Mobile's own opacity (0.28, set via the base `opacity` prop below) is
// intentionally left unchanged: the site owner's request was scoped to the
// desktop screenshot they shared, and mobile already improved as a side
// effect of the shared tint increase alone (its airframe opacity is
// untouched, so darkening the sky behind it is a strict improvement with
// nothing to trade off).
"use client";

import Link from "next/link";
import AirframeGhost from "@/components/ui/AirframeGhost";
import Reveal from "@/components/ui/Reveal";

export default function HomeCompanyStrip() {
  return (
    // bg-bg/80 -> bg-bg/50: SkyScenery's contrast fix (see SkyScenery.tsx)
    // now makes the sky genuinely visible, so this section's tint is
    // loosened further to let more of it show through.
    //
    // bg-bg/50 -> bg-bg/55 (site-owner request, current session): a modest
    // darkening of the sky background, done jointly with the airframe
    // opacity bump below -- see the AirframeGhost comment for the verified
    // contrast rationale.
    <section className="relative bg-bg/55 px-6 py-20 md:py-24">
      {/* Decorative only (Requirement 10.6). Pulled below the section's
          bottom edge so the crop keeps the body/arms/gimbal in frame and
          drops the landing legs, which are the least legible part of the
          airframe at this opacity. */}
      <AirframeGhost
        src="/images/airframe-hawkai.webp"
        width={1041}
        height={580}
        side="left"
        opacity={0.28}
        bleed={0.35}
        scrim={0.78}
        scrimStart={0.12}
        fade={1}
        // Mobile carries a HIGHER opacity than desktop here (0.28 vs 0.22) and a
        // much smaller bottom offset. Both are measured, not stylistic: at 390px
        // the layer is only 359px tall against 702px on desktop, so the desktop
        // offset pushed all but its top 75px below the section, and once it sits
        // in frame properly it clears the muted runs with more headroom than the
        // desktop layout does.
        className="bottom-[-3%] w-[165vw] max-w-[1260px] md:bottom-[-208px] md:w-[98vw] md:[--airframe-opacity:0.26]"
      />
      <div className="relative z-10 mx-auto max-w-7xl">
        <Reveal>
          <div className="grid gap-8 border-t border-line pt-10 md:grid-cols-[2fr_1fr] md:items-end">
            <div>
              <p className="label">Company</p>
              <h2 className="mt-3 text-heading font-display text-fg">
                Built by Bajrang Dronetech Pvt Ltd
              </h2>
              <p className="mt-4 max-w-md text-body font-body text-muted">
                Engineering and operations based in India, purpose-built for
                the field.
              </p>
            </div>

            <div className="md:text-right">
              <Link
                href="/company"
                className="inline-block border border-fg px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-fg transition-colors hover:bg-fg hover:text-bg"
              >
                About the company
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Technical_Data metadata row — founding year (2025) added as the
            third item per the resolved, narrowed OCP-05 (Requirement 4.4).
            Team size and HQ location remain gated/undisclosed (task 44). */}
        <Reveal delay={0.1}>
          <div className="technical-data mt-8 flex flex-wrap gap-x-10 gap-y-2 text-muted">
            <span>Bajrang Dronetech Pvt Ltd</span>
            <span>Engineering &amp; operations · India</span>
            <span>Founded 2025</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
