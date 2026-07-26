"use client";

// HomeClosingVision — closing cinematic mission-statement section, added
// per explicit site-owner request (current session) as a 9th Homepage
// section, rendered after HomeContactBand and directly above Footer.
//
// This reintroduces the "closing vision section" role originally
// specified in WEBSITE_PLAN.md's SECTION 11 ("THE VISION") and flagged as
// outstanding in HOMEPAGE_MISSING_PARTS.md ("Add the closing vision
// section... a full-width cinematic landscape or aerial visual supports a
// large mission statement, concise supporting copy...") — that role was
// deliberately dropped during the Task 16 curation down to 8 sections
// (see page.tsx's comments on Vision.tsx), but the site owner has now
// asked for an equivalent closing section back, modeled directly on a
// reference screenshot they supplied (a full-bleed dark section with a
// large mission-style closing line sitting just above the footer nav).
//
// Deliberately reuses the site's existing (fixed) SkyScenery backdrop
// rather than introducing a second background image — consistent with
// every other section on the page, which all show SkyScenery through a
// semi-transparent tint rather than each having their own background.
// No Change_Proposal gates this section: the copy below is a mission
// statement, not a numeral/metric/deployment claim, so nothing here
// requires OCP-style gating.
//
// Headline removal (site-owner request, current session): the section's
// h2 headline ("Autonomous eyes, so critical sites never go dark.") was
// removed per explicit request. The "Vision" label and supporting
// sentence remain; the section itself is unchanged otherwise.
//
// Punctuation follow-up (site-owner request: no hyphens/dashes on the
// homepage): the supporting sentence previously used an em dash to
// introduce its closing list ("...gap in watch — borders, bases, and the
// infrastructure a country runs on."); reworded to a colon instead, same
// meaning.
// Background layer (site-owner request, current session): hosts the Sentrivion
// as a decorative airframe cutout bleeding off the RIGHT edge — see
// AirframeGhost.tsx for how the cutouts were made and why the layer is static
// and scrimmed. The Sentrivion goes here rather than in either section above
// because this section's copy is the continuous-coverage closing statement and
// the Sentrivion is the long-endurance/long-range platform of the two; its
// wide wingspan also suits a wide, sparse band. This also gives the section
// some visual weight, which it previously lacked entirely (it renders at
// roughly 465px with a label and one sentence in it).
//
// `opacity` is materially lower here than in HomeSpecSheet/HomeCompanyStrip,
// and `bleed` materially higher. Two compounding reasons, both measured
// against the real composited backdrop rather than guessed:
//
//   - This section tints SkyScenery at bg-bg/70 rather than bg-bg/50 AND sits
//     over the dark lower half of that photo, so an identical alpha reads
//     roughly twice as strongly here as it does in HomeSpecSheet.
//   - The Sentrivion cutout is a broad, low-detail wing surface (43% of its
//     own bounding box is opaque, against 15% for the HawkAI plan view), so at
//     any normal opacity it reads as a bright mass rather than as an airframe.
//
// The bleed is deliberately the SHALLOWEST of the three hosts despite that,
// which is the opposite of the obvious fix. Cropping this particular airframe
// hard was tried first and looked worse: front-on, a Sentrivion wing is a
// featureless rounded slab, and the swept wingspan is the only thing that
// makes the aircraft recognisable, so a deep crop threw away the shape and
// left a vague light patch. Showing most of the span and compensating with a
// much lower opacity keeps the silhouette legible as an aircraft while
// carrying less brightness overall than the tighter crop did.
import AirframeGhost from "@/components/ui/AirframeGhost";
import Reveal from "@/components/ui/Reveal";

export default function HomeClosingVision() {
  return (
    <section className="relative overflow-hidden bg-bg/70 px-6 py-32 md:py-44">
      {/* Decorative only (Requirement 10.6). */}
      <AirframeGhost
        src="/images/airframe-sentrivion.webp"
        width={708}
        height={429}
        side="right"
        opacity={0.06}
        bleed={0.22}
        scrim={0.45}
        className="bottom-[-16%] w-[105vw] md:w-[52vw]"
      />
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <Reveal>
          <p className="label justify-center">Vision</p>
          <p className="mx-auto mt-5 max-w-xl text-body font-body text-muted">
            Pawaac exists to make continuous, pilotless coverage the
            default for the places that can least afford a gap in
            watch: borders, bases, and the infrastructure a country
            runs on.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
