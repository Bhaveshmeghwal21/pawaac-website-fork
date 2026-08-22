// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { existsSync } from "node:fs";
import { join } from "node:path";
import ProductDetectionDemo from "@/components/sections/ProductDetectionDemo";
import { isValidIllustrativeLabel } from "@/lib/validators/simulatedLabel";

// Site-owner request (current session): annotations generated with Gemini 3.7
// Flash over real Pawaac flight footage, shown on the Platform page.
//
// The overlay was NOT produced by Pawaac's own detector, so the visible
// caption has to say it is illustrative. That is the invariant most worth
// protecting here: the video looks like product output, so a future edit that
// tightens the caption into "our detection system" would turn it into an
// unbacked capability claim with nothing objecting. simulatedLabel.ts already
// encodes the wording rule; this wires the real component to it.
//
// jsdom does not implement media playback, so play/pause are stubbed. The
// point is not to test the browser, it is to test that we ask for the right
// behaviour: no autoplay under reduced motion, and a working pause control.

const PUBLIC = join(__dirname, "..", "..", "..", "public");

function mockMatchMedia(reduce: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reduce : false,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
      onchange: null,
    }),
  });
}

let play: ReturnType<typeof vi.fn>;
let pause: ReturnType<typeof vi.fn>;

beforeEach(() => {
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true, writable: true, value: play,
  });
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true, writable: true, value: pause,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Platform page detection demo", () => {
  it("labels the overlay as illustrative, per simulatedLabel.ts", () => {
    mockMatchMedia(false);
    const { container } = render(<ProductDetectionDemo />);

    const caption = container.querySelector("figcaption")?.textContent ?? "";
    expect(caption.length).toBeGreaterThan(0);
    expect(isValidIllustrativeLabel(caption)).toBe(true);
  });

  it("does not present the overlay as output of the shipping detector", () => {
    mockMatchMedia(false);
    const { container } = render(<ProductDetectionDemo />);
    const caption = container.querySelector("figcaption")?.textContent ?? "";

    // It must actively disclaim, not merely avoid boasting.
    expect(caption.toLowerCase()).toMatch(/not output of the shipping detector/);
  });

  it("serves both webm and mp4, and a poster, all present on disk", () => {
    mockMatchMedia(false);
    const { container } = render(<ProductDetectionDemo />);

    const video = container.querySelector("video");
    expect(video).not.toBeNull();

    const sources = Array.from(container.querySelectorAll("source")).map((s) => ({
      src: s.getAttribute("src") ?? "",
      type: s.getAttribute("type") ?? "",
    }));
    expect(sources.map((s) => s.type)).toEqual(["video/webm", "video/mp4"]);

    const poster = video?.getAttribute("poster") ?? "";
    expect(poster.length).toBeGreaterThan(0);

    for (const p of [...sources.map((s) => s.src), poster]) {
      expect(existsSync(join(PUBLIC, p.replace(/^\//, "")))).toBe(true);
    }
  });

  it("is muted and looping, and carries a description for assistive technology", () => {
    mockMatchMedia(false);
    const { container } = render(<ProductDetectionDemo />);
    const video = container.querySelector("video") as HTMLVideoElement;

    expect(video.muted).toBe(true);
    expect(video.hasAttribute("loop")).toBe(true);
    expect(video.getAttribute("aria-label")?.length ?? 0).toBeGreaterThan(20);
  });

  it("autoplays only when reduced motion is not requested", () => {
    mockMatchMedia(false);
    render(<ProductDetectionDemo />);
    expect(play).toHaveBeenCalled();
  });

  it("does not autoplay under prefers-reduced-motion, and pauses instead", () => {
    mockMatchMedia(true);
    render(<ProductDetectionDemo />);

    expect(play).not.toHaveBeenCalled();
    expect(pause).toHaveBeenCalled();
  });

  it("offers a keyboard reachable pause control (WCAG 2.2.2)", () => {
    mockMatchMedia(true);
    render(<ProductDetectionDemo />);

    // Paused under reduced motion, so the control offers Play.
    const button = screen.getByRole("button", { name: /play the demo video/i });
    expect(button.tagName).toBe("BUTTON");

    fireEvent.click(button);
    expect(play).toHaveBeenCalled();
  });

  it("never renders the autoPlay attribute, which would ignore the motion preference", () => {
    mockMatchMedia(false);
    const { container } = render(<ProductDetectionDemo />);

    expect(container.querySelector("video")?.hasAttribute("autoplay")).toBe(false);
  });
});
