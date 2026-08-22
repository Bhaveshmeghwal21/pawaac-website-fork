// Platform page (/product), Section 4 — the proposed solution, end to end.
//
// Position (site-owner request, current session): "before explaining how the
// platform works, add the airframes photos first, then use drone vision model
// output second then explaination of whole platform". This section led the
// page body before that request and now follows ProductHardware and
// ProductDetectionDemo, so the reader meets the aircraft and its output before
// the cycle that ties them together.
//
// Site-owner request (current session): "fill the platform page exactly how
// does the proposed solution by pawaac platform, in short ... how are they
// gonna work how do we plan to do surveillance this whole page is for that".
//
// This is the expanded counterpart to HomeOperatingLoop.tsx, which carries
// the same seven steps as a homepage teaser. The step names and one-line
// bodies are copied verbatim from the site owner's supplied text so the two
// surfaces cannot drift; the only net-new copy here is the short "what that
// means" line under each step, which explains the mechanism without adding
// any figure, location, customer or capability that is not already
// published elsewhere on the site.
//
// Deliberately claim-free: no numerals, no endurance/range/altitude values,
// no detection accuracy, no named sites. Every figure on this site must
// trace to an already-published source (see README -> Content governance),
// and nothing in this section needs one to make the concept legible.
//
// "GPS denied navigation" is a site-owner supplied capability statement
// already approved and shipped in HomeOperatingLoop.tsx; it spans the
// airborne portion rather than posing as a separate step, and no
// implementation method is named.
//
// Dock mechanism (site-owner correction, current session): "what dock does is
// swapping the battery not charging." The Swap step's own body, which the
// site owner supplied, already said "Rapid battery recovery" rather than
// naming a recharge, so it is unchanged. The Dock step's supporting detail
// line previously said the aircraft sat "holding charge" and now says "ready
// to fly" instead. See ProductDockCharging.tsx, where the same correction
// removed the charging language from the dock section's heading and body.
//
// The Dock step's body still reads "Protected on site, charged and ready."
// That is the site owner's own verbatim wording, it is shared with
// HomeOperatingLoop.tsx, and it describes the state of the AIRCRAFT (it has a
// charged battery and can fly) rather than claiming the dock performs the
// charging. It is deliberately left alone: changing it here would also put
// this page out of step with the homepage, which
// ProductPlatformPage.test.tsx actively fails on.
import Reveal from "@/components/ui/Reveal";
import OperatingStepSymbol, {
  type OperatingSymbolVariant,
} from "@/components/ui/OperatingStepSymbol";

type Step = {
  name: string;
  body: string;
  detail: string;
  symbol: OperatingSymbolVariant;
};

type Phase = {
  phase: string;
  steps: Step[];
};

const PHASES: Phase[] = [
  {
    phase: "On site",
    steps: [
      {
        name: "Dock",
        body: "Protected on site, charged and ready.",
        detail:
          "The aircraft lives at the location it watches, enclosed against weather and ready to fly, so a mission does not wait on a crew arriving with a case.",
        symbol: "dock",
      },
      {
        name: "Dispatch",
        body: "Launches on schedule or when called.",
        detail:
          "Two triggers, one behaviour: a routine patrol on a set schedule, or an on demand launch when something needs looking at now.",
        symbol: "dispatch",
      },
    ],
  },
  {
    phase: "In the air",
    steps: [
      {
        name: "Patrol",
        body: "Follows the mission inside defined bounds.",
        detail:
          "The route and its limits are set before takeoff. The aircraft holds to that plan rather than being flown stick by stick.",
        symbol: "patrol",
      },
      {
        name: "Detect",
        body: "Onboard vision identifies what needs attention.",
        detail:
          "Interpretation happens on the aircraft, so the decision about what matters does not depend on somebody watching a live feed at the time.",
        symbol: "detect",
      },
      {
        name: "Escalate",
        body: "A located alert reaches the operator.",
        detail:
          "The output is not footage to review later. It is a specific alert, tied to a place, raised at the moment it is found.",
        symbol: "escalate",
      },
    ],
  },
  {
    phase: "Back on site",
    steps: [
      {
        name: "Return",
        body: "The aircraft returns after the mission.",
        detail:
          "Recovery is part of the mission rather than a separate task, which is what lets the cycle repeat without a handover.",
        symbol: "return",
      },
      {
        name: "Swap",
        body: "Rapid battery recovery prepares the next flight.",
        detail:
          "Turnaround is the real limit on continuous watch, so the dock is built around getting the aircraft airworthy again quickly.",
        symbol: "recharge",
      },
    ],
  },
];

