// @vitest-environment jsdom
import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
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
  it("renders the seven consolidated sections in order, followed by the compact footer", () => {
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
    expect(children.at(-1)?.props).toMatchObject({ compact: true });
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

  it("keeps exactly one SkyScenery inside HomeHero instead of at page level", () => {
    const pageChildren = elementChildren(Home() as ElementWithChildren);
    const heroChildren = elementChildren(HomeHero() as ElementWithChildren);

    expect(pageChildren.filter((child) => child.type === SkyScenery)).toHaveLength(0);
    expect(heroChildren.filter((child) => child.type === SkyScenery)).toHaveLength(1);
  });
});
