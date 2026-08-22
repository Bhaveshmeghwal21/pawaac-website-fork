"use client";

// Hero background carousel: state hook, media stage, and controls.
//
// Site-owner request (current session): "use this video after creating a
// carousel in hero section of homepage, there is a hero image so basically when
// the user visits first image shows up then it swipes to the right ... also it
// should be possible for users to swipe as well".
//
// Why this is split into a hook plus two presentational parts rather than one
// component: the media fills the hero as an absolute z-0 layer, but the controls
// belong in the z-10 content column so they line up with the headline and the
// CTA on the site's content grid. One component cannot sit in both places, and
// lifting the state into HomeHero keeps the carousel's two halves in their
// natural DOM positions instead of absolutely positioning the controls to
// approximate an alignment the grid already provides.
//
// Why the media is NOT converted to a GIF, despite the request allowing it:
// this repo already rejected exactly that trade for the /product detection demo,
// and the reasoning is recorded in README.md. A GIF cannot be paused, so it can
// satisfy neither WCAG 2.2.2 (Pause, Stop, Hide) nor this repo's reduced-motion
// rule, and it costs more bytes at less resolution. The measured numbers here
// are the same story: the source mp4 is 4.73 MB, and the webm/mp4 pair below is
// 550 KB / 707 KB, while a GIF of a 19.5 second clip would run to several
// megabytes at a fraction of the quality.
//
// Accessibility shape:
//   - The media track is aria-hidden. It is decorative background, consistent
//     with SkyScenery (already aria-hidden) being one of its slides, and the
//     hero's meaning lives in the headline. decorativeElement.ts's rule is that
//     decorative elements stay out of the accessibility tree.
//   - The controls are NOT decorative and are fully exposed: a real pause
//     control (WCAG 2.2.2 applies to moving content whether or not the content
//     itself is meaningful) and one selector per slide with aria-current.
//   - Under prefers-reduced-motion the carousel never advances on its own, so
//     the pause control is meaningless and is not rendered. The slide selectors
//     stay, so the footage is still reachable deliberately.
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

export type HeroCarouselSlide = {
  /**
   * Names the slide's content for the selector button's accessible name, as
   * "Show {label}". Keep it a noun phrase.
   */
  label: string;
  /** How long this slide is held before advancing, in milliseconds. */
  holdMs: number;
};

export type HeroCarouselApi = {
  index: number;
  slides: readonly HeroCarouselSlide[];
  isPaused: boolean;
  /** True when the visitor asked for reduced motion; no slide advances itself. */
  isStatic: boolean;
  dragOffsetPx: number;
  isDragging: boolean;
  goTo: (index: number) => void;
  togglePaused: () => void;
  stageProps: {
    ref: React.RefObject<HTMLDivElement | null>;
    onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: ReactPointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (event: ReactPointerEvent<HTMLDivElement>) => void;
  };
};

// A swipe has to clear the larger of SWIPE_FRACTION of the stage width or
// MIN_SWIPE_PX. The floor matters for two reasons: it stops a stray few-pixel
// drag on a narrow viewport from changing slides, and it keeps the threshold
// meaningful in jsdom, where getBoundingClientRect always reports a width of 0.
//
// Both are exported so tests can assert the rule at its boundary rather than
// hardcoding a pixel count that silently stops testing anything if these are
// ever tuned.
export const MIN_SWIPE_PX = 48;
export const SWIPE_FRACTION = 0.1;

