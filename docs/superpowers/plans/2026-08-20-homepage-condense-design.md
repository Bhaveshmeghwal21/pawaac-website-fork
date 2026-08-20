# Homepage Condense Design

## Goal

Turn the homepage into a shorter, six-section story for laptop and mobile, keep the sunset/drone photograph exclusive to the hero, and render homepage photography in its original color.

## Approved structure

1. Hero: cinematic image, value proposition, one primary CTA.
2. Operating story: a concise four-stage coverage loop with the concept interface integrated into the same section.
3. Platforms: one comparison section for HawkAI Plus and Sentrivion, with three headline specifications per platform.
4. Applications: one deliberate light section combining sector imagery and critical-site framing.
5. Planner: a tangible interactive proof point, with copy before media on mobile.
6. Company, trust, mission, and contact: one compact closing section followed by a compact footer.

## Visual system

- The sunset/drone image is scoped to the hero and no longer fixed behind the document.
- Subsequent sections use opaque black, charcoal, and one white contrast surface.
- Homepage photos render in color by default; technical airframe cutouts may remain muted decorative assets.
- Mobile section spacing is 48–64px; laptop spacing is 80–96px.
- Essential copy is visible without scroll-scrub animation.

## Responsive behavior

- Operating story: horizontal rail on laptop, concise stacked rows on mobile.
- Platforms: two columns on laptop, two compact stacked cards on mobile.
- Applications: four columns on wide screens and a 2×2 grid on mobile.
- Planner: copy precedes screenshot in DOM order at all sizes.
- Closing content and footer avoid additional full-screen beats.

## Acceptance criteria

- The homepage render tree contains six content sections plus the footer.
- `SkyScenery` is rendered by the hero and is no longer a page-level fixed backdrop.
- The redundant autonomy, enterprise, company-strip, and closing-vision sections are not rendered independently.
- Homepage sector, planner, and application photography has no grayscale CSS filter.
- Desktop and mobile homepage length are materially shorter than the audited 8,048px and 9,563px baselines.

