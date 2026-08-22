"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/ui/Logo";

// Internal navigation uses next/link, not raw <a>.
//
// Every internal link in the header was an <a>, which makes each click a full
// document request: the App Router is bypassed, the page goes white, and Lenis,
// GSAP and the scroll-progress field all tear down and re-initialise. On a site
// whose design language is built on continuous motion that was the most visible
// quality defect in the build, and @next/next/no-html-link-for-pages reported it
// as a lint error on the logo. External destinations stay as <a>.
const MotionLink = motion.create(Link);

// Spec: pawaac-design-language-evolution, Task 57 (supersedes Task 17)
// Requirements: 1.1, 1.5, 1.6
// Design: design.md -> Shared Components -> Header / Navigation
//
// Exactly 4 primary items, in this order, pointing to real Pawaac_Site
// routes/dropdowns. Deployments was removed from primary Navigation (moved
// to Footer-only, task 58, Requirement 1.8); Planner and Log Analyser live
// under Resources, while News and Our Commitments live under Company.
//
// "Product" carries a dropdown exposing the 4 product lines. The 4th line
// is named "HawkAI" (site owner has finalized the name; previously
// "Quadcopter (name pending)").
//
// CTA rename (site-owner request, current session): the header's primary
// CTA button (still linking to /contact, Requirement 1.7) is now labeled
// "Contact Us" rather than "Request Demo" — text change only, no route
// change. See the matching HomeContactBand.tsx rename for the homepage's
// closing CTA.
const PRODUCT_SUBLINKS = [
  { label: "Software Stack", href: "/product/software-stack" },
  { label: "Docking System", href: "/product/docking-system" },
  { label: "Sentrivion", href: "/product/sentrivion" },
  { label: "HawkAI", href: "/product/hawkai" },
];

// Resources_Menu dropdown contents, in order (Requirement 1.1, design.md ->
// Header / Navigation). "Log Analyser" is the sole external destination and
// carries the same External_Link_Marker treatment as Footer's external
// links (Requirement 2.3's marker pattern), applied here too.
const RESOURCES_SUBLINKS = [
  { label: "Planner", href: "/designer" },
  {
    label: "Log Analyser",
    href: "https://analyse.bajrangdrone.tech",
    external: true,
  },
];

// Routes that drive the Resources active-item indicator (Requirement
// 1.5–1.6, Correctness Property 14). Analyser is external and therefore
// cannot itself be "the current page", so it is intentionally excluded.
const RESOURCES_ACTIVE_ROUTES = ["/designer"];

// Company_Menu dropdown contents, in order.
//
// Site-owner request (current session): "Careers" is promoted out of this
// dropdown into its own primary nav item (see LINKS below), so the site's
// most conversion-relevant page for candidates is one click instead of two.
// This supersedes the original site-owner request recorded below, which put
// Careers here in the first place — Company keeps href="/company" so the
// "Company" label itself still navigates to the existing Company_Page,
// following the same both-link-AND-trigger pattern used for Product. The
// first child, "About Us", is an intentional duplicate destination of the
// trigger itself (the same convention many sites use: the top-level label
// and its first dropdown entry both resolve to the same About/company page).
// News and Our Commitments are grouped here as company-facing pages.
//
// Original request that first placed Careers here: "no careers page, about
// us, contact us page in ... Company section ... make company as dropdown
// and put these under that."
const COMPANY_SUBLINKS = [
  { label: "About Us", href: "/company" },
  { label: "Contact Us", href: "/contact" },
  { label: "Blogs", href: "/news" },
  { label: "Our Commitments", href: "/commitments" },
];

// Routes that drive the Company active-item indicator (Requirement
// 1.5–1.6, Correctness Property 14), mirroring RESOURCES_ACTIVE_ROUTES:
// Company shows active on its own page as well as on its dropdown-linked
// company pages: Contact, News, and Our Commitments. Careers is excluded —
// it now drives its own primary-item indicator instead (see LINKS below).
const COMPANY_ACTIVE_ROUTES = [
  "/company",
  "/contact",
  "/news",
  "/commitments",
];

type SubLink = {
  label: string;
  href: string;
  external?: boolean;
};

