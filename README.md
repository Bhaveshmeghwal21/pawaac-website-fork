# pawaac-website

Marketing site for **PAWAAC**, the drone platform built by Bajrang Dronetech
Pvt Ltd (founded 2025). Covers two airframes — **HawkAI Plus**, a tactical
quadcopter built for long endurance, and **Sentrivion**, a VTOL built for rapid
deployment — plus the autonomy stack behind them and a live coverage-planning
tool.

Next.js App Router, TypeScript, Tailwind CSS v4.

---

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the lead-delivery keys
npm run dev
```

Then open <http://localhost:3000>.

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server (Turbopack) on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm test` | Vitest suite (39 files, 303 tests) |
| `npm run lint` | ESLint |

> **Read this before writing code.** `AGENTS.md` at the repo root carries a
> standing instruction: this project is on Next.js 16, whose APIs and
> conventions differ from older releases in ways that are easy to get wrong from
> memory. Check the bundled docs in `node_modules/next/dist/docs/` for the area
> you're touching rather than assuming.

---

## Routes

| Path | Contents |
| --- | --- |
| `/` | Homepage — the curated section set (see below) |
| `/product` | **Platform** — how the proposed solution works end to end: the seven step mission cycle (dock, dispatch, patrol, detect, escalate, return, swap), the human oversight branch, GPS denied navigation, then the hardware that runs it |
| `/product/hawkai` · `/product/sentrivion` | Per-airframe spec pages |
| `/product/docking-system` · `/product/software-stack` | Supporting subsystems |
| `/autonomy` | Autonomy stack: sense, decide, act |
| `/designer` | Coverage planner — patrol radii and docking-station placement (react-leaflet) |
| `/company` · `/careers` · `/commitments` · `/blogs` · `/contact` | Company pages |
| `/blogs/[slug]` | Individual blog post, prerendered per post from `lib/blogPosts.ts` |
| `/api/contact` · `/api/careers` | Form handlers (react-hook-form + zod) |
| `/sitemap.xml` · `/robots.txt` · `/opengraph-image` | Generated from `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx` |

**Five routes are currently hidden from navigation** at the site owner's
request: `/autonomy` and all four `/product/*` sub-pages. They are hidden, not
deleted — each still resolves if visited directly, and every section component
is untouched on disk. Only the discovery links were removed (from
`Navigation.tsx` and `app/sitemap.ts`), each with a comment naming the exact
snippet to re-add. Because the last `/product/*` child was hidden, the primary
nav item — renamed from "Product" to **"Platform"** — is now a plain link
rather than a dropdown. The `/product` URL itself is unchanged; only the label
moved, so `ProductHero`, `Product_Page` in spec comments and the route all keep
their existing names.

`Footer` is rendered per page rather than from the root layout. Every route
renders it identically except `/designer`, which is a full-viewport map tool —
see the comment in `app/designer/page.tsx`. The homepage previously passed a
`<Footer compact />` variant that dropped the oversized wordmark bar and the
scroll-linked reveal; it now renders the same full footer as every other route,
and the `compact` prop is retained but unused. `app/not-found.tsx`,
`app/error.tsx` and `app/global-error.tsx` cover the failure paths.

---

## Deployment

**The forms only work if lead delivery is configured.** Copy `.env.example` and
set `RESEND_API_KEY` and `LEAD_FROM_EMAIL` (a sender on a Resend-verified
domain); `LEAD_TO_EMAIL` defaults to the address in `lib/leadDelivery.ts`.

Without those, `/api/contact` and `/api/careers` return **503** and both forms
tell the visitor to email directly. That is intentional and worth preserving:
these routes previously validated a submission, `console.log`ed it, and returned
`{ ok: true }` while the UI said "We'll contact you within 24 hours", so every
demo request and job application was silently discarded. `leadDelivery.test.ts`
pins the invariant that success is never reported unless the provider accepted
the message.

Both endpoints are public and unauthenticated, so they carry a fixed-window
rate limit (`lib/rateLimit.ts`) and a `content-length` cap checked before the
body is read. The limiter is per server instance — see its header comment for
what that does and does not buy you.