export function useHeroCarousel(
  slides: readonly HeroCarouselSlide[],
): HeroCarouselApi {
  const prefersReducedMotion = usePrefersReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [drag, setDrag] = useState<{ startX: number; dx: number } | null>(null);

  const count = slides.length;

  // Auto-advance. The timeout is keyed on the current slide so each slide can
  // hold for its own duration — the still image needs only a beat, the footage
  // needs long enough to read as footage rather than as a flicker.
  //
  // setState happens inside the timeout callback, not in the effect body, so
  // this does not trip react-hooks/set-state-in-effect.
  useEffect(() => {
    if (prefersReducedMotion || isPaused || drag || count < 2) return;

    const id = window.setTimeout(() => {
      setIndex((i) => (i + 1) % count);
    }, slides[index].holdMs);

    return () => window.clearTimeout(id);
  }, [count, drag, index, isPaused, prefersReducedMotion, slides]);

  const goTo = useCallback(
    (next: number) => {
      if (count < 1) return;
      setIndex(((next % count) + count) % count);
    },
    [count],
  );

  const togglePaused = useCallback(() => setIsPaused((p) => !p), []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      // Mouse wheel/middle clicks and right clicks should not start a drag.
      if (event.button !== 0) return;
      // setPointerCapture keeps move/up events coming to this element even if
      // the pointer leaves it mid-drag. Guarded because jsdom does not
      // implement it.
      if (typeof event.currentTarget.setPointerCapture === "function") {
        try {
          event.currentTarget.setPointerCapture(event.pointerId);
        } catch {
          // A pointer that has already been released throws here; harmless.
        }
      }
      setDrag({ startX: event.clientX, dx: 0 });
    },
    [],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      setDrag((d) => (d ? { ...d, dx: event.clientX - d.startX } : d));
    },
    [],
  );

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!drag) return;

      const width =
        event.currentTarget.getBoundingClientRect().width ||
        (typeof window !== "undefined" ? window.innerWidth : 0);
      const threshold = Math.max(MIN_SWIPE_PX, width * SWIPE_FRACTION);

      if (drag.dx <= -threshold) goTo(index + 1);
      else if (drag.dx >= threshold) goTo(index - 1);

      setDrag(null);
    },
    [drag, goTo, index],
  );

  return useMemo<HeroCarouselApi>(
    () => ({
      index,
      slides,
      isPaused,
      isStatic: prefersReducedMotion,
      dragOffsetPx: drag?.dx ?? 0,
      isDragging: drag !== null,
      goTo,
      togglePaused,
      stageProps: {
        ref: stageRef,
        onPointerDown,
        onPointerMove,
        onPointerUp: endDrag,
        onPointerCancel: endDrag,
      },
    }),
    [
      drag,
      endDrag,
      goTo,
      index,
      isPaused,
      onPointerDown,
      onPointerMove,
      prefersReducedMotion,
      slides,
      togglePaused,
    ],
  );
}

/**
 * The full-bleed media layer. Children are the slides, in the same order as the
 * `slides` config handed to `useHeroCarousel`.
 *
 * `touch-action: pan-y` is what lets a visitor swipe the carousel horizontally
 * without losing the ability to scroll the page vertically through it — the
 * stage covers the whole hero, so without it a full-bleed swipe surface would
 * eat vertical scrolling on every phone.
 */
export function HeroCarouselStage({
  api,
  children,
}: {
  api: HeroCarouselApi;
  children: ReactNode;
}) {
  const { index, dragOffsetPx, isDragging, isStatic, stageProps } = api;

  return (
    <div
      {...stageProps}
      aria-hidden="true"
      className="absolute inset-0 z-0 overflow-hidden select-none"
      style={{ touchAction: "pan-y", cursor: isDragging ? "grabbing" : undefined }}
    >
      <div
        data-hero-carousel-track
        className={`flex h-full w-full ${
          // No transition while dragging (the track must track the finger) and
          // none under reduced motion (a slide change is then an instant swap,
          // never a slide across the viewport).
          isDragging || isStatic
            ? ""
            : "transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        }`}
        style={{
          transform: `translateX(calc(${-index * 100}% + ${dragOffsetPx}px))`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** One slide's positioning shell. Keeps every slide exactly one viewport wide. */
export function HeroCarouselSlideFrame({ children }: { children: ReactNode }) {
  return <div className="relative h-full w-full shrink-0 grow-0 basis-full">{children}</div>;
}

/**
 * Slide selectors plus the pause control. Rendered in the hero's content column
 * rather than over the media, so it sits on the same grid as the headline.
 */
export function HeroCarouselControls({
  api,
  className = "",
}: {
  api: HeroCarouselApi;
  className?: string;
}) {
  const { index, slides, isPaused, isStatic, goTo, togglePaused } = api;

  return (
    <div className={`flex items-center gap-5 ${className}`}>
      <div className="flex items-center gap-2.5">
        {slides.map((slide, i) => (
          <button
            key={slide.label}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show ${slide.label}`}
            aria-current={i === index ? "true" : undefined}
            // -my-3/py-3 gives the 1px rule a 25px tall hit area without
            // changing the layout around it. The visible mark is a hairline, but
            // WCAG 2.5.8 wants a 24x24 target, and on a phone this is the only
            // control here that is thumb operated.
            className="group -my-3 py-3 focus-visible:outline-none"
          >
            <span
              className={`block h-px transition-all duration-500 ${
                i === index
                  ? "w-12 bg-fg"
                  : "w-6 bg-fg/40 group-hover:bg-fg/80 group-focus-visible:bg-fg group-focus-visible:ring-1 group-focus-visible:ring-fg"
              }`}
            />
          </button>
        ))}
      </div>

      {/* WCAG 2.2.2. Omitted under reduced motion because nothing moves on its
          own there, so a pause control would be a button that does nothing. */}
      {!isStatic && (
        <button
          type="button"
          onClick={togglePaused}
          aria-label={
            isPaused
              ? "Play the hero background slideshow"
              : "Pause the hero background slideshow"
          }
          className="-my-2 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-fg/70 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] transition-colors hover:text-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fg"
        >
          {isPaused ? "Play" : "Pause"}
        </button>
      )}
    </div>
  );
}
