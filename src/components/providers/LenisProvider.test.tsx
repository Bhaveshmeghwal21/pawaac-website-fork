// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LenisProvider from "./LenisProvider";

const {
  lenisDestroy,
  LenisMock,
  tickerAdd,
  tickerRemove,
  lagSmoothing,
} = vi.hoisted(() => {
  const on = vi.fn();
  const raf = vi.fn();
  const destroy = vi.fn();
  return {
    lenisOn: on,
    lenisRaf: raf,
    lenisDestroy: destroy,
    LenisMock: vi.fn(function MockLenis() {
      return { on, raf, destroy };
    }),
    tickerAdd: vi.fn(),
    tickerRemove: vi.fn(),
    lagSmoothing: vi.fn(),
  };
});

vi.mock("lenis", () => ({ default: LenisMock }));
vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    ticker: {
      add: tickerAdd,
      remove: tickerRemove,
      lagSmoothing,
    },
  },
}));
vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: { update: vi.fn() },
}));

function mockReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe("LenisProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses native scrolling when reduced motion is requested", () => {
    mockReducedMotion(true);

    render(
      <LenisProvider>
        <p>Page content</p>
      </LenisProvider>,
    );

    expect(screen.getByText("Page content")).toBeInTheDocument();
    expect(LenisMock).not.toHaveBeenCalled();
    expect(tickerAdd).not.toHaveBeenCalled();
  });

  it("creates and cleans up Lenis when motion is allowed", () => {
    mockReducedMotion(false);

    const { unmount } = render(
      <LenisProvider>
        <p>Page content</p>
      </LenisProvider>,
    );

    expect(LenisMock).toHaveBeenCalledWith({ duration: 1.1, smoothWheel: true });
    expect(tickerAdd).toHaveBeenCalledTimes(1);

    unmount();

    expect(tickerRemove).toHaveBeenCalledTimes(1);
    expect(lenisDestroy).toHaveBeenCalledTimes(1);
    expect(lagSmoothing).toHaveBeenLastCalledWith(500, 33);
  });
});
