// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import Footer from "@/components/layout/Footer";
import HomeContactBand from "@/components/sections/HomeContactBand";
import HomeDeploymentsPreview from "@/components/sections/HomeDeploymentsPreview";
import HomeHero from "@/components/sections/HomeHero";
import HomeOperatingLoop from "@/components/sections/HomeOperatingLoop";
import HomePlannerCTA from "@/components/sections/HomePlannerCTA";
import HomeProblemFraming from "@/components/sections/HomeProblemFraming";
import HomeSpecSheet from "@/components/sections/HomeSpecSheet";
import { scanForDashes } from "@/lib/validators/dashFreeCopy";

// Site-owner copy rule, recorded in README.md under "Conventions worth
// knowing": no hyphens or dashes in on page homepage copy.
//
// Previously this rule was documented but unenforced, and had drifted: the
// homepage shipped "broad-area coverage" (HomeSpecSheet), "time-critical
// response environments" (HomeDeploymentsPreview) and "purpose-built for
// demanding field environments" (HomeContactBand), while the newest section
// followed it. This suite renders each real homepage section and scans its
// rendered text, so the rule now holds for the whole page rather than for
// whichever section was written most recently.
//
// Scanning textContent means the rule covers visible copy and screen reader
// only copy, and does not touch className values, hrefs or image alt text,
// which legitimately contain hyphens.
const HOMEPAGE_SECTIONS = [
  ["HomeHero", HomeHero],
  ["HomeProblemFraming", HomeProblemFraming],
  ["HomeOperatingLoop", HomeOperatingLoop],
  ["HomeSpecSheet", HomeSpecSheet],
  ["HomeDeploymentsPreview", HomeDeploymentsPreview],
  ["HomePlannerCTA", HomePlannerCTA],
  ["HomeContactBand", HomeContactBand],
] as const;

describe("homepage copy rules", () => {
  it.each(HOMEPAGE_SECTIONS)(
    "%s publishes no hyphens or dashes in its on page copy",
    (_name, Section) => {
      const { container } = render(<Section />);
      const offences = scanForDashes(container.textContent ?? "");

      expect(offences.map((offence) => offence.token)).toEqual([]);
    },
  );

  it("the compact homepage footer publishes no hyphens or dashes either", () => {
    const { container } = render(<Footer compact />);

    expect(scanForDashes(container.textContent ?? "").map((o) => o.token)).toEqual(
      [],
    );
  });
});
