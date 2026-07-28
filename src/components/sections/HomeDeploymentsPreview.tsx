"use client";

// Spec: pawaac-design-language-evolution — Task 16 (Homepage Section 3)
// Requirements: 4.1, 4.3, 5.1, 5.4, 6.1, 6.3
// Design: design.md -> Page Specifications -> Homepage, Section 3
//         (Deployment sectors preview)
//
// Persona: Defense_Police_Persona. Real photography sector thumbnails with
// Label_Caps sector tags (P2), Reveal_On_Scroll entrance (P5).
//
// OCP-03 RESOLVED (site-owner decision, current session): the prior
// abstract-icon-only restriction is explicitly lifted by the site owner.
// Each sector tile shows a real, commercially-licensed photo instead of an
// abstract line-art icon. Defense and police tiles use aerial photography
// specifically per site-owner request (an aerial view fits the
// "sense from above" framing better than a ground-level shot):
//   - defense: "Aerial View Of Hindon Airbase IMG_9896_04.jpg" by Sumita
//     Roy Dutta, an aerial view of Hindon Air Force Station (Ghaziabad,
//     Uttar Pradesh), CC BY-SA 4.0
//     (https://creativecommons.org/licenses/by-sa/4.0/).
//   - police: "Downtown hyderabad drone.png" by Shredpave, a drone aerial
//     view of a major Indian city (Hyderabad), CC0 1.0 Universal Public
//     Domain Dedication (no attribution required) — paired with "police"
//     as a city/urban-patrol framing rather than a specific police
//     facility (no real facility exists to source responsibly).
//   - industrial: "India industry.jpg" by Abhisek Sarda, CC BY 2.0
//     (https://creativecommons.org/licenses/by/2.0/).
//   - disaster response: "An aerial view of flood-ravaged Rudraprayag, in
//     Uttarakhand.jpg", published by the Ministry of Defence / Press
//     Information Bureau, Government of India (PIB ID 47848), Government
//     Open Data License - India (GODL)
//     (https://www.data.gov.in/government-open-data-license-india). Like
//     every other tile here, this depicts a real, specific, named place
//     (a documented 2013 Uttarakhand flood site) but is used purely as a
//     generic "this is the kind of scene disaster response operations
//     happen in" sector illustration, exactly like the police tile uses
//     an identifiable Hyderabad skyline and the industrial tile an
//     identifiable Mumbai-area facility — none of the four claim Pawaac
//     was involved at that specific location (still compliant with the
//     "no customer/partner identity disclosed" constraint that motivated
//     the original OCP-03 gating).
// All four sourced from Wikimedia Commons (upload.wikimedia.org), verified
// license terms permit commercial use; credit given here in code comments
// per license terms (no on-page attribution UI exists in this component).
// Grayscale filter applied to match every other real photo on the site
// (Requirement 3.1-3.2).
//
// Defense/infrastructure re-sourcing (site-owner request, current
// session): the site owner flagged the original defense and
// infrastructure tiles as "technically wrong" (approving police and,
// with reservations, industrial). Investigating turned up a real sourcing
// bug in the ORIGINAL defense tile: the prior session's own code comment
// claimed "sector-defense.jpg" was an aerial view of an Indian Army
// cantonment, but the actual file is a ground-level photo of a passenger
// train — "Bangalore Cantonment" is also a railway station name in
// Bangalore, and the earlier sourcing pass evidently picked up the
// station photo rather than a military-cantonment photo despite the
// matching-sounding title. Re-verified this time by downloading and
// visually inspecting every candidate before use, not just reading its
// Commons title/caption.
//
// Infrastructure -> disaster response (site-owner request, same session,
// follow-up): the site owner asked what actually distinguishes
// "industrial" from "infrastructure" and noted the two read as visually
// similar generic-aerial-industrial-complex shots even though they are
// conceptually distinct (industrial = commercial manufacturing;
// infrastructure = critical public utility systems). Rather than just
// finding a more visually distinct infrastructure photo, the site owner
// asked to replace that fourth tile with "disaster response" instead — a
// genuinely different, non-overlapping category that PAWAAC's own
// long-endurance/thermal-imaging surveillance capability plausibly
// extends to (search, damage assessment, monitoring), and one this site
// has not claimed anywhere before, so it was confirmed explicitly rather
// than assumed. The Howrah Bridge tile it replaced (before that, the
// power-plant tile) is left unused on disk (sector-infrastructure.jpg,
// sector-infrastructure-v2.jpg), per this codebase's established
// "don't delete, don't break things" convention.
//
// Task 65 update: Deployments_Page (/deployments) has been removed
// entirely. Per task 65's decision point, this section keeps its default
// option (c) treatment — a purely illustrative teaser with no outbound
// link. The "View all deployments" CTA that previously linked to
// /deployments has been removed; headline, supporting sentence, and
// visual treatment are otherwise unchanged.
//
// Eyebrow relabel + reposition (homepage narrative-arc review, current
// session): the eyebrow read "Defense & police" — the same persona tag this
// codebase uses to decide section order (Property 7 / Requirement 6.1,
// 6.3) — but the four tiles it labels are defense, police, INDUSTRIAL and
// DISASTER RESPONSE (the latter two added in this session's earlier sector
// re-sourcing work), which are Enterprise-persona territory. The label
// contradicted its own content. Changed to the persona-neutral "Sectors",
// matching this codebase's convention for Both-persona sections (compare
// "Planner", "Company", "Contact us"); the heading and supporting sentence
// already named all four sectors accurately, so nothing else needed
// rewording. This section also moves in page.tsx to sit immediately before
// HomeEnterpriseFraming, so the persona widening its own tiles already
// implied reads as a deliberate turn instead of a mismatched label two
// sections away from the content it actually described.
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

const SECTORS = [
  {
    tag: "defense",
    src: "/images/sector-defense-v2.jpg",
    alt: "Aerial view of an Indian Air Force base",
  },
  {
    tag: "police",
    src: "/images/sector-police.jpg",
    alt: "Drone aerial view of a major Indian city",
  },
  {
    tag: "industrial",
    src: "/images/sector-industrial.jpg",
    alt: "Aerial view of an industrial area near Mumbai, India",
  },
  {
    tag: "disaster response",
    src: "/images/sector-disaster-response.jpg",
    alt: "Aerial view of flood damage in Rudraprayag, Uttarakhand",
  },
];

export default function HomeDeploymentsPreview() {
  return (
    // bg-bg/80 -> bg-bg/50: SkyScenery's contrast fix (see SkyScenery.tsx)
    // now makes the sky genuinely visible, so this section's tint is
    // loosened further to let more of it show through.
    <section className="relative overflow-hidden bg-bg/50 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal className="max-w-2xl">
          <p className="label">Sectors</p>
          <h2 className="mt-3 text-heading font-display text-fg">
            Where Pawaac is built to operate
          </h2>
          <p className="mt-4 text-body font-body text-muted">
            Borders, facilities, and critical sites across defense, police,
            industrial, and disaster response deployments.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SECTORS.map((s, i) => (
            <Reveal key={s.tag} delay={0.05 + i * 0.08}>
              <div
                className="relative w-full grayscale"
                style={{ aspectRatio: "16 / 9" }}
              >
                <Image
                  src={s.src}
                  alt={s.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <span className="label absolute left-4 top-4 text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
                  {s.tag}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
