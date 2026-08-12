"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";

// HawkAI Plus specs — confirmed engineering data
const SPECS = [
  { index: "01", label: "ENDURANCE", numeral: "80+", unit: "MIN", desc: "Thermal payload endurance" },
  { index: "02", label: "RANGE", numeral: "15", unit: "KM", desc: "Operational range" },
  { index: "03", label: "WIND", numeral: "45", unit: "KTS", desc: "All-weather resistance" },
];

// Sentrivion specs
const SENTRIVION_SPECS = [
  { index: "01", label: "DEPLOYMENT", numeral: "<10", unit: "MIN", desc: "Arrival to operational" },
  { index: "02", label: "COVERAGE", numeral: "700+", unit: "SQ KM", desc: "Per takeoff point" },
  { index: "03", label: "PAYLOAD SWAP", numeral: "<5", unit: "MIN", desc: "Thermal/optical swap" },
];

const METADATA = [
  { key: "PLATFORM", value: "HAWKAI PLUS" },
  { key: "TYPE", value: "TACTICAL QUADCOPTER" },
  { key: "PAYLOAD", value: "THERMAL" },
  { key: "AUTONOMY", value: "GPS / GEOFENCE" },
  { key: "STATUS", value: "OPERATIONAL" },
];

const SENTRIVION_METADATA = [
  { key: "PLATFORM", value: "SENTRIVION" },
  { key: "TYPE", value: "VTOL FIXED-WING" },
  { key: "PAYLOAD", value: "THERMAL / OPTICAL" },
  { key: "AUTONOMY", value: "GPS / GEOFENCE" },
  { key: "STATUS", value: "OPERATIONAL" },
];

