# Homepage Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add restrained GSAP choreography to the six-section homepage, synchronized with the preloader and safe on mobile and reduced-motion devices.

**Architecture:** A small page-readiness utility coordinates the first-visit preloader and hero. A reusable client-side homepage motion component owns one scoped GSAP timeline per section, while semantic content remains visible by default. Lenis and all scroll-linked motion are disabled when the user requests reduced motion.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, GSAP 3, ScrollTrigger, Lenis, Tailwind CSS 4, Vitest, Testing Library, Playwright.

---

### Task 1: Preloader readiness and reduced-motion contract

**Files:**
- Create: `src/lib/motion/pageReady.ts`
- Create: `src/lib/motion/pageReady.test.ts`
- Modify: `src/components/ui/Preloader.tsx`
- Modify: `src/components/providers/LenisProvider.tsx`
- Modify: related component tests

- [x] Write failing tests proving that readiness is observable both before and after subscription, the preloader signals only when its exit is complete, and reduced motion skips Lenis/preloader animation.
- [x] Run the focused tests and confirm failures describe the missing readiness and reduced-motion behavior.
- [x] Implement the readiness signal, preloader coordination, and reduced-motion Lenis guard with no arbitrary hero delay.
- [x] Run the focused tests and confirm they pass.

### Task 2: Reusable GSAP homepage section choreography

**Files:**
- Create: `src/components/motion/HomeMotionSection.tsx`
- Create: `src/components/motion/HomeMotionSection.test.tsx`
- Modify: `src/components/ui/HeroHeadline.tsx`
- Modify: `src/components/ui/SkyScenery.tsx`

- [x] Write failing tests for visible-by-default markup, a single scoped timeline per section, hero readiness coordination, desktop-only parallax, mobile distances, and reduced-motion static rendering.
- [x] Run the focused tests and confirm they fail for the missing orchestration.
- [x] Implement scoped GSAP contexts with cleanup and responsive/reduced-motion branches; remove blur from the hero entrance and scope scenery parallax to the hero.
- [x] Run the focused tests and confirm they pass.

### Task 3: Apply grouped timelines to all homepage sections

**Files:**
- Modify: `src/components/sections/HomeHero.tsx`
- Modify: `src/components/sections/HomeOperatingLoop.tsx`
- Modify: `src/components/sections/HomeSpecSheet.tsx`
- Modify: `src/components/sections/HomeDeploymentsPreview.tsx`
- Modify: `src/components/sections/HomePlannerCTA.tsx`
- Modify: `src/components/sections/HomeContactBand.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Modify: `src/components/sections/HomepageSections.test.tsx`
- Modify: `src/components/layout/Footer.test.tsx`

- [x] Add failing component tests for motion-group markers, one orchestrator per section, the required choreography order, and a static compact footer.
- [x] Run the focused tests and confirm the new assertions fail.
- [x] Replace homepage `Reveal` wrappers with semantic motion-group markers inside one orchestrator per section; keep layout, copy, links, color imagery, and responsive ordering unchanged.
- [x] Run the focused tests and confirm they pass.

### Task 4: Full verification and browser audit

**Files:**
- Modify only if verification exposes a defect in the files above.

- [x] Run the complete Vitest suite.
- [x] Run ESLint and TypeScript checks. (Changed-file ESLint and TypeScript pass; repository-wide ESLint remains blocked by unrelated generated/legacy files.)
- [x] Run the Next.js production build.
- [x] Audit 1440×900 and 390×844 in a real browser, including first visit, repeat visit, scrolling every section, and reduced-motion mode.
- [x] Confirm no hidden content, failed resources, horizontal overflow, extra scroll length, or compact-footer motion. (Mobile development mode emits Next Image LCP heuristics while programmatically jumping through sections; production build is clean.)
- [x] Remove temporary audit files and review the final diff against the approved design.