`NEXT_PUBLIC_SITE_URL` overrides the canonical origin in `lib/site.ts`, which
feeds `metadataBase`, the sitemap and robots. Leave it unset for production.

---

## Layout

```
src/
  app/               routes, globals.css (design tokens), layout.tsx (fonts, providers)
  components/
    layout/          Navigation, Footer
    sections/        page sections, one file per section
    ui/              shared primitives (Reveal, PinnedSpecSheet, AirframeGhost, …)
    providers/       LenisProvider — drives gsap.ticker from Lenis
    designer/        the /designer coverage planner
  hooks/             useMediaQuery, usePrefersReducedMotion
  lib/
    motion/          scrollLerpField — continuous scroll-progress engine
    validators/      content and design governance (see below)
    schemas.ts       zod schemas for the forms
```

Sections are composed, not generic: the homepage render tree in
`src/app/page.tsx` lists its sections explicitly and documents why each one is
there — and why several planned ones were deliberately dropped rather than
built. Read that file's header before adding or reordering a section.

---

## Design language

The governing spec is `pawaac-design-language-evolution`; component headers cite
it as `Spec: pawaac-design-language-evolution — Task N`. Two earlier documents,
`WEBSITE_PLAN.md` and `KIRO_STEERING.md`, describe a superseded v1.0 direction
(red accent, video heroes, a 3D drone canvas) — **they are historical, not
current.** Where they disagree with the code, the code is right.

**Palette is strictly achromatic.** Tokens live in `src/app/globals.css`:

| Token | Value |
| --- | --- |
| `--color-bg` | `#080808` |
| `--color-fg` | `#ededed` |
| `--color-muted` | `#8a8a8a` |
| `--color-line` | `#1f1f1f` |

Every value satisfies R=G=B, and `colorToken.ts` tests that invariant. Three
photographs are deliberate exceptions, each documented in the component itself:
the real sky photograph in `SkyScenery.tsx`, the Vision banner in
`VisionHero.tsx` (`/commitments`), and the lead editorial image on the Blogs
page in `NewsList.tsx`. Colour in editorial/blog imagery is expected; the
achromatic rule governs the interface, not photography that is explicitly
illustrative. The detection demo video on `/product` is a fourth, for the same
reason — it is camera footage, and the overlay drawn on it uses `--color-fg`.

### The detection demo video

`/product` carries the site's only video (`ProductDetectionDemo.tsx` →
`ui/DemoVideo.tsx`). Read the header comments before touching it; the short
version:

- The **footage is real** Pawaac flight footage. The **bounding boxes are not
  from Pawaac's detector** — they were generated with Gemini 3.7 Flash and
  smoothed with a ByteTrack implementation (Kalman motion model, two-stage
  high/low confidence association, lost-track buffer). Presenting it as product
  output would be an unbacked capability claim, so the visible caption says
  "illustrative" and explicitly disclaims the shipping detector.
  `simulatedLabel.ts` encodes that wording rule and
  `ProductDetectionDemo.test.tsx` asserts the real caption satisfies it.
- It ships as `<video>` (webm + mp4 + poster), not the animated GIF that also
  exists at `public/videos/detection-demo.gif`. A GIF cannot be paused, so it
  can satisfy neither WCAG 2.2.2 nor this repo's reduced-motion rule, and it
  costs more than twice the bytes at less than half the resolution.
- Autoplay is **not** the `autoPlay` attribute. It is started from an effect
  only when `prefers-reduced-motion` is not set, so the reduced-motion branch is
  real rather than cosmetic, and the rendered markup does not depend on a
  client-only media query.

**Type:** Space Grotesk (display/headings), Inter (body), JetBrains Mono
(labels and technical data), all loaded as variable fonts via `next/font`.

**Conventions worth knowing:**

- Section gutters go on the `<section>` (`<section className="… px-6">` wrapping
  `mx-auto max-w-7xl`), never on the inner wrapper — nesting the gutter inside
  `max-w-7xl` pushes that section off the page's content grid at wide viewports.
