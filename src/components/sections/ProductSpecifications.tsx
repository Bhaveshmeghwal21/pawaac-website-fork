// Spec: pawaac-design-language-evolution — Task 68 (Product_Page Section 2, supersedes Task 10)
// Requirements: 4.1, 4.2
// Design: design.md -> Page Specifications -> Product_Page, Section 2
//         (Specifications)
//
// Persona: Defense_Police_Persona. OCP-07 is now resolved: real,
// brochure-confirmed specifications live on the two dedicated product
// sub-pages (src/app/product/hawkai, src/app/product/sentrivion — tasks
// 66/67). This top-level Section 2 no longer houses a blended-numerals
// Pinned_Spec_Sheet (that usage has been removed entirely); it is now a
// brief lead-in, per design.md's updated Product_Page table.
//
// Site-owner request (current session): "hide sentrivion page and hawkai
// page" — this section's two CTAs used to link directly to
// /product/hawkai and /product/sentrivion, which would now be dead ends
// for a visitor (the pages still resolve, but nothing else on the site
// points at them). Replaced with one CTA to /contact, the same move
// already made for HomeSpecSheet.tsx's "View platform" links earlier this
// session, rather than leaving a lead-in paragraph that promises "the
// HawkAI Plus and Sentrivion pages" with no way to reach them.
import Link from "next/link";

export default function ProductSpecifications() {
  return (
    <section className="relative bg-bg px-6 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Site-owner request (current session): visible label renamed from
            "Product" to "Platform", matching the primary nav item rename. */}
        <p className="label">Platform</p>
        <h2 className="mt-3 text-heading font-display text-fg">
          Specifications
        </h2>
        <p className="mt-4 max-w-md text-body font-body text-muted">
          Contact us for full, confirmed hardware specifications on both
          airframes.
        </p>

        <div className="mt-8">
          <Link
            href="/contact"
            className="inline-block border border-fg px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-fg transition-colors hover:bg-fg hover:text-bg"
          >
            Contact us for specifications
          </Link>
        </div>
      </div>
    </section>
  );
}
