// Canonical origin for the deployed site.
//
// Used by the root layout's `metadataBase`, `sitemap.ts` and `robots.ts`, which
// previously would have hardcoded it three times. Absolute URLs matter here:
// Open Graph and sitemap entries are invalid as relative paths, so a wrong
// value silently produces broken social previews and an unusable sitemap.
//
// Override with NEXT_PUBLIC_SITE_URL to point a preview deployment at itself.
// Trailing slashes are stripped so callers can always append "/path".
const FALLBACK_SITE_URL = "https://pawaac.com";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL
).replace(/\/+$/, "");

/** Absolute URL for a site-relative path. `absoluteUrl("/contact")`. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
