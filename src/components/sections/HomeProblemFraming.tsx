import HomeMotionSection from "@/components/motion/HomeMotionSection";
import ProblemSymbol, {
  type ProblemSymbolVariant,
} from "@/components/ui/ProblemSymbol";

// Spec: docs/superpowers/plans/2026-08-20-homepage-problem-framing.md
// Finding: F1 (page never states the problem)
//
// The homepage opened solution first: hero (what we make) -> HomeOperatingLoop
// (how it works) -> HomeSpecSheet (what we sell) -> HomeDeploymentsPreview
// (where). Nothing established the operational gap being closed, so the
// autonomy story arrived with nothing to resolve and a first time visitor read
// mechanics before motive. This section supplies that missing "why" and is
// rendered as section 2, directly after the hero and directly before the
// operating loop that answers it.
//
// Framing (site-owner supplied reference, then corrected by the site owner):
// the heading and these shortcomings are the site owner's own framing. The
// correction matters, because an earlier version of this file got it wrong:
// these are NOT generic fixed camera and manned guarding problems. They are
// the limitations of CONVENTIONAL, PILOTED drone surveillance. That is the real
// competitive ground, since the alternative a buyer is usually weighing up is
// another drone operator rather than another camera vendor, and every
// limitation below follows from a human having to fly the aircraft. Autonomy is
// what removes them, which is exactly what HomeOperatingLoop goes on to
// describe.
//
// "Camera blind spots" stays first and is the one point about fixed cameras
// rather than drones: it is the reason to put an aircraft over a site at all,
// so it sets up the rest rather than sitting alongside them.
//
// "GPS signal loss" was added at the site owner's request. It matters
// disproportionately for the defense and border use this site leads with:
// jamming and spoofing are routine there, and an aircraft navigating by
// satellite fix alone stops being useful the moment that fix goes. Note that
// bannedTerms.ts lists GPS as a banned term, but that rule is scoped to
// Placeholder_Media copy rather than approved on page copy, and this is a
// widely published industry limitation, not a claim about our own telemetry.
//
// Presentation (site-owner direction, superseding the earlier text and diagram
// builds of this section):
//   - Prose stays at one title and one short line per problem.
//   - Large explanatory diagrams were rejected because they were abstract,
//     consumed most of every card, and pushed the five-card mobile layout past
//     one viewport. Compact pictograms now identify each problem with familiar
//     objects, without asking a tiny graphic to explain a whole scenario.
//   - The cards are undivided tiles: symbol, title and line form one scannable
//     unit. Five tiles share one outer rule rather than becoming five framed
//     image panels.
//   - The closing pivot into HomeOperatingLoop remains unnecessary: that
//     section's heading, "Surveillance that notices, not just records",
//     answers this section directly.
//
// Content governance: this section carries no numerals at all, and
// HomepageSections.test.tsx asserts its rendered text contains no digits. That
// is deliberate and predates the visual rework: the original Problem.tsx was
// dropped at Task 16 because its stat counters were ungated, and every numeral
// on this site has to trace to an already published figure. If a figure is
// ever wanted here it needs a Change Proposal and a real source first.
//
// Copy also observes the site owner's no hyphens or dashes rule, enforced for
// every homepage section by HomepageCopyRules.test.tsx.
const SHORTCOMINGS: {
  title: string;
  line: string;
  symbol: ProblemSymbolVariant;
}[] = [
  {
    title: "Camera blind spots",
    line: "Fixed views, with dark ground between them.",
    symbol: "blindSpots",
  },
  {
    title: "Incomplete patrols",
    line: "Flights happen in windows. Between them, nothing.",
    symbol: "incompletePatrols",
  },
  {
    title: "Delayed response",
    line: "Nothing is airborne until a pilot arrives.",
    symbol: "delayedResponse",
  },
  {
    title: "Manpower strain",
    line: "A trained pilot for every drone does not scale.",
    symbol: "manpowerStrain",
  },
  {
    title: "GPS signal loss",
    line: "Jamming or lost signal grounds a drone that depends on it.",
    symbol: "gpsLoss",
  },
];

export default function HomeProblemFraming() {
  return (
    // bg-bg-2 keeps the page's alternating surface rhythm intact between the
    // hero photograph above and HomeOperatingLoop's bg-bg below.
    <HomeMotionSection
      variant="problem"
      className="relative overflow-hidden bg-bg-2 px-6 py-12 md:py-16"
    >
      <div className="mx-auto max-w-7xl">
        <div data-motion-group>
          <p className="label">The problem</p>
          <h2 className="mt-3 max-w-3xl text-heading font-display text-fg">
            Where surveillance falls short
          </h2>
        </div>

        {/* Symbols replace the rejected chart like diagrams. Each tile is one
            compact unit with no separate media panel, keeping all five points
            scannable and bringing the narrow layout back inside one viewport. */}
        <div
          data-motion-group
          className="mt-8 grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-3 lg:grid-cols-5"
        >
          {SHORTCOMINGS.map((shortcoming) => (
            <div
              key={shortcoming.title}
              data-motion-item
              className="last:col-span-2 lg:last:col-span-1"
            >
              <article
                data-problem-card
                className="flex h-full min-h-40 flex-col bg-bg p-4 md:min-h-48 md:p-5"
              >
                <ProblemSymbol variant={shortcoming.symbol} />
                <h3 className="mt-5 font-display text-base font-bold leading-snug text-fg md:text-lg">
                  {shortcoming.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted md:text-sm">
                  {shortcoming.line}
                </p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </HomeMotionSection>
  );
}
