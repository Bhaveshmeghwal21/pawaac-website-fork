"use client"; // Error boundaries must be Client Components.

// Last-resort boundary for failures in the root layout itself.
//
// error.tsx sits inside the root layout, so it cannot catch an error thrown by
// that layout — if RootLayout fails, there is no boundary and the visitor gets a
// blank document. This file replaces the root layout when active, which is why
// it declares its own <html> and <body>.
//
// Styling is inline rather than via globals.css and next/font, deliberately: the
// font CSS variables are applied by RootLayout's className, and that is exactly
// the component presumed broken here. Hardcoding the four palette values keeps
// this page correct with no dependency on anything that might have failed. The
// values match the tokens in globals.css (--color-bg, --color-fg,
// --color-muted, --color-line).
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "#080808",
          color: "#ededed",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "36rem" }}>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#8a8a8a",
            }}
          >
            Error
          </p>
          <h1
            style={{
              margin: "0.75rem 0 0",
              fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            The site failed to load
          </h1>
          <p
            style={{
              margin: "1rem 0 0",
              lineHeight: 1.6,
              color: "#8a8a8a",
            }}
          >
            Something went wrong before the page could render. Reloading may
            resolve it. If it does not, you can reach us at{" "}
            <a href="mailto:kshitij@pawaac.com" style={{ color: "#ededed" }}>
              kshitij@pawaac.com
            </a>
            .
          </p>

          {error.digest && (
            <p
              style={{
                margin: "1rem 0 0",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#8a8a8a",
              }}
            >
              Reference {error.digest}
            </p>
          )}

          <div
            style={{
              marginTop: "2.5rem",
              borderTop: "1px solid #1f1f1f",
              paddingTop: "1.5rem",
            }}
          >
            {/*
              A plain reload, not unstable_retry() and not next/link: if the
              root layout is what threw, re-rendering the same tree in place is
              unlikely to help, and the client router this boundary would need
              is part of what may be broken. A full document request re-runs
              everything from the server, which is the point.
            */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages --
                deliberate full document load; see the comment above. */}
            <a
              href="/"
              style={{
                display: "inline-block",
                backgroundColor: "#ffffff",
                color: "#000000",
                padding: "0.75rem 1.25rem",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Reload the site
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
