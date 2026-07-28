// Spec: pawaac-design-language-evolution — Task 16 (Update Homepage to
// curated 8-section set)
// Requirements: 4.1, 4.3, 4.4, 5.1, 5.4, 6.1, 6.3, 6.4
// Design: design.md -> Page Specifications -> Homepage
//
// Replaces the old single-page render tree (Hero, Problem, DroneShowcase,
// Simplicity, VisionAI, DecisionOS, Traction, Gallery, Vision, Contact)
// with the curated 8-section set from design.md's Homepage table:
//   1. HomeHero                  (Defense_Police_Persona)
//   2. HomeSpecSheet             (Defense_Police_Persona)
//   3. HomeDeploymentsPreview    (Defense_Police_Persona)
//   4. HomeAutonomyTeaser        (Both)
//   5. HomePlannerCTA            (Both)
//   6. HomeEnterpriseFraming     (Enterprise_Persona)
//   7. HomeCompanyStrip          (Both)
//   8. HomeContactBand           (Both)
//
// DroneShowcase (migrated to /product, task 10), VisionAI and DecisionOS
// (migrated to /autonomy, task 11), and Contact (migrated to /contact,
// task 14) are removed from this render tree. Those component files are
// left on disk, unused, consistent with the "don't delete, don't break
// things" convention already used by tasks 10-15.
//
// Task 65 note: Deployments_Page (previously migrated from Traction.tsx at
// /deployments, task 12) has been removed entirely per the site-owner
// decision. Section 3 (HomeDeploymentsPreview) remains rendered here as a
// purely illustrative teaser (decision option (c)) with its outbound
// "View all deployments" link removed, since there is no longer a
// Deployments_Page for it to link to. Traction.tsx itself is unaffected —
// it was already unused on the Homepage as of task 16.
//
// Problem.tsx, Simplicity.tsx, Gallery.tsx, and Vision.tsx are also removed
// from this render tree rather than adapted, because none of their content
// maps cleanly onto one of the 8 specified sections above without either
// duplicating another section's content or introducing a 9th/10th
// "orphaned" section not represented in design.md's Homepage table:
//   - Problem.tsx (unconfirmed stat counters — border km, patrol coverage,
//     etc.) duplicates the "field-readiness" framing HomeSpecSheet already
//     covers, and its numerals are exactly the kind of unconfirmed figure
//     OCP-02 gates — keeping it would smuggle ungated numerals onto the
//     page.
//   - Simplicity.tsx ("how it works" steps) overlaps with the autonomy
//     narrative now owned by HomeAutonomyTeaser (Section 4) and, in more
//     detail, by Autonomy_Page itself (task 11) — it is not one of the 8
//     table rows, so it is dropped here rather than kept as an extra
//     section.
//   - Gallery.tsx (photo grid with fabricated captions/locations like
//     "Tawang", "Northern Unit", "ASC Bangalore") is dropped: it is not one
//     of the 8 table rows, and its invented location/unit references are
//     the kind of unverified content Requirement 8.1 constrains — its
//     imagery treatment informed HomeDeploymentsPreview's abstract sector
//     thumbnails instead (Section 3).
//   - Vision.tsx ("data layer for physical security" close-out) overlaps
//     with the company/trust framing now owned by HomeCompanyStrip
//     (Section 7) and the contact framing owned by HomeContactBand
//     (Section 8) — it is not one of the 8 table rows, so it is dropped
//     rather than kept as a 9th section.
// All four files are left on disk, unused, per the same convention noted
// above.
//
// Persona ordering (Property 7 / Requirement 6.1, 6.3): Sections 1-3
// (Defense_Police_Persona) render before Section 6
// (Enterprise_Persona); Sections 4, 5, 7, 8 (Both) sit in table order,
// which is already consistent with that constraint.
import HomeHero from "@/components/sections/HomeHero";
import HomeOperatingLoop from "@/components/sections/HomeOperatingLoop";
import HomeAutonomyTeaser from "@/components/sections/HomeAutonomyTeaser";
import HomeSpecSheet from "@/components/sections/HomeSpecSheet";
import HomeDeploymentsPreview from "@/components/sections/HomeDeploymentsPreview";
import HomeEnterpriseFraming from "@/components/sections/HomeEnterpriseFraming";
import HomePlannerCTA from "@/components/sections/HomePlannerCTA";
import HomeCompanyStrip from "@/components/sections/HomeCompanyStrip";
import HomeClosingVision from "@/components/sections/HomeClosingVision";
import HomeContactBand from "@/components/sections/HomeContactBand";
import Footer from "@/components/layout/Footer";
import SkyScenery from "@/components/ui/SkyScenery";