- No hyphens or dashes in on-page homepage copy (site-owner preference).
  Enforced by `dashFreeCopy.ts`, which `HomepageCopyRules.test.tsx` runs
  against the rendered text of every homepage section and the compact footer.
  The rule covers rendered copy only, so hyphens in class names, hrefs and
  image alt text are unaffected, and the `·` separator in the footer is
  deliberately not treated as a dash.
- Decorative layers are `aria-hidden` + `pointer-events-none`, and are static —
  `ReducedMotionMatrix.test.tsx` pins that.

---

## Content governance

This is the part most likely to surprise you, and the part to preserve.

**Every numeral on the site must trace to a real, already-published figure.**
Anything unconfirmed renders a visible `Pending confirmation` placeholder
instead of a plausible-looking number. Simulated or concept interfaces must
carry a visible label saying so — `simulatedLabel.ts` enforces the wording.

Proposals to publish anything new are tracked as **Change Proposals (`OCP-NN`)**
in code comments next to the content they gate, each `approved`, `rejected` or
`open`. `changeProposal.ts` encodes the rule that work is ready only when every
linked proposal is approved, and that an open proposal must carry an actual
question.

`src/lib/validators/` holds the enforcement, all pure and dependency-free:

| Validator | Enforces |
| --- | --- |
| `bannedTerms` | Placeholder copy contains no coordinates, range/speed/unit figures, GPS, serials or `AES-` references |
| `dashFreeCopy` | On-page homepage copy contains no hyphens or dashes |
| `sensitiveContent` | Content that must not be published |
| `simulatedLabel` | Concept/simulated UI is explicitly labelled |
| `placeholderMedia` | Placeholder media is registered and compliant |
| `colorToken` · `contrastDirection` | Achromatic palette and contrast direction |
| `decorativeElement` | Decorative elements stay out of the accessibility tree |
| `sectionContent` · `personaOrder` | Section content shape and audience ordering |
| `footerLink` · `navActiveItem` | Navigation and footer correctness |
| `changeProposal` | Change-Proposal gating |

Two suites in that directory have no module of their own and assert against
fixtures and the real components instead: `contrastRatio.test.ts` (measured
contrast ratios) and `placeholderMediaRegistry.test.ts` (the placeholder-media
registry, scanned with `bannedTerms`).

If you add a figure, a customer name, a location or a screenshot of a working
system, expect to justify it against these — that discipline is why the site
reads as credible.

---

## Motion

Lenis handles smooth scroll and drives `gsap.ticker`, so GSAP, ScrollTrigger and
the custom field below all share one clock instead of competing rAF loops. See
`providers/LenisProvider.tsx`.

`lib/motion/scrollLerpField.ts` is a continuous per-element scroll-progress
field with per-element damping. Every element derives its own progress from its
own position and eases toward it, so nothing "fires": motion is fully reversible,
scroll velocity becomes visible as lag, and arriving mid-section via a deep link
or scroll restoration is correct on the first frame with no extra bookkeeping.
Element offsets are cached per layout, so the per-frame path does zero layout
reads.

**Reduced motion is a first-class branch, not an afterthought.** Components gate
on `usePrefersReducedMotion` or `gsap.matchMedia()`, and hidden start states are
written from JS only — never from a CSS class — so that under
`prefers-reduced-motion: reduce` nothing is created and content renders fully
visible. `ReducedMotionMatrix.test.tsx` asserts each row of that matrix against
the real components under both settings.

---

## Testing

```bash
npm test
```

Vitest with jsdom and Testing Library; `fast-check` is available for
property-based tests. Coverage concentrates where a bug would be silent rather
than loud — the validators above, the reduced-motion matrix, and
`PinnedSpecSheet.test.tsx`, which pins the invariant that a spec readout never
displays a fabricated figure while its scramble animation is mid-flight.

---

## Local-only files

`PAWAAC_CONTEXT.md` is a private company reference imported by `CLAUDE.md`. It
is gitignored and intentionally absent from this repository — the `@` import
simply no-ops without it. Do not commit it, and do not paste its contents into
code comments, issues or PRs; this repository is public.
