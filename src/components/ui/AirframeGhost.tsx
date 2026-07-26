// AirframeGhost — an oversized airframe cutout used as a decorative section
// background, bleeding off the left or right edge of its host section.
//
// Site-owner request (current session): use the three product shots already in
// public/images as section backgrounds rather than as captioned figures —
// "extract only drone images from their bg", "no need for showing full photos,
// with labels", "just a background design like half of the drone on left side
// or right side".
//
// ── The assets ───────────────────────────────────────────────────────────
//
// Three alpha cutouts were derived from the site owner's own product shots and
// written alongside them in public/images:
//
//   airframe-sentrivion.webp   708x429   <- sentrivion-product-1.jpg
//   airframe-hawkai.webp      1041x580   <- hawkai-plus-product.jpg
//   airframe-hawkai-plan.webp  826x797   <- hawkai-plus-product-2.jpg
//
// The originals are untouched. Each cutout was matted off its backdrop (the
// Sentrivion shot was on pure black, the two HawkAI shots on a studio sweep
// and a workshop bench respectively), then flattened to R=G=B so these layers
// satisfy the strict achromatic palette (Requirement 3.1-3.2) on their own,
// with no `grayscale` filter needed at render time. That matters for
// hawkai-plus-product.jpg in particular, whose orange gimbal accent ring is
// the only saturated colour anywhere in the set. SkyScenery.tsx's real-colour
// photo remains the site's single deliberate exception to that rule, and this
// component does NOT extend it.
//
// ── Why there is a scrim ─────────────────────────────────────────────────
//
// Every section that hosts one of these sits over SkyScenery's fixed backdrop,
// which is a warm, high-contrast sunset photo that ALREADY CONTAINS A DRONE
// SILHOUETTE near the upper centre of the viewport. Two consequences:
//
//   - Dropped straight onto that photo, a second airframe reads as clutter
//     rather than as texture, so `opacity` is kept low and the hosts below
//     bias their layer toward the lower half of the section, away from where
//     the photo's own silhouette sits. Because SkyScenery is `fixed`, that
//     silhouette never moves on screen, so this can only be mitigated, not
//     solved, while that photo is the backdrop.
//   - The sunset is busy enough that a low-opacity cutout dissolves into it.
//     `scrim` lays a single-stop gradient of --color-bg down the bleed edge,
//     which locally calms the photo and gives the airframe a field to read
//     against. Set `scrim={0}` on a host that does not need it.
//
// Opacity is deliberately a per-host prop rather than a fixed constant: the
// hosts tint SkyScenery by different amounts (bg-bg/50 vs bg-bg/70) and sit
// over different parts of the photo, so the same alpha reads roughly twice as
// strongly in HomeClosingVision as it does in HomeSpecSheet.
//
// ── Why this layer is static ─────────────────────────────────────────────
//
// No scroll-linked motion, deliberately. This is a Pattern 1 oversized
// background texture, and ReducedMotionMatrix.test.tsx already pins that row:
// the site's Pattern-1 layers (the Display_Type word-mark spans behind each
// hero, and SkyScenery's own removed cloud drift) are static, aria-hidden, and
// identical under both motion settings. A parallaxing airframe would break
// that row rather than extend it, so there is nothing here for
// prefers-reduced-motion to gate.
//
// Requirement 10.6: purely decorative — aria-hidden, pointer-events-none, and
// excluded from the tab order. `alt=""` on the image for the same reason.
//
// ── Why `unoptimized` ────────────────────────────────────────────────────
//
// These three go through next/image with optimization OFF, deliberately.
// Verified against the running dev server: /_next/image negotiates output
// format from the request's Accept header, and on the fallback path — any
// client not advertising image/webp or image/avif — it re-encodes to
// image/jpeg. JPEG has no alpha channel, so the matte is discarded and the
// cutout comes back fully opaque (sampled corner alpha 255 instead of 0),
// which would render each of these as a hard rectangle with the source shot's
// original black/grey backdrop baked in. Measured, same asset, same URL:
//
//   Accept: image/avif,image/webp,...  -> image/webp  30.9 KB  corner a=0
//   Accept: image/png,image/jpeg,...   -> image/jpeg  15.4 KB  corner a=255
//
// Modern browsers all take the first path, so this would have shipped looking
// correct nearly everywhere and failed as a visible black box on the tail.
// Optimization is also close to pointless here: these files are already
// hand-matted WebP written at the exact pixel sizes the layout asks for
// (708-1041px wide), so the optimizer's only real contribution was 7.5 KB of
// recompression on a lazy-loaded decorative layer. Serving the originals
// straight from /public removes the failure mode entirely.
import Image from "next/image";

