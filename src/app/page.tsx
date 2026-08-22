// Homepage render tree.
//
// README.md tells readers to read this header before adding or reordering a
// section, because the homepage is composed explicitly rather than generated
// from a config list. That header was lost during commit 3778442 ("Condense
// homepage and add restrained motion"), which reduced the page from eleven
// sections to six; it is restored here (finding F2 in
// docs/superpowers/plans/2026-08-20-homepage-problem-framing.md) and now
// documents the current seven section set.
//
// Order, and why each section is here:
//   1. HomeHero             What this is, who it is for, one way in.
//   2. HomeProblemFraming   The operational gap being closed. Added per
//                           finding F1: the page previously ran hero ->
//                           operating loop -> platforms, so it explained how
//                           the system works and what it costs before ever
//                           saying why any of it is needed. Qualitative only,
//                           no numerals. See the component header.
//   3. HomeOperatingLoop    How the gap is closed as a complete cycle: Dock,
//                           Dispatch, Patrol, Detect, Escalate, Return, then
//                           recharge, then Swap. GPS denied navigation
//                           spans the airborne stages and Escalate branches to
//                           the human oversight moment. Reads as the direct
//                           answer to section 2.
//   4. HomeSpecSheet        The two airframes that fly it, with headline
//                           engineering figures and links to full detail.
//   5. HomeDeploymentsPreview  Where it applies, and the critical site framing
//                           that used to live in HomeEnterpriseFraming.
//   6. HomePlannerCTA       Interactive proof: the visitor models their own
//                           coverage area in /designer.
//   7. HomeContactBand      Company, mission, credentials and the next step,
//                           consolidated into one close.
//   Footer                  Site-owner request (current session): the homepage
//                           now renders the same full Footer as every other
//                           route, rather than the `compact` variant it used
//                           to pass. The homepage was the only page missing
//                           the oversized wordmark bar and the scroll linked
//                           reveal, which read as an inconsistency between the
//                           homepage bottom and every inner page bottom. The
//                           `compact` prop itself is left in place on Footer
//                           (unused for now, still covered by Footer.test.tsx)
//                           per this repo's "don't delete, don't break things"
//                           convention — pass `compact` here again to restore
//                           the old homepage only treatment.
//
// Sections 2 and 3 (Defense_Police_Persona framing) render before the
// enterprise framing now folded into section 5, which keeps the persona
// ordering constraint satisfied.
//
// Deliberately not rendered here, left on disk unused per this repo's long
// standing "don't delete, don't break things" convention: HomeAutonomyTeaser
// (its concept interface visual moved into HomeOperatingLoop),
// HomeEnterpriseFraming (folded into HomeDeploymentsPreview), HomeCompanyStrip
// and HomeClosingVision (both folded into HomeContactBand, whose mission line
// is the one HomeClosingVision used to carry), plus the older pre condense
// set: Hero, Problem, DroneShowcase, Simplicity, VisionAI, DecisionOS,
// Traction, Gallery, Vision, Contact. Problem.tsx specifically is superseded
// by HomeProblemFraming, which reuses its narrative without its ungated stat
// counters.
//
// SkyScenery is not rendered at page level. It lives inside HomeHero so the
// absolute layer cannot escape into the rest of the page; page.test.tsx pins
// that.
import Footer from "@/components/layout/Footer";
import HomeContactBand from "@/components/sections/HomeContactBand";
import HomeDeploymentsPreview from "@/components/sections/HomeDeploymentsPreview";
import HomeHero from "@/components/sections/HomeHero";
import HomeOperatingLoop from "@/components/sections/HomeOperatingLoop";
import HomePlannerCTA from "@/components/sections/HomePlannerCTA";
import HomeProblemFraming from "@/components/sections/HomeProblemFraming";
import HomeSpecSheet from "@/components/sections/HomeSpecSheet";

export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeProblemFraming />
      <HomeOperatingLoop />
      <HomeSpecSheet />
      <HomeDeploymentsPreview />
      <HomePlannerCTA />
      <HomeContactBand />
      <Footer />
    </>
  );
}
