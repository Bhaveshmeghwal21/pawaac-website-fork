"use client";

import Image from "next/image";
import Link from "next/link";
import HomeMotionSection from "@/components/motion/HomeMotionSection";
import ReticleFrame from "@/components/ui/ReticleFrame";

const STEPS = [
  {
    index: "01",
    name: "Dock",
    body: "Aircraft remain charged at the site they cover, ready without a separate launch crew.",
  },
  {
    index: "02",
    name: "Patrol",
    body: "Scheduled and on demand routes fly inside a defined geofence with automatic return safeguards.",
  },
  {
    index: "03",
    name: "Detect",
    body: "Onboard vision surfaces events worth reviewing instead of sending back hours of undifferentiated footage.",
  },
  {
    index: "04",
    name: "Escalate & respond",
    body: "An operator receives a located alert, opens live oversight, and decides what happens next.",
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
          <p className="mt-5 max-w-2xl text-body font-body text-fg/80">
            Pawaac connects the aircraft, dock, onboard vision, and operator
            into one repeatable coverage cycle.
          </p>
        </div>

        <div data-motion-group className="mt-10 grid border-y border-line sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <div
              key={step.index}
              data-motion-item
              className="border-b border-line p-5 last:border-b-0 sm:[&:nth-child(odd)]:border-r sm:[&:nth-child(n+3)]:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
            >
              <article data-operating-step>
                <p className="technical-data text-muted">{step.index}</p>
                <h3 className="mt-3 font-display text-xl font-bold text-fg md:text-2xl">
                  {step.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-fg/70">
                  {step.body}
                </p>
              </article>
            </div>
          ))}
        </div>

        <div data-motion-group className="mt-14 grid gap-8 border-t border-line pt-10 md:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] md:items-center md:gap-14">
          <div data-motion-item>
              <p className="label">Human oversight</p>
              <h3 className="mt-3 font-display text-3xl font-bold leading-tight text-fg md:text-5xl">
                One tap from alert to oversight
              </h3>
              <p className="mt-4 max-w-md text-body text-muted">
                The system flags what deserves attention. The operator enters
                the loop only when context and judgment are needed.
              </p>
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
              <div className="relative w-full" style={{ aspectRatio: "1198 / 684" }}>
                <Image
                  src="/images/gcs.png"
                  alt="Concept ground control interface showing target tracking and flight commands"
                  fill
                  sizes="(min-width: 768px) 60vw, 100vw"
                  className="object-cover"
                />
                <ReticleFrame variant="dark" />
              </div>
            </div>
            <p className="technical-data mt-2 text-muted">
              Concept interface (in development)
            </p>
          </div>
        </div>
      </div>
    </HomeMotionSection>
  );
}
