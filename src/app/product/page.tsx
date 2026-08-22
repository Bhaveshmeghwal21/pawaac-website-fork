import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";

// Spec: pawaac-design-language-evolution — Task 10 (Product_Page route)
// Requirements: 1.1, 4.1, 4.3, 4.4, 5.1, 5.4, 9.6, 9.7
// Design: design.md -> Page Specifications -> Product_Page
//
// Establishes the `/product` route, reached from the primary nav item now
// labeled "Platform" (site-owner request, current session — the route itself
// is unchanged).
//
// Site-owner request (current session): "fill the platform page exactly how
// does the proposed solution by pawaac platform, in short ... how are they
// gonna work how do we plan to do surveillance this whole page is for that".
// The page is now ordered as an argument rather than a spec dump.
//
// Order revision (site-owner request, current session): "in platform before
// explaining how the platform works, add the airframes photos first, then use
// drone vision model output second then explaination of whole platform", then
// "move this section before explaination as well and hide sense every angle
// section in platform page" — "this section" being the dock, which the previous
// revision had left downstream of the loop.
//
// The page therefore front loads everything physical and shows the explanation
// last, as the thing that ties the hardware together rather than the thing that
// introduces it:
//
//   1. ProductHero            what the platform is
//   2. ProductHardware        the two airframes, with real photos
//   3. ProductDetectionDemo   what the onboard vision produces, as an
//                             illustrative annotated clip of real footage
//   4. ProductDockCharging    the dock the aircraft lives in
//   5. ProductOperatingLoop   how it all works, as one closed cycle (the seven
//                             steps, the human oversight branch, GPS denied
//                             navigation)
//   6. ProductSpecifications  closing CTA — figures on request
//
// ProductSensorPayload (the 3D drone viewer, "Sense every angle") is HIDDEN at
// the site owner's request, not deleted — same treatment as the five hidden
// routes described in the README. The component is untouched on disk and still
// works; only its import and render call were removed here. To restore it, add
// back:
//
//   import ProductSensorPayload from "@/components/sections/ProductSensorPayload";
//
// and render <ProductSensorPayload /> between <ProductOperatingLoop /> and
// <ProductSpecifications />, which is where it sat. ProductPlatformPage.test.tsx
// pins that it stays out until then, so an accidental re-add fails loudly rather
// than silently changing the page.
//
// Persona ordering note: ProductDockCharging is tagged Enterprise_Persona and
// now renders before two Defense_Police_Persona sections (ProductOperatingLoop
// carries no tag, but ProductSpecifications does). Property 7's ordering
// preference is therefore not satisfied on this page any more. That is a
// deliberate, site-owner-directed override of a design-doc preference, recorded
// here and in ProductDockCharging.tsx rather than quietly ignored. Property 7 is
// enforced by personaOrder.ts against its own fixtures, not against this page,
// so nothing fails; the note exists so the next person does not "fix" the order
// back and undo an explicit request.
import ProductHero from "@/components/sections/ProductHero";
import ProductHardware from "@/components/sections/ProductHardware";
import ProductDetectionDemo from "@/components/sections/ProductDetectionDemo";
import ProductDockCharging from "@/components/sections/ProductDockCharging";
import ProductOperatingLoop from "@/components/sections/ProductOperatingLoop";
import ProductSpecifications from "@/components/sections/ProductSpecifications";

export const metadata: Metadata = {
  // Site-owner request (current session): visible label renamed from
  // "Product" to "Platform", matching the primary nav item rename. The
  // route itself stays /product (internal identifiers — ProductHero,
  // Product_Page in spec comments, the URL — are left as-is, same
  // treatment as the earlier News -> Blogs label rename before its route
  // was separately renamed).
  title: "Platform · PAWAAC Drones",
  description:
    "How the Pawaac platform runs a watch: dock, dispatch, patrol, detect, escalate, return and swap, as one closed cycle with human oversight.",
};

export default function ProductPage() {
  return (
    <>
      <ProductHero />
      <ProductHardware />
      <ProductDetectionDemo />
      <ProductDockCharging />
      <ProductOperatingLoop />
      <ProductSpecifications />
      <Footer />
    </>
  );
}