// Resources has no own route — it is purely a Label_Caps dropdown trigger
// (design.md -> Header / Navigation: "each a Label_Caps link or, for
// Resources, a Label_Caps dropdown trigger"), unlike Product and Company,
// which are both a real link AND a dropdown trigger. `href` is therefore
// intentionally omitted for Resources; the trigger renders as a <button>
// rather than an <a> below.
// Site-owner request (current session): hide /autonomy from discoverable
// navigation "for now". The route and its four section components
// (AutonomyHero, AutonomyVisionAI, AutonomyDispatch, AutonomySafeguards) are
// left entirely on disk and still resolve at /autonomy — this only removes
// the link, per this repo's "don't delete, don't break things" convention.
// Re-add `{ label: "Autonomy", href: "/autonomy" }` here to restore it.
const LINKS: {
  label: string;
  href?: string;
  children?: SubLink[];
}[] = [
  { label: "Product", href: "/product", children: PRODUCT_SUBLINKS },
  { label: "Resources", children: RESOURCES_SUBLINKS },
  // Site-owner request (current session): promoted out of the Company
  // dropdown into its own primary item — see COMPANY_SUBLINKS above.
  { label: "Careers", href: "/careers" },
  { label: "Company", href: "/company", children: COMPANY_SUBLINKS },
];

// External_Link_Marker (Requirement 2.3's marker pattern, reused here per
// design.md's Header / Navigation section): a small monochrome
// diagonal-arrow glyph (aria-hidden="true") immediately followed by
// visually-hidden text "(opens external site)", matching Footer.tsx's
// ExternalLinkMarker exactly.
function ExternalLinkMarker() {
  return (
    <>
      {" "}
      <span aria-hidden="true">↗</span>
      <span className="sr-only">(opens external site)</span>
    </>
  );
}

