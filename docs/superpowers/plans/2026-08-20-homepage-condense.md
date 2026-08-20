# Homepage Condense Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage as a six-section, responsive story with hero-only scenery, original-color imagery, and a compact footer.

**Architecture:** Keep the existing homepage component boundaries where they remain useful, but change their responsibilities: `HomeOperatingLoop` absorbs the autonomy visual, `HomeSpecSheet` becomes one platform comparison, `HomeDeploymentsPreview` absorbs enterprise framing, and `HomeContactBand` becomes the complete trust/mission/contact close. The page route renders only those consolidated components. `Footer` gains a compact prop so inner pages keep the current footer treatment.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Vitest, Testing Library.

---

### Task 1: Homepage structure contract

**Files:**
- Create: `src/app/page.test.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/sections/HomeHero.tsx`
- Modify: `src/components/ui/SkyScenery.tsx`

- [ ] Write a failing route test that mocks section components and asserts the exact six-section order, no independent autonomy/enterprise/company/vision render, and compact footer usage.
- [ ] Run `npm test -- src/app/page.test.tsx` and confirm it fails against the current eleven-section route.
- [ ] Move `SkyScenery` into `HomeHero`, change its root from fixed to absolute, replace deprecated `priority` with Next.js 16 `preload`, and reduce `page.tsx` to the approved consolidated section order.
- [ ] Run the route and `SkyScenery` tests and confirm they pass.

### Task 2: Consolidated visual sections

**Files:**
- Create: `src/components/sections/HomepageSections.test.tsx`
- Modify: `src/components/sections/HomeOperatingLoop.tsx`
- Modify: `src/components/sections/HomeSpecSheet.tsx`
- Modify: `src/components/sections/HomeDeploymentsPreview.tsx`
- Modify: `src/components/sections/HomePlannerCTA.tsx`
- Modify: `src/components/sections/HomeContactBand.tsx`

- [ ] Write failing component tests for the four-stage operating story, two-platform comparison, 2×2-capable applications grid, color imagery, mobile copy-first planner, and combined company/mission/contact close.
- [ ] Run `npm test -- src/components/sections/HomepageSections.test.tsx` and confirm the assertions fail for the current components.
- [ ] Implement the consolidated sections with opaque surfaces and reduced responsive spacing.
- [ ] Run the component tests and confirm they pass.

### Task 3: Compact footer

**Files:**
- Modify: `src/components/layout/Footer.test.tsx`
- Modify: `src/components/layout/Footer.tsx`

- [ ] Add a failing test for `compact` mode that retains navigation/contact/credentials while omitting the oversized decorative wordmark and reducing outer spacing.
- [ ] Run `npm test -- src/components/layout/Footer.test.tsx` and confirm it fails because the prop does not exist.
- [ ] Add `compact?: boolean` and implement the homepage-only compact variant without changing default inner-page behavior.
- [ ] Run footer tests and confirm they pass.

### Task 4: Verification and responsive audit

**Files:**
- Modify only if verification exposes a defect in files above.

- [ ] Run `npm test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Render with `npx next dev --webpack` at 1440×900 and 390×844, check six sections, color images, no background spillover, no horizontal overflow, and measure the new document height.
- [ ] Review the final diff against the approved structure and remove temporary audit artifacts.

