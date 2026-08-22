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
              {/*
                Site-owner request (current session): use planner2 here. The
                previous planner.jpeg is a screenshot of the older planner, whose
                survey zone was a dashed square sized by a corner handle and whose
                second slider set the patrol radius per dock. Both of those changed
                (the zone is a circle, and the visitor now sets the number of
                drones while the radius is derived), so that image no longer showed
                the tool it links to. planner.jpeg is left on disk unused per this
                repo's "don't delete, don't break things" convention.

                Alt text updated with it: it described "patrol radius circles and
                docking station markers", which is still true but omits the two
                controls that are the point of the new panel.
              */}
              <Image
                src="/images/planner2.jpeg"
                alt="Screenshot of the Pawaac coverage planner: a dashed circular survey zone over a city map, with seven docking station markers and their overlapping patrol radius circles, beside sliders for coverage radius and number of drones"
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
