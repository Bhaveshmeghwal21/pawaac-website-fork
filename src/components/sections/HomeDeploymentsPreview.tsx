"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Reveal from "@/components/ui/Reveal";

const SECTORS = [
  {
    index: "01",
    tag: "DEFENSE",
    title: "PROTECTING\nBORDERS &\nCRITICAL ASSETS.",
    subtitle: "Border surveillance & force protection",
    src: "/images/sector-defense-v2.jpg",
    alt: "Aerial view of an Indian Air Force base",
  },
  {
    index: "02",
    tag: "POLICE",
    title: "URBAN\nSURVEILLANCE &\nSITUATIONAL\nAWARENESS.",
    subtitle: "City patrol & crowd monitoring",
    src: "/images/sector-police.jpg",
    alt: "Drone aerial view of a major Indian city",
  },
  {
    index: "03",
    tag: "INDUSTRIAL",
    title: "INFRASTRUCTURE\nPERIMETER\nMONITORING.",
    subtitle: "Facility security & asset protection",
    src: "/images/sector-industrial.jpg",
    alt: "Aerial view of an industrial area near Mumbai, India",
  },
  {
    index: "04",
    tag: "DISASTER RESPONSE",
    title: "RAPID\nASSESSMENT\nSEARCH &\nRESPONSE.",
    subtitle: "Damage assessment & search operations",
    src: "/images/sector-disaster-response.jpg",
    alt: "Aerial view of flood damage in Rudraprayag, Uttarakhand",
  },
];

export default function HomeDeploymentsPreview() {
  const [active, setActive] = useState(0);

  return (
    <section className="relative overflow-hidden bg-black px-6 py-28 md:py-36">
      {/* Giant background number */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-[-8%] top-[5%] select-none font-display text-[50vw] font-bold leading-none text-white/[0.025] md:text-[30vw]"
      >
        {SECTORS[active].index}
      </span>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* ─── HEADLINE ───────────────────────────────────────────── */}
        <Reveal>
          <div className="mb-12 md:mb-16">
            <p className="label">Sectors</p>
            <h2 className="mt-4 font-display text-[clamp(2.25rem,5vw,4.5rem)] font-bold uppercase leading-[0.9] tracking-[-0.04em] text-white">
              Where Pawaac<br />operates
            </h2>
            <p className="mt-4 max-w-[550px] text-[15px] font-body leading-relaxed text-white/50">
              Autonomous systems for defense, public safety, critical
              infrastructure, and rapid-response operations.
            </p>
          </div>
        </Reveal>

        {/* ─── SECTOR NAV ─────────────────────────────────────────── */}
        <div className="mb-8 border-b border-white/[0.08]">
          <div className="flex gap-0 overflow-x-auto">
            {SECTORS.map((sector, i) => (
              <button
                key={sector.index}
                onClick={() => setActive(i)}
                className={`group relative shrink-0 px-5 pb-4 pt-2 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors duration-300 ${
                  active === i ? "text-white" : "text-white/30 hover:text-white/60"
                }`}
              >
                <span className="mr-1.5 text-white/20">{sector.index}</span>
                {sector.tag}
                {/* Active indicator line */}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-px transition-all duration-500 ${
                    active === i ? "bg-white" : "bg-transparent"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ─── SHOWCASE ───────────────────────────────────────────── */}
        <div className="grid gap-4 md:grid-cols-[1fr_0.4fr] md:gap-3">
          {/* Active sector — large */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full overflow-hidden"
                style={{ aspectRatio: "16 / 9" }}
              >
                <Image
                  src={SECTORS[active].src}
                  alt={SECTORS[active].alt}
                  fill
                  sizes="(min-width: 768px) 65vw, 100vw"
                  className="object-cover"
                  style={{ filter: "grayscale(1) brightness(0.7) contrast(1.1)" }}
                />
                {/* Dark overlay for text */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Content over image */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                    {SECTORS[active].index} / {SECTORS[active].tag}
                  </p>
                  <h3 className="mt-3 max-w-md whitespace-pre-line font-display text-[clamp(1.5rem,3.5vw,2.75rem)] font-bold uppercase leading-[0.95] tracking-[-0.03em] text-white">
                    {SECTORS[active].title}
                  </h3>
                  <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.1em] text-white/50">
                    {SECTORS[active].subtitle}
                  </p>
                </div>

                {/* Corner marks */}
                <span aria-hidden="true" className="absolute left-3 top-3 h-4 w-4 border-l border-t border-white/20" />
                <span aria-hidden="true" className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-white/20" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Inactive sectors — stacked vertically */}
          <div className="flex gap-2 md:flex-col md:gap-3">
            {SECTORS.filter((_, i) => i !== active).map((sector, i) => {
              const realIndex = SECTORS.indexOf(sector);
              return (
                <button
                  key={sector.index}
                  onClick={() => setActive(realIndex)}
                  className="group relative flex-1 overflow-hidden text-left transition-all duration-500 hover:flex-[1.15]"
                  style={{ aspectRatio: "16/9" }}
                >
                  <Image
                    src={sector.src}
                    alt={sector.alt}
                    fill
                    sizes="(min-width: 768px) 20vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    style={{ filter: "grayscale(1) brightness(0.35) contrast(1.05)" }}
                  />
                  {/* Hover brighten */}
                  <div className="absolute inset-0 bg-black/30 transition-colors duration-500 group-hover:bg-black/10" />

                  {/* Label */}
                  <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-white/30 transition-colors duration-300 group-hover:text-white/50">
                      {sector.index}
                    </p>
                    <p className="mt-0.5 font-display text-[13px] font-bold uppercase leading-tight tracking-[-0.01em] text-white/50 transition-colors duration-300 group-hover:text-white/80 md:text-[14px]">
                      {sector.tag}
                    </p>
                  </div>

                  {/* Hover border */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 border border-white/0 transition-all duration-500 group-hover:border-white/15"
                  />

                  {/* Arrow on hover */}
                  <span
                    aria-hidden="true"
                    className="absolute right-3 top-3 font-mono text-[10px] text-white/0 transition-all duration-300 group-hover:text-white/40"
                  >
                    →
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── BOTTOM TECHNICAL STRIP ─────────────────────────────── */}
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-2 border-t border-white/[0.06] pt-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/20">
              Autonomous systems
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/20">
              Deploy anywhere
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white/20">
              Operate with confidence
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
