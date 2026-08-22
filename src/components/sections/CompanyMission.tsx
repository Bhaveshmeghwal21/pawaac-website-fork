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

          {/* Site-owner request (current session): "write a para or something
              really moving psychologically and philosophically" under the
              mission heading. This is the founder-argument slot the research
              into Skydio and Shield AI identified as missing — both put a
              plain mission line up top and the conviction immediately below
              it, rather than trying to make the headline itself carry the
              feeling.
              Deliberately claim-free: no figures, customers, locations or
              capability assertions, so it needs no Change_Proposal gate and
              passes bannedTerms/sensitiveContent unchanged. The argument is
              about the nature of human attention, which is arguable on its
              own terms and does not depend on anything unpublished. */}
          <div className="mt-8 grid gap-5">
            <p className="text-body font-body leading-relaxed text-[#454545]">
              Watching is the hardest thing to ask of a person. Not because it
              is difficult, but because it is almost always uneventful. Hours
              of nothing teach the mind to expect nothing, and attention wears
              thin in exactly the conditions that need it most. A lapse never
              announces itself. It becomes visible only afterward, in what was
              missed.
            </p>
            <p className="text-body font-body leading-relaxed text-[#454545]">
              We did not build Pawaac because people fail. We built it because
              vigilance is the wrong thing to spend a person on. A machine can
              hold a horizon indefinitely at no cost to itself. What a person
              brings is judgment, and judgment is usually spent long before the
              moment it is needed. So we take the waiting, and leave the
              deciding to whoever is on watch, with their attention still
              intact.
            </p>
          </div>

          {/* Technical_Data pull-quote styling (Pattern 2) — NOT gated by
              any Change_Proposal (design.md marks this section's
              Change_Proposals column "None"). Now reads as the deliberately
              flat engineering restatement of the argument above it, which is
              why it stays rather than being replaced by the new prose. */}
          <blockquote className="mt-10 border-l-2 border-[#d6d6d6] pl-6">
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
