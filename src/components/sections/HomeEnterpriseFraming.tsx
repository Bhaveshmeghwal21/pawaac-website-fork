"use client";

import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

export default function HomeEnterpriseFraming() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-28 text-[#080808] md:py-40">
      {/* Clean black-to-white transition at top */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#080808] to-transparent md:h-28"
      />

      {/* Subtle technical vertical grid lines */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {[18, 33, 50, 67, 82].map((pos) => (
          <span
            key={pos}
            className="absolute top-0 h-full w-px bg-[#080808]/[0.03]"
            style={{ left: `${pos}%` }}
          />
        ))}
      </div>

      {/* Giant background number */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[-5%] top-[15%] select-none font-display text-[40vw] font-bold leading-none text-[#080808]/[0.025] md:text-[28vw]"
      >
        04
      </span>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* ─── MAIN LAYOUT ────────────────────────────────────────── */}
        <div className="grid gap-12 md:grid-cols-[0.45fr_0.55fr] md:items-start md:gap-20">
          {/* Left — Text */}
          <div>
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#6b6b6b]">
                Enterprise &amp; critical infrastructure
              </p>

              <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,4.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.04em] text-[#080808]">
                Autonomy for<br />
                critical sites.
              </h2>

              <p className="mt-6 max-w-[480px] text-[15px] font-body leading-relaxed text-[#454545]">
                The same platform secures industrial and infrastructure
                perimeters.
              </p>
            </Reveal>

            {/* CTA — editorial link style with underline */}
            <Reveal delay={0.1}>
              <a
                href="/product"
                className="group mt-8 inline-flex items-center gap-2.5 border-b border-[#080808]/30 pb-1.5 font-mono text-[12px] uppercase tracking-[0.12em] text-[#080808] transition-all duration-300 hover:border-[#080808] hover:gap-3.5"
              >
                Explore the platform
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
            </Reveal>
          </div>

          {/* Right — Image with technical treatment */}
          <Reveal delay={0.12}>
            <div className="relative mt-6 md:mt-10">
              {/* Image container with frame */}
              <div
                className="relative w-full border border-[#d6d6d6] bg-[#f5f5f5]"
                style={{ aspectRatio: "16 / 9" }}
              >
                <Image
                  src="/images/rawimage3.jpg"
                  alt="Aerial reconnaissance view representing critical infrastructure monitoring"
                  fill
                  sizes="(min-width: 768px) 55vw, 100vw"
                  className="object-cover"
                  style={{ filter: "grayscale(1) contrast(1.05)" }}
                />

                {/* Corner brackets */}
                <span aria-hidden="true" className="absolute left-2 top-2 h-5 w-5 border-l border-t border-[#080808]/30" />
                <span aria-hidden="true" className="absolute right-2 top-2 h-5 w-5 border-r border-t border-[#080808]/30" />
                <span aria-hidden="true" className="absolute bottom-2 left-2 h-5 w-5 border-b border-l border-[#080808]/30" />
                <span aria-hidden="true" className="absolute bottom-2 right-2 h-5 w-5 border-b border-r border-[#080808]/30" />

                {/* Technical labels */}
                <div aria-hidden="true" className="absolute right-3 top-3 flex flex-col items-end gap-1">
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/70 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
                    Site // 04
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/70 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
                    Mode // Autonomous
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/70 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
                    Status // Active
                  </span>
                </div>

                {/* Small status indicator dot */}
                <span aria-hidden="true" className="absolute left-3 top-3 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/80 [box-shadow:0_0_4px_rgba(255,255,255,0.5)]" />
                  <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/60 [text-shadow:0_1px_4px_rgba(0,0,0,0.8)]">
                    Live
                  </span>
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ─── BOTTOM DATA STRIP ──────────────────────────────────── */}
        <Reveal delay={0.15}>
          <div className="mt-16 border-t border-[#080808]/[0.08] pt-6 md:mt-24">
            <div className="flex flex-wrap gap-x-10 gap-y-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#080808]/30">
                01 / Perimeter
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#080808]/30">
                02 / Infrastructure
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#080808]/30">
                03 / Critical sites
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
