// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  hasCompletedIntroThisSession,
  isPageReady,
  signalPageReady,
  subscribeToPageReady,
} from "./pageReady";

describe("page readiness", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-page-ready");
  });
  it("notifies subscribers once when the page becomes ready", () => {
    const subscriber = vi.fn();
    const unsubscribe = subscribeToPageReady(subscriber);

    expect(isPageReady()).toBe(false);

    signalPageReady();
    signalPageReady();

    expect(isPageReady()).toBe(true);
    expect(subscriber).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("runs late subscribers immediately and supports cleanup", () => {
    signalPageReady();
    const lateSubscriber = vi.fn();
    const unsubscribeLate = subscribeToPageReady(lateSubscriber);
    expect(lateSubscriber).toHaveBeenCalledTimes(1);
    unsubscribeLate();

    document.documentElement.removeAttribute("data-page-ready");
    const removedSubscriber = vi.fn();
    const unsubscribe = subscribeToPageReady(removedSubscriber);
    unsubscribe();
    signalPageReady();

    expect(removedSubscriber).not.toHaveBeenCalled();
  });
});


// `hasCompletedIntroThisSession` was imported here when it was added but
// never actually exercised — its only coverage was indirect, through the
// three components that consume it (Reveal, HeroHeadline,
// HomeMotionSection). It is the single source of truth for whether ~29
// section components skip their entrance animation, and it deliberately
// swallows sessionStorage exceptions, so the fail-open path in particular
// is worth pinning directly: if it ever threw instead, every page using
// Reveal would crash in private-browsing contexts.
describe("hasCompletedIntroThisSession", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("is false before the first load of a session completes", () => {
    expect(hasCompletedIntroThisSession()).toBe(false);
  });

  it("is true once Preloader's session flag is set", () => {
    // Reuses Preloader.tsx's existing key rather than a second flag, so
    // "seen the splash" and "skip the entrance animation" cannot disagree.
    window.sessionStorage.setItem("pawaac-loaded", "1");

    expect(hasCompletedIntroThisSession()).toBe(true);
  });

  it("treats any other stored value as not yet completed", () => {
    window.sessionStorage.setItem("pawaac-loaded", "true");

    expect(hasCompletedIntroThisSession()).toBe(false);
  });

  it("fails open to playing the animation when sessionStorage throws", () => {
    const getItem = vi
      .spyOn(window.sessionStorage, "getItem")
      .mockImplementation(() => {
        throw new Error("sessionStorage is unavailable");
      });

    expect(() => hasCompletedIntroThisSession()).not.toThrow();
    expect(hasCompletedIntroThisSession()).toBe(false);

    getItem.mockRestore();
  });
});