export type AirframeGhostProps = {
  /** Path under /public. */
  src: string;
  /** Intrinsic pixel dimensions of `src`, for next/image. */
  width: number;
  height: number;
  /** Which edge the airframe bleeds off. */
  side: "left" | "right";
  /**
   * Width + vertical placement classes for the airframe layer itself, e.g.
   * `w-[110vw] bottom-0 md:w-[58vw]`. Use `top-*`/`bottom-*`/`inset-y-*` for
   * vertical placement — NOT a translate utility, which would land on the
   * `translate` CSS property and compose with the horizontal bleed transform
   * below rather than replacing it.
   */
  className?: string;
  /**
   * Base layer opacity, which in practice means the MOBILE value. Tuned per
   * host — see the note above.
   *
   * Applied as `opacity: var(--airframe-opacity, <opacity>)`, so a host can
   * raise it at a breakpoint with a static arbitrary-property class such as
   * `md:[--airframe-opacity:0.58]` in `className`. That indirection exists
   * because the safe opacity genuinely differs by breakpoint rather than being
   * a styling preference: the spec rail collapses from three columns to two on
   * mobile, so different --color-muted labels end up over the airframe, and the
   * sky photo's bright sun band sits much closer to the copy at 390px.
   */
  opacity?: number;
  /** Fraction of the airframe's own width held off-canvas past `side`. */
  bleed?: number;
  /** Strength of the bleed-edge gradient scrim. 0 disables it. */
  scrim?: number;
  /**
   * Where the scrim gradient starts, as a fraction of the section width
   * measured from the edge OPPOSITE `side`. Everything before it is fully
   * transparent, and the ramp to --color-bg runs from here to the bleed edge.
   * Lower values darken more of the section, which is what lets a large,
   * high-opacity airframe read as brighter than SkyScenery instead of merely
   * blending harder into it.
   */
  scrimStart?: number;
  /**
   * Fraction of the airframe's own width over which it ramps from fully
   * transparent (its inner edge) to fully opaque (its bleed edge). 0 disables
   * the mask and the layer renders flat.
   *
   * This is what makes a bright airframe survive contact with body copy. The
   * palette's --color-muted (#8a8a8a) labels are dark enough that they need a
   * near-black backdrop to clear WCAG AA, and measured on the real composite
   * they drop as low as 2.3:1 over a flat, high-opacity airframe. Ramping the
   * layer so it only reaches full brightness out at the bleed edge — away from
   * the content column — keeps the airframe reading as brighter than the sky
   * where it actually lives, without lighting up the ground under the text.
   */
  fade?: number;
  sizes?: string;
};

export default function AirframeGhost({
  src,
  width,
  height,
  side,
  className = "",
  opacity = 0.16,
  bleed = 0.3,
  scrim = 0.6,
  scrimStart = 0.42,
  fade = 0,
  sizes = "(min-width: 768px) 60vw, 110vw",
}: AirframeGhostProps) {
  // Ramps away from the bleed edge, so `to right` for a right-side bleed means
  // transparent at the layer's left (inner) edge and opaque at its right.
  const mask =
    fade > 0
      ? `linear-gradient(to ${side}, transparent 0%, #000 ${fade * 100}%)`
      : undefined;
  return (
    // No z-index: this matches the Display_Type texture span in HomeHero.tsx /
    // HomeAutonomyTeaser.tsx, whose hosts pair an un-z-indexed decorative
    // layer with a `relative z-10` content wrapper. `overflow-hidden` here
    // rather than on the host section means the bleed is clipped locally and
    // no host has to change its own overflow to contain this.
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 select-none overflow-hidden"
    >
      {scrim > 0 && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to ${side}, transparent ${scrimStart * 100}%, var(--color-bg) 100%)`,
            opacity: scrim,
          }}
        />
      )}

      <div
        className={`absolute ${side === "right" ? "right-0" : "left-0"} ${className}`}
        style={{
          opacity: `var(--airframe-opacity, ${opacity})`,
          transform: `translateX(${side === "right" ? "" : "-"}${bleed * 100}%)`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      >
        <Image
          src={src}
          alt=""
          width={width}
          height={height}
          sizes={sizes}
          unoptimized
          className="h-auto w-full"
        />
      </div>
    </div>
  );
}
