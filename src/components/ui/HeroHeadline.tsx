"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { subscribeToPageReady } from "@/lib/motion/pageReady";

export default function HeroHeadline({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLHeadingElement>(null);
  const words = text.split(" ");

  useEffect(() => {
    const heading = containerRef.current;
    if (!heading || typeof window.matchMedia !== "function") return;

    let cleanupMotion: (() => void) | undefined;
    const unsubscribe = subscribeToPageReady(() => {
      const hero = heading.closest<HTMLElement>("[data-home-hero]");
      if (!hero) return;

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

            const wordEls = heading.querySelectorAll<HTMLElement>("[data-word]");
            const support = hero.querySelector<HTMLElement>("[data-hero-support]");
            const scenery = hero.querySelector<HTMLElement>("[data-hero-scenery-image]");
            const timeline = gsap.timeline();

            if (desktop && scenery) {
              timeline.fromTo(
                scenery,
                { scale: 1.025 },
                { scale: 1, duration: 0.7, ease: "power2.out" },
                0,
              );
            }

            timeline.from(wordEls, {
              autoAlpha: 0,
              y: desktop ? 18 : 10,
              duration: desktop ? 0.65 : 0.45,
              ease: "power3.out",
              stagger: desktop ? 0.05 : 0.04,
            }, desktop ? 0.08 : 0);

            if (support) {
              timeline.from(support, {
                autoAlpha: 0,
                y: desktop ? 16 : 8,
                duration: desktop ? 0.55 : 0.4,
                ease: "power2.out",
              }, "<0.2");
            }

            if (desktop && scenery) {
              gsap.fromTo(
                scenery,
                { y: -20 },
                {
                  y: 20,
                  ease: "none",
                  scrollTrigger: {
                    trigger: hero,
                    start: "top top",
                    end: "bottom top",
                    scrub: 0.8,
                  },
                },
              );
            }

          },
        );
      }, hero);

      cleanupMotion = () => {
        media?.revert();
        context.revert();
      };
    });

    return () => {
      unsubscribe();
      cleanupMotion?.();
    };
  }, []);

  return (
    <h1 ref={containerRef} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span
            key={`${w}-${i}`}
            data-word
            className="inline-block will-change-[transform,opacity]"
          >
            {w}
            {i < words.length - 1 && <>&nbsp;</>}
          </span>
        ))}
      </span>
    </h1>
  );
}
