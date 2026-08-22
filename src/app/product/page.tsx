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
// The page is now ordered as an argument rather than a spec dump:
//
//   1. ProductHero            what the platform is
//   2. ProductOperatingLoop   how it works, as one closed cycle (the core
//                             of the request: the seven steps, the human
//                             oversight branch, GPS denied navigation)
//   3. ProductDetectionDemo   the Detect step shown rather than described,
//                             with an illustrative annotated clip of real
//                             flight footage
//   4. ProductHardware        the two airframes that fly that cycle
//                             (HawkAI Plus, Sentrivion) with real photos
//   5. ProductDockCharging    the dock that starts and ends it, with the
//                             dock image the site owner supplied
//   6. ProductSensorPayload   the payload that does the looking (existing
//                             3D viewer, unchanged)
//   7. ProductSpecifications  closing CTA — figures on request
//
// Sections 4 and 5 are adjacent on purpose: they are the two halves of the
// same answer ("what runs the loop"), split only because the dock asset is a
// white-background image and therefore belongs in the white band.
import ProductHero from "@/components/sections/ProductHero";
import ProductOperatingLoop from "@/components/sections/ProductOperatingLoop";
import ProductDetectionDemo from "@/components/sections/ProductDetectionDemo";
import ProductHardware from "@/components/sections/ProductHardware";
import ProductDockCharging from "@/components/sections/ProductDockCharging";
import ProductSensorPayload from "@/components/sections/ProductSensorPayload";
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
      <ProductOperatingLoop />
      <ProductDetectionDemo />
      <ProductHardware />
      <ProductDockCharging />
      <ProductSensorPayload />
      <ProductSpecifications />
      <Footer />
    </>
  );
}
