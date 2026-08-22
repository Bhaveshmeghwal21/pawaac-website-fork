// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import Reveal from "./Reveal";

// Regression test for a real reported error (site-owner console report,
// current session):
//
//   "A tree hydrated but some attributes of the server rendered HTML didn't
//    match the client properties ... at Reveal (src/components/ui/Reveal.tsx)"
//
// Cause: the same-session reload fix (skip the entrance animation after the
// first load of a session) originally read `sessionStorage` directly during
// render. The server has no sessionStorage, so it always rendered the
// animated branch, while the client's first render on any reload returned the
// plain revealed branch — a genuine hydration mismatch on every reload of
// every page, since Reveal backs ~29 section components site wide.
//
// Fix: read the flag through `useSyncExternalStore`, whose `getServerSnapshot`
// pins both the server render and the hydration pass to the animated branch;
// React then reads the real client value immediately after hydration and
// re-renders to the revealed branch. This test drives that exact sequence.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [];
}

function mockMatchMedia() {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

const HYDRATION_COMPLAINT = /hydrat|did ?n[o']?t match/i;

describe("Reveal hydration", () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    mockMatchMedia();
    window.sessionStorage.clear();
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.sessionStorage.clear();
  });

  it("hydrates a same-session reload with no mismatch, then settles on the revealed branch", async () => {
    const tree = (
      <Reveal>
        <p>Revealed content</p>
      </Reveal>
    );

    // The server cannot see sessionStorage, so it must emit the animated
    // branch (clip-path inline style present).
    const serverHtml = renderToString(tree);
    expect(serverHtml).toContain("clip-path");

    // Now simulate the client on a reload: the session flag is already set,
    // which is the case that used to mismatch.
    window.sessionStorage.setItem("pawaac-loaded", "1");

    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    document.body.appendChild(container);

    await act(async () => {
      hydrateRoot(container, tree);
    });

    const complaints = consoleError.mock.calls.filter((call: unknown[]) =>
      call.some((arg: unknown) => HYDRATION_COMPLAINT.test(String(arg))),
    );
    expect(complaints).toEqual([]);

    // And it does not stay on the animated branch: after hydration the
    // content is plainly revealed, with no clip-path left driving it.
    expect(container.textContent).toContain("Revealed content");
    const stillClipped = Array.from(
      container.querySelectorAll<HTMLElement>("*"),
    ).some((el) => el.style.clipPath);
    expect(stillClipped).toBe(false);

    container.remove();
  });

  it("hydrates a genuine first visit with no mismatch, keeping the animated branch", async () => {
    const tree = (
      <Reveal>
        <p>Revealed content</p>
      </Reveal>
    );

    const serverHtml = renderToString(tree);

    // No session flag: this is the first load, so the entrance should play.
    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    document.body.appendChild(container);

    await act(async () => {
      hydrateRoot(container, tree);
    });

    const complaints = consoleError.mock.calls.filter((call: unknown[]) =>
      call.some((arg: unknown) => HYDRATION_COMPLAINT.test(String(arg))),
    );
    expect(complaints).toEqual([]);
    expect(container.textContent).toContain("Revealed content");

    container.remove();
  });
});
