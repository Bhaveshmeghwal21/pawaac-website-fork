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
  DEFAULT_DRONE_COUNT,
  DEFAULT_SITE_RADIUS_M,
  DRONE_COUNT_MAX,
} from "./SystemDesigner";

// Site-owner request (current session): "give the user ability to select number
// of drones instead of surveillance through each drone". The second slider was
// the per drone patrol radius, with the station count derived from it. That
// direction is now reversed, so what these tests pin is that the count is what
// the visitor controls and the radius is what falls out — a regression that
// swapped them back would still render a plausible looking panel.

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

function map() {
  return screen.getByTestId("map");
}

function patrolRadius() {
  return Number(map().getAttribute("data-patrol-radius"));
}

// The label wraps two spans, its name and its live value, so its accessible text
// is "Drones7" rather than "Drones". Anchored at the start to avoid matching the
// singular "Patrol radius / drone" readout below it.
function droneSlider() {
  return screen.getByLabelText(/^drones/i);
}

describe("SystemDesigner control panel", () => {
  beforeEach(() => {
    render(<SystemDesigner />);
    selectSite();
  });

  it("renders a slider for the coverage circle and one for the number of drones", () => {
    const siteRadius = screen.getByLabelText(/coverage radius/i) as HTMLInputElement;
    const drones = droneSlider() as HTMLInputElement;

    expect(siteRadius.type).toBe("range");
    expect(drones.type).toBe("range");
    expect(siteRadius.value).toBe(String(DEFAULT_SITE_RADIUS_M));
    expect(drones.value).toBe(String(DEFAULT_DRONE_COUNT));
    expect(drones.max).toBe(String(DRONE_COUNT_MAX));
    expect(drones.step).toBe("1");
  });

  it("no longer offers a patrol radius slider, since that figure is now derived", () => {
    const ranges = screen.getAllByRole("slider");
    expect(ranges).toHaveLength(2);
    expect(
      ranges.some((r) => (r as HTMLInputElement).id === "patrol-radius"),
    ).toBe(false);
  });

  it("places exactly the requested number of stations", () => {
    fireEvent.change(droneSlider(), { target: { value: "13" } });

    expect(map()).toHaveAttribute("data-dock-count", "13");
    expect(droneSlider()).toHaveValue("13");
  });

  it("derives a smaller required patrol radius as drones are added", () => {
    fireEvent.change(droneSlider(), { target: { value: "2" } });
    const few = patrolRadius();

    fireEvent.change(droneSlider(), { target: { value: "20" } });
    const many = patrolRadius();

    expect(few).toBeGreaterThan(many);
    // The derived figure is what the map draws its coverage circles at.
    expect(many).toBeGreaterThan(0);
  });

  it("asks a single drone to cover the whole coverage radius", () => {
    fireEvent.change(droneSlider(), { target: { value: "1" } });

    expect(map()).toHaveAttribute("data-dock-count", "1");
    expect(patrolRadius()).toBe(DEFAULT_SITE_RADIUS_M);
  });

  it("passes the coverage radius through to the map and re-derives the patrol radius", () => {
    const before = patrolRadius();

    fireEvent.change(screen.getByLabelText(/coverage radius/i), {
      target: { value: "900" },
    });

    expect(map()).toHaveAttribute("data-site-radius", "900");
    // A bigger zone patrolled by the same number of drones asks more of each.
    expect(patrolRadius()).toBeGreaterThan(before);
    // Growing the zone must not change how many drones the visitor asked for.
    expect(map()).toHaveAttribute("data-dock-count", String(DEFAULT_DRONE_COUNT));
  });

  it("shows the required radius as the panel's headline readout", () => {
    expect(screen.getByText(/patrol radius \/ drone/i)).toBeInTheDocument();
    expect(screen.getByText("m required")).toBeInTheDocument();
    expect(screen.getByText(String(patrolRadius()))).toBeInTheDocument();
  });

  it("shows the coverage circle's area rather than a bounding box area", () => {
    // pi * 300^2 = 282743 m2 = 28.3 ha
    expect(screen.getByText("28.3")).toBeInTheDocument();
    expect(screen.getByText("ha")).toBeInTheDocument();
  });
});
