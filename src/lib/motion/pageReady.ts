const PAGE_READY_ATTRIBUTE = "data-page-ready";
const PAGE_READY_EVENT = "pawaac:page-ready";

// Site-owner request (current session): "when I reload the page the
// content appears very slow" — the fix, per the site owner's explicit
// choice between two options, is to skip entrance animations entirely
// after the first load of a browser session, on every page, not just the
// Homepage. Preloader.tsx already tracks "has this session seen the
// splash" via `sessionStorage["pawaac-loaded"]` to skip its own splash on
// reload; this reuses that exact same flag (not a new one) so "seen the
// splash" and "skip entrance animation" stay a single source of truth
// rather than two flags that could disagree.
const SESSION_LOADED_KEY = "pawaac-loaded";

/**
 * True once this browser session has already completed a full page load
 * (Preloader has run or been skipped at least once via reduced motion).
 * Consumers use this to skip their own entrance animation and render
 * already-revealed on every reload after the first, matching the exact
 * reasoning Preloader already applies to its own splash screen.
 *
 * Safe to call during render (not just in an effect): reads a plain
 * synchronous sessionStorage value, no side effect, and returns `false`
 * during SSR/the first client render before hydration can check it, which
 * correctly falls back to "play the animation" rather than guessing.
 */
export function hasCompletedIntroThisSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SESSION_LOADED_KEY) === "1";
  } catch {
    // sessionStorage can throw in locked-down/private-browsing contexts;
    // fail open to "play the animation" rather than crash the page.
    return false;
  }
}

export function isPageReady(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.getAttribute(PAGE_READY_ATTRIBUTE) === "true"
  );
}

export function signalPageReady(): void {
  if (typeof document === "undefined" || isPageReady()) return;

  document.documentElement.setAttribute(PAGE_READY_ATTRIBUTE, "true");
  window.dispatchEvent(new Event(PAGE_READY_EVENT));
}

export function subscribeToPageReady(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;

  if (isPageReady()) {
    listener();
    return () => undefined;
  }

  window.addEventListener(PAGE_READY_EVENT, listener, { once: true });
  return () => window.removeEventListener(PAGE_READY_EVENT, listener);
}
