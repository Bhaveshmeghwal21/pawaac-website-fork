// @vitest-environment jsdom
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "@/components/layout/Footer";
import HomeContactBand from "@/components/sections/HomeContactBand";
import HomeDeploymentsPreview from "@/components/sections/HomeDeploymentsPreview";
import HomeHero from "@/components/sections/HomeHero";
import HomeOperatingLoop from "@/components/sections/HomeOperatingLoop";
import HomePlannerCTA from "@/components/sections/HomePlannerCTA";
import HomeProblemFraming from "@/components/sections/HomeProblemFraming";
import HomeSpecSheet from "@/components/sections/HomeSpecSheet";
import SkyScenery from "@/components/ui/SkyScenery";
import Home from "./page";

type ElementWithChildren = ReactElement<{ children?: ReactNode }>;

function elementChildren(element: ElementWithChildren) {
  return Children.toArray(element.props.children).filter(isValidElement) as ReactElement<
    Record<string, unknown>
  >[];
}

describe("Home page composition", () => {
  // HomeProblemFraming sits at index 1, immediately after the hero: the page
  // previously opened solution first (hero -> operating loop -> platforms) and
  // never stated the operational gap being closed, so the problem framing has
  // to land before the mechanics that resolve it.
  it("renders the seven consolidated sections in order, followed by the same full footer every other route uses", () => {
    const children = elementChildren(Home() as ElementWithChildren);

    expect(children.map((child) => child.type)).toEqual([
      HomeHero,
      HomeProblemFraming,
      HomeOperatingLoop,
      HomeSpecSheet,
      HomeDeploymentsPreview,
      HomePlannerCTA,
      HomeContactBand,
      Footer,
    ]);
    // Site-owner request (current session): the homepage used to pass
    // `compact`, which dropped the oversized wordmark bar and the scroll
    // linked reveal and made the homepage bottom the only inconsistent one
    // on the site. It now renders the Footer exactly as the other 12 routes
    // do, so `compact` must not be passed.
    expect(children.at(-1)?.props).not.toMatchObject({ compact: true });
  });

  it("states the problem before the operating loop that resolves it", () => {
    const order = elementChildren(Home() as ElementWithChildren).map(
      (child) => child.type,
    );

    expect(order.indexOf(HomeProblemFraming)).toBeLessThan(
      order.indexOf(HomeOperatingLoop),
    );
    expect(order.indexOf(HomeProblemFraming)).toBeGreaterThan(order.indexOf(HomeHero));
  });

  // The hero's backdrop is now a two slide carousel (site-owner request), so
  // SkyScenery sits inside it rather than being a direct child of the hero
  // section. The invariant this test exists to protect is unchanged: exactly one
  // sky backdrop, scoped inside the hero, never hoisted to page level where its
  // absolute layer would escape into the rest of the page.
  //
  // The hero half is asserted against the rendered DOM rather than the element
  // tree because HomeHero now owns the carousel's state, so calling it as a
  // plain function would be an invalid hook call.
  it("keeps exactly one sky backdrop inside HomeHero instead of at page level", () => {
    const pageChildren = elementChildren(Home() as ElementWithChildren);
    expect(pageChildren.filter((child) => child.type === SkyScenery)).toHaveLength(0);

    const { container } = render(<HomeHero />);
    expect(
      container.querySelectorAll('[data-hero-scenery-image] img[src*="droneInSky"]'),
    ).toHaveLength(1);
  });

  it("renders both carousel slides, the photograph first", () => {
    const { container } = render(<HomeHero />);
    const track = container.querySelector("[data-hero-carousel-track]");

    expect(track).not.toBeNull();
    // Slide order is what makes the photograph the first thing painted and the
    // footage the slide it advances to.
    expect(track?.children).toHaveLength(2);
    expect(track?.children[0].querySelector("[data-hero-scenery-image]")).not.toBeNull();
    expect(track?.children[1].querySelector("video")).not.toBeNull();
  });
});
