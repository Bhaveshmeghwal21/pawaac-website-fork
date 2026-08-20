// @vitest-environment jsdom
import { act, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { signalPageReady } from "@/lib/motion/pageReady";
import HeroHeadline from "./HeroHeadline";

const {
  conditions,
  timeline,
  timelineFactory,
  topLevelFromTo,
  contextRevert,
  mediaRevert,
  matchMediaCleanup,
} = vi.hoisted(() => {
  const activeConditions = {
    desktop: true,
    mobile: false,
    reduce: false,
  };
  const activeTimeline = {
    from: vi.fn(),
    fromTo: vi.fn(),
    kill: vi.fn(),
  };
  activeTimeline.from.mockImplementation(() => activeTimeline);
  activeTimeline.fromTo.mockImplementation(() => activeTimeline);
  return {
    conditions: activeConditions,
    timeline: activeTimeline,
    timelineFactory: vi.fn(() => activeTimeline),
    topLevelFromTo: vi.fn(() => ({ kill: vi.fn() })),
    contextRevert: vi.fn(),
    mediaRevert: vi.fn(),
    matchMediaCleanup: { current: undefined as (() => void) | undefined },
  };
});

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    context: vi.fn((setup: () => void) => {
      setup();
      return { revert: contextRevert };
    }),
    matchMedia: vi.fn(() => ({
      add: vi.fn(
        (
          _queries: Record<string, string>,
          setup: (context: { conditions: typeof conditions }) => void,
        ) => {
          matchMediaCleanup.current = setup({ conditions }) as
            | (() => void)
            | undefined;
        },
      ),
      revert: mediaRevert,
    })),
    timeline: timelineFactory,
    fromTo: topLevelFromTo,
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {} }));

function mockMatchMedia() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches:
      query === "(prefers-reduced-motion: reduce)" ? conditions.reduce : false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function renderHero() {
  return render(
    <section data-home-hero>
      <div data-hero-scenery-image />
      <HeroHeadline text="Autonomous systems" />
      <div data-hero-support>Support and CTA</div>
    </section>,
  );
}

describe("HeroHeadline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.removeAttribute("data-page-ready");
    conditions.desktop = true;
    conditions.mobile = false;
    conditions.reduce = false;
    mockMatchMedia();
  });

  it("waits for page readiness, then runs restrained desktop entrance and hero-scoped parallax", () => {
    renderHero();

    expect(timelineFactory).not.toHaveBeenCalled();
    expect(topLevelFromTo).not.toHaveBeenCalled();
    expect(
      document.querySelector<HTMLElement>("[data-word]")?.style.opacity,
    ).toBe("");

    act(() => signalPageReady());

    expect(timelineFactory).toHaveBeenCalledTimes(1);
    expect(timeline.fromTo).toHaveBeenCalledWith(
      expect.anything(),
      { scale: 1.025 },
      expect.objectContaining({ scale: 1, duration: 0.7 }),
      expect.anything(),
    );

    const wordVars = timeline.from.mock.calls[0][1];
    expect(wordVars).toMatchObject({ autoAlpha: 0, y: 18, stagger: 0.05 });
    expect(wordVars).not.toHaveProperty("filter");

    expect(timeline.from).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ autoAlpha: 0, y: 16 }),
      expect.anything(),
    );

    const hero = screen.getByText("Support and CTA").closest("section");
    expect(topLevelFromTo).toHaveBeenCalledWith(
      expect.anything(),
      { y: -20 },
      expect.objectContaining({
        y: 20,
        scrollTrigger: expect.objectContaining({ trigger: hero }),
      }),
    );
  });

  it("uses a shorter mobile entrance with no scenery scale or parallax", () => {
    conditions.desktop = false;
    conditions.mobile = true;
    renderHero();

    act(() => signalPageReady());

    const wordVars = timeline.from.mock.calls[0][1];
    expect(wordVars).toMatchObject({ y: 10, duration: 0.45, stagger: 0.04 });
    expect(timeline.fromTo).not.toHaveBeenCalled();
    expect(topLevelFromTo).not.toHaveBeenCalled();
  });

  it("lets GSAP context reversion restore styles on a live reduced-motion change", () => {
    renderHero();
    act(() => signalPageReady());

    act(() => matchMediaCleanup.current?.());

    expect(timeline.kill).not.toHaveBeenCalled();
    expect(topLevelFromTo.mock.results[0].value.kill).not.toHaveBeenCalled();
  });
});
