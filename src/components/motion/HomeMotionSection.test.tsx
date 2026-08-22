// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import HomeMotionSection from "./HomeMotionSection";

const {
  conditions,
  timeline,
  timelineFactory,
  contextRevert,
  mediaRevert,
} = vi.hoisted(() => {
  const activeConditions = {
    desktop: true,
    mobile: false,
    reduce: false,
  };
  const activeTimeline = {
    from: vi.fn(),
    fromTo: vi.fn(),
  };
  activeTimeline.from.mockImplementation(() => activeTimeline);
  activeTimeline.fromTo.mockImplementation(() => activeTimeline);
  return {
    conditions: activeConditions,
    timeline: activeTimeline,
    timelineFactory: vi.fn(
      (...[_config]: [{
        scrollTrigger: {
          trigger: HTMLElement;
          start: string;
          once: boolean;
        };
      }]) => {
        void _config;
        return activeTimeline;
      },
    ),
    contextRevert: vi.fn(),
    mediaRevert: vi.fn(),
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
        ) => setup({ conditions }),
      ),
      revert: mediaRevert,
    })),
    timeline: timelineFactory,
  },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {},
}));

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

describe("HomeMotionSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
    conditions.desktop = true;
    conditions.mobile = false;
    conditions.reduce = false;
    mockMatchMedia();
  });

  it("creates one section-scoped timeline and one non-pinning ScrollTrigger", () => {
    const { unmount } = render(
      <HomeMotionSection variant="operating" className="test-section">
        <div data-motion-group>Intro</div>
        <div data-motion-group>
          <span data-motion-item>Step one</span>
          <span data-motion-item>Step two</span>
        </div>
        <div data-motion-group>Oversight and media</div>
      </HomeMotionSection>,
    );

    const section = screen.getByText("Intro").closest("section");
    expect(section).toHaveAttribute("data-home-motion", "operating");
    expect(timelineFactory).toHaveBeenCalledTimes(1);

    const config = timelineFactory.mock.calls[0][0];
    expect(config.scrollTrigger).toMatchObject({
      trigger: section,
      start: "top 82%",
      once: true,
    });
    expect(config.scrollTrigger).not.toHaveProperty("pin");
    expect(config.scrollTrigger).not.toHaveProperty("scrub");
    expect(timeline.from).toHaveBeenCalledTimes(3);
    expect(timeline.from.mock.calls.map((call) => call[2])).toEqual([
      0,
      "-=0.16",
      "-=0.16",
    ]);

    unmount();
    expect(mediaRevert).toHaveBeenCalledTimes(1);
    expect(contextRevert).toHaveBeenCalledTimes(1);
  });

  it("leaves SSR-visible content untouched under reduced motion", () => {
    conditions.desktop = false;
    conditions.reduce = true;

    render(
      <HomeMotionSection variant="planner">
        <p data-motion-group>Always visible</p>
      </HomeMotionSection>,
    );

    const content = screen.getByText("Always visible");
    expect(timelineFactory).not.toHaveBeenCalled();
    expect(content).not.toHaveStyle({ opacity: "0" });
    expect(content.style.transform).toBe("");
  });

  it("only adds desktop image-settle motion to the platforms variant", () => {
    const { unmount } = render(
      <HomeMotionSection variant="planner">
        <div data-motion-group>
          <div data-motion-image>Planner screenshot</div>
        </div>
      </HomeMotionSection>,
    );

    expect(timeline.from.mock.calls.some(([, vars]) => vars.scale === 1.015)).toBe(
      false,
    );

    unmount();
    vi.clearAllMocks();

    render(
      <HomeMotionSection variant="platforms">
        <div data-motion-group>
          <div data-motion-image>Platform image</div>
        </div>
      </HomeMotionSection>,
    );

    expect(timeline.from.mock.calls.some(([, vars]) => vars.scale === 1.015)).toBe(
      true,
    );
  });

  // Site-owner report (current session): "when I reload the page the
  // content appears very slow" — fixed by skipping this scroll-triggered
  // entrance timeline entirely once this browser session has already
  // completed a load (the same sessionStorage flag Preloader.tsx sets on
  // first load).
  it("skips the entrance timeline entirely on a same-session reload", () => {
    window.sessionStorage.setItem("pawaac-loaded", "1");

    render(
      <HomeMotionSection variant="operating">
        <div data-motion-group>Intro</div>
      </HomeMotionSection>,
    );

    expect(timelineFactory).not.toHaveBeenCalled();
  });
});
