"use client";

// Accessible looping demo video.
//
// This is the first video on the site. Two things drove the shape of it:
//
// 1. Reduced motion is a first-class branch in this repo (see README ->
//    Motion), so autoplay is NOT expressed as the `autoPlay` attribute. It is
//    started from an effect only when the visitor has not asked for reduced
//    motion. Doing it declaratively would either autoplay for everyone or
//    branch the rendered markup on a client-only media query, and the latter
//    is exactly the hydration mismatch that Reveal.tsx had to be fixed for.
//
// 2. WCAG 2.2.2 (Pause, Stop, Hide): looping motion needs a control. A GIF
//    cannot offer one, which is the main reason this ships as a <video>
//    rather than the animated GIF that also exists at
//    public/videos/detection-demo.gif. The control below is a real button,
//    keyboard reachable, with an accurate accessible name.
//
// The video is always muted and carries no audio track at all, so there is no
// sound to control and no autoplay-blocking from the browser's audio policy.
import { useEffect, useRef, useState } from "react";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

export type DemoVideoProps = {
  /** Base path without extension; `.webm` and `.mp4` are both served. */
  src: string;
  poster: string;
  /**
   * Describes the footage for assistive technology. Required: this carries
   * the meaning for anyone who cannot see the video.
   */
  description: string;
  /**
   * Visible provenance caption. Must state that the overlay is illustrative —
   * `simulatedLabel.ts` encodes that rule and
   * ProductDetectionDemo.test.tsx asserts it for this component's use.
   */
  caption: string;
  aspect?: string;
  className?: string;
};

export default function DemoVideo({
  src,
  poster,
  description,
  caption,
  aspect = "16 / 9",
  className,
}: DemoVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (prefersReducedMotion) {
      // No setState here on purpose: pause() fires the onPause handler below,
      // which owns this state. Setting it synchronously inside the effect as
      // well is both redundant and a lint error (cascading renders).
      video.pause();
      return;
    }

    // play() rejects if the browser blocks it. That is not an error worth
    // surfacing: the poster stays visible and the control below still works.
    const attempt = video.play();
    if (attempt && typeof attempt.catch === "function") {
      attempt.catch(() => setIsPlaying(false));
    }
  }, [prefersReducedMotion]);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => setIsPlaying(false));
      }
    } else {
      video.pause();
    }
  }

  return (
    <figure className={className}>
      <div className="relative overflow-hidden border border-line bg-bg-2">
        <div className="relative w-full" style={{ aspectRatio: aspect }}>
          <video
            ref={videoRef}
            poster={poster}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={description}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={src + ".webm"} type="video/webm" />
            <source src={src + ".mp4"} type="video/mp4" />
          </video>
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-label={isPlaying ? "Pause the demo video" : "Play the demo video"}
          className="absolute bottom-3 right-3 border border-fg/70 bg-bg/80 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-fg backdrop-blur transition-colors hover:bg-fg hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fg focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>

      <figcaption className="technical-data mt-3 text-muted">{caption}</figcaption>
    </figure>
  );
}
