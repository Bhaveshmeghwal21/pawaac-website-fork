import HomeMotionSection from "@/components/motion/HomeMotionSection";
import Link from "next/link";

export default function HomeContactBand() {
  return (
    <HomeMotionSection
      variant="closing"
      className="relative overflow-hidden border-t border-line bg-bg-2 px-6 py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] lg:items-end">
          <div data-motion-group>
            <p className="label">Company &amp; mission</p>
            <h2 className="mt-3 max-w-4xl text-heading font-display text-fg">
              Built by Bajrang Dronetech Pvt Ltd
            </h2>
            <p className="mt-4 max-w-2xl text-body text-muted">
              Engineering and operations based in India, purpose-built for
              demanding field environments.
            </p>
            <p className="mt-7 max-w-3xl border-l border-line pl-5 font-display text-xl leading-relaxed text-fg/85 md:text-2xl">
              Pawaac exists to make continuous, pilotless coverage the default
              for the places that can least afford a gap in watch.
            </p>
          </div>

          <div data-motion-group>
            <div className="border border-line bg-bg p-6">
              <p className="label">Next step</p>
              <h3 className="mt-3 font-display text-3xl font-bold text-fg">
                Talk to the team
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Tell us what you need to cover and how the site operates.
              </p>
              <Link
                href="/contact"
                className="mt-6 block bg-white px-6 py-3 text-center font-mono text-xs font-semibold uppercase tracking-[0.1em] text-black transition-colors hover:bg-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                Contact us →
              </Link>
            </div>
          </div>
        </div>

        <div data-motion-group>
          <div className="mt-10 flex flex-col gap-6 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <span className="border border-line px-3 py-2 font-mono text-[10px] text-fg">
                DGCA COMPLIANT
              </span>
              <span className="border border-line px-3 py-2 font-mono text-[10px] text-fg">
                MeitY RECOGNIZED
              </span>
              <span className="border border-line px-3 py-2 font-mono text-[10px] text-fg">
                ENGINEERING &amp; OPERATIONS · INDIA
              </span>
            </div>
            <Link
              href="/company"
              className="group inline-flex items-center gap-2 font-mono text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-4 focus-visible:ring-offset-bg-2"
            >
              About the company
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </HomeMotionSection>
  );
}
