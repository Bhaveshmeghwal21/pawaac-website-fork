"use client";

// Spec: pawaac-design-language-evolution — Task 10 (Product_Page Section 4)
// Requirements: 4.1, 4.3, 5.1, 5.4
// Design: design.md -> Page Specifications -> Product_Page, Section 4
//         (Dock & charging) — OCP-08 resolved via site-owner-delegated
//         judgment
//
// FACTUAL CORRECTION (site-owner request, current session): "remove charging
// in this page, as what dock does is swapping the battery not charging."
// This section previously read "Dock, charge, redeploy" and "The dock
// recharges and redeploys the drone". Both were wrong about the mechanism:
// the dock swaps the battery, it does not recharge the aircraft in place.
// All charging language is therefore gone from this section's visible copy,
// and ProductPlatformPage.test.tsx pins that it stays gone.
//
// Two knock-on notes:
//   * The em dash in the old heading was removed in the same request, so
//     the heading is now "Dock, swap, redeploy automatically".
//   * The filename and exported component are still ProductDockCharging.
//     Renaming them is a separate call the site owner has not asked for, and
//     this repo's convention through this whole session has been to change
//     visible copy without churning internal identifiers (same as the News
//     -> Blogs label rename, and Product -> Platform, where the /product
//     route and ProductHero kept their names). The spec citation above also
//     still names design.md's "Dock & charging" section, which is a
//     historical reference and not a claim.
//
// Persona: Enterprise_Persona. Placed after the Defense_Police_Persona
// sections per the persona-ordering policy (Property 7).
//
// OCP-08 history: this section previously rendered a generated SVG
// technical diagram, on the explicit grounds that "no real dock photo
// exists in any asset" and an abstract placeholder would have implied a
// product photo that did not exist.
//
// Site-owner request (current session): that is no longer true — the site
// owner supplied a dock image (originally D:\LionXdrones\images\dock.avif,
// converted to public/images/dock-station.webp to match the repo's existing
// .webp airframe assets) and asked for it to be used on this page. The SVG
// diagram is therefore replaced by the real asset.
//
// The visible caption below says "design visualization" rather than
// presenting this as a photograph of a deployed unit. That wording is
// deliberate and conservative: the image reads as a studio product
// visualization on a white background, and this repo's content governance
// requires that imagery not imply a deployment or a built-and-fielded
// system that has not been published as such (see README -> Content
// governance). If the site owner confirms this is a photograph of a real
// built dock, the caption is the only line that needs to change.
//
// This section is a white band, which is why it is the right home for this
// particular asset: the source image has a white studio background, so it
// sits flush here instead of appearing as a bright rectangle on the dark
// sections above. The grayscale filter is the site's standard resting-state
// treatment (Requirement 5.1, 5.4) and also neutralises the only colour in
// the frame (the red/yellow emergency stop buttons), keeping the achromatic
// palette rule intact with no new documented exception.
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";

// What the dock contributes to the loop, in the order the loop uses it.
// Each line describes structure visible in the image or restates an
// already-published capability; none introduces a figure.
const DOCK_ROLE = [
  {
    step: "Dock",
    body: "Encloses the aircraft on site, so it waits where it is needed instead of in a case.",
  },
  {
    step: "Dispatch",
    body: "Opens and releases the aircraft on schedule or on demand.",
  },
  {
    step: "Swap",
    body: "Recovers the aircraft and swaps the battery, ready for the next flight.",
  },
];

export default function ProductDockCharging() {
  return (
    <section className="relative bg-white px-6 py-28 text-[#080808]">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <Reveal>
            <p className="label text-[#6b6b6b]">The dock</p>
            <h2 className="mt-3 text-heading font-display text-[#080808]">
              Dock, swap, redeploy automatically
            </h2>
            <p className="mt-4 max-w-md text-body font-body text-[#454545]">
              The dock swaps the battery and redeploys the drone without a human
              in the loop. It is what makes the cycle a cycle: the aircraft has
              somewhere to return to, and returning is what lets it go out
              again.
            </p>

            <dl className="mt-8 space-y-4 border-t border-[#d6d6d6] pt-6">
              {DOCK_ROLE.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <dt className="technical-data w-20 shrink-0 text-[#080808]">
                    {item.step}
                  </dt>
                  <dd className="text-sm leading-relaxed text-[#454545]">
                    {item.body}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.1}>
            <figure>
              <div className="relative w-full border border-[#d6d6d6] bg-white">
                {/* The source asset is 1024x422 (a wide, shallow frame with
                    the aircraft sitting on top of the dock). object-contain
                    on a matching wide aspect box keeps the aircraft in
                    frame; object-cover would crop it off the top. */}
                <div
                  className="relative w-full"
                  style={{ aspectRatio: "1024 / 422" }}
                >
                  <Image
                    src="/images/dock-station.webp"
                    alt="Pawaac dock with its side panels open and an aircraft resting on the landing surface above the equipment bay"
                    fill
                    sizes="(min-width: 768px) 50vw, 90vw"
                    className="object-contain grayscale"
                  />
                </div>
              </div>
              {/* Mandatory provenance caption — see the header comment. */}
              <figcaption className="technical-data mt-3 text-[#6b6b6b]">
                Dock design visualization
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