// SkyScenery (site-owner-requested full-bleed background, live
// visual-preview feedback): a fixed, viewport-sized, purely decorative
// backdrop rendered once here so it sits behind every section below.
// Requirement 10.6: aria-hidden + pointer-events-none, handled inside
// SkyScenery itself. Sections that need to let it show through have had
// their solid `bg-bg` swapped for a semi-transparent `bg-bg/NN` — see
// each Home*.tsx section for details; HomeEnterpriseFraming keeps its
// solid `bg-white` for text-contrast readability on that light section.
//
// HomeClosingVision (site-owner request, current session): a 9th section
// re-added above Footer — see HomeClosingVision.tsx for full rationale.
//
// ── Homepage UX audit (current session): one section added ───────────────
//
// HomeOperatingLoop, before HomeSpecSheet. Net-new; nothing was removed
// from the render tree.
//
// A HomeTrustStrip section (a credential strip carrying the DGCA COMPLIANT /
// MeitY RECOGNIZED badges plus the operating entity and founding year, which
// otherwise appear only in the Footer at ~97% scroll depth) was added here
// and then REMOVED at the site owner's explicit request after reviewing it
// live. Do not reintroduce it without asking. The underlying observation
// still stands and is unaddressed: those two credentials are the fastest
// available answers to "is this a real, cleared vendor" for the
// Defense_Police_Persona, and they are currently buried in the Footer.
//
// Ordering rationale:
//
//   - HomeOperatingLoop sits BEFORE HomeSpecSheet, not after it. The
//     previous order asked a first-time visitor to absorb six hardware
//     numerals before anything had explained what the system does with
//     them. Task 16's own note on HomeSpecSheet flagged a version of this
//     ("spec numerals named before the platforms were"), which was patched
//     with a bridging sentence; putting the operating cycle first fixes it
//     at the root, and the specs then land as evidence for a claim the
//     reader has already been given. HomeOperatingLoop is a "Both"-persona
//     section and still renders well before the sole Enterprise_Persona
//     section (HomeEnterpriseFraming), so Property 7 / Requirement 6.1,
//     6.3's persona ordering constraint continues to hold.
//
// Net scroll effect: un-jacking Pinned_Spec_Sheet (see PinnedSpecSheet.tsx)
// freed ~4,500px, and this section spends part of it on content that argues
// rather than indexes. The page gets meaningfully shorter overall.
//
// ── Narrative arc re-sequencing (site-owner request, current session) ────
//
// Site owner: "this homepage definitely states a story but i dont think it
// is building it properly... maybe we can rearrange the sections... maybe
// rewriting the texts." Read every section's actual copy top to bottom
// (not just its visual treatment) rather than assuming the existing task
// order was narratively sound just because it was already implemented, and
// found four concrete breaks in how the story built:
//
//   1. The autonomy mechanism was explained twice, three sections apart —
//      once concretely by HomeOperatingLoop (dock/patrol/detect/alert/
//      respond) and again, more abstractly, by HomeAutonomyTeaser ("sense,
//      decide, act"). A reader who absorbed the first got nothing new from
//      the second; it read as a loop-back, not a build.
//   2. HomeDeploymentsPreview's eyebrow was "Defense & police" — the same
//      persona tag that determines this codebase's own section-ordering
//      rule (Property 7 / Requirement 6.1, 6.3: Defense_Police_Persona
//      sections render before the sole Enterprise_Persona section) — but
//      its own tiles (after this session's sector-swap work) are defense,
//      police, industrial AND disaster response. Half its content
//      contradicted its own persona label, while sitting two sections away
//      from the one section (HomeEnterpriseFraming) that actually owns that
//      other half.
//   3. HomePlannerCTA is the single most concrete proof point on the page
//      (a real, working tool, not a mockup — see its own file header) but
//      sat sandwiched between an abstract concept section and a persona
//      pivot, where it functioned as a detour rather than a payoff.
//   4. HomeClosingVision's mission paragraph is the page's strongest
//      emotional beat and is effectively the Hero's opening claim restated
//      with full weight — but it rendered AFTER HomeContactBand's CTA,
//      burying the emotional peak after the ask instead of building to it.
//
// Fixes, in render-tree order below:
//
//   - HomeAutonomyTeaser moves directly after HomeOperatingLoop and is
//     reworded (see that file's own header) to illustrate the specific
//     escalation claim HomeOperatingLoop's closing line just made, rather
//     than re-explaining the whole loop in the abstract. Same asset (the
//     GCS concept mockup), same Simulated_Label disclosure, different job.
//   - HomeDeploymentsPreview's eyebrow changes from "Defense & police" to
//     the persona-neutral "Sectors" (heading/copy/tiles already describe
//     all four sectors accurately — only the label was wrong) and it now
//     sits immediately before HomeEnterpriseFraming, so the persona
//     widening reads as a deliberate "and it is not only defense and
//     police" turn instead of an unrelated section two slots later.
//   - HomeEnterpriseFraming moves up to follow HomeDeploymentsPreview
//     directly, for the same reason.
//   - HomePlannerCTA moves down to close out this proof arc (Specs ->
//     Sectors -> Enterprise -> Planner) as its capstone — "here is hardware
//     proof, here is where/who it is for, now try it yourself" — instead of
//     interrupting that arc partway through.
//   - HomeClosingVision moves above HomeContactBand, so the page peaks
//     emotionally and then asks, rather than asking and then philosophizing.
//
// Property 7 / Requirement 6.1, 6.3 still holds under the new order:
// HomeEnterpriseFraming (Enterprise_Persona) still renders after every
// Defense_Police_Persona section (Hero, HomeAutonomyTeaser, HomeSpecSheet)
// — it is simply now IMMEDIATELY preceded by the newly-persona-neutral
// HomeDeploymentsPreview rather than separated from it by two sections.
export default function Home() {
  return (
    <>
      <SkyScenery />
      <HomeHero />
      <HomeOperatingLoop />
      <HomeAutonomyTeaser />
      <HomeSpecSheet />
      <HomeDeploymentsPreview />
      <HomeEnterpriseFraming />
      <HomePlannerCTA />
      <HomeCompanyStrip />
      <HomeClosingVision />
      <HomeContactBand />
      <Footer />
    </>
  );
}