// Continuous 01..07 numbering across the three phases, computed once at
// module scope. Doing this with a counter incremented inside the render's
// .map() callback is a lint error (react-hooks/immutability: reassigning a
// variable after render completes), and would also be wrong on re-render.
const NUMBERED_PHASES: {
  phase: string;
  steps: (Step & { number: string })[];
}[] = (() => {
  let counter = 0;
  return PHASES.map((phase) => ({
    phase: phase.phase,
    steps: phase.steps.map((step) => {
      counter += 1;
      return { ...step, number: String(counter).padStart(2, "0") };
    }),
  }));
})();

export default function ProductOperatingLoop() {
  return (
    <section className="relative bg-bg px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="label">Operating concept</p>
          <h2 className="mt-3 text-heading font-display text-fg">
            How the platform runs a watch
          </h2>
          <p className="mt-4 max-w-2xl text-body font-body text-muted">
            Surveillance fails at the seams: the gap between shifts, the feed
            nobody is watching, the aircraft waiting on a crew. The platform is
            built as one closed cycle so those seams do not exist. It starts and
            ends at the dock.
          </p>
        </Reveal>

        <div className="mt-14 space-y-12">
          {NUMBERED_PHASES.map((phase) => (
            <div key={phase.phase}>
              <Reveal>
                <div className="flex items-center gap-4">
                  <p className="technical-data whitespace-nowrap text-fg">
                    {phase.phase}
                  </p>
                  <span aria-hidden="true" className="h-px flex-1 bg-line" />
                </div>
              </Reveal>

              <ol className="mt-6 grid gap-px border border-line bg-line md:grid-cols-3">
                {phase.steps.map((step) => (
                  <li key={step.name} className="bg-bg">
                    <Reveal className="h-full">
                      <article
                        data-operating-step
                        className="flex h-full flex-col gap-4 p-6 md:p-7"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <OperatingStepSymbol variant={step.symbol} />
                          <span
                            aria-hidden="true"
                            className="technical-data text-muted"
                          >
                            {step.number}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-display text-xl font-bold leading-snug text-fg">
                            {step.name}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-fg/70">
                            {step.body}
                          </p>
                          <p className="mt-3 text-sm leading-relaxed text-muted">
                            {step.detail}
                          </p>
                        </div>

                        {step.symbol === "escalate" && (
                          <p className="technical-data mt-auto inline-flex items-center gap-2 border-t border-line pt-4 text-fg">
                            <span
                              aria-hidden="true"
                              className="size-1.5 bg-fg"
                            />
                            Human oversight
                            <span aria-hidden="true">↓</span>
                          </p>
                        )}
                      </article>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {/* Navigation resilience spans the airborne portion of the loop
            rather than sitting inside it as an eighth step. */}
        <Reveal>
          <div className="mt-12 border border-line bg-bg-2 p-6 md:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
              <OperatingStepSymbol variant="gpsDenied" compact />
              <div className="min-w-0">
                <p className="label">Navigation resilience</p>
                <h3 className="mt-1 font-display text-xl font-bold text-fg md:text-2xl">
                  GPS denied navigation
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                  Mission continuity when satellite positioning is unavailable.
                  This spans the airborne portion of the loop rather than being
                  a step of its own, because losing positioning does not end the
                  mission.
                </p>
              </div>
              <div
                aria-hidden="true"
                className="ml-auto hidden min-w-24 flex-1 items-center sm:flex"
              >
                <span className="h-px flex-1 bg-fg/60" />
                <span className="size-2 rotate-45 border-r border-t border-fg/60" />
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-8 flex items-center gap-3 border-t border-line pt-6">
            <span aria-hidden="true" className="font-mono text-lg text-fg">
              ←
            </span>
            <p className="technical-data text-muted">
              Back to Dock. Ready again, with no crew mobilised in between.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
