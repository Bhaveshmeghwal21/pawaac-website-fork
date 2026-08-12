"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/ui/Logo";

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

// Company_Menu dropdown contents, in order (site-owner request: "no
// careers page, about us, contact us page in ... Company section ... make
// company as dropdown and put these under that"). Company keeps
// href="/company" so the "Company" label itself still navigates to the
// existing Company_Page — following the exact same both-link-AND-trigger
// pattern already used for Product. The first child, "About Us", is an
// intentional duplicate destination of the trigger itself (the same
// convention many sites use: the top-level label and its first dropdown
// entry both resolve to the same About/company page). News and Our
// Commitments are also grouped here as company-facing pages.
const COMPANY_SUBLINKS = [
  { label: "About Us", href: "/company" },
  { label: "Careers", href: "/careers" },
  { label: "Contact Us", href: "/contact" },
  { label: "News", href: "/news" },
  { label: "Our Commitments", href: "/commitments" },
];

// Routes that drive the Company active-item indicator (Requirement
// 1.5–1.6, Correctness Property 14), mirroring RESOURCES_ACTIVE_ROUTES:
// Company now shows active on its own page as well as on its dropdown-linked
// company pages: Careers, Contact, News, and Our Commitments.
const COMPANY_ACTIVE_ROUTES = [
  "/company",
  "/careers",
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
const LINKS: {
  label: string;
  href?: string;
  children?: SubLink[];
}[] = [
  { label: "Product", href: "/product", children: PRODUCT_SUBLINKS },
  { label: "Autonomy", href: "/autonomy" },
  { label: "Resources", children: RESOURCES_SUBLINKS },
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
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastScrollY = useRef(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const diff = latest - lastScrollY.current;
    // Hide nav on scroll down, show on scroll up
    if (latest > 120 && diff > 8) {
      setHidden(true);
    } else if (diff < -4) {
      setHidden(false);
    }
    setScrolled(latest > 24);
    lastScrollY.current = latest;
  });

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: hidden && !open ? "-120%" : "0%" }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed left-4 right-4 top-4 z-[90] rounded-full transition-[background,border-color,backdrop-filter,box-shadow] duration-500 md:left-8 md:right-8 md:top-5 lg:left-16 lg:right-16 ${
          scrolled
            ? "bg-black/70 backdrop-blur-2xl border border-white/[0.4] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.15),0_0_0_1px_rgba(255,255,255,0.08)]"
            : "bg-black/40 backdrop-blur-xl border border-white/[0.3] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)]"
        }`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-fg focus:px-4 focus:py-2 focus:font-mono focus:text-[11px] focus:font-semibold focus:uppercase focus:tracking-[0.1em] focus:text-bg"
        >
          Skip to content
        </a>

        {/* Subtle bottom glow line when scrolled */}
        {scrolled && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 -bottom-px h-px rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent 100%)"
            }}
          />
        )}

        <nav className="mx-auto flex h-[56px] max-w-7xl items-center justify-between px-6 md:px-8">
          <a href="/" className="group flex items-center gap-2.5 text-white">
            <div className="relative">
              <Logo className="h-7 w-7 transition-transform duration-500 group-hover:scale-110" />
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-white/0 blur-md transition-all duration-500 group-hover:bg-white/10"
              />
            </div>
            <span className="font-display text-base font-bold tracking-tight text-white">
              PAWAAC
            </span>
          </a>

          <ul className="hidden items-center gap-9 md:flex">
            {LINKS.map((l) => {
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
              const TriggerTag: "a" | "button" = l.href ? "a" : "button";

              return (
                <li key={l.label} className={hasChildren ? "group/nav relative" : ""}>
                  <TriggerTag
                    {...(l.href
                      ? { href: l.href }
                      : { type: "button" as const })}
                    aria-current={isActive ? "page" : undefined}
                    aria-haspopup={hasChildren ? "true" : undefined}
                    aria-expanded={hasChildren ? "false" : undefined}
                    className={`label group relative flex items-center gap-1.5 !text-[12px] !font-medium transition-all duration-300 hover:!text-white ${
                      isActive ? "!text-white" : "!text-white/70"
                    }`}
                  >
                    {l.label}
                    {hasChildren && (
                      <span
                        aria-hidden="true"
                        className="mt-px inline-block text-[9px] transition-transform duration-300 group-hover/nav:rotate-180"
                      >
                        ▾
                      </span>
                    )}
                    {/* Premium animated underline */}
                    <span
                      className={`absolute -bottom-2 left-0 h-[2px] rounded-full bg-white transition-all duration-500 ${
                        isActive ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-50"
                      }`}
                    />
                  </TriggerTag>

                  {hasChildren && (
                    <div className="invisible absolute left-1/2 top-full z-[91] mt-4 -translate-x-1/2 opacity-0 transition-all duration-300 group-hover/nav:visible group-hover/nav:mt-3 group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:mt-3 group-focus-within/nav:opacity-100">
                      <ul className="glass-stronger w-60 py-2 shadow-2xl">
                        {l.children!.map((child) => (
                          <li key={child.href}>
                            <a
                              href={child.href}
                              {...(child.external
                                ? { target: "_blank", rel: "noopener noreferrer" }
                                : {})}
                              className="group/link flex items-center px-5 py-2.5 text-[12px] font-mono uppercase tracking-[0.08em] text-muted transition-all duration-300 hover:bg-white/[0.04] hover:text-fg"
                            >
                              <span
                                aria-hidden="true"
                                className="mr-2 inline-block h-px w-0 bg-fg/60 transition-all duration-300 group-hover/link:w-3"
                              />
                              {child.label}
                              {child.external && <ExternalLinkMarker />}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <a
            href="/contact"
            className="btn-primary hidden md:inline-flex"
          >
            Contact Us
          </a>

          {/* Animated hamburger */}
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
            className="relative flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
          >
            <motion.span
              animate={open ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="block h-[1.5px] w-5 bg-fg"
            />
            <motion.span
              animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2 }}
              className="block h-[1.5px] w-5 bg-fg"
            />
            <motion.span
              animate={open ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="block h-[1.5px] w-5 bg-fg"
            />
          </button>
        </nav>
      </motion.header>

      {/* Premium Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            data-mobile-menu
            className="fixed inset-0 z-[95] md:hidden"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-bg/[0.97] backdrop-blur-2xl" />

            <div className="relative flex h-full flex-col items-center justify-center gap-7 px-8">
              {LINKS.map((l, i) =>
                l.href ? (
                  <div key={l.label} className="flex flex-col items-center gap-2.5">
                    <motion.a
                      href={l.href}
                      onClick={() => setOpen(false)}
                      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ delay: 0.06 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="font-display text-3xl font-semibold text-fg"
                    >
                      {l.label}
                    </motion.a>
                    {l.children?.map((child) => (
                      <motion.a
                        key={child.href}
                        href={child.href}
                        {...(child.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        onClick={() => setOpen(false)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.06 * i + 0.04, duration: 0.4 }}
                        className="label text-muted transition-colors hover:text-fg"
                      >
                        {child.label}
                        {child.external && <ExternalLinkMarker />}
                      </motion.a>
                    ))}
                  </div>
                ) : (
                  <div key={l.label} className="flex flex-col items-center gap-2.5">
                    <motion.span
                      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ delay: 0.06 * i, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="font-display text-3xl font-semibold text-fg"
                    >
                      {l.label}
                    </motion.span>
                    {l.children?.map((child) => (
                      <motion.a
                        key={child.href}
                        href={child.href}
                        {...(child.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        onClick={() => setOpen(false)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.06 * i + 0.04, duration: 0.4 }}
                        className="label text-muted transition-colors hover:text-fg"
                      >
                        {child.label}
                        {child.external && <ExternalLinkMarker />}
                      </motion.a>
                    ))}
                  </div>
                ),
              )}

              {/* Mobile CTA */}
              <motion.a
                href="/contact"
                onClick={() => setOpen(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="btn-primary mt-4"
              >
                Contact Us
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
