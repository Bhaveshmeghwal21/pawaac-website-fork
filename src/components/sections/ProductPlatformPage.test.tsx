// @vitest-environment jsdom
import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import ProductPage from "@/app/product/page";
import Footer from "@/components/layout/Footer";
import HomeOperatingLoop from "@/components/sections/HomeOperatingLoop";
import ProductOperatingLoop from "@/components/sections/ProductOperatingLoop";
import ProductHero from "@/components/sections/ProductHero";
import ProductHardware from "@/components/sections/ProductHardware";
import ProductDetectionDemo from "@/components/sections/ProductDetectionDemo";
import ProductDockCharging from "@/components/sections/ProductDockCharging";
import ProductSensorPayload from "@/components/sections/ProductSensorPayload";
import ProductSpecifications from "@/components/sections/ProductSpecifications";

// Site-owner request (current session): the Platform page (/product) was
// rebuilt to explain the proposed solution end to end — the seven step
// mission cycle, the human oversight branch, GPS denied navigation, and the
// hardware that runs it (HawkAI Plus, Sentrivion, the dock).
//
// What is worth pinning here is the stuff that would break silently:
//
//   1. The seven steps and their one-line bodies now exist in TWO places —
//      HomeOperatingLoop.tsx (homepage teaser) and ProductOperatingLoop.tsx
//      (this page's expanded version). They are duplicated strings, not a
//      shared module, so they can drift without anything failing. The first
//      suite below compares the two rendered outputs directly.
//   2. The dock image ships with a visible provenance caption saying it is a
//      design visualization rather than a photograph of a deployed unit.
//      That caption is a content-governance requirement (see the header
//      comment in ProductDockCharging.tsx); losing it in a future edit would
//      turn the section into an implied deployment claim with no test
//      objecting.
//   3. No figures. This page describes capability, and every numeral on this
//      site must trace to an already-published figure (README -> Content
//      governance). A future edit adding "45 min endurance" to make a
//      section feel more concrete is exactly the silent regression the
//      repo's validators exist to catch.
//
// Note on scanning: the repo's scanForBannedTerms() is NOT used here even
// though it covers unit/range figures, because it also bans the literal
// token "GPS" — correct for placeholder copy, wrong for this page, where
// "GPS denied navigation" is approved, already-shipped site-owner copy. The
// figure check below is therefore a targeted subset.

/** Extracts [stepName, stepBody] pairs from a rendered operating loop. */
function readSteps(container: HTMLElement): [string, string][] {
  return Array.from(container.querySelectorAll("[data-operating-step]")).map(
    (article) => [
      article.querySelector("h3")?.textContent?.trim() ?? "",
      article.querySelector("p")?.textContent?.trim() ?? "",
    ],
  );
}

const EXPECTED_STEP_ORDER = [
  "Dock",
  "Dispatch",
  "Patrol",
  "Detect",
  "Escalate",
  "Return",
  "Swap",
];

describe("Platform page operating loop", () => {
  it("renders the seven mission steps in the site owner's order", () => {
    const { container } = render(<ProductOperatingLoop />);

    expect(readSteps(container).map(([name]) => name)).toEqual(
      EXPECTED_STEP_ORDER,
    );
  });

  it("carries the same step names and one-line bodies as the homepage teaser", () => {
    // Guards the duplication described in this file's header: these strings
    // live in two components, and the two surfaces must not disagree about
    // what the platform does.
    const home = render(<HomeOperatingLoop />);
    const platform = render(<ProductOperatingLoop />);

    expect(readSteps(platform.container)).toEqual(readSteps(home.container));
  });

  it("attaches the human oversight branch to Escalate, not to another step", () => {
    const { container } = render(<ProductOperatingLoop />);

    const escalate = Array.from(
      container.querySelectorAll("[data-operating-step]"),
    ).find((article) =>
      article.querySelector("h3")?.textContent?.includes("Escalate"),
    );

    expect(escalate?.textContent).toContain("Human oversight");

    // And exactly one step mentions it.
    const mentions = Array.from(
      container.querySelectorAll("[data-operating-step]"),
    ).filter((article) => article.textContent?.includes("Human oversight"));
    expect(mentions).toHaveLength(1);
  });

  it("presents GPS denied navigation as resilience spanning the loop, not as an eighth step", () => {
    const { container } = render(<ProductOperatingLoop />);

    expect(container.textContent).toContain("GPS denied navigation");
    expect(container.textContent).toContain("Navigation resilience");

    // It must not have been folded into the step list, which would make it
    // read as a discrete mission phase.
    const stepNames = readSteps(container).map(([name]) => name);
    expect(stepNames).not.toContain("GPS denied navigation");
    expect(stepNames).toHaveLength(7);
  });
});

