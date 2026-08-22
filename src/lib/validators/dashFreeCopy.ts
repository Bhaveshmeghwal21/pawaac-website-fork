// Site-owner copy rule: no hyphens or dashes in on page homepage copy.
//
// README.md records this under "Conventions worth knowing" as a site owner
// preference, but nothing enforced it, so the rule had drifted: at the time
// this validator was added the live homepage shipped "broad-area coverage",
// "time-critical response environments" and "purpose-built for demanding
// field environments", while the newest section followed the rule. A
// preference that is documented but unenforced becomes a preference that is
// silently half applied, which is worse than not having it written down.
//
// Pure scanner function. Intentionally dependency-free and side-effect-free,
// matching bannedTerms.ts — used by HomepageCopyRules.test.tsx, which renders
// the real homepage sections and scans their visible text.
//
// Scope note: this rule is about rendered on page copy. It is deliberately NOT
// applied to className values, URLs, dates, code identifiers or file names,
// all of which legitimately contain hyphens. Callers are responsible for
// passing only visible text (in practice, an element's textContent).

/**
 * Dash and hyphen code points banned from on page homepage copy, keyed by
 * their Unicode name so a failing scan can say which character was found
 * rather than printing an indistinguishable glyph.
 *
 * The middot (U+00B7), used deliberately in the footer's
 * "© 2025 Bajrang Dronetech Pvt Ltd · Built in India" and in the
 * "ENGINEERING & OPERATIONS · INDIA" badge, is intentionally absent: it is a
 * separator, not a dash, and the site owner rule does not cover it.
 */
const DASH_CHARACTERS: Record<string, string> = {
  "\u002D": "HYPHEN-MINUS",
  "\u2010": "HYPHEN",
  "\u2011": "NON-BREAKING HYPHEN",
  "\u2012": "FIGURE DASH",
  "\u2013": "EN DASH",
  "\u2014": "EM DASH",
  "\u2015": "HORIZONTAL BAR",
  "\u2212": "MINUS SIGN",
  "\uFE58": "SMALL EM DASH",
  "\uFE63": "SMALL HYPHEN-MINUS",
  "\uFF0D": "FULLWIDTH HYPHEN-MINUS",
};

const DASH_CLASS = `[${Object.keys(DASH_CHARACTERS).join("")}]`;

/** A single offending token found in scanned copy. */
export type DashOffence = {
  /** The whitespace-delimited token containing the dash, e.g. "broad-area". */
  token: string;
  /** Unicode name of the offending character, e.g. "HYPHEN-MINUS". */
  character: string;
};

/**
 * Scans `text` for banned hyphen and dash characters and returns one entry per
 * offending whitespace-delimited token, in document order. Returns an empty
 * array iff `text` is free of hyphens and dashes.
 *
 * Returning the surrounding token rather than the bare character is
 * deliberate: a failing test then names the actual word to rewrite
 * ("broad-area") instead of only reporting that a hyphen exists somewhere.
 */
export function scanForDashes(text: string): DashOffence[] {
  const tokenPattern = new RegExp(`\\S*${DASH_CLASS}\\S*`, "gu");
  const offences: DashOffence[] = [];

  for (const match of text.matchAll(tokenPattern)) {
    const token = match[0];
    const offending = [...token].find((char) => char in DASH_CHARACTERS);
    if (offending) {
      offences.push({
        token,
        character: DASH_CHARACTERS[offending],
      });
    }
  }

  return offences;
}

/** Convenience predicate: true iff `text` contains no hyphens or dashes. */
export function isDashFree(text: string): boolean {
  return scanForDashes(text).length === 0;
}
