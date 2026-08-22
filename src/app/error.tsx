"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";
import Link from "next/link";

// Runtime error boundary for every route below the root layout.
//
// Same reasoning as not-found.tsx: the built-in fallback is an unstyled white
// page. This keeps the visitor on a page that looks like the site and offers a
// recovery path.
//
// `unstable_retry` rather than `reset`: Next 16 documents `unstable_retry()` as
// the way to recover, because it re-fetches and re-renders the boundary's
// children, whereas `reset()` only clears the error state and re-renders with
// the same data — which for a failed fetch just reproduces the error. See
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md
// (`unstable_retry` at :117, the `reset` caveat at :155). The name is unstable
// upstream; if a Next upgrade renames it, this file is where to look.
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // No error-reporting service is configured. Logging to the console at least
    // puts the digest somewhere reachable — in production the message itself is
    // redacted by React and the digest is the only way to correlate this with
    // the server-side log entry.
    console.error(error);
  }, [error]);

  return (
    <section className="relative bg-bg px-6 py-28 md:py-36">
      <div className="mx-auto max-w-3xl">
        <p className="label">Error</p>
        <h1 className="mt-3 text-heading font-display text-fg">
          Something went wrong
        </h1>
        <p className="mt-4 max-w-md text-body font-body text-muted">
          This section failed to load. Trying again may be enough; if it is not,
          the rest of the site is unaffected.
        </p>

        {error.digest && (
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            Reference {error.digest}
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-interactive"
          >
            Try again
          </button>
          <Link
            href="/"
            className="font-mono text-[12px] uppercase tracking-[0.12em] text-fg underline decoration-line decoration-1 underline-offset-4 transition hover:decoration-fg"
          >
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
