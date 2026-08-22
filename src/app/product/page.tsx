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
// drone vision model output second then explaination of whole platform". The
// hardware and detection sections were previously downstream of the operating
// loop; they now precede it, so the page shows the aircraft and what it sees
// before explaining the cycle those two things serve:
//
//   1. ProductHero            what the platform is
//   2. ProductHardware        the two airframes, with real photos
//   3. ProductDetectionDemo   what the onboard vision produces, as an
//                             illustrative annotated clip of real footage
//   4. ProductOperatingLoop   how it works, as one closed cycle (the seven
//                             steps, the human oversight branch, GPS denied
//                             navigation)
//   5. ProductDockCharging    the dock that starts and ends that cycle, with
//                             the dock image the site owner supplied
//   6. ProductSensorPayload   the payload that does the looking (existing
//                             3D viewer, unchanged)
//   7. ProductSpecifications  closing CTA — figures on request
//
// ProductHardware and ProductDockCharging were previously adjacent, as the two
// halves of one answer ("what runs the loop"). That pairing is deliberately
// given up here: the site owner's order puts the airframes early as the
// concrete thing a reader recognises, while the dock only makes sense once the
// cycle has been described, since its whole job is starting and ending that
// cycle. The dock also has to stay in its own white band, which is what the
// asset's white studio background requires (see ProductDockCharging.tsx), so
// moving it up would have put a bright band between the two dark sections the
// site owner asked to lead with.
import ProductHero from "@/components/sections/ProductHero";
import ProductHardware from "@/components/sections/ProductHardware";
import ProductDetectionDemo from "@/components/sections/ProductDetectionDemo";
import ProductOperatingLoop from "@/components/sections/ProductOperatingLoop";
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
      <ProductHardware />
      <ProductDetectionDemo />
      <ProductOperatingLoop />
      <ProductDockCharging />
      <ProductSensorPayload />
      <ProductSpecifications />
      <Footer />
    </>
  );
}
