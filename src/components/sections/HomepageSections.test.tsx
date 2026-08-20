// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import HomeOperatingLoop from "./HomeOperatingLoop";
import HomeSpecSheet from "./HomeSpecSheet";
import HomeDeploymentsPreview from "./HomeDeploymentsPreview";
import HomePlannerCTA from "./HomePlannerCTA";
import HomeContactBand from "./HomeContactBand";

function owningSection(element: Element) {
  const section = element.closest("section");
  expect(section).not.toBeNull();
  return section as HTMLElement;
}

describe("condensed homepage sections", () => {
  it("combines the operating loop and escalation visual into four concise stages", () => {
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
    expect(container.querySelectorAll("[data-operating-step]")).toHaveLength(4);
    expect(within(section).getByText("Dock")).toBeInTheDocument();
    expect(within(section).getByText("Patrol")).toBeInTheDocument();
    expect(within(section).getByText("Detect")).toBeInTheDocument();
    expect(within(section).getByText("Escalate & respond")).toBeInTheDocument();
    expect(
      within(section).getByText("Concept interface (in development)"),
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
    expect(within(closing).getByText("DGCA COMPLIANT")).toBeInTheDocument();
    expect(within(closing).getByText("MeitY RECOGNIZED")).toBeInTheDocument();
    expect(
      within(closing).getByRole("link", { name: "About the company" }),
    ).toHaveAttribute("href", "/company");
    expect(
      within(closing).getByRole("link", { name: /^Contact us/ }),
    ).toHaveAttribute("href", "/contact");
    expect(closing).toHaveAttribute("data-home-motion", "closing");
  });
});
