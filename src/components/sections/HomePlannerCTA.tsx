import Image from "next/image";
import Link from "next/link";
import HomeMotionSection from "@/components/motion/HomeMotionSection";
import ReticleFrame from "@/components/ui/ReticleFrame";

export default function HomePlannerCTA() {
  return (
    <HomeMotionSection
      variant="planner"
      className="relative overflow-hidden bg-[#0b0b0b] px-6 py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-7xl gap-9 md:grid-cols-[minmax(0,4fr)_minmax(0,6fr)] md:items-center md:gap-14">
        <div data-motion-group>
          <p className="label">Interactive proof</p>
          <h2 className="mt-3 text-heading font-display text-fg">
            Model your own coverage area
          </h2>
          <p className="mt-4 max-w-md text-body text-muted">
            Place a survey area, explore patrol reach, and estimate the dock
            layout for a real site.
          </p>
          <Link
            href="/designer"
            className="mt-6 inline-block border border-fg px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-fg transition-colors hover:bg-fg hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Open the planner
          </Link>
        </div>

        <div data-motion-group>
          <div data-motion-image className="relative overflow-hidden border border-grey-800 bg-bg">
            <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
              <Image
                src="/images/planner.jpeg"
                alt="Screenshot of the Pawaac coverage planner showing patrol radius circles and docking station markers over a map"
                fill
                sizes="(min-width: 768px) 60vw, 100vw"
                className="object-cover"
              />
              <ReticleFrame variant="dark" />
            </div>
          </div>
        </div>
      </div>
    </HomeMotionSection>
  );
}
