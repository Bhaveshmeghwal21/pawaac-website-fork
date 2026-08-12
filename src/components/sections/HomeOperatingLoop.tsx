"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

const STEPS = [
  {
    index: "01",
    name: "Dock",
    body: "Aircraft sit docked and charging at the station or facility they cover. No separate launch site, no crew callout to get airborne.",
    side: "left" as const,
  },
  {
    index: "02",
    name: "Patrol",
    body: "Scheduled and on demand loops fly on GPS waypoint autonomy inside a geofence, with return to home on low battery or loss of signal.",
    side: "right" as const,
  },
  {
    index: "03",
    name: "Detect",
    body: "Onboard vision classifies and tracks entities during the flight, so what comes back is events to act on rather than hours of footage to review.",
    side: "left" as const,
  },
  {
    index: "04",
    name: "Alert",
    body: "An operator gets a located alert and taps in for live video only when there is something worth looking at.",
    side: "right" as const,
  },
  {
    index: "05",
    name: "Respond",
    body: "The aircraft holds overwatch while responders move, then returns to the dock and recharges for the next loop.",
    side: "left" as const,
  },
];

/**
 * The SVG flight path that connects all 5 stages in a zigzag.
 * Drawn progressively as the user scrolls through the section.
 */
function FlightPath({ progress }: { progress: number }) {
  // The path zigzags: left node → right node → left node etc.
  // Each node is vertically centered in its stage row.
  // On desktop: left nodes at x=20%, right nodes at x=80%
  // Vertical spacing: evenly distributed across the SVG height
  const d = [
    "M 20 4",      // Start at stage 1 (left)
    "L 20 16",     // Down from stage 1
    "C 20 20, 80 20, 80 24", // Curve to right
    "L 80 36",     // Down to stage 2 (right)
    "L 80 44",     // Down from stage 2
    "C 80 48, 20 48, 20 52", // Curve to left
    "L 20 64",     // Down to stage 3 (left)
    "L 20 72",     // Down from stage 3
    "C 20 76, 80 76, 80 80", // Curve to right
    "L 80 92",     // Down to stage 4 (right)
    "L 80 100",    // Down from stage 4
    "C 80 104, 20 104, 20 108", // Curve to left
    "L 20 120",    // Down to stage 5 (left)
  ].join(" ");

  return (
    <svg
      viewBox="0 0 100 124"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
      aria-hidden="true"
    >
      {/* Background path (dim) */}
      <path
        d={d}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="0.3"
        vectorEffect="non-scaling-stroke"
      />
      {/* Animated foreground path */}
      <path
        d={d}
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="0.3"
        vectorEffect="non-scaling-stroke"
        strokeDasharray="1"
        strokeDashoffset={1 - progress}
        style={{ pathLength: 1 }}
      />
      {/* Nodes at each stage */}
      {[
        [20, 4],
        [80, 36],
        [20, 64],
        [80, 92],
        [20, 120],
      ].map(([cx, cy], i) => {
        const nodeProgress = Math.min(1, Math.max(0, (progress - i * 0.18) / 0.12));
        return (
          <rect
            key={i}
            x={cx - 0.8}
            y={cy - 0.8}
            width={1.6}
            height={1.6}
            fill={nodeProgress > 0.5 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)"}
            style={{
              transition: "fill 0.4s ease",
            }}
          />
        );
      })}
    </svg>
  );
}

/**
 * Mobile flight path — single vertical line with alternating node offsets.
 */
function MobileFlightPath({ progress }: { progress: number }) {
  return (
    <svg
      viewBox="0 0 40 200"
      preserveAspectRatio="none"
      className="pointer-events-none absolute left-6 top-0 h-full w-10 md:hidden"
      aria-hidden="true"
    >
      {/* Vertical line */}
      <line
        x1="20" y1="0" x2="20" y2="200"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <line
        x1="20" y1="0" x2="20" y2={200 * progress}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      {/* Nodes */}
      {[20, 60, 100, 140, 180].map((cy, i) => {
        const nodeProgress = Math.min(1, Math.max(0, (progress - i * 0.18) / 0.12));
        return (
          <rect
            key={i}
            x={17}
            y={cy - 3}
            width={6}
            height={6}
            fill={nodeProgress > 0.5 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)"}
            style={{ transition: "fill 0.4s ease" }}
          />
        );
      })}
    </svg>
  );
}

