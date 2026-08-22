// Spec: pawaac-design-language-evolution — Task 35 (superseded by Task 61)
// Requirements: 1.5, 1.6
// Design: design.md -> Correctness Properties -> Property 14
//   "Navigation active-indicator correctness"
//
// Pure validator function backing Property 14. Intentionally
// dependency-free and side-effect-free.
//
// Task 61 update: Navigation was restructured (task 57) from 5 flat
// primary items to 4 primary items — Product, Autonomy, Resources,
// Company — where Resources is a dropdown with no own route. The internal
// Planner route (`/designer`) resolves to the single "resources" indicator,
// while News and Our Commitments are grouped under Company. The cleanest
// data shape for this is a map from route -> primary-item id, rather than a
// flat array of routes.
//
// Follow-up update (Company dropdown): Company was restructured from a
// flat link into a dropdown (Company_Menu) exposing About Us (/company),
// Careers (/careers), Contact Us (/contact), News (/news), and Our
// Commitments (/commitments) — mirroring how Resources collapses its own
// internal route onto one indicator. These routes map to `"company"`.
//
// Site-owner request (current session): /autonomy is hidden from
// navigation (Navigation.tsx's LINKS array no longer includes it), and
// "Careers" is promoted out of the Company dropdown into its own primary
// item. This map is left unchanged for `/autonomy` — a route can still
// resolve to a primary-item id here even while unlinked in the real nav,
// since a direct visit to /autonomy renders Navigation with no indicator
// lit at all (the id it would resolve to no longer has a matching primary
// item), which is the correct behavior for "hidden, not deleted." `/careers`
// is updated to map to its own new `"careers"` id instead of `"company"`,
// since it is no longer part of Company_Menu.
export type PrimaryNavItemId =
  | "product"
  | "autonomy"
  | "resources"
  | "careers"
  | "company";

/**
 * Map of every route that drives a primary-item active-indicator to the
 * primary-item id it resolves to. Product, Autonomy, and Careers each map
 * to themselves 1:1; `/designer` maps to `"resources"`, since Resources has
 * no own route and instead activates for its internal Planner dropdown link
 * (Analyser is external and is intentionally excluded — it cannot itself
 * be "the current page"). `/company`, `/contact`, `/news`, and
 * `/commitments` map to `"company"`, since Company_Menu links to those four
 * internal company pages (Careers no longer among them).
 */
export const NAV_ROUTE_TO_PRIMARY_ITEM: Record<string, PrimaryNavItemId> = {
  "/product": "product",
  "/autonomy": "autonomy",
  "/careers": "careers",
  "/company": "company",
  "/contact": "company",
  "/news": "company",
  "/commitments": "company",
  "/designer": "resources",
};

/**
 * Resolves the active primary-item indicator for the given current route,
 * per design.md's Property 14 (updated for the Product / Resources / Careers
 * / Company structure, Careers promoted out of Company_Menu): "for any
 * current route drawn from the set of all Pawaac_Site routes, the
 * Navigation renders the active-item indicator under exactly one of the
 * primary items — Product, Resources, Careers, or Company — if the current
 * route is `/product`, the Resources_Menu-linked Planner route (`/designer`),
 * `/careers`, or one of the Company_Menu-linked routes (`/company`,
 * `/contact`, `/news`, `/commitments`, all of which resolve to the Company
 * indicator), or under none of the items if the current route matches none
 * of those (i.e. Homepage, or /autonomy while it remains unlinked in the
 * real nav). Deployments_Page (`/deployments`) has been removed entirely
 * (task 65) and, like any other unmapped route, resolves to `null`."
 *
 * Returns the resolved `PrimaryNavItemId`, or `null` if `currentRoute`
 * matches none of the mapped routes.
 */
export function resolveActiveNavItem(
  currentRoute: string,
): PrimaryNavItemId | null {
  return NAV_ROUTE_TO_PRIMARY_ITEM[currentRoute] ?? null;
}
