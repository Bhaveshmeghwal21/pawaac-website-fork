// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import { createElement, Fragment, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isPageReady } from "@/lib/motion/pageReady";
import Preloader from "./Preloader";

let finishExit: (() => void) | undefined;
const { animatePresenceRender } = vi.hoisted(() => ({
  animatePresenceRender: vi.fn(),
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({
    children,
    onExitComplete,
  }: {
    children: ReactNode;
    onExitComplete?: () => void;
  }) => {
    animatePresenceRender();
    finishExit = onExitComplete;
    return createElement(Fragment, null, children);
  },
  motion: new Proxy(
    {},
    {
      get: (_target, tag: string) =>
        ({ children, ...props }: { children?: ReactNode; [key: string]: unknown }) => {
          const domProps = { ...props };
          for (const key of ["initial", "animate", "exit", "transition"]) {
            delete domProps[key];
          }
          return createElement(tag, domProps, children);
        },
    },
  ),
}));

describe("Preloader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    sessionStorage.clear();
    document.documentElement.removeAttribute("data-page-ready");
    finishExit = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("signals readiness only after the visible preloader finishes exiting", () => {
    render(<Preloader />);

    expect(isPageReady()).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2300);
    });

    expect(sessionStorage.getItem("pawaac-loaded")).toBe("1");
    expect(isPageReady()).toBe(false);

    act(() => {
      finishExit?.();
    });

    expect(isPageReady()).toBe(true);
  });

  it("does not signal readiness from the initially empty presence boundary", () => {
    render(<Preloader />);

    act(() => {
      finishExit?.();
    });

    expect(isPageReady()).toBe(false);
  });

  it("signals readiness immediately when this session already skipped the preloader", () => {
    sessionStorage.setItem("pawaac-loaded", "1");

    render(<Preloader />);

    expect(isPageReady()).toBe(true);
  });

  it("skips the overlay and timer under reduced motion", () => {
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;

    const { container } = render(<Preloader />);

    expect(container).toBeEmptyDOMElement();
    expect(animatePresenceRender).toHaveBeenCalledTimes(0);
    expect(setTimeoutSpy).not.toHaveBeenCalledWith(expect.any(Function), 2300);
    expect(isPageReady()).toBe(true);
  });

  it("removes an active overlay when reduced motion is enabled", () => {
    let reduced = false;
    let changeListener: ((event: MediaQueryListEvent) => void) | undefined;
    const mediaQueryList = {
      get matches() {
        return reduced;
      },
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: vi.fn(
        (_type: string, listener: (event: MediaQueryListEvent) => void) => {
          changeListener = listener;
        },
      ),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    window.matchMedia = vi.fn(() => mediaQueryList) as unknown as typeof window.matchMedia;

    const { container } = render(<Preloader />);
    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(container.firstElementChild).not.toBeNull();

    reduced = true;
    act(() => {
      changeListener?.({ matches: true } as MediaQueryListEvent);
    });
    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(container).toBeEmptyDOMElement();
    expect(isPageReady()).toBe(true);
    expect(sessionStorage.getItem("pawaac-loaded")).toBe("1");
  });

  it("does not start a late preloader when reduced motion is disabled", () => {
    let reduced = true;
    let changeListener: ((event: MediaQueryListEvent) => void) | undefined;
    const mediaQueryList = {
      get matches() {
        return reduced;
      },
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: vi.fn(
        (_type: string, listener: (event: MediaQueryListEvent) => void) => {
          changeListener = listener;
        },
      ),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
    window.matchMedia = vi.fn(() => mediaQueryList) as unknown as typeof window.matchMedia;
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

    const { container } = render(<Preloader />);

    expect(isPageReady()).toBe(true);
    expect(sessionStorage.getItem("pawaac-loaded")).toBe("1");
    expect(animatePresenceRender).toHaveBeenCalledTimes(0);

    reduced = false;
    act(() => {
      changeListener?.({ matches: false } as MediaQueryListEvent);
      vi.advanceTimersByTime(0);
    });

    expect(container).toBeEmptyDOMElement();
    expect(setTimeoutSpy).not.toHaveBeenCalledWith(expect.any(Function), 2300);
  });
});