export default function HomeOperatingLoop() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "end 0.3"],
  });

  const rawProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const progress = useSpring(rawProgress, { stiffness: 80, damping: 30 });

  // For the flight path SVG, we need a plain number (not a MotionValue)
  // Use a state-driven approach via useTransform callback
  const pathProgress = prefersReducedMotion ? 1 : undefined;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-bg/90 px-6 py-28 md:py-40"
    >
      {/* Darkened background overlay to suppress sky */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black/40"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* ─── HEADER ─────────────────────────────────────────────── */}
        <div className="grid gap-8 md:grid-cols-[1fr_1fr] md:items-end md:gap-16">
          <div>
            <p className="label">Operating concept</p>

            {/* Precision-engineered headline frame */}
            <div className="relative mt-6 -ml-2 w-fit px-8 py-7 md:-ml-4 md:px-10 md:py-9">
              {/* Frame edges — 1px white lines with corner notch gaps (10px) */}
              {/* Top */}
              <span aria-hidden="true" className="absolute left-[10px] right-[10px] top-0 h-px bg-white/30" />
              {/* Bottom — extends 6px farther right */}
              <span aria-hidden="true" className="absolute bottom-0 left-0 right-[-6px] h-px bg-white/30" />
              {/* Left — starts below top-left notch */}
              <span aria-hidden="true" className="absolute bottom-[10px] left-0 top-[10px] w-px bg-white/30" />
              {/* Right */}
              <span aria-hidden="true" className="absolute bottom-[10px] right-0 top-[10px] w-px bg-white/30" />

              {/* Corner notch marks — tiny L-shapes at each corner */}
              <span aria-hidden="true" className="absolute -left-[3px] -top-[3px] h-[10px] w-[10px] border-l border-t border-white/20" />
              <span aria-hidden="true" className="absolute -right-[3px] -top-[3px] h-[10px] w-[10px] border-r border-t border-white/20" />
              <span aria-hidden="true" className="absolute -bottom-[3px] -left-[3px] h-[10px] w-[10px] border-b border-l border-white/20" />
              <span aria-hidden="true" className="absolute -bottom-[3px] -right-[3px] h-[10px] w-[10px] border-b border-r border-white/20" />

              {/* Technical markers */}
              <span aria-hidden="true" className="absolute -left-5 top-1/2 h-px w-2.5 -translate-y-1/2 bg-white/25" />
              <span aria-hidden="true" className="absolute -bottom-4 right-5 h-[5px] w-[5px] border border-white/25" />

              <h2 className="font-display text-[clamp(2.5rem,5.5vw,5rem)] font-bold uppercase leading-[0.9] tracking-[-0.04em] text-white">
                Surveillance<br />
                that notices,<br />
                not just<br />
                records.
              </h2>
            </div>
          </div>
          <div className="max-w-[550px]">
            <p className="text-[1rem] font-body leading-relaxed text-white/60 md:text-[1.0625rem]">
              A conventional camera network records everything and depends on
              someone watching it. Pawaac turns that around: the system spends
              its effort noticing, so your people can spend theirs responding.
            </p>
          </div>
        </div>

        {/* ─── ZIGZAG WORKFLOW ─────────────────────────────────────── */}
        <div className="relative mt-20 md:mt-28">
          {/* SVG flight path (desktop) */}
          <FlightPathAnimated progress={progress} reduced={prefersReducedMotion} />

          {/* Mobile flight path */}
          <MobileFlightPathAnimated progress={progress} reduced={prefersReducedMotion} />

          {/* Stages */}
          <div className="relative space-y-16 pl-14 md:space-y-24 md:pl-0">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.index}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                className={`md:w-[40%] ${
                  step.side === "right"
                    ? "md:ml-auto md:text-left"
                    : "md:mr-auto md:text-left"
                }`}
              >
                {/* Stage number */}
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
                  {step.index}
                </p>
                {/* Stage name */}
                <h3 className="mt-2 font-display text-[clamp(1.75rem,3.5vw,3rem)] font-bold uppercase leading-[1.0] tracking-[-0.03em] text-white">
                  {step.name}
                </h3>
                {/* Stage description */}
                <p className="mt-3 max-w-[380px] text-[14px] font-body leading-relaxed text-white/50 md:text-[15px]">
                  {step.body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ─── CLOSING STATEMENT ──────────────────────────────────── */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 border-t border-white/10 pt-8 md:mt-28"
        >
          <p className="max-w-xl font-display text-[clamp(1.1rem,2vw,1.5rem)] font-medium uppercase leading-[1.3] tracking-[-0.01em] text-white/80">
            The cycle repeats without a pilot at the controls, and an operator
            stays in the loop for escalation by design.
          </p>
          <a
            href="/autonomy"
            className="group mt-6 inline-flex items-center gap-2.5 font-mono text-[12px] uppercase tracking-[0.12em] text-white/60 transition-colors duration-300 hover:text-white"
          >
            See the autonomy stack
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1.5">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Wrapper that reads the MotionValue and passes a plain number to FlightPath.
 */
function FlightPathAnimated({
  progress,
  reduced,
}: {
  progress: ReturnType<typeof useSpring>;
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div ref={ref} className="absolute inset-0 hidden md:block" aria-hidden="true">
      <FlightPathInner progress={progress} reduced={reduced} />
    </motion.div>
  );
}

function FlightPathInner({
  progress,
  reduced,
}: {
  progress: ReturnType<typeof useSpring>;
  reduced: boolean;
}) {
  // Read MotionValue as a rendered value via useTransform
  const dashOffset = useTransform(progress, (v) => 1 - (reduced ? 1 : v));

  const d = [
    "M 20 4",
    "L 20 16",
    "C 20 20, 80 20, 80 24",
    "L 80 36",
    "L 80 44",
    "C 80 48, 20 48, 20 52",
    "L 20 64",
    "L 20 72",
    "C 20 76, 80 76, 80 80",
    "L 80 92",
    "L 80 100",
    "C 80 104, 20 104, 20 108",
    "L 20 120",
  ].join(" ");

  return (
    <svg
      viewBox="0 0 100 124"
      preserveAspectRatio="none"
      className="h-full w-full"
    >
      {/* Background path (dim) */}
      <path
        d={d}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="0.3"
        vectorEffect="non-scaling-stroke"
      />
      {/* Animated foreground path */}
      <motion.path
        d={d}
        fill="none"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="0.3"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        style={{
          strokeDasharray: 1,
          strokeDashoffset: dashOffset,
        }}
      />
      {/* Nodes */}
      {[
        [20, 4],
        [80, 36],
        [20, 64],
        [80, 92],
        [20, 120],
      ].map(([cx, cy], i) => (
        <NodeRect key={i} cx={cx} cy={cy} index={i} progress={progress} reduced={reduced} />
      ))}
    </svg>
  );
}

function NodeRect({
  cx,
  cy,
  index,
  progress,
  reduced,
}: {
  cx: number;
  cy: number;
  index: number;
  progress: ReturnType<typeof useSpring>;
  reduced: boolean;
}) {
  const fill = useTransform(progress, (p) => {
    const val = reduced ? 1 : p;
    const nodeP = Math.min(1, Math.max(0, (val - index * 0.18) / 0.12));
    return nodeP > 0.5 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)";
  });

  return (
    <motion.rect
      x={cx - 0.8}
      y={cy - 0.8}
      width={1.6}
      height={1.6}
      style={{ fill }}
    />
  );
}

