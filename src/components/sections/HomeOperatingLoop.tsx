"use client";

import Image from "next/image";
import Link from "next/link";
import HomeMotionSection from "@/components/motion/HomeMotionSection";
import OperatingStepSymbol, {
  type OperatingSymbolVariant,
} from "@/components/ui/OperatingStepSymbol";
import ReticleFrame from "@/components/ui/ReticleFrame";

// The operating concept is a closed mission cycle, not a row of feature cards.
// Dock is both the starting state and the destination after recovery. GPS
// denied navigation spans the airborne portion rather than pretending to be a
// separate mission step, and the human interface branches from Escalate.
//
// "Rapid battery swap and recharge" is published in the Sentrivion brochure.
// The copy deliberately does not claim that the swap itself is automated;
// automated docking and charging are separate published capabilities. "GPS
// denied navigation" is a site-owner supplied capability statement approved
// for this section; no unverified implementation method is named.
const STEPS: {
  name: string;
  body: string;
  symbol: OperatingSymbolVariant;
}[] = [
  {
    name: "Dock",
    body: "Protected on site, charged and ready.",
    symbol: "dock",
  },
  {
    name: "Dispatch",
    body: "Launches on schedule or when called.",
    symbol: "dispatch",
  },
  {
    name: "Patrol",
    body: "Follows the mission inside defined bounds.",
    symbol: "patrol",
  },
  {
    name: "Detect",
    body: "Onboard vision identifies what needs attention.",
    symbol: "detect",
  },
  {
    name: "Escalate",
    body: "A located alert reaches the operator.",
    symbol: "escalate",
  },
  {
    name: "Return",
    body: "The aircraft returns after the mission.",
    symbol: "return",
  },
  {
    name: "Swap",
    body: "Rapid battery recovery prepares the next flight.",
    symbol: "recharge",
  },
];

export default function HomeOperatingLoop() {
  return (
    <HomeMotionSection
      variant="operating"
      className="relative overflow-hidden bg-bg px-6 py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div data-motion-group className="max-w-3xl">
          <p className="label">Operating concept</p>
          <h2 className="mt-3 text-heading font-display text-fg">
            Surveillance that notices, not just records
          </h2>
        </div>

        <div
          data-motion-group
          className="mt-10 border border-line bg-bg-2 p-5 md:p-8"
        >
          <div className="relative">
            <span
              aria-hidden="true"
              className="absolute bottom-6 left-[23px] top-6 w-px bg-line md:hidden"
            />
            <span
              aria-hidden="true"
              className="absolute left-7 right-7 top-7 hidden h-px bg-line md:block"
            />

            <ol
              data-mission-loop
              className="relative grid gap-0 md:grid-cols-7"
            >
              {STEPS.map((step, index) => (
                <li
                  key={step.name}
                  data-motion-item
                  className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-4 pb-7 last:pb-0 md:block md:px-2 md:pb-0"
                >
                  <OperatingStepSymbol variant={step.symbol} />
                  {index < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="absolute right-[-2px] top-[25px] hidden size-1.5 rotate-45 border-r border-t border-fg/40 md:block"
                    />
                  )}
                  <article data-operating-step className="md:mt-5">
                    <h3 className="font-display text-lg font-bold leading-snug text-fg md:text-xl">
                      {step.name}
                    </h3>
                    <p className="mt-2 max-w-40 text-xs leading-relaxed text-fg/65 md:text-sm">
                      {step.body}
                    </p>
                    {step.symbol === "escalate" && (
                      <span
                        data-operator-branch
                        className="technical-data mt-3 inline-flex items-center gap-2 text-fg"
                      >
                        <span
                          aria-hidden="true"
                          className="size-1.5 bg-fg"
                        />
                        Human oversight ↓
                      </span>
                    )}
                  </article>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 grid md:grid-cols-7">
            <div
              data-navigation-resilience
              className="border border-line bg-bg p-4 md:col-span-5 md:col-start-2 md:p-5"
            >
              <div className="flex items-center gap-4">
                <OperatingStepSymbol variant="gpsDenied" compact />
                <div className="min-w-0">
                  <p className="label">Navigation resilience</p>
                  <h3 className="mt-1 font-display text-lg font-bold text-fg md:text-xl">
                    GPS denied navigation
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted md:text-sm">
                    Mission continuity when satellite positioning is unavailable.
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
          </div>

          <div
            data-loop-return
            className="mt-6 flex items-center gap-3 border-t border-line pt-4"
          >
            <span aria-hidden="true" className="font-mono text-lg text-fg">
              ←
            </span>
            <p className="technical-data text-muted">
              Back to Dock. Ready again.
            </p>
          </div>
        </div>

        <div data-motion-group className="mt-12 grid gap-8 border-t border-line pt-10 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] md:items-center md:gap-14">
          <div data-motion-item>
              <p className="label">Human oversight</p>
              <h3 className="mt-3 font-display text-3xl font-bold leading-tight text-fg md:text-5xl">
                One tap from alert to oversight
              </h3>
              <Link
                href="/autonomy"
                className="group mt-6 inline-flex items-center gap-2 font-mono text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-4 focus-visible:ring-offset-bg"
              >
                Explore the autonomy stack
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
          </div>

          <div data-motion-item>
            <div data-motion-image className="relative overflow-hidden border border-grey-800 bg-bg-2">
              <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
                <Image
                  src="/images/visionModelOutput.jpeg"
                  alt="Illustrative aerial detection view marking trucks and a person for operator review"
                  fill
                  sizes="(min-width: 768px) 60vw, 100vw"
                  className="object-cover"
                />
                <ReticleFrame variant="dark" />
              </div>
            </div>
            <p className="technical-data mt-2 text-muted">
              Illustrative detection view (in development)
            </p>
          </div>
        </div>
      </div>
    </HomeMotionSection>
  );
}