describe("Platform page hardware sections", () => {
  it("shows both airframes with non-empty, descriptive alt text", () => {
    const { container } = render(<ProductHardware />);

    const images = Array.from(container.querySelectorAll("img"));
    expect(images).toHaveLength(2);

    for (const img of images) {
      expect(img.getAttribute("alt")?.trim().length ?? 0).toBeGreaterThan(0);
    }

    const alts = images.map((img) => img.getAttribute("alt") ?? "").join(" | ");
    expect(alts).toMatch(/HawkAI/i);
    expect(alts).toMatch(/Sentrivion/i);
  });

  it("does not link to the hidden per airframe pages, which would be dead ends", () => {
    const { container } = render(<ProductHardware />);

    const hrefs = Array.from(container.querySelectorAll("a")).map((a) =>
      a.getAttribute("href"),
    );

    expect(hrefs).not.toContain("/product/hawkai");
    expect(hrefs).not.toContain("/product/sentrivion");
  });

  it("ships the dock image with its visible provenance caption", () => {
    const { container } = render(<ProductDockCharging />);

    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("alt")?.trim().length ?? 0).toBeGreaterThan(0);

    const caption = container.querySelector("figcaption");
    expect(caption?.textContent?.toLowerCase()).toContain("visualization");
  });

  // Site-owner factual correction (current session): "remove charging in this
  // page, as what dock does is swapping the battery not charging." The dock
  // section previously read "Dock, charge, redeploy" / "The dock recharges
  // and redeploys the drone", which described the wrong mechanism. This pins
  // the correction, because the wording is plausible enough that a future
  // edit could reintroduce it without anyone noticing it had been ruled out.
  it("describes the dock as swapping the battery, never as charging", () => {
    const { container } = render(<ProductDockCharging />);
    const text = (container.textContent ?? "").toLowerCase();

    expect(text).toContain("swap");
    expect(text).not.toMatch(/charg/);
  });

  it("keeps the dock heading free of dashes, per the site owner's request", () => {
    const { container } = render(<ProductDockCharging />);
    const heading = container.querySelector("h2")?.textContent ?? "";

    expect(heading.length).toBeGreaterThan(0);
    // Covers hyphen, en dash, em dash and minus sign.
    expect(heading).not.toMatch(/[-\u2010-\u2015\u2212]/);
  });
});

// Site-owner request (current session): "in platform before explaining how the
// platform works, add the airframes photos first, then use drone vision model
// output second then explaination of whole platform".
//
// This is pinned because it is a reading-order argument, not a layout detail,
// and reordering a page is a one line change that no other test would notice.
// The requested sequence is: the aircraft, then what its vision produces, then
// the cycle both serve.
describe("Platform page section order", () => {
  const order = () =>
    Children.toArray((ProductPage() as ReactElement<{ children?: ReactNode }>).props.children)
      .filter(isValidElement)
      .map((child) => (child as ReactElement).type);

  it("shows the airframes and the detection output before explaining the loop", () => {
    const seq = order();

    expect(seq.indexOf(ProductHardware)).toBeLessThan(seq.indexOf(ProductDetectionDemo));
    expect(seq.indexOf(ProductDetectionDemo)).toBeLessThan(
      seq.indexOf(ProductOperatingLoop),
    );
    expect(seq.indexOf(ProductHardware)).toBeGreaterThan(seq.indexOf(ProductHero));
  });

  it("renders the seven sections in the requested order, closing with the footer", () => {
    expect(order()).toEqual([
      ProductHero,
      ProductHardware,
      ProductDetectionDemo,
      ProductOperatingLoop,
      ProductDockCharging,
      ProductSensorPayload,
      ProductSpecifications,
      Footer,
    ]);
  });
});

describe("Platform page publishes no unverifiable figures", () => {
  // Targeted subset of scanForBannedTerms — see this file's header for why
  // the full scanner is not used.
  const FIGURE_PATTERN =
    /\d+(\.\d+)?\s*(km\/h|kmph|mph|km|kg|lbs?|m\/s|kn|min|mins?|hrs?|hours?|%|megapixel|mp)\b/i;

  const SECTIONS = [
    ["ProductOperatingLoop", ProductOperatingLoop],
    ["ProductHardware", ProductHardware],
    ["ProductDockCharging", ProductDockCharging],
  ] as const;

  it.each(SECTIONS)("%s renders no speed, range, weight or duration figure", (
    _name,
    Section,
  ) => {
    const { container } = render(<Section />);

    // Step numbering (01..07) is decorative and aria-hidden, and is not a
    // claim; the pattern above only matches digits bound to a unit, so it
    // does not trip on it.
    expect(container.textContent ?? "").not.toMatch(FIGURE_PATTERN);
  });
});