/**
 * Mobile flight path wrapper.
 */
function MobileFlightPathAnimated({
  progress,
  reduced,
}: {
  progress: ReturnType<typeof useSpring>;
  reduced: boolean;
}) {
  const lineY = useTransform(progress, (v) => (reduced ? 200 : v * 200));

  return (
    <svg
      viewBox="0 0 40 200"
      preserveAspectRatio="none"
      className="pointer-events-none absolute left-4 top-0 h-full w-8 md:hidden"
      aria-hidden="true"
    >
      {/* Dim vertical line */}
      <line
        x1="20" y1="0" x2="20" y2="200"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      {/* Progress line */}
      <motion.line
        x1="20" y1="0" x2="20"
        style={{ y2: lineY } as any}
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      {/* Nodes */}
      {[20, 56, 92, 128, 164].map((nodeY, i) => (
        <MobileNodeRect key={i} cy={nodeY} index={i} progress={progress} reduced={reduced} />
      ))}
    </svg>
  );
}

function MobileNodeRect({
  cy,
  index,
  progress,
  reduced,
}: {
  cy: number;
  index: number;
  progress: ReturnType<typeof useSpring>;
  reduced: boolean;
}) {
  const fill = useTransform(progress, (p) => {
    const val = reduced ? 1 : p;
    const nodeP = Math.min(1, Math.max(0, (val - index * 0.18) / 0.12));
    return nodeP > 0.5 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.12)";
  });

  return (
    <motion.rect
      x={17}
      y={cy - 2.5}
      width={5}
      height={5}
      style={{ fill }}
    />
  );
}
