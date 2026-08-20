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
  it("renders only the six consolidated sections in order, followed by the compact footer", () => {
    const children = elementChildren(Home() as ElementWithChildren);

    expect(children.map((child) => child.type)).toEqual([
      HomeHero,
      HomeOperatingLoop,
      HomeSpecSheet,
      HomeDeploymentsPreview,
      HomePlannerCTA,
      HomeContactBand,
      Footer,
    ]);
    expect(children.at(-1)?.props).toMatchObject({ compact: true });
  });

  it("keeps exactly one SkyScenery inside HomeHero instead of at page level", () => {
    const pageChildren = elementChildren(Home() as ElementWithChildren);
    const heroChildren = elementChildren(HomeHero() as ElementWithChildren);

    expect(pageChildren.filter((child) => child.type === SkyScenery)).toHaveLength(0);
    expect(heroChildren.filter((child) => child.type === SkyScenery)).toHaveLength(1);
  });
});
