import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";

// User-requested follow-up (Product header dropdown, item 2 of 4):
// "Docking system" — net-new placeholder route. Existing dock-related
// content lives in src/components/sections/ProductDockCharging.tsx
// (rendered on /product); this route gives the docking system its own
// dedicated page, reusing the same placeholder-media conventions.
//
// FACTUAL CORRECTION (site-owner request, current session): "what dock does
// is swapping the battery not charging." This page carried the same wrong
// heading and body as ProductDockCharging.tsx ("Dock, charge, redeploy" /
// "The dock recharges and redeploys"). The site owner asked for the fix on
// the Platform page, but the identical claim here is wrong for the same
// reason and this route still resolves if visited directly even though it is
// hidden from navigation, so it is corrected in the same pass rather than
// left as a stale contradiction of the page that links nowhere.
import Reveal from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Docking System · PAWAAC Drones",
  description:
    "The dock that swaps the battery and redeploys the Pawaac drone automatically, without a human in the loop.",
};

export default function DockingSystemPage() {
  return (
    <>
      <section className="relative bg-bg px-6 py-28 md:py-36">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-2 md:items-center">
          <Reveal>
            {/* Site-owner request (current session): breadcrumb label
                updated from "Product / Docking System" to "Platform /
                Docking System", matching the primary nav item rename. This
                page is itself hidden from navigation as of the same
                session (see Navigation.tsx's PRODUCT_SUBLINKS-removal
                history) — updated for consistency since it still resolves
                directly at its URL. */}
            <p className="label">Platform / Docking System</p>
            <h1 className="mt-3 text-heading font-display text-fg">
              Dock, swap, redeploy automatically
            </h1>
            <p className="mt-4 max-w-md text-body font-body text-muted">
              The dock swaps the battery and redeploys the drone without a human
              in the loop.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div
              aria-hidden="true"
              className="relative mx-auto w-full max-w-sm border border-line"
              style={{ aspectRatio: "4 / 3" }}
            >
              <svg
                viewBox="0 0 200 150"
                className="h-full w-full p-10 text-muted"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="30" y="90" width="140" height="40" />
                <line x1="100" y1="90" x2="100" y2="40" />
                <circle cx="100" cy="30" r="10" />
                <line x1="70" y1="55" x2="130" y2="55" />
              </svg>
            </div>
          </Reveal>
        </div>
      </section>
      <Footer />
    </>
  );
}
