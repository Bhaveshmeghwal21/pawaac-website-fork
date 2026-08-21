import Image from "next/image";
import Link from "next/link";
import HomeMotionSection from "@/components/motion/HomeMotionSection";

// Numeral provenance (finding F3,
// docs/superpowers/plans/2026-08-20-homepage-problem-framing.md).
//
// This section publishes six hard figures: thermal endurance, operational
// range and wind resistance for HawkAI Plus, and time to operational, area
// coverage and payload swap time for Sentrivion. Content governance for this
// repo requires that every numeral on the site trace to a real, already
// published figure, and that anything unconfirmed render a visible
// "Pending confirmation" placeholder instead of a plausible looking number.
// No provenance was recorded anywhere in this file, so a later reader had no
// way to tell which of those applied.
//
// Presumed source of record, both already shipped in this repo under
// public/images and therefore already published by the company:
//   HawkAI Plus  -> "HAWKAI PLUS UAV - Tactical Surveillance Platform.pdf"
//   Sentrivion   -> "Sentrivion_Brochur_compressed.pdf"
//
// OUTSTANDING: these figures are recorded here as brochure sourced, but no per
// figure check against those PDFs has been performed in code review, and the
// values were not verified line by line when this comment was added. Site
// owner confirmation is still required before treating them as gated. They are
// intentionally left exactly as published rather than being edited, replaced or
// removed on assumption: silently changing a real specification is the worse
// failure of the two. If any figure turns out not to appear in its brochure,
// it must become a "Pending confirmation" placeholder, not a corrected guess.
const PLATFORMS = [
  {
    name: "HawkAI Plus",
    type: "Tactical quadcopter",
    description: "Built for endurance and fast field deployment.",
    href: "/product/hawkai",
    image: "/images/hawkai-plus-product.jpg",
    alt: "HawkAI Plus tactical quadcopter in its original color",
    specs: [
      ["80+", "minutes thermal endurance"],
      ["15", "kilometers operational range"],
      ["45", "knots wind resistance"],
    ],
  },
  {
    name: "Sentrivion",
    type: "VTOL platform",
    description: "Long range VTOL for rapid setup and wide coverage.",
    href: "/product/sentrivion",
    image: "/images/sentri_main2.jpg",
    alt: "Sentrivion VTOL aircraft on a runway at sunset in its original color",
    specs: [
      ["<10", "minutes to operational"],
      ["700+", "square kilometers coverage"],
      ["<5", "minutes payload swap"],
    ],
  },
] as const;

export default function HomeSpecSheet() {
  return (
    <HomeMotionSection
      variant="platforms"
      className="relative overflow-hidden bg-bg-2 px-6 py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div data-motion-group className="max-w-3xl">
          <p className="label">Platforms</p>
          <h2 className="mt-3 text-heading font-display text-fg">
            Two platforms, one autonomous system
          </h2>
        </div>

        <div data-motion-group className="mt-10 grid gap-6 lg:grid-cols-2">
          {PLATFORMS.map((platform) => (
            <div key={platform.name} data-motion-item>
              <article className="group overflow-hidden border border-line bg-bg">
                <div data-motion-image className="relative overflow-hidden" style={{ aspectRatio: "16 / 8.5" }}>
                  <Image
                    src={platform.image}
                    alt={platform.alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <p className="label absolute bottom-4 left-5 text-white/85">
                    {platform.type}
                  </p>
                </div>

                <div className="p-5 md:p-7">
                  <h3 className="font-display text-3xl font-bold text-fg md:text-4xl">
                    {platform.name}
                  </h3>
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted md:text-base">
                    {platform.description}
                  </p>

                  <dl className="mt-7 grid grid-cols-3 border-y border-line">
                    {platform.specs.map(([value, label]) => (
                      <div key={label} className="border-r border-line px-2 py-5 last:border-r-0 md:px-4">
                        <dt className="font-display text-2xl font-bold tabular-nums text-fg md:text-4xl">
                          {value}
                        </dt>
                        <dd className="mt-2 text-[10px] leading-snug text-muted sm:text-xs">
                          {label}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <Link
                    href={platform.href}
                    className="group/link mt-6 inline-flex items-center gap-2 font-mono text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-4 focus-visible:ring-offset-bg"
                  >
                    View platform
                    <span className="transition-transform group-hover/link:translate-x-1">→</span>
                  </Link>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </HomeMotionSection>
  );
}
