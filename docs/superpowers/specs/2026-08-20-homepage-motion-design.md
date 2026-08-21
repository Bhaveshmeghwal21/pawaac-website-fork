# Homepage Motion Design

## Goal

Add a restrained, cinematic motion layer to the approved six-section homepage without increasing page length, obscuring content, or competing with the aircraft imagery.

## Direction

Use GSAP for homepage mount and scroll choreography, while keeping the existing Lenis instance as the single smooth-scroll engine. Do not add Anime.js, pin sections, create horizontal scrolling, or introduce scroll distance solely for animation.

The motion personality is controlled and technical: short vertical settles, subtle image depth, small grouped staggers, and decisive easing. The page must remain readable and correctly laid out before JavaScript runs.

## Choreography

1. **Hero**
   - Wait for the first-visit preloader to finish before starting the entrance.
   - Settle the scenery from a very slight scale-up on laptop.
   - Reveal headline words with a short rise and opacity stagger; do not blur text.
   - Bring in supporting copy and CTA together after the headline begins.
   - Apply only a small hero-scoped vertical parallax on laptop.

2. **Operating story**
   - Trigger one timeline for the section.
   - Reveal the introduction, then the four operating stages as one staggered group.
   - Reveal oversight copy and interface media as a paired closing beat.

3. **Platforms**
   - Reveal the introduction followed by the two platform cards.
   - On laptop only, let each card image settle from a slight scale-up.
   - Treat each card's specifications as one group instead of separate triggers.

4. **Applications**
   - Reveal the introduction and supporting framing first.
   - Bring in the four application cards with a compact stagger.
   - Keep hover zoom as the only ongoing card-image interaction.

5. **Planner**
   - Reveal copy first and the screenshot shortly afterward with a small overlap.
   - Preserve copy-before-media DOM order and do not parallax the screenshot.

6. **Closing section and footer**
   - Reveal mission copy, contact panel, and credentials in two or three grouped beats.
   - Keep the compact footer static.

## Responsive and accessibility behavior

- Laptop/desktop: 16-24px entrance distances, 0.5-0.75 second durations, subtle hero parallax and card-image settle.
- Mobile: 8-12px entrance distances, 0.35-0.5 second durations, no parallax and no image-scale entrances.
- Reduced motion: no GSAP transforms, no scroll-linked motion, no animated preloader, and native scrolling instead of Lenis smoothing.
- Motion targets start visible in server-rendered markup. GSAP applies initial states only after hydration so failed or disabled JavaScript never hides content.

## Architecture

- Coordinate preloader completion through one explicit browser readiness signal rather than a fixed delay inside the hero.
- Use one reusable GSAP section orchestrator with scoped selectors and automatic cleanup.
- Keep roughly one `ScrollTrigger` per homepage section rather than one trigger per card or text block.
- Preserve the existing server/client component boundaries unless a component needs a ref or lifecycle for animation.

## Acceptance criteria

- The hero entrance is visible after the first-visit preloader exits.
- Each below-fold homepage section creates one grouped timeline when it approaches the viewport.
- The homepage adds no pinned space or artificial scroll length.
- Mobile disables parallax and large image transforms.
- `prefers-reduced-motion: reduce` produces immediately visible static content, skips the animated preloader, and disables Lenis smoothing.
- The compact footer has no entrance or scroll-linked animation.
- Desktop and mobile browser checks show no console errors, failed resources, horizontal overflow, or content left hidden after scrolling.