export default function Navigation() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Which desktop dropdown is open, by label.
  //
  // The panels used to be hover-only (`group-hover/nav:` plus
  // `group-focus-within/nav:`), which left them unreachable on any touch device
  // wide enough to get the desktop layout — an iPad in portrait is 768px, so it
  // gets the desktop nav and the `md:hidden` drawer stays hidden, and there is
  // no hover event to open Resources with. That made /designer and the Log
  // Analyser unreachable from the header on that class of device. Hover still
  // works exactly as before; this adds an explicit, keyboard- and
  // touch-operable path on top of it.
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Close any open dropdown when the route changes. Done during render rather
  // than in an effect: `react-hooks/set-state-in-effect` (an error in this
  // config) forbids a synchronous setState in an effect body, and this is the
  // pattern React documents for resetting state when an input changes.
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setOpenMenu(null);
  }

  useEffect(() => {
    // Requirements: 1.5, 1.6 / Design: Header / Navigation
    // Scroll threshold refined from 50px -> 24px to match design.md's
    // "transparent at scroll 0, transitioning ... once scrolled > 24px".
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Dismiss an open dropdown on Escape or on a click outside the header. Only
  // attached while something is actually open, so the common case adds no
  // listeners. setState happens inside the callbacks, not in the effect body,
  // so this does not trip react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!openMenu) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (target && !(target as Element).closest?.("header")) setOpenMenu(null);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openMenu]);

  return (
    <>
      <header
      className={`fixed inset-x-0 top-0 z-[90] transition-colors duration-300 ${
        scrolled
          ? "bg-black/72 backdrop-blur-[16px] border-b border-line"
          : "bg-transparent"
      }`}
    >
      {/*
        Skip-to-content link (Requirement 10.5): first focusable element in
        the render tree, visually hidden until focused, moves focus to the
        <main id="main-content"> wrapper set in src/app/layout.tsx.
      */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-fg focus:px-4 focus:py-2 focus:font-mono focus:text-[11px] focus:font-semibold focus:uppercase focus:tracking-[0.1em] focus:text-bg"
      >
        Skip to content
      </a>

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 text-fg">
          <Logo className="h-7 w-7" />
          <span className="font-display text-lg font-bold tracking-tight text-fg">
            PAWAAC
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => {
            // Requirements: 1.5, 1.6 / Design: Header / Navigation ->
            // Active-item indicator, Correctness Property 14.
            // Product and Autonomy are active only on an exact route match
            // to their own page. Resources has no own route, so it instead
            // shows active on its Planner route — Analyser is external and
            // cannot itself be "the current page", so it does not drive the
            // indicator. Company shows active on its own page and on its
            // Company_Menu-linked routes: Careers, Contact, News, and Our
            // Commitments. No item is active on Homepage ("/") or any other
            // non-matching route (Deployments_Page has been removed
            // entirely — task 65).
            const isResourcesActive = RESOURCES_ACTIVE_ROUTES.includes(
              pathname ?? "",
            );
            const isCompanyActive = COMPANY_ACTIVE_ROUTES.includes(
              pathname ?? "",
            );
            const isActive =
              l.label === "Resources"
                ? isResourcesActive
                : l.label === "Company"
                  ? isCompanyActive
                  : pathname === l.href;
            const hasChildren = !!l.children?.length;
            const isMenuOpen = openMenu === l.label;
            // Resources has no route of its own, so its trigger is the
            // disclosure control itself. Product and Company are real links AND
            // dropdown triggers, so they keep navigating on click and get a
            // separate chevron button beside them — a <button> cannot be nested
            // inside an <a>, and hijacking the link's own click would take away
            // the ability to reach /product and /company at all on touch.
            const isSelfTrigger = hasChildren && !l.href;

            return (
              <li key={l.label} className={hasChildren ? "group/nav relative" : ""}>
                <span className="flex items-center gap-1.5">
                  {l.href ? (
                    <Link
                      href={l.href}
                      aria-current={isActive ? "page" : undefined}
                      aria-haspopup={hasChildren ? "true" : undefined}
                      aria-expanded={hasChildren ? isMenuOpen : undefined}
                      className={`label group relative flex items-center !text-white transition-colors hover:text-fg ${
                        isActive ? "text-fg" : "text-muted"
                      }`}
                    >
                      {l.label}
                      <span
                        className={`absolute -bottom-1 left-0 h-px bg-interactive transition-all duration-300 ${
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      aria-current={isActive ? "page" : undefined}
                      aria-haspopup="true"
                      aria-expanded={isMenuOpen}
                      onClick={() => setOpenMenu(isMenuOpen ? null : l.label)}
                      className={`label group relative flex items-center gap-1.5 !text-white transition-colors hover:text-fg ${
                        isActive ? "text-fg" : "text-muted"
                      }`}
                    >
                      {l.label}
                      <span
                        aria-hidden="true"
                        className={`mt-px inline-block text-[9px] transition-transform duration-200 group-hover/nav:rotate-180 ${
                          isMenuOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▾
                      </span>
                      <span
                        className={`absolute -bottom-1 left-0 h-px bg-interactive transition-all duration-300 ${
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </button>
                  )}

                  {hasChildren && !isSelfTrigger && (
                    <button
                      type="button"
                      // Names the item so the control is unambiguous in a screen
                      // reader's element list, where "Show submenu" on its own
                      // would be meaningless repeated four times.
                      aria-label={`${isMenuOpen ? "Hide" : "Show"} ${l.label} submenu`}
                      aria-expanded={isMenuOpen}
                      onClick={() => setOpenMenu(isMenuOpen ? null : l.label)}
                      // Site-owner report (current session): "the dropdown
                      // ones have downward arrow but 2 of them have grey or
                      // black". Product and Company render their chevron as
                      // this separate button (a <button> cannot nest inside
                      // the <a>), which was styled `text-muted` (#8a8a8a)
                      // while Resources' chevron sits inside its own
                      // `!text-white` trigger and so rendered white. Against
                      // the bright hero photo the grey ones were close to
                      // invisible. Matched to the Resources chevron.
                      //
                      // Follow-up report: "these arrow positioning ... they
                      // are at the bottom (product and company only)". Cause
                      // was this button not being a flex container, unlike the
                      // Resources trigger (`flex items-center`) whose chevron
                      // is therefore a vertically centred flex item. Here the
                      // 9px glyph was an inline-block sitting on the baseline
                      // of a line box sized by the inherited ~16px font, which
                      // pushed it well below the label's optical centre.
                      // `flex items-center` plus `leading-none` on the glyph
                      // collapses the line box to the glyph itself and centres
                      // it, matching Resources exactly.
                      className="-m-1 flex items-center p-1 !text-white transition-colors hover:text-fg"
                    >
                      <span
                        aria-hidden="true"
                        className={`inline-block text-[9px] leading-none transition-transform duration-200 group-hover/nav:rotate-180 ${
                          isMenuOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▾
                      </span>
                    </button>
                  )}
                </span>

                {hasChildren && (
                  // Bugfix (site-owner report, current session): the panel
                  // used to sit a visual `mt-2` (8px) below the trigger.
                  // That gap was dead space outside this <li>'s own
                  // hoverable box (the <li> is only as tall as the trigger
                  // row; the panel is absolutely positioned, so it does not
                  // stretch the <li> to cover the space below it) — moving
                  // the cursor diagonally toward the panel crossed that gap
                  // and instantly dropped `group-hover/nav`, since plain
                  // CSS hover has no tolerance for momentarily leaving the
                  // hovered box. Fixed by dropping the `mt-2` entirely: the
                  // panel now sits flush against the trigger row
                  // (`top-full`, no margin), so there is no gap left to
                  // cross and the hover path from label to panel is
                  // continuous.
                  <ul
                    className={`absolute left-0 top-full z-[91] w-56 border border-line bg-black/95 py-2 backdrop-blur-[16px] transition-opacity duration-200 group-hover/nav:visible group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:opacity-100 ${
                      isMenuOpen ? "visible opacity-100" : "invisible opacity-0"
                    }`}
                  >
                    {l.children!.map((child) =>
                      child.external ? (
                        <li key={child.href}>
                          <a
                            href={child.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setOpenMenu(null)}
                            className="label block px-4 py-2.5 text-muted transition-colors hover:text-fg"
                          >
                            {child.label}
                            <ExternalLinkMarker />
                          </a>
                        </li>
                      ) : (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => setOpenMenu(null)}
                            className="label block px-4 py-2.5 text-muted transition-colors hover:text-fg"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <Link
          href="/contact"
          className="hidden border border-fg px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-fg transition-colors hover:bg-fg hover:text-bg md:block"
        >
          Contact Us
        </Link>

        <button
          aria-label="Menu"
          onClick={() => setOpen((o) => !o)}
          className="flex flex-col gap-1.5 md:hidden"
        >
          <span className="h-px w-6 bg-fg" />
          <span className="h-px w-6 bg-fg" />
        </button>
      </nav>

      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-mobile-menu
            className="fixed inset-0 z-[95] flex flex-col items-center justify-center gap-8 bg-bg md:hidden"
          >
            <button
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute right-6 top-5 font-mono text-sm text-muted"
            >
              CLOSE ✕
            </button>
            {LINKS.map((l, i) =>
              l.href ? (
                <div key={l.label} className="flex flex-col items-center gap-3">
                  <MotionLink
                    href={l.href}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="font-display text-3xl font-semibold text-fg"
                  >
                    {l.label}
                  </MotionLink>
                  {l.children?.map((child) =>
                    child.external ? (
                      <motion.a
                        key={child.href}
                        href={child.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i + 0.03 }}
                        className="label text-muted"
                      >
                        {child.label}
                        <ExternalLinkMarker />
                      </motion.a>
                    ) : (
                      <MotionLink
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i + 0.03 }}
                        className="label text-muted"
                      >
                        {child.label}
                      </MotionLink>
                    ),
                  )}
                </div>
              ) : (
                // Resources has no own route (design.md: "a Label_Caps
                // dropdown trigger" rather than a link) — the mobile menu
                // renders its label as static (non-navigating) text
                // heading above its children, mirroring how Product's
                // dropdown appears in the mobile menu otherwise.
                <div key={l.label} className="flex flex-col items-center gap-3">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="font-display text-3xl font-semibold text-fg"
                  >
                    {l.label}
                  </motion.span>
                  {l.children?.map((child) =>
                    child.external ? (
                      <motion.a
                        key={child.href}
                        href={child.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i + 0.03 }}
                        className="label text-muted"
                      >
                        {child.label}
                        <ExternalLinkMarker />
                      </motion.a>
                    ) : (
                      <MotionLink
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpen(false)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i + 0.03 }}
                        className="label text-muted"
                      >
                        {child.label}
                      </MotionLink>
                    ),
                  )}
                </div>
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
