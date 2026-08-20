import Image from "next/image";
import HomeMotionSection from "@/components/motion/HomeMotionSection";

const APPLICATIONS = [
  {
    tag: "Defense",
    src: "/images/FPV_view.png",
    alt: "Operational aerial view representing defense coverage",
  },
  {
    tag: "Police",
    src: "/images/sector-police.jpg",
    alt: "Color aerial view of a major Indian city",
  },
  {
    tag: "Critical infrastructure",
    src: "/images/sector-infrastructure-v2.jpg",
    alt: "Color aerial view of critical energy infrastructure",
  },
  {
    tag: "Disaster response",
    src: "/images/sector-disaster-response.jpg",
    alt: "Color aerial view of flood damage in Rudraprayag, Uttarakhand",
  },
] as const;

export default function HomeDeploymentsPreview() {
  return (
    <HomeMotionSection
      variant="applications"
      className="relative overflow-hidden bg-white px-6 py-16 text-[#080808] md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div data-motion-group className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(260px,3fr)] lg:items-end">
          <div data-motion-item className="max-w-3xl">
            <p className="label text-[#666]">Applications</p>
            <h2 className="mt-3 text-heading font-display text-[#080808]">
              Where Pawaac is built to operate
            </h2>
            <p className="mt-4 max-w-2xl text-body text-[#454545]">
              Autonomous coverage for borders, urban operations, facilities,
              and time-critical response environments.
            </p>
          </div>

          <div data-motion-item>
            <div className="border-l border-[#cfcfcf] pl-5">
              <h3 className="font-display text-2xl font-bold leading-tight text-[#080808]">
                Security autonomy for critical sites
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#555]">
                The same system architecture extends from defense and police
                missions to industrial and public infrastructure perimeters.
              </p>
            </div>
          </div>
        </div>

        <div
          data-applications-grid
          data-motion-group
          className="mt-10 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4"
        >
          {APPLICATIONS.map((application) => (
            <div key={application.tag} data-motion-item>
              <article
                data-application-card
                className="group relative overflow-hidden bg-[#111]"
                style={{ aspectRatio: "4 / 3" }}
              >
                <Image
                  src={application.src}
                  alt={application.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                <h3 className="absolute inset-x-3 bottom-3 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-white sm:inset-x-4 sm:bottom-4 sm:text-xs">
                  {application.tag}
                </h3>
              </article>
            </div>
          ))}
        </div>
      </div>
    </HomeMotionSection>
  );
}
