"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type HomeMotionVariant =
  | "problem"
  | "operating"
  | "platforms"
  | "applications"
  | "planner"
  | "closing";

export default function HomeMotionSection({
  variant,
  className,
  children,
}: {
  variant: HomeMotionVariant;
  className?: string;
  children: React.ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof window.matchMedia !== "function") return;

    gsap.registerPlugin(ScrollTrigger);
    let media: ReturnType<typeof gsap.matchMedia> | undefined;
    const context = gsap.context(() => {
      media = gsap.matchMedia();
      media.add(
        {
          desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        ({ conditions }) => {
          const { desktop, reduce } = conditions as {
            desktop: boolean;
            mobile: boolean;
            reduce: boolean;
          };
          if (reduce) return;

          const groups = Array.from(
            section.querySelectorAll<HTMLElement>("[data-motion-group]"),
          );
          if (groups.length === 0) return;

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              once: true,
            },
          });

          groups.forEach((group, index) => {
            const items = group.querySelectorAll<HTMLElement>("[data-motion-item]");
            timeline.from(items.length > 0 ? items : group, {
              autoAlpha: 0,
              y: desktop ? 18 : 10,
              duration: desktop ? 0.62 : 0.42,
              ease: "power2.out",
              stagger: items.length > 0 ? (desktop ? 0.06 : 0.04) : 0,
            }, index === 0 ? 0 : "-=0.16");

            if (desktop && variant === "platforms") {
              const images = group.querySelectorAll<HTMLElement>("[data-motion-image]");
              if (images.length > 0) {
                timeline.from(images, { scale: 1.015, duration: 0.7, ease: "power2.out" }, "<");
              }
            }
          });

        },
      );
    }, section);

    return () => {
      media?.revert();
      context.revert();
    };
  }, [variant]);

  return (
    <section ref={sectionRef} data-home-motion={variant} className={className}>
      {children}
    </section>
  );
}
