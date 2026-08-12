"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

/**
 * Wraps an image/content with a subtle parallax scroll effect.
 * The content moves slightly slower than the scroll, creating depth.
 * Falls back to static under prefers-reduced-motion.
 */
export default function ParallaxImage({
  children,
  className = "",
  speed = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  /** Parallax intensity. 0 = no effect, 0.5 = half-speed. Default 0.15 (subtle). */
  speed?: number;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [`-${speed * 100}%`, `${speed * 100}%`]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}
