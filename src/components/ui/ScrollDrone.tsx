"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import useMediaQuery from "@/hooks/useMediaQuery";

/**
 * A scroll-linked drone that flies across the viewport as the user scrolls.
 * The drone follows a serpentine (weaving left-to-right-to-left) path,
 * tilts into its direction of travel, and has spinning propellers.
 *
 * - Fixed position, pointer-events-none (purely decorative)
 * - Hidden on mobile (<768px) for performance
 * - Respects prefers-reduced-motion (renders nothing)
 * - Uses Framer Motion useScroll + useTransform for 60fps GPU animation
 */

// Path waypoints: the drone weaves across the viewport.
// x values are in vw-equivalent percentages (0 = left edge, 100 = right edge)
// y values are in vh-equivalent percentages (0 = top, 100 = bottom)
// Each entry: [scrollProgress, xPercent, yPercent]
const PATH_POINTS: [number, number, number][] = [
  [0.0, 85, 15],    // Start top-right (near hero)
  [0.08, 70, 35],   // Drift left and down
  [0.16, 20, 25],   // Sweep to left side
  [0.24, 10, 50],   // Down along left edge
  [0.32, 35, 65],   // Cross toward center
  [0.40, 80, 45],   // Swing right
  [0.48, 90, 60],   // Continue right and down
  [0.56, 60, 75],   // Sweep back center
  [0.64, 15, 55],   // Far left
  [0.72, 25, 80],   // Down-left
  [0.80, 70, 70],   // Cross right
  [0.88, 85, 85],   // Lower right
  [0.96, 50, 40],   // Circle back to center
  [1.0, 30, 20],    // End upper-left area
];

const scrollValues = PATH_POINTS.map((p) => p[0]);
const xValues = PATH_POINTS.map((p) => p[1]);
const yValues = PATH_POINTS.map((p) => p[2]);

// Rotation derived from the direction of travel between waypoints
const rotationValues = PATH_POINTS.map((_, i) => {
  if (i === 0) return 12;
  const dx = xValues[i] - xValues[i - 1];
  const dy = yValues[i] - yValues[i - 1];
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return Math.max(-30, Math.min(30, angle * 0.5));
});

export default function ScrollDrone() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { scrollYProgress } = useScroll();

  // Map scroll progress to x, y, and rotation — all hooks called unconditionally
  const rawX = useTransform(scrollYProgress, scrollValues, xValues);
  const rawY = useTransform(scrollYProgress, scrollValues, yValues);
  const rawRotate = useTransform(scrollYProgress, scrollValues, rotationValues);

  // Spring physics for smooth, organic movement
  const x = useSpring(rawX, { stiffness: 60, damping: 20, mass: 0.8 });
  const y = useSpring(rawY, { stiffness: 60, damping: 20, mass: 0.8 });
  const rotate = useSpring(rawRotate, { stiffness: 80, damping: 15, mass: 0.5 });

  // Derived transforms for CSS values (also unconditional)
  const left = useTransform(x, (val) => `${val}vw`);
  const top = useTransform(y, (val) => `${val}vh`);

  // Don't render on mobile or reduced motion
  if (prefersReducedMotion || !isDesktop) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[45] hidden md:block"
    >
      <motion.div
        className="absolute"
        style={{ left, top, rotate }}
      >
        {/* Drone SVG - top-down quadcopter silhouette */}
        <div className="relative h-12 w-12 -translate-x-1/2 -translate-y-1/2 opacity-[0.45] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-full w-full"
          >
            {/* Body center */}
            <rect x="26" y="26" width="12" height="12" rx="2" fill="currentColor" className="text-fg/80" />

            {/* Arms */}
            <line x1="32" y1="26" x2="14" y2="8" stroke="currentColor" strokeWidth="2" className="text-fg/60" />
            <line x1="32" y1="26" x2="50" y2="8" stroke="currentColor" strokeWidth="2" className="text-fg/60" />
            <line x1="32" y1="38" x2="14" y2="56" stroke="currentColor" strokeWidth="2" className="text-fg/60" />
            <line x1="32" y1="38" x2="50" y2="56" stroke="currentColor" strokeWidth="2" className="text-fg/60" />

            {/* Propeller discs (spinning via CSS) */}
            <circle cx="14" cy="8" r="7" className="drone-propeller text-fg/40" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.1" />
            <circle cx="50" cy="8" r="7" className="drone-propeller text-fg/40" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.1" />
            <circle cx="14" cy="56" r="7" className="drone-propeller text-fg/40" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.1" />
            <circle cx="50" cy="56" r="7" className="drone-propeller text-fg/40" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.1" />

            {/* Motor hubs */}
            <circle cx="14" cy="8" r="2.5" fill="currentColor" className="text-fg/70" />
            <circle cx="50" cy="8" r="2.5" fill="currentColor" className="text-fg/70" />
            <circle cx="14" cy="56" r="2.5" fill="currentColor" className="text-fg/70" />
            <circle cx="50" cy="56" r="2.5" fill="currentColor" className="text-fg/70" />

            {/* Front indicator (camera/direction) */}
            <circle cx="32" cy="24" r="1.5" fill="currentColor" className="text-white/90" />
          </svg>
        </div>

        {/* Subtle ground shadow */}
        <div className="absolute left-1/2 top-full mt-2 h-2 w-6 -translate-x-1/2 rounded-full bg-black/15 blur-sm" />
      </motion.div>

      {/* Propeller spin keyframe */}
      <style>{`
        .drone-propeller {
          transform-origin: center;
          animation: drone-spin 0.12s linear infinite;
        }
        @keyframes drone-spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .drone-propeller { animation: none; }
        }
      `}</style>
    </div>
  );
}
