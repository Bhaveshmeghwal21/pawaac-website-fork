"use client";

import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

const SEQUENCE = [
  { index: "01", label: "DEFINE AREA" },
  { index: "02", label: "PLACE STATIONS" },
  { index: "03", label: "BUILD ROUTE" },
];

export default function HomePlannerCTA() {
  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 md:py-40">
      {/* Giant background number */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-[-8%] top-[8%] select-none font-display text-[45vw] font-bold leading-none text-white/[0.025] md:text-[28vw]"
      >
        03
      </span>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* ─── MAIN LAYOUT ────────────────────────────────────────── */}
        <div className="grid gap-12 md:grid-cols-[0.4fr_0.6fr] md:items-start md:gap-16">
          {/* Left — Text */}
          <div className="md:pt-8">
            <Reveal>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/35">
                Planner // Interactive
              </p>

              <h2 className="mt-5 font-display font-bold uppercase leading-[0.88] tracking-[-0.04em] text-white">
                <span className="block text-[clamp(1.75rem,3.5vw,2.75rem)]">
                  Model your own
                </span>
                <span className="block text-[clamp(3rem,7vw,5.5rem)]">
                  Coverage
                </span>
                <span className="block text-[clamp(1.75rem,3.5vw,2.75rem)]">
                  area.
                </span>
              </h2>

              <p className="mt-6 max-w-[420px] text-[15px] font-body leading-relaxed text-white/45">
                Design coverage, stations, and autonomous routes before
                deployment.
              </p>
            </Reveal>

            {/* CTA — editorial link */}
            <Reveal delay={0.1}>
              <a
                href="/designer"
                className="group mt-8 inline-flex items-center gap-2.5 border-b border-white/30 pb-1.5 font-mono text-[12px] uppercase tracking-[0.12em] text-white/70 transition-all duration-300 hover:border-white hover:text-white hover:gap-3.5"
              >
                Open planner
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
            </Reveal>
          </div>

          {/* Right — Planner image */}
          <Reveal delay={0.12}>
            <div className="relative">
              {/* Technical labels around the frame */}
              <div aria-hidden="true" className="mb-2 flex items-center justify-between px-1">
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/25">
                  Planner // 01
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/25">
                  Mode // Coverage
                </span>
              </div>

              {/* Image frame */}
              <div className="relative border border-white/[0.15] bg-white/[0.02]">
                {/* Corner brackets */}
                <span aria-hidden="true" className="absolute -left-[3px] -top-[3px] h-3 w-3 border-l border-t border-white/25" />
                <span aria-hidden="true" className="absolute -right-[3px] -top-[3px] h-3 w-3 border-r border-t border-white/25" />
                <span aria-hidden="true" className="absolute -bottom-[3px] -left-[3px] h-3 w-3 border-b border-l border-white/25" />
                <span aria-hidden="true" className="absolute -bottom-[3px] -right-[3px] h-3 w-3 border-b border-r border-white/25" />

                <div className="relative" style={{ aspectRatio: "16 / 9" }}>
                  <Image
                    src="/images/planner.jpeg"
                    alt="Screenshot of the Pawaac coverage planner showing patrol-radius circles and docking-station markers over a map"
                    fill
                    sizes="(min-width: 768px) 60vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Bottom labels */}
              <div aria-hidden="true" className="mt-2 flex items-center justify-between px-1">
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/25">
                  Stations // 04
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/25">
                  Route // GPS
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ─── TECHNICAL SEQUENCE ─────────────────────────────────── */}
        <Reveal delay={0.15}>
          <div className="mt-16 border-t border-white/[0.06] pt-8 md:mt-24">
            <div className="flex flex-wrap items-center gap-0">
              {SEQUENCE.map((step, i) => (
                <div key={step.index} className="flex items-center">
                  <div className="flex items-center gap-2 px-4 py-2 first:pl-0">
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">
                      {step.index}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/60">
                      {step.label}
                    </span>
                  </div>
                  {i < SEQUENCE.length - 1 && (
                    <span aria-hidden="true" className="h-px w-8 bg-white/10 md:w-12" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ─── BOTTOM DATA STRIP ──────────────────────────────────── */}
        <Reveal delay={0.18}>
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/20">
              Custom radius
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/20">
              Multi-station
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/20">
              GPS autonomy
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
