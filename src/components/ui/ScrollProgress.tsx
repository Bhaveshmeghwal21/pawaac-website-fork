"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * A thin, premium scroll progress bar fixed at the very top of the viewport.
 * Sits above the navigation (z-[100]) and provides a subtle visual cue
 * of page position — a common pattern on DJI, Palantir, and Anduril sites.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 50,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[100] h-[2px] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))",
      }}
    />
  );
}
