// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// The real MapCanvas is a react-leaflet tree behind `next/dynamic({ ssr: false })`.
// It needs a sized DOM container and raster tiles to do anything meaningful, so it
// is mocked out here: this file is about the control panel that drives it. The
// props it receives are surfaced as data attributes so the wiring is still
// asserted rather than assumed.
vi.mock("@/components/designer/MapCanvas", () => ({
  default: ({
    site,
    docks,
    patrolRadiusM,
  }: {
    site: { lat: number; lng: number; radiusM: number };
    docks: unknown[];
    patrolRadiusM: number;
  }) => (
    <div
      data-testid="map"
      data-site-radius={site.radiusM}
      data-patrol-radius={patrolRadiusM}
      data-dock-count={docks.length}
    />
  ),
}));

import SystemDesigner, {
  DEFAULT_PATROL_RADIUS_M,
  DEFAULT_SITE_RADIUS_M,
} from "./SystemDesigner";

// Site-owner request (current session): the outer perimeter became a circle and
// its radius moved onto its own slider, beside the existing per-dock patrol
// radius slider. Two sliders that both feed the same derived station layout is
// exactly the kind of wiring that breaks silently — the map would still draw a
// plausible set of circles while one control did nothing — so both are pinned to
// the values they hand to MapCanvas.

function selectSite() {
  Object.defineProperty(globalThis.navigator, "geolocation", {
    configurable: true,
    value: {
      getCurrentPosition: (ok: PositionCallback) =>
        ok({
          coords: { latitude: 12.9716, longitude: 77.5946 },
        } as GeolocationPosition),
    },
  });
  fireEvent.click(screen.getByRole("button", { name: "Use my current location" }));
}

describe("SystemDesigner control panel", () => {
  beforeEach(() => {
    render(<SystemDesigner />);
    selectSite();
  });

  it("renders a slider for the coverage circle and one for the patrol radius", () => {
    const siteRadius = screen.getByLabelText(/coverage radius/i) as HTMLInputElement;
    const patrolRadius = screen.getByLabelText(/patrol radius/i) as HTMLInputElement;

    expect(siteRadius.type).toBe("range");
    expect(patrolRadius.type).toBe("range");
    expect(siteRadius.value).toBe(String(DEFAULT_SITE_RADIUS_M));
    expect(patrolRadius.value).toBe(String(DEFAULT_PATROL_RADIUS_M));
  });

  it("passes the coverage radius through to the map when its slider moves", () => {
    fireEvent.change(screen.getByLabelText(/coverage radius/i), {
      target: { value: "900" },
    });
    expect(screen.getByTestId("map")).toHaveAttribute("data-site-radius", "900");
  });

  it("re-plans the stations when either slider moves", () => {
    const before = Number(
      screen.getByTestId("map").getAttribute("data-dock-count"),
    );

    // A larger zone at the same patrol radius needs more stations.
    fireEvent.change(screen.getByLabelText(/coverage radius/i), {
      target: { value: "1200" },
    });
    const wider = Number(
      screen.getByTestId("map").getAttribute("data-dock-count"),
    );
    expect(wider).toBeGreaterThan(before);

    // A longer patrol radius over that same zone needs fewer.
    fireEvent.change(screen.getByLabelText(/patrol radius/i), {
      target: { value: "400" },
    });
    expect(
      Number(screen.getByTestId("map").getAttribute("data-dock-count")),
    ).toBeLessThan(wider);
  });

  it("shows the coverage circle's area rather than a bounding box area", () => {
    // pi * 300^2 = 282743 m2 = 28.3 ha
    expect(screen.getByText("28.3")).toBeInTheDocument();
    expect(screen.getByText("ha")).toBeInTheDocument();
  });
});
