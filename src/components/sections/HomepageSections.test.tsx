// @vitest-environment jsdom
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import HomeOperatingLoop from "./HomeOperatingLoop";
import HomeProblemFraming from "./HomeProblemFraming";
import HomeSpecSheet from "./HomeSpecSheet";
import HomeDeploymentsPreview from "./HomeDeploymentsPreview";
import HomePlannerCTA from "./HomePlannerCTA";
import HomeContactBand from "./HomeContactBand";

function owningSection(element: Element) {
  const section = element.closest("section");
  expect(section).not.toBeNull();
  return section as HTMLElement;
}

// Number of shortcoming cards in HomeProblemFraming, used by the guard that
// keeps prose from creeping back into that section.
const SHORTCOMING_COUNT = 5;

describe("condensed homepage sections", () => {
  it("keeps every homepage image source backed by a public asset", () => {
    const { container } = render(<HomeDeploymentsPreview />);
    const imageSources = Array.from(container.querySelectorAll("img"))
      .map((image) => image.getAttribute("src"))
      .filter((src): src is string => Boolean(src))
      .map((src) => src.split("?")[0])
      .filter((src) => src.startsWith("/images/"));

    for (const source of imageSources) {
      expect(existsSync(join(process.cwd(), "public", source.slice(1)))).toBe(
        true,
      );
    }
  });

  it("frames the problem as five visual shortcomings, with no ungated numerals", () => {
    const { container } = render(<HomeProblemFraming />);
    const section = owningSection(
      screen.getByRole("heading", { name: "Where surveillance falls short" }),
    );

    // These are the limitations of conventional PILOTED drone surveillance, not
    // of fixed cameras and manned guarding. An earlier version of the section
    // got that wrong; the distinction is the whole competitive argument, since
    // the alternative a buyer weighs up is usually another drone operator.
    // "Camera blind spots" is the deliberate exception and comes first: it is
    // the reason to fly anything over a site at all.
    expect(
      Array.from(container.querySelectorAll("h3")).map((h) => h.textContent),
    ).toEqual([
      "Camera blind spots",
      "Incomplete patrols",
      "Delayed response",
      "Manpower strain",
      "GPS signal loss",
    ]);
    expect(container.querySelectorAll("[data-problem-card]")).toHaveLength(5);
    expect(section).toHaveAttribute("data-home-motion", "problem");

    // Site-owner direction: use compact symbols rather than explanatory
    // diagrams or generated imagery. One pictogram identifies each problem;
    // each is decorative because the adjacent title and line provide its
    // accessible meaning.
    const symbols = container.querySelectorAll("[data-problem-symbol]");
    expect(symbols).toHaveLength(SHORTCOMING_COUNT);
    const svgs = container.querySelectorAll("[data-problem-symbol] svg");
    expect(svgs).toHaveLength(SHORTCOMING_COUNT);
    for (const symbol of symbols) {
      expect(symbol).toHaveAttribute("aria-hidden", "true");
      // SVG <text> would land in textContent and break the no digits rule.
      expect(symbol.querySelectorAll("text")).toHaveLength(0);
    }

    // The section has to stay inside one viewport, so the earlier standfirst,
    // per card paragraphs and closing pivot sentence are gone. Guard against
    // prose creeping back: at most one short line of copy per card.
    expect(container.querySelectorAll("p")).toHaveLength(
      1 + SHORTCOMING_COUNT, // the eyebrow label, plus one line per card
    );

    // Content governance: every numeral on the site must trace to an already
    // published figure. The original Problem.tsx was dropped at Task 16
    // precisely because its stat counters were ungated, so this section is
    // required to stay qualitative rather than reintroduce them. The diagrams
    // show proportions, never quantities, for the same reason.
    expect(section.textContent ?? "").not.toMatch(/\d/);

    // The site owner's no hyphens or dashes rule is enforced for this section
    // and every other homepage section in HomepageCopyRules.test.tsx, via the
    // dashFreeCopy validator, rather than by an ad hoc regex here.
  });

  it("presents a closed mission loop with recovery, navigation resilience, and oversight", () => {
    const { container } = render(<HomeOperatingLoop />);
    const section = owningSection(
      screen.getByRole("heading", {
        name: "Surveillance that notices, not just records",
      }),
    );

    expect(
      owningSection(
        screen.getByRole("heading", { name: "One tap from alert to oversight" }),
      ),
    ).toBe(section);
    expect(container.querySelectorAll("[data-operating-step]")).toHaveLength(7);
    expect(container.querySelector("[data-mission-loop]")).not.toBeNull();
    expect(container.querySelector("[data-loop-return]")).not.toBeNull();
    expect(container.querySelector("[data-operator-branch]")).not.toBeNull();
    expect(container.querySelector("[data-navigation-resilience]")).not.toBeNull();

    const symbols = container.querySelectorAll("[data-operating-symbol]");
    expect(symbols).toHaveLength(8);
    for (const symbol of symbols) {
      expect(symbol).toHaveAttribute("aria-hidden", "true");
      expect(symbol.querySelectorAll("text")).toHaveLength(0);
    }

    for (const stage of [
      "Dock",
      "Dispatch",
      "Patrol",
      "Detect",
      "Escalate",
      "Return",
      "Swap",
    ]) {
      expect(within(section).getByText(stage)).toBeInTheDocument();
    }
    expect(
      within(section).getByRole("heading", { name: "GPS denied navigation" }),
    ).toBeInTheDocument();
    expect(within(section).getByText("Back to Dock. Ready again.")).toBeInTheDocument();
    expect(container.querySelector('img[src*="gcs.png"]')).not.toBeNull();
    expect(
      screen.getByRole("img", {
        name: /ground control interface showing live aerial detections/i,
      }),
    ).toBeInTheDocument();
    expect(
      within(section).getByText("Ground control interface (in development)"),
    ).toBeInTheDocument();
    expect(section).toHaveAttribute("data-home-motion", "operating");
  });

  it("presents both aircraft and their color photography in one comparison section", () => {
    const { container } = render(<HomeSpecSheet />);
    const hawkai = screen.getByRole("heading", { name: "HawkAI Plus" });
    const sentrivion = screen.getByRole("heading", { name: "Sentrivion" });

    expect(owningSection(hawkai)).toBe(owningSection(sentrivion));
    expect(container.querySelectorAll("section")).toHaveLength(1);
    expect(
      container.querySelector('img[src*="hawkai-plus-product.jpg"]'),
    ).not.toBeNull();
    expect(container.querySelector('img[src*="sentri_main2.jpg"]')).not.toBeNull();
    expect(container.querySelectorAll('[class*="grayscale"]')).toHaveLength(0);
    expect(owningSection(hawkai)).toHaveAttribute("data-home-motion", "platforms");

    for (const heading of [hawkai, sentrivion]) {
      const card = heading.closest("article");
      expect(card).not.toBeNull();
      expect(card?.querySelectorAll("dl > div")).toHaveLength(3);
    }
  });

  it("combines applications and critical-site framing in a compact color grid", () => {
    const { container } = render(<HomeDeploymentsPreview />);
    const section = owningSection(
      screen.getByRole("heading", { name: "Where Pawaac is built to operate" }),
    );

    expect(
      owningSection(
        screen.getByRole("heading", {
          name: "Security autonomy for critical sites",
        }),
      ),
    ).toBe(section);
    expect(container.querySelectorAll("[data-application-card]")).toHaveLength(4);
    expect(container.querySelector("[data-applications-grid]")).toHaveClass(
      "grid-cols-2",
    );
    expect(container.querySelectorAll('[class*="grayscale"]')).toHaveLength(0);
    expect(section).toHaveAttribute("data-home-motion", "applications");
  });

  it("keeps planner copy before its screenshot and removes grayscale styling", () => {
    const { container } = render(<HomePlannerCTA />);
    const heading = screen.getByRole("heading", {
      name: "Model your own coverage area",
    });
    const image = screen.getByRole("img", { name: /coverage planner/i });

    expect(
      heading.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(container.querySelectorAll('[class*="grayscale"]')).toHaveLength(0);
    expect(owningSection(heading)).toHaveAttribute("data-home-motion", "planner");
  });

  it("combines company proof, mission, credentials, and contact in one close", () => {
    render(<HomeContactBand />);
    const companyHeading = screen.getByRole("heading", {
      name: "Built by Bajrang Dronetech Pvt Ltd",
    });
    const closing = owningSection(companyHeading);

    expect(
      owningSection(
        screen.getByRole("heading", { level: 3, name: "Talk to the team" }),
      ),
    ).toBe(closing);
    expect(
      within(closing).getByText(
        /Pawaac exists to make continuous, pilotless coverage the default/i,
      ),
    ).toBeInTheDocument();
    expect(within(closing).getByText("DPIIT RECOGNIZED")).toBeInTheDocument();
    expect(within(closing).queryByText("MeitY RECOGNIZED")).toBeNull();
    expect(
      within(closing).getByRole("link", { name: "About the company" }),
    ).toHaveAttribute("href", "/company");
    expect(
      within(closing).getByRole("link", { name: /^Contact us/ }),
    ).toHaveAttribute("href", "/contact");
    expect(closing).toHaveAttribute("data-home-motion", "closing");
  });
});
