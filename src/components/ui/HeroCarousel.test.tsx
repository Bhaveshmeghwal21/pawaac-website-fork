// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HomeHero, { SLIDES } from "@/components/sections/HomeHero";
import { MIN_SWIPE_PX, SWIPE_FRACTION } from "@/components/ui/HeroCarousel";

/** Each slide's own hold, read from the real config rather than repeated here. */
const PHOTO_HOLD = SLIDES[0].holdMs;
const FOOTAGE_HOLD = SLIDES[1].holdMs;
/** Comfortably longer than a full cycle, for "it never advances" assertions. */
const WELL_PAST_A_CYCLE = (PHOTO_HOLD + FOOTAGE_HOLD) * 3;

// Site-owner request (current session): the hero backdrop advances from the sky
// photograph to real flight footage on its own, and can also be swiped by hand.
//
// Every behaviour below is one that fails silently. A broken advance timer, a
// swipe threshold that never triggers, or a reduced-motion branch that only
// looks gated would all still render a hero that appears correct in a
// screenshot, which is why these are pinned rather than eyeballed.

let reducedMotion = false;

function mockMatchMedia(reduced: boolean) {
  reducedMotion = reduced;
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reducedMotion : false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

function track() {
  return document.querySelector("[data-hero-carousel-track]") as HTMLElement;
}

/** Slide index currently held, read back off the track's own transform. */
function activeIndex() {
  const match = /translateX\(calc\((-?\d+)%/.exec(track().style.transform);
  return match ? Math.abs(Number(match[1])) / 100 : NaN;
}

/**
 * The same threshold the component applies. jsdom reports a zero width for the
 * stage, so the component falls back to window.innerWidth; this mirrors that so
 * the tests below straddle the real boundary instead of a guessed pixel count.
 */
function swipeThreshold() {
  return Math.max(MIN_SWIPE_PX, window.innerWidth * SWIPE_FRACTION);
}

function swipe(dx: number) {
  const stage = track().parentElement as HTMLElement;
  fireEvent.pointerDown(stage, { button: 0, pointerId: 1, clientX: 400 });
  fireEvent.pointerMove(stage, { pointerId: 1, clientX: 400 + dx });
  fireEvent.pointerUp(stage, { pointerId: 1, clientX: 400 + dx });
}

describe("hero carousel", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMatchMedia(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("opens on the photograph and advances to the footage on its own", () => {
    render(<HomeHero />);
    expect(activeIndex()).toBe(0);

    act(() => void vi.advanceTimersByTime(PHOTO_HOLD));
    expect(activeIndex()).toBe(1);
  });

  it("holds the footage longer than the photograph before cycling back", () => {
    // The point of the assertion, stated once: the hold is per slide, not global.
    expect(FOOTAGE_HOLD).toBeGreaterThan(PHOTO_HOLD);

    render(<HomeHero />);
    act(() => void vi.advanceTimersByTime(PHOTO_HOLD));
    expect(activeIndex()).toBe(1);

    // Still on the footage after the photograph's shorter hold has elapsed
    // again, which is what proves the hold is per slide rather than global.
    act(() => void vi.advanceTimersByTime(PHOTO_HOLD));
    expect(activeIndex()).toBe(1);

    act(() => void vi.advanceTimersByTime(FOOTAGE_HOLD - PHOTO_HOLD));
    expect(activeIndex()).toBe(0);
  });

  it("advances on a leftward swipe and goes back on a rightward one", () => {
    render(<HomeHero />);

    swipe(-(swipeThreshold() + 20));
    expect(activeIndex()).toBe(1);

    swipe(swipeThreshold() + 20);
    expect(activeIndex()).toBe(0);
  });

  it("ignores a drag that falls short of the swipe threshold", () => {
    render(<HomeHero />);

    swipe(-(swipeThreshold() - 5));
    expect(activeIndex()).toBe(0);

    // And a stray few pixel drag, which the pixel floor exists to absorb.
    swipe(-6);
    expect(activeIndex()).toBe(0);
  });

  it("stops advancing once paused, and resumes when played again", () => {
    render(<HomeHero />);

    fireEvent.click(
      screen.getByRole("button", { name: "Pause the hero background slideshow" }),
    );
    act(() => void vi.advanceTimersByTime(WELL_PAST_A_CYCLE));
    expect(activeIndex()).toBe(0);

    fireEvent.click(
      screen.getByRole("button", { name: "Play the hero background slideshow" }),
    );
    act(() => void vi.advanceTimersByTime(PHOTO_HOLD));
    expect(activeIndex()).toBe(1);
  });

  it("exposes a selector per slide, marking the active one", () => {
    render(<HomeHero />);

    const photo = screen.getByRole("button", { name: "Show the sky view" });
    const footage = screen.getByRole("button", { name: "Show the flight footage" });

    expect(photo).toHaveAttribute("aria-current", "true");
    expect(footage).not.toHaveAttribute("aria-current");

    fireEvent.click(footage);
    expect(activeIndex()).toBe(1);
    expect(footage).toHaveAttribute("aria-current", "true");
    expect(photo).not.toHaveAttribute("aria-current");
  });

  it("keeps the media out of the accessibility tree and off the tab order", () => {
    render(<HomeHero />);
    const stage = track().parentElement as HTMLElement;

    expect(stage).toHaveAttribute("aria-hidden", "true");
    // Vertical page scrolling must survive a full-bleed horizontal swipe surface.
    expect(stage.style.touchAction).toBe("pan-y");
    expect(document.querySelector("video")).toHaveAttribute("tabindex", "-1");
  });

  it("never preloads the footage, so it cannot compete with the hero's LCP image", () => {
    render(<HomeHero />);

    expect(document.querySelector("video")).toHaveAttribute("preload", "none");
    expect(document.querySelector("video")).not.toHaveAttribute("autoplay");
    expect(
      document.querySelector('[data-hero-scenery-image] img[src*="droneInSky"]'),
    ).not.toBeNull();
  });

  // Mobile: the content column overlays the swipe surface, and on a narrow
  // viewport it covers most of the hero. If it captured touches, the swipeable
  // area would collapse to a thin band above the headline.
  // Regression: site-owner report "this extra black side in carousel in video
  // appearing". The video was positioned with all four insets plus an explicit
  // width and height. A <video> is a replaced element, so that over-constraint
  // resolved against the clip's intrinsic 848px rather than filling the hero,
  // leaving the rest of the slide black. The box must be stated in a way that
  // cannot conflict.
  it("sizes the footage to fill its slide with no conflicting box values", () => {
    render(<HomeHero />);
    const video = document.querySelector("video") as HTMLElement;

    expect(video.className).toContain("inset-0");
    expect(video.className).toContain("h-full");
    expect(video.className).toContain("w-full");
    expect(video.className).toContain("object-cover");

    // No negative inset paired with an explicit size, which is the combination
    // that caused the gap.
    expect(video.className).not.toMatch(/-inset-/);
    expect(video.className).not.toMatch(/calc\(/);
  });

  it("lets a swipe start on the headline while keeping the controls tappable", () => {
    const { container } = render(<HomeHero />);

    const contentRow = container.querySelector(
      ".pointer-events-none.flex.flex-col",
    );
    expect(contentRow).not.toBeNull();

    const cta = screen.getByRole("link", { name: "See the platform" });
    expect(cta.className).toContain("pointer-events-auto");
    expect(
      screen.getByRole("button", { name: "Show the sky view" }).parentElement
        ?.parentElement?.className,
    ).toContain("pointer-events-auto");
  });

  // Regression: site-owner report that the carousel was not draggable by mouse.
  // Touch worked; the mouse did not, and the cause was not in the drag code.
  //
  // A slide holds a real <img>, and images are draggable by default on desktop.
  // Pressing and moving on one starts a native HTML5 image drag, which fires
  // `dragstart` and cancels the live pointer interaction with `pointercancel`.
  // The carousel ends the drag on cancel, and at that point the pointer had
  // travelled only a few pixels, so it fell under the swipe threshold and the
  // slide never changed. Touch never starts a native drag, which is exactly why
  // the bug looked mouse specific.
  describe("mouse dragging", () => {
    it("blocks the native image drag that was cancelling the gesture", () => {
      render(<HomeHero />);
      const stage = track().parentElement as HTMLElement;

      // fireEvent returns false when the handler called preventDefault, which is
      // what stops the browser taking the gesture over.
      expect(fireEvent.dragStart(stage)).toBe(false);
    });

    it("blocks it when the drag starts on the photograph itself", () => {
      render(<HomeHero />);
      const photo = document.querySelector(
        '[data-hero-scenery-image] img[src*="droneInSky"]',
      ) as HTMLElement;

      // The realistic case: the press lands on the image, not on bare stage.
      // Prevented either by the image opting out or by the stage handler the
      // event bubbles to.
      expect(photo).toHaveAttribute("draggable", "false");
      expect(fireEvent.dragStart(photo)).toBe(false);
    });

    it("changes slide on a left button drag past the threshold", () => {
      render(<HomeHero />);
      const stage = track().parentElement as HTMLElement;
      // Integer, because the transform is asserted as a string below and the
      // threshold itself is fractional (a fraction of the viewport width).
      const dx = Math.ceil(swipeThreshold()) + 20;

      fireEvent.pointerDown(stage, { button: 0, pointerId: 1, clientX: 500 });
      fireEvent.pointerMove(stage, { pointerId: 1, clientX: 500 - dx });
      // Mid gesture the track follows the pointer rather than snapping.
      expect(track().style.transform).toContain(`${-dx}px`);
      expect(track().className).not.toContain("transition-transform");
      fireEvent.pointerUp(stage, { pointerId: 1, clientX: 500 - dx });

      expect(activeIndex()).toBe(1);
    });

    it("ignores a right or middle button drag", () => {
      render(<HomeHero />);
      const stage = track().parentElement as HTMLElement;
      const dx = swipeThreshold() + 20;

      for (const button of [1, 2]) {
        fireEvent.pointerDown(stage, { button, pointerId: 1, clientX: 500 });
        fireEvent.pointerMove(stage, { pointerId: 1, clientX: 500 - dx });
        fireEvent.pointerUp(stage, { pointerId: 1, clientX: 500 - dx });
        expect(activeIndex()).toBe(0);
      }
    });

    it("shows a grab cursor at rest and a grabbing cursor mid drag", () => {
      render(<HomeHero />);
      const stage = track().parentElement as HTMLElement;

      // The only hint a mouse user gets that the hero is draggable at all.
      expect(stage.style.cursor).toBe("grab");

      fireEvent.pointerDown(stage, { button: 0, pointerId: 1, clientX: 500 });
      fireEvent.pointerMove(stage, { pointerId: 1, clientX: 460 });
      expect(stage.style.cursor).toBe("grabbing");

      fireEvent.pointerUp(stage, { pointerId: 1, clientX: 460 });
      expect(stage.style.cursor).toBe("grab");
    });

    it("holds the auto advance while a drag is in progress", () => {
      render(<HomeHero />);
      const stage = track().parentElement as HTMLElement;

      fireEvent.pointerDown(stage, { button: 0, pointerId: 1, clientX: 500 });
      fireEvent.pointerMove(stage, { pointerId: 1, clientX: 490 });

      // Well past the photograph's hold, but a held pointer must not have the
      // slide change underneath it.
      act(() => void vi.advanceTimersByTime(WELL_PAST_A_CYCLE));
      expect(activeIndex()).toBe(0);

      fireEvent.pointerUp(stage, { pointerId: 1, clientX: 490 });
    });
  });

  describe("under prefers-reduced-motion: reduce", () => {
    beforeEach(() => {
      mockMatchMedia(true);
    });

    it("never advances on its own and offers no pause control", () => {
      render(<HomeHero />);

      act(() => void vi.advanceTimersByTime(WELL_PAST_A_CYCLE));
      expect(activeIndex()).toBe(0);

      expect(
        screen.queryByRole("button", {
          name: /the hero background slideshow/,
        }),
      ).toBeNull();
    });

    it("still lets the visitor reach the footage deliberately, without a slide transition", () => {
      render(<HomeHero />);

      fireEvent.click(screen.getByRole("button", { name: "Show the flight footage" }));
      expect(activeIndex()).toBe(1);
      // An instant swap, not a 700ms slide across the viewport.
      expect(track().className).not.toContain("transition-transform");
    });
  });
});
