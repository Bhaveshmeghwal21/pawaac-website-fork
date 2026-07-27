// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import PinnedSpecSheet, { readoutText, scrambleNumeral } from "./PinnedSpecSheet";

// The spec-rail numerals decode through a progress-driven digit scramble (see
// PinnedSpecSheet.tsx's motion header). Every numeral on this site has to
// trace to a real, confirmed published figure (Requirement 8.3, and the
// no-fabrication convention OCP-02 enforces), so a scramble bug would not
// just look wrong — it could display a hardware spec that is not true. These
// tests pin the invariants that keep that from happening.
//
// Every real published numeral this component renders across all three call
// sites, because these are exactly the shapes that have to survive: plain
// digits, a trailing "+", a leading "<", a four-digit value, and — from
// HawkAISpecs.tsx — a DECIMAL, whose "." is structural in the same way "+"
// and "<" are and must never be scrambled or displaced.
const REAL_NUMERALS = [
  // HomeSpecSheet.tsx
  "80+",
  "15",
  "<10",
  "700+",
  "45",
  "<5",
  // HawkAISpecs.tsx / SentrivionSpecs.tsx
  "60+",
  "2.4",
  "4000",
];

const DIGIT = /[0-9]/;

describe("scrambleNumeral", () => {
  it("returns the exact target at full progress, for every published numeral", () => {
    for (const n of REAL_NUMERALS) {
      expect(scrambleNumeral(n, 1)).toBe(n);
    }
  });

  it("never changes the output length, at any progress", () => {
    for (const n of REAL_NUMERALS) {
      for (let p = 0; p <= 1.0001; p += 0.05) {
        expect(scrambleNumeral(n, p)).toHaveLength(n.length);
      }
    }
  });

  it("holds non-digit characters in place at every progress", () => {
    // "+" and "<" are structural, not data — a scramble that moved or
    // replaced them would render a meaningless readout like "8-+" or "1<0".
    for (const n of REAL_NUMERALS) {
      for (let p = 0; p <= 1.0001; p += 0.05) {
        const out = scrambleNumeral(n, p);
        for (let i = 0; i < n.length; i++) {
          if (!DIGIT.test(n[i])) {
            expect(out[i]).toBe(n[i]);
          }
        }
      }
    }
  });

  it("only ever substitutes digits for digits", () => {
    // Guards against emitting letters or symbols into a numeric readout.
    for (const n of REAL_NUMERALS) {
      for (let p = 0; p <= 1.0001; p += 0.05) {
        const out = scrambleNumeral(n, p);
        for (let i = 0; i < n.length; i++) {
          if (DIGIT.test(n[i])) {
            expect(out[i]).toMatch(DIGIT);
          }
        }
      }
    }
  });

  it("resolves left to right, locking earlier characters first", () => {
    // At 2/3 progress through "700+", the first two characters are locked to
    // their real values and only the third digit is still resolving.
    const out = scrambleNumeral("700+", 0.75);
    expect(out[0]).toBe("7");
    expect(out[1]).toBe("0");
    expect(out[3]).toBe("+");
  });

  it("leaves nothing locked at zero progress except non-digits", () => {
    const out = scrambleNumeral("<10", 0);
    expect(out[0]).toBe("<");
    expect(out).toHaveLength(3);
    expect(out[1]).toMatch(DIGIT);
    expect(out[2]).toMatch(DIGIT);
  });

  it("keeps a decimal point in place while its digits resolve", () => {
    // "2.4" (HawkAI all-up weight, kg). A scramble that treated "." as
    // scrambleable, or shifted it, would publish a different weight.
    for (let p = 0; p <= 1.0001; p += 0.05) {
      expect(scrambleNumeral("2.4", p)[1]).toBe(".");
    }
    expect(scrambleNumeral("2.4", 1)).toBe("2.4");
  });

  it("handles an empty target without throwing", () => {
    // The "Pending confirmation" placeholder path passes no data-value.
    expect(scrambleNumeral("", 0.5)).toBe("");
  });
});

