"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

/**
 * Premium animated counter that counts up from 0 to target value
 * when scrolled into view. Used for statistics/metrics display.
 * Falls back to static value under prefers-reduced-motion.
 */
export default function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1.8,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || prefersReducedMotion) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // Ease out cubic for a decelerating count
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [inView, value, duration, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <span className={className}>
        {prefix}{value}{suffix}
      </span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {prefix}{inView ? count : 0}{suffix}
    </span>
  );
}
