"use client";

// Spec: pawaac-design-language-evolution — Task 13 (Company_Page Section 2)
// Requirements: 4.1, 4.3
// Design: design.md -> Page Specifications -> Company_Page, Section 2
//         (Mission & approach)
//
// Persona: Both. This section has NO linked Change_Proposal in design.md
// (its Change_Proposals column is "None") — the headline and supporting
// sentence below are rendered fully and exactly as specified, with no
// gating. Uses Technical_Data pull-quote styling (Pattern 2) per the
// design table; no visual element beyond the styled pull-quote is
// specified for this section.
import Reveal from "@/components/ui/Reveal";

export default function CompanyMission() {
  return (
    <section className="relative bg-white px-6 py-28 text-[#080808]">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <p className="label text-[#6b6b6b]">Mission</p>
          <h2 className="mt-3 text-heading font-display text-[#080808]">
            {/* Site-owner request (current session), informed by a review of
                how the category leaders actually write this line. Skydio
                ("Our mission is to make the world more productive, creative,
                and safe with autonomous flight"), Shield AI ("Our mission is
                to protect service members and civilians with intelligent
                systems") and Anduril ("Transforming US and allied military
                capabilities with advanced technology") all use the same
                deliberately plain "protect/enable [who] with [what]"
                construction rather than a rhetorical headline. Two earlier
                attempts here leaned literary ("Why we build autonomy, not
                remote control", then "No one should have to choose what goes
                unwatched") and read as less serious than the plain form, not
                more. The conviction belongs in the founder story below this
                line, which is where Shield AI and Skydio both put it.
                Phrasing echoes HomeContactBand's closing line, "the places
                that can least afford a gap in watch", so the two pages state
                one mission rather than two. */}
            Our mission is to protect the places that cannot afford a gap in
            watch.
          </h2>

          {/* Technical_Data pull-quote styling (Pattern 2) — NOT gated by
              any Change_Proposal (design.md marks this section's
              Change_Proposals column "None"). */}
          <blockquote className="mt-8 border-l-2 border-[#d6d6d6] pl-6">
            <p className="technical-data text-lg leading-relaxed text-[#454545]">
              Autonomous systems reduce operator burden in high-stakes
              environments.
            </p>
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
}