describe("readoutText — never displays a fabricated figure at rest", () => {
  // The scramble substitutes RANDOM digits for unresolved ones, so any paused
  // mid-reveal position renders a number that is simply not true. Observed live
  // before this guard existed: "<16" on screen where the published spec is
  // "<10", and "777+" where it is "700+". Requirement 8.3 / OCP-02 require every
  // numeral on this site to trace to a confirmed figure, and "it was only meant
  // to be transient" is not a defence when the page is sitting still.
  //
  // The invariant: whenever the page is not moving, the readout is the real
  // value — at EVERY progress, not just at the end.
  const REAL = ["80+", "15", "<10", "700+", "45", "<5", "60+", "2.4", "4000"];

  it("returns the exact published value at zero velocity, at every progress", () => {
    for (const n of REAL) {
      for (let p = 0; p <= 1.0001; p += 0.02) {
        expect(readoutText(n, p, 0)).toBe(n);
      }
    }
  });

  it("returns the exact published value for tiny residual velocities", () => {
    // Lenis eases to a stop rather than snapping, so velocity decays through
    // small non-zero values. Those must already count as "at rest", otherwise
    // the readout parks on a scrambled figure as the scroll settles.
    for (const n of REAL) {
      for (const v of [0.01, -0.05, 0.3, -0.59, 0.6, -0.6]) {
        expect(readoutText(n, 0.5, v)).toBe(n);
      }
    }
  });

  it("returns the exact published value once the reveal completes, at any velocity", () => {
    for (const n of REAL) {
      for (const v of [0, 5, -40, 900]) {
        expect(readoutText(n, 1, v)).toBe(n);
      }
    }
  });

  it("only scrambles while the page is actually moving mid-reveal", () => {
    // Length and structure still hold while scrambling, so a moving readout
    // never reflows or emits a non-numeric character.
    for (const n of REAL) {
      const out = readoutText(n, 0.4, 40);
      expect(out).toHaveLength(n.length);
      for (let i = 0; i < n.length; i++) {
        if (!/[0-9]/.test(n[i])) expect(out[i]).toBe(n[i]);
        else expect(out[i]).toMatch(/[0-9]/);
      }
    }
  });

  it("never scrambles the empty placeholder target", () => {
    for (const v of [0, 50]) {
      expect(readoutText("", 0.5, v)).toBe("");
    }
  });
});

// The Homepage rail carries specs for BOTH airframes, and three of its six
// numerals are Sentrivion's while the section background is a HawkAI Plus plan
// view. Attribution therefore rests entirely on the group caption: with it, a
// reader knows which airframe a figure belongs to; without it, the layout
// silently credits every number to the quad in the picture. That makes the
// caption a content-correctness feature rather than decoration, so it is pinned
// here alongside the scramble invariants.
describe("group caption (eyebrow) — platform attribution", () => {
  const PANELS = [
    { label: "Deployment time", numeral: "<10", supportingSentence: "Minutes." },
  ];

  it("renders the caption text and keeps it in the accessibility tree", () => {
    render(<PinnedSpecSheet panels={PANELS} eyebrow="Sentrivion · VTOL platform" />);
    const caption = screen.getByText("Sentrivion · VTOL platform");
    expect(caption).toBeInTheDocument();
    // Decorative layers on this site are aria-hidden (Requirement 10.6). This
    // one must NOT be: it carries the attribution for the numerals beneath it.
    expect(caption.closest("[aria-hidden='true']")).toBeNull();
  });

  it("renders no caption element when none is passed", () => {
    // Keeps the single-platform call sites (/product/hawkai, /product/sentrivion)
    // exactly as they were — their page already names the airframe.
    const { container } = render(<PinnedSpecSheet panels={PANELS} />);
    expect(container.querySelector("[data-group-eyebrow]")).toBeNull();
  });

  it("is visually distinct from the panel labels it captions", () => {
    // Both are 12px mono. If the caption inherited the panels' muted colour it
    // would read as a seventh label rather than a heading over them, which is
    // what happened when it was given the `.technical-data` class: that class
    // sets `color: var(--color-muted)` as an unlayered rule and beat `text-fg`.
    render(<PinnedSpecSheet panels={PANELS} eyebrow="HawkAI Plus" />);
    const caption = screen.getByText("HawkAI Plus");
    expect(caption.className).toContain("text-fg");
    expect(caption.className).not.toContain("technical-data");
    expect(screen.getByText("Deployment time").className).toContain("text-muted");
  });
});
