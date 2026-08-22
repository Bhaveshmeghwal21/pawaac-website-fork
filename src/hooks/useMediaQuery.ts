"use client";

import { useCallback, useSyncExternalStore } from "react";

// Media-query subscription.
//
// Previously this held `useState(false)` and corrected itself inside an
// effect. Two problems came out of that:
//
//   1. `react-hooks/set-state-in-effect` flagged it as an error, because
//      calling setState synchronously in an effect body triggers a second
//      render pass on every mount.
//   2. More seriously, the value was *wrong* on the first client render, and
//      callers branch on it to decide whether to mount expensive subtrees.
//      `ProductSensorPayload` renders a 3D drone viewer when `isMobile` is
//      false, so a phone got `false` first, mounted the viewer, fired its
//      `dynamic()` import, and only then unmounted it — pulling three.js,
//      drei, postprocessing and a 1.5 MB .glb onto a mobile connection to
//      display nothing.
//
// `useSyncExternalStore` is the intended React primitive for reading from an
// external source like `matchMedia`: `getSnapshot` runs synchronously during
// render, so the very first client render sees the real viewport instead of a
// placeholder.
//
// `serverFallback` is the value used for the server render and the hydration
// pass that must match it. It defaults to `false`, but a caller that gates a
// heavy subtree should pass the value that renders the *cheap* branch, so the
// expensive one is only ever reached after the query is positively confirmed.
const listeners = new Map<string, MediaQueryList>();

function getList(query: string): MediaQueryList {
  let mql = listeners.get(query);
  if (!mql) {
    mql = window.matchMedia(query);
    listeners.set(query, mql);
  }
  return mql;
}

export default function useMediaQuery(
  query: string,
  serverFallback = false,
): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = getList(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => getList(query).matches, [query]);

  const getServerSnapshot = useCallback(() => serverFallback, [serverFallback]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
