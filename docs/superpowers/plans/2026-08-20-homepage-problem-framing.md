# Homepage Problem Framing Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the homepage a reason to exist before it starts selling. Today the
page opens solution first and never states the operational gap PAWAAC closes, so
a first time visitor reads mechanics before motive. Add one qualitative problem
section as section 2, and repair four regressions found during a full read of
the page.

**Architecture:** Add a single new section component, `HomeProblemFraming`,
between `HomeHero` and `HomeOperatingLoop`. It reuses the existing
`HomeMotionSection` wrapper (new `problem` variant) so its entrance matches
every other section rather than introducing a parallel motion system. No
existing section is restructured; the other four changes are documentation,
provenance and semantics fixes in place.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4,
GSAP + ScrollTrigger via `HomeMotionSection`, Vitest, Testing Library.

---

## Findings that motivate this plan

Read of `src/app/page.tsx` and all six rendered sections, at
commit `3778442` ("Condense homepage and add restrained motion").

| # | Finding | Severity |
| --- | --- | --- |
| F1 | Page never states the problem. Order is hero (what) → operating loop (how) → platforms (what) → applications (where) → planner → company. Stakes are absent, so the autonomy story has nothing to resolve. | High, this is the reported defect |
| F2 | `src/app/page.tsx` lost its render tree documentation header during the condense commit. `README.md` states that file "documents why each one is there — and why several planned ones were deliberately dropped" and instructs readers to read that header before adding or reordering a section. The file is now bare imports, so that instruction points at nothing. | High, documented invariant broken |
| F3 | `HomeSpecSheet` publishes six hard numerals (endurance, range, wind resistance, time to operational, area coverage, payload swap time) with no provenance comment and no Change Proposal reference, in a repo whose central rule is that every numeral traces to an already published figure. | Medium, governance gap |
| F4 | `HomeDeploymentsPreview` renders one word image overlay tags ("Defense", "Police", …) as `<h3>`, competing in the heading outline with the section's two real `<h3>` headings. | Low, accessibility |
| F5 | `README.md` advertises `npm test` as "22 files, 168 tests". Actual is 29 files, 196 tests. | Low, stale docs |

## Copy constraints that apply to the new section

- Every numeral on the site must trace to a real published figure, otherwise it
  renders a visible `Pending confirmation` placeholder. **The new section
  therefore carries no numerals at all.** This is the same rule that caused the
  original `Problem.tsx` to be dropped at Task 16: its four stat counters
  (border kilometres, patrol area per hour, uptime, share of areas with live
  coverage) were ungated. Its qualitative narrative is reused here, its counters
  are not.
- No hyphens or dashes in on page homepage copy (site owner preference).
- No coordinates, serials, unit figures or `AES-` references (`bannedTerms`).
- Claims must stay inside what the rest of the page already asserts: docked
  aircraft, scheduled and on demand patrol, onboard detection, operator
  escalation.

## Approved copy

Label: `The problem`

Heading: `The perimeter never shrinks. The watch does.`

Standfirst: `Large sites are covered by fixed cameras, scheduled patrols, and
operators who cannot watch every feed at once. Incidents happen in the gaps
between them.`

Three cards, qualitative only:

1. **Fixed cameras leave gaps** — `A camera covers the point it is aimed at. The
   ground between them stays unobserved, and a patrol route that runs on a
   schedule can be learned.`
2. **Recording is not responding** — `Most footage is reviewed after the fact. By
   the time an event is found in it, the moment to act on it has passed.`
3. **A pilot is a precondition** — `Conventional drones fly only when a trained
   operator is on site and free to fly them, which is rarely the moment
   something needs a closer look.`

Pivot line into `HomeOperatingLoop`: `Pawaac closes those gaps by keeping
aircraft docked at the site they cover, flying them on the site's own schedule,
and surfacing only what needs a decision.`

## Visual and motion treatment

- Surface `bg-bg-2`, which keeps the page's alternating rhythm intact:
  hero (photo) → problem `bg-bg-2` → operating `bg-bg` → platforms `bg-bg-2` →
  applications `bg-white` → planner `#0b0b0b` → closing `bg-bg-2`.
- Cards use a left rule (`border-l`) treatment, deliberately different from
  `HomeOperatingLoop`'s bordered 4 up grid directly below it, so two adjacent
  sections do not read as one repeated component.
- No numbered indices, because `HomeOperatingLoop` immediately below already
  owns `01`–`04` and reusing them would imply a single sequence.
- Motion via `HomeMotionSection variant="problem"`: `data-motion-group` on the
  intro and on the card row, `data-motion-item` per card. Reduced motion is
  handled by the wrapper's existing `gsap.matchMedia` `reduce` branch.

---

### Task 1: Failing tests first

**Files:**
- Modify: `src/app/page.test.tsx`
- Modify: `src/components/sections/HomepageSections.test.tsx`

- [ ] Extend the route composition test to the seven section order with
      `HomeProblemFraming` at index 1, still ending in the compact `Footer`.
- [ ] Add a section test asserting the heading, all three card headings, the
      pivot line, `data-problem-card` count of 3, `data-home-motion="problem"`,
      and that the section publishes no digits in its text content.
- [ ] Run both files and confirm they fail because the component does not exist.

### Task 2: The problem section

**Files:**
- Create: `src/components/sections/HomeProblemFraming.tsx`
- Modify: `src/components/motion/HomeMotionSection.tsx`

- [ ] Add `"problem"` to the `HomeMotionVariant` union.
- [ ] Implement the section from the approved copy above, `<h2>` for the
      section heading and `<h3>` per card.
- [ ] Run both test files and confirm they pass.