export default function HomeSpecSheet() {
  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 1 — HAWKAI PLUS
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-black px-6 py-28 md:py-36">
        {/* Giant editorial background numeral */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute right-[-5%] top-[10%] select-none font-display text-[40vw] font-bold leading-none text-white/[0.025] md:text-[25vw]"
        >
          01
        </span>

        <div className="relative z-10 mx-auto max-w-7xl">
          {/* ─── TOP: Headline + Product ID ─────────────────────────── */}
          <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-16">
            {/* Left — Headline & context */}
            <div>
              <p className="label">Defense &amp; police</p>

              <Reveal>
                <h2 className="mt-5 font-display text-[clamp(2.5rem,5.5vw,5rem)] font-bold uppercase leading-[0.9] tracking-[-0.04em] text-white">
                  Engineered for<br />
                  the unforgiving.
                </h2>
              </Reveal>

              <Reveal delay={0.1}>
                <p className="mt-6 max-w-[500px] text-[15px] font-body leading-relaxed text-white/50">
                  Two platforms: HawkAI Plus, a tactical UAV built for long
                  endurance, and Sentrivion, a VTOL built for rapid deployment.
                  Confirmed platform specs below, not field deployment or mission
                  stats.
                </p>
              </Reveal>

              {/* Product identity block */}
              <Reveal delay={0.15}>
                <div className="mt-10 border-t border-white/10 pt-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">
                    01 / Platform
                  </p>
                  <p className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-bold uppercase leading-[1.0] tracking-[-0.02em] text-white">
                    HawkAI Plus
                  </p>
                  <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.15em] text-white/40">
                    Tactical Quadcopter
                  </p>
                </div>
              </Reveal>
            </div>

            {/* Right — Drone image with technical callouts */}
            <Reveal delay={0.12}>
              <div className="relative">
                {/* Drone image */}
                <div className="relative mx-auto w-full max-w-[560px] md:ml-auto md:mr-0">
                  <div className="relative" style={{ aspectRatio: "826 / 797" }}>
                    <Image
                      src="/images/airframe-hawkai-plan.webp"
                      alt="HawkAI Plus top-down plan view"
                      fill
                      sizes="(min-width: 768px) 560px, 90vw"
                      className="object-contain"
                      style={{
                        filter: "grayscale(1) brightness(1.1) contrast(1.1)",
                        maskImage: "radial-gradient(ellipse at center, black 50%, transparent 85%)",
                        WebkitMaskImage: "radial-gradient(ellipse at center, black 50%, transparent 85%)",
                      }}
                    />
                  </div>

                  {/* Technical callout lines */}
                  {/* Top — Rotor System */}
                  <div aria-hidden="true" className="absolute left-[18%] top-[12%] hidden md:block">
                    <div className="flex items-center gap-2">
                      <span className="h-px w-10 bg-white/30" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                        Rotor system
                      </span>
                    </div>
                  </div>

                  {/* Center — Airframe */}
                  <div aria-hidden="true" className="absolute left-[5%] top-[48%] hidden md:block">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                        Airframe
                      </span>
                      <span className="h-px w-8 bg-white/30" />
                    </div>
                  </div>

                  {/* Bottom — Thermal Payload */}
                  <div aria-hidden="true" className="absolute bottom-[25%] right-[10%] hidden md:block">
                    <div className="flex items-center gap-2">
                      <span className="h-px w-8 bg-white/30" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                        Thermal payload
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* ─── SPECIFICATIONS ─────────────────────────────────────── */}
          <div className="mt-16 border-t border-white/10 pt-10 md:mt-24">
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-3">
              {SPECS.map((spec, i) => (
                <Reveal key={spec.label} delay={0.05 * i}>
                  <div className={`py-6 sm:py-0 ${i > 0 ? "border-t border-white/[0.06] sm:border-l sm:border-t-0 sm:pl-8" : ""}`}>
                    {/* Spec index + label */}
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                      {spec.index} / {spec.label}
                    </p>

                    {/* Large numeral */}
                    <p className={`mt-3 font-display font-bold uppercase leading-none tracking-[-0.03em] text-white ${
                      i === 0
                        ? "text-[clamp(4rem,10vw,7.5rem)]"
                        : "text-[clamp(3rem,7vw,5.5rem)]"
                    }`}>
                      {spec.numeral}
                    </p>

                    {/* Unit */}
                    <p className="mt-2 font-mono text-[13px] font-medium uppercase tracking-[0.1em] text-white/60">
                      {spec.unit}
                    </p>

                    {/* Description */}
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-white/30">
                      {spec.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* ─── BOTTOM METADATA STRIP ──────────────────────────────── */}
          <div className="mt-12 border-t border-white/[0.06] pt-6">
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {METADATA.map((item) => (
                <span key={item.key} className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/25">
                  {item.key} // {item.value}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECTION 2 — SENTRIVION
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-t border-white/[0.06] bg-black px-6 py-28 md:py-36">
        {/* Giant editorial background numeral */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[-5%] top-[10%] select-none font-display text-[40vw] font-bold leading-none text-white/[0.025] md:text-[25vw]"
        >
          02
        </span>

        <div className="relative z-10 mx-auto max-w-7xl">
          {/* ─── TOP: Product ID + Image ────────────────────────────── */}
          <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:gap-16">
            {/* Left — Drone image */}
            <Reveal delay={0.08}>
              <div className="relative">
                <div className="relative mx-auto w-full max-w-[520px] md:mr-auto md:ml-0">
                  <div className="relative" style={{ aspectRatio: "708 / 429" }}>
                    <Image
                      src="/images/airframe-sentrivion.webp"
                      alt="Sentrivion VTOL fixed-wing top view"
                      fill
                      sizes="(min-width: 768px) 520px, 90vw"
                      className="object-contain"
                      style={{
                        filter: "grayscale(1) brightness(1.1) contrast(1.1)",
                        maskImage: "radial-gradient(ellipse at center, black 55%, transparent 90%)",
                        WebkitMaskImage: "radial-gradient(ellipse at center, black 55%, transparent 90%)",
                      }}
                    />
                  </div>

                  {/* Technical callout */}
                  <div aria-hidden="true" className="absolute right-[8%] top-[20%] hidden md:block">
                    <div className="flex items-center gap-2">
                      <span className="h-px w-10 bg-white/30" />
                      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                        Fixed wing
                      </span>
                    </div>
                  </div>

                  <div aria-hidden="true" className="absolute bottom-[30%] left-[15%] hidden md:block">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/40">
                        Payload bay
                      </span>
                      <span className="h-px w-8 bg-white/30" />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Right — Product identity */}
            <div>
              <Reveal>
                <div className="border-t border-white/10 pt-6 md:border-t-0 md:pt-0">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">
                    02 / Platform
                  </p>
                  <p className="mt-2 font-display text-[clamp(1.5rem,3vw,2.5rem)] font-bold uppercase leading-[1.0] tracking-[-0.02em] text-white">
                    Sentrivion
                  </p>
                  <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.15em] text-white/40">
                    VTOL Fixed-Wing Platform
                  </p>
                </div>
              </Reveal>
            </div>
          </div>

          {/* ─── SPECIFICATIONS ─────────────────────────────────────── */}
          <div className="mt-16 border-t border-white/10 pt-10 md:mt-24">
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-3">
              {SENTRIVION_SPECS.map((spec, i) => (
                <Reveal key={spec.label} delay={0.05 * i}>
                  <div className={`py-6 sm:py-0 ${i > 0 ? "border-t border-white/[0.06] sm:border-l sm:border-t-0 sm:pl-8" : ""}`}>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
                      {spec.index} / {spec.label}
                    </p>
                    <p className={`mt-3 font-display font-bold uppercase leading-none tracking-[-0.03em] text-white ${
                      i === 0
                        ? "text-[clamp(4rem,10vw,7.5rem)]"
                        : "text-[clamp(3rem,7vw,5.5rem)]"
                    }`}>
                      {spec.numeral}
                    </p>
                    <p className="mt-2 font-mono text-[13px] font-medium uppercase tracking-[0.1em] text-white/60">
                      {spec.unit}
                    </p>
                    <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-white/30">
                      {spec.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* ─── BOTTOM METADATA STRIP ──────────────────────────────── */}
          <div className="mt-12 border-t border-white/[0.06] pt-6">
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {SENTRIVION_METADATA.map((item) => (
                <span key={item.key} className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/25">
                  {item.key} // {item.value}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-10">
            <a
              href="/product"
              className="group inline-flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.12em] text-white/50 transition-colors duration-300 hover:text-white"
            >
              See full specifications
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
