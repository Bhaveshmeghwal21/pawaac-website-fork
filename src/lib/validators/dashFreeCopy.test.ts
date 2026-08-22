import { describe, expect, it } from "vitest";
import { isDashFree, scanForDashes } from "./dashFreeCopy";

describe("scanForDashes", () => {
  it("returns no offences for copy that is free of hyphens and dashes", () => {
    expect(
      scanForDashes(
        "Fully autonomous surveillance drones for defense, police, and critical infrastructure.",
      ),
    ).toEqual([]);
    expect(isDashFree("The perimeter never shrinks. The watch does.")).toBe(true);
  });

  it("names the offending token, not just the character", () => {
    // The point of returning the token is that a failing homepage scan tells
    // the reader which word to rewrite.
    expect(scanForDashes("designed for broad-area coverage")).toEqual([
      { token: "broad-area", character: "HYPHEN-MINUS" },
    ]);
  });

  it("detects each banned dash variant, not only the ASCII hyphen", () => {
    expect(scanForDashes("time\u2010critical")[0]?.character).toBe("HYPHEN");
    expect(scanForDashes("time\u2011critical")[0]?.character).toBe(
      "NON-BREAKING HYPHEN",
    );
    expect(scanForDashes("a\u2012b")[0]?.character).toBe("FIGURE DASH");
    expect(scanForDashes("2024\u20132025")[0]?.character).toBe("EN DASH");
    expect(scanForDashes("a \u2014 b")[0]?.character).toBe("EM DASH");
    expect(scanForDashes("a\u2015b")[0]?.character).toBe("HORIZONTAL BAR");
    expect(scanForDashes("a\u2212b")[0]?.character).toBe("MINUS SIGN");
  });

  it("reports every offending token in document order", () => {
    expect(
      scanForDashes("purpose-built for time-critical work").map((o) => o.token),
    ).toEqual(["purpose-built", "time-critical"]);
  });

  it("does not treat the middot separator as a dash", () => {
    // Used deliberately in the footer copyright line and the credentials badge.
    expect(
      isDashFree("\u00A9 2025 Bajrang Dronetech Pvt Ltd \u00B7 Built in India"),
    ).toBe(true);
    expect(isDashFree("ENGINEERING & OPERATIONS \u00B7 INDIA")).toBe(true);
  });

  it("leaves other punctuation alone", () => {
    expect(
      isDashFree("Escalate & respond, then decide (quickly): what happens next?"),
    ).toBe(true);
    expect(isDashFree("kshitij@pawaac.com +91 76739 43461")).toBe(true);
  });
});
