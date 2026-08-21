const PAGE_READY_ATTRIBUTE = "data-page-ready";
const PAGE_READY_EVENT = "pawaac:page-ready";

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
