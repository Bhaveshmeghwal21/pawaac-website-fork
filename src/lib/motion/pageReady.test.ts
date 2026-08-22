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
