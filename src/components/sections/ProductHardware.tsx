// Platform page (/product), Section 3 — the two airframes that fly the loop.
//
// Site-owner request (current session): "use product images how are they
// gonna work how do we plan to do surveillance ... by images i meant images
// of sentrivion, hawkai, and dock system". The dock is the third element and
// gets its own light band immediately after this one
// (ProductDockCharging.tsx), which already existed as a white section and is
// the natural home for the dock photograph's white background.
//
// Both photographs are real in-repo brochure/build assets, rendered with the
// site's standard grayscale resting-state filter (Requirement 3.1-3.2), the
// same treatment ProductHero.tsx uses. That also keeps the achromatic
// palette rule intact without needing a documented colour exception.
//
// These cards deliberately do NOT link to /product/hawkai or
// /product/sentrivion. Both routes still resolve, but they are hidden from
// navigation at the site owner's request (see Navigation.tsx), so linking
// here would reintroduce the dead ends that ProductSpecifications.tsx's
// CTA was rewritten to avoid earlier this session.
//
// Claim discipline: the airframe descriptions carry no figures. "Long
// endurance" (HawkAI Plus) and "rapid deployment" (Sentrivion) are the
// framings already used in the repo README and across the site; the
// endurance and range numerals that back them live only on the hidden
// per-airframe spec pages and in the brochures, so they are not restated
// here. Specifications route through /contact instead.
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import ReticleFrame from "@/components/ui/ReticleFrame";

type Airframe = {
  name: string;
  role: string;
  image: { src: string; alt: string; aspect: string };
  body: string;
  loop: string;
};

const AIRFRAMES: Airframe[] = [
  {
    name: "HawkAI Plus",
    role: "Quadcopter",
    image: {
      src: "/images/hawkai-plus-product.jpg",
      alt: "HawkAI Plus quadcopter with a gimbal mounted camera beneath the fuselage",
      // Each frame carries its source image's own aspect ratio (measured
      // from the file, not assumed) so the photo fills it edge to edge. A
      // shared fixed ratio would letterbox one of them badly: HawkAI is
      // 1152x864 (4:3) but Sentrivion is 1280x561, nearly twice as wide, so
      // forcing both into 4:3 would leave the Sentrivion shot floating in
      // empty space with the container colour showing through.
      aspect: "1152 / 864",
    },
    body: "Built for long endurance over a fixed site. It takes off vertically from the dock, holds position or follows a route, and carries the gimbal that does the looking.",
    loop: "Stays with one site and watches it repeatedly",
  },
  {
    name: "Sentrivion",
    role: "VTOL",
    image: {
      src: "/images/sentrivion-product-1.jpg",
      alt: "Sentrivion vertical takeoff and landing aircraft, a blended wing airframe with four lift rotors",
      aspect: "1280 / 561",
    },
    body: "Built for rapid deployment. It launches vertically like the quadcopter, with no runway to prepare, then transitions to wing borne flight to cover ground.",
    loop: "Reaches further, for area rather than a single point",
  },
];

export default function ProductHardware() {
  return (
    <section className="relative bg-bg px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="label">The aircraft</p>
          <h2 className="mt-3 text-heading font-display text-fg">
            Two airframes, one loop
          </h2>
          <p className="mt-4 max-w-2xl text-body font-body text-muted">
            The cycle above does not change with the aircraft. What changes is
            reach: one holds a site, the other covers ground. Both launch
            vertically, so both work from a dock.
          </p>
        </Reveal>

        <div className="mt-14 space-y-14 md:space-y-20">
          {AIRFRAMES.map((frame, index) => (
            <div
              key={frame.name}
              className="grid gap-8 md:grid-cols-2 md:items-center md:gap-14"
            >
              <Reveal
                className={
                  // Alternate which side the photo sits on. The text keeps
                  // DOM order first in both rows, so the reading order stays
                  // name-then-photo for screen readers regardless of the
                  // visual swap.
                  index % 2 === 1 ? "md:order-2" : undefined
                }
              >
                <p className="technical-data text-muted">{frame.role}</p>
                <h3 className="mt-2 font-display text-3xl font-bold leading-tight text-fg md:text-4xl">
                  {frame.name}
                </h3>
                <p className="mt-4 max-w-md text-body font-body text-muted">
                  {frame.body}
                </p>
                <p className="mt-5 flex items-start gap-3 border-t border-line pt-4 text-sm leading-relaxed text-fg/75">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-1.5 shrink-0 bg-fg"
                  />
                  {frame.loop}
                </p>
              </Reveal>

              <Reveal
                delay={0.1}
                className={index % 2 === 1 ? "md:order-1" : undefined}
              >
                <div className="relative w-full border border-line bg-bg-2">
                  <div
                    className="relative w-full"
                    style={{ aspectRatio: frame.image.aspect }}
                  >
                    <Image
                      src={frame.image.src}
                      alt={frame.image.alt}
                      fill
                      sizes="(min-width: 768px) 50vw, 90vw"
                      className="object-cover grayscale"
                    />
                    <ReticleFrame variant="dark" />
                  </div>
                </div>
              </Reveal>
            </div>
          ))}
        </div>

        <Reveal>
          {/* No CTA here on purpose: ProductSpecifications.tsx closes this
              page with the "Contact us for specifications" button, and two
              near-identical CTAs on one page is worse than one placed well.
              This is just the note explaining why no figures appear above. */}
          <p className="mt-16 max-w-xl border-t border-line pt-8 text-body font-body text-muted">
            Endurance, range and payload figures are shared on request rather
            than published here.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
