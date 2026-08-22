import { ImageResponse } from "next/og";

// Open Graph / social card.
//
// Before this, the openGraph block in the root layout carried no image at all,
// so every share of any URL on this site — WhatsApp, LinkedIn, Slack, X —
// rendered a blank preview. For a launch announcement that is the single most
// visible gap on the site, and it is invisible from inside the app.
//
// Generated with ImageResponse rather than shipped as a static file so it stays
// in the achromatic palette defined in globals.css (bg #080808, fg #ededed,
// muted #8a8a8a, line #1f1f1f) without a separate design asset to keep in sync.
// No custom font is loaded: next/og needs font data passed explicitly for
// anything but its default sans-serif, and a missing font file would fail the
// build. The default face is neutral enough for a wordmark card.
export const alt =
  "PAWAAC — autonomous aerial surveillance. HawkAI Plus and Sentrivion.";

export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#080808",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 18,
              height: 18,
              border: "3px solid #ededed",
              borderRadius: 999,
            }}
          />
          <div
            style={{
              color: "#8a8a8a",
              fontSize: 24,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            Bajrang Dronetech
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#ededed",
              fontSize: 132,
              fontWeight: 700,
              letterSpacing: -4,
              lineHeight: 1,
            }}
          >
            PAWAAC
          </div>
          <div
            style={{
              marginTop: 24,
              color: "#ededed",
              fontSize: 40,
              lineHeight: 1.25,
              maxWidth: 900,
            }}
          >
            Autonomous aerial surveillance for defense and police
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            borderTop: "1px solid #1f1f1f",
            paddingTop: 28,
            color: "#8a8a8a",
            fontSize: 26,
          }}
        >
          <span>HawkAI Plus</span>
          <span style={{ color: "#1f1f1f" }}>/</span>
          <span>Sentrivion</span>
          <span style={{ color: "#1f1f1f" }}>/</span>
          <span>Autonomy stack</span>
        </div>
      </div>
    ),
    size,
  );
}