### Task 3: Route wiring and restored documentation (F1, F2)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] Render `HomeProblemFraming` between `HomeHero` and `HomeOperatingLoop`.
- [ ] Restore a render tree header documenting the current seven section set,
      why each is present, which sections were dropped in the condense commit
      and are now unused on disk, and the persona ordering constraint, so the
      `README.md` instruction resolves again.

### Task 4: Hero opens the question (F1, continued)

**Files:**
- Modify: `src/components/sections/HomeHero.tsx`

- [ ] Keep the existing sentence naming what the product is and who it is for,
      and add one short clause naming the differentiator, so the gap is hinted
      at above the fold rather than only after a scroll. No hyphens or dashes.

### Task 5: Governance, semantics and docs (F3, F4, F5)

**Files:**
- Modify: `src/components/sections/HomeSpecSheet.tsx`
- Modify: `src/components/sections/HomeDeploymentsPreview.tsx`
- Modify: `README.md`

- [ ] Record the source of record for the six platform numerals in a header
      comment, naming the brochures in `public/images` and flagging owner
      confirmation as outstanding. Do not alter, invent or delete any figure.
- [ ] Change the four image overlay tags from `<h3>` to `<p>`, keeping their
      visual treatment and the `data-application-card` contract unchanged.
- [ ] Correct the stale test file and test counts in `README.md`.

### Task 6: Verification

- [ ] `npx vitest run`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Confirm the new section publishes no numerals and no hyphens or dashes.

---

## Follow up 1: perimeter diagram (superseded by follow up 2)

The section shipped text only and read as plain, so it gained a large perimeter
site plan diagram beside stacked cards. That diagram
(`PerimeterGapDiagram.tsx`) was removed again in follow up 2 below and never
reached a commit. Recorded here only so the sequence makes sense.

## Follow up 2: reframed, visuals first, one screen (site-owner direction)

Three problems reported against the first build:

1. The framing was not the site owner's. They supplied a reference giving the
   real framing: heading "Where surveillance falls short", and four
   shortcomings grouped as surveillance shortcomings (camera blind spots,
   incomplete patrols) and response delays (delayed response, manpower strain).
2. Too much prose. Nobody reads it; the point should be carried by visuals.
3. The section ran to roughly one and a half screens.

**Files:** create `src/components/ui/ProblemVisual.tsx`, delete
`src/components/ui/PerimeterGapDiagram.tsx`, rewrite
`src/components/sections/HomeProblemFraming.tsx`, update
`src/components/sections/HomepageSections.test.tsx`.

- [x] Adopted the owner's heading and their four shortcomings verbatim,
      flattened into one row of four in their grouped order. A second level of
      group headings was dropped because it cost vertical space the section
      could not afford.
- [x] Cut the standfirst, the four body paragraphs, the closing pivot sentence,
      the figure caption and the legend. Each shortcoming is now one diagram, a
      title, and one short line. The pivot was dropped rather than reworded
      because HomeOperatingLoop's own heading, "Surveillance that notices, not
      just records", already answers "Where surveillance falls short".
- [x] Four small diagrams replace the one large one, sharing a single visual
      language so they read as a set: solid bright means covered or attended,
      dashed dim means uncovered or elapsed.
- [x] A test guard keeps prose from creeping back: the section may contain only
      the eyebrow label plus one line per card.

### Verified by measurement, not by eye

Rendered the section in isolation in headless Chrome with reduced motion forced
(which also bypasses the Preloader, since it returns null under that setting)
and measured the real layout:

| Viewport | Section height | Fits one screen |
| --- | --- | --- |
| 1422 x 804 | 675px | yes |
| 504 x 804 | 739px | yes |

No horizontal overflow and no clipped heading at either width.

Two defects were found and fixed only because of that measurement pass:

- Four cards stacked single column measured **1804px** on a narrow viewport,
  well over one screen. Switching to `grid-cols-2` from the narrowest width,
  matching the treatment `HomeDeploymentsPreview` already uses, brought it to
  739px.
- The patrol marker sat exactly on the route's corner and its trail was too
  faint to read. Moved along the top run and the gradient shortened so more of
  it is bright.

The diagrams themselves went through three rendered iterations. The first had
coverage wedges deep enough to overlap into unreadable noise; the second fixed
a stepped gradient trail and a corner artifact, and rebuilt manpower strain as
a sparse coverage grid after the original circles made the area look adequately
covered, which argued against the point being made. Preview artifacts and the
temporary verification route were removed afterwards; note that deleting a
temporary route also requires clearing its stale entry under
`.next/dev/types/app/`, which otherwise fails the next type check.




## Follow up 3: compact symbol system

The five diagram cards were rejected after visual review. Although the geometry
was technically distinct, the marks read as charts rather than recognisable
operational problems, and their fixed `200 / 130` media area pushed the
five-card narrow layout to 1030px. Generated photography was explored and then
explicitly abandoned: temporal constraints such as intermittent patrols and
response delay could not be communicated honestly by a small still image
without requiring a caption to explain the scene.

The accepted direction is a compact symbol system:

- camera plus interrupted field of view for blind spots
- drone plus clock for intermittent piloted patrols
- active alert plus grounded drone for delayed response
- operator linked to one aircraft for manpower strain
- severed satellite link plus drone for GPS signal loss

`ProblemSymbol.tsx` draws the five native pictograms in one achromatic stroke
language. They contain no SVG text, are decorative beside equivalent real copy,
and require no icon dependency or motion branch. `HomeProblemFraming` removes
the separate diagram panel and divider from every card; each problem is now one
compact tile containing its symbol, title and short line. The tiles share a
single outer rule and one-pixel internal gaps, retaining the site's technical
visual language without presenting the symbols as miniature illustrations.
