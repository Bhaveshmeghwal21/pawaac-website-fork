import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't advertise the framework and version to every visitor.
  poweredByHeader: false,

  images: {
    // Next 16 resolves to `['image/webp']` by default. AVIF is listed first so
    // browsers that accept it get it and everything else falls back to WebP.
    // This site is photograph-heavy — several source files in public/images are
    // multi-megabyte JPEG/PNG — so the extra encoding time at request happens
    // once per size and is cached, while the transfer saving applies to every
    // visitor.
    formats: ["image/avif", "image/webp"],

    // Next 16 raised this default from 60s to 4 hours (see
    // node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md:722).
    // 4 hours is still short for what these actually are: static photographs
    // that never change under a given filename. Re-optimising a 3.5 MB source
    // JPEG every 4 hours is pure waste. 31 days, not a year, because these are
    // referenced by path rather than by static import, so a same-name content
    // swap would otherwise be invisible for far too long. The repo's existing
    // habit of suffixing replacements (`-v2`) makes that unlikely anyway.
    minimumCacheTTL: 2678400,
  },

  async redirects() {
    return [
      // Site-owner request (current session): the Blogs route was renamed
      // from /news to /blogs. `permanent: true` sends a 308, which
      // instructs browsers and search engines to cache the redirect
      // rather than re-checking it on every request — correct here since
      // the move is not coming back. `/news/:slug` is listed separately
      // from `/news` (rather than a single `/news/:path*`) because the
      // bare index has no slug segment to forward; matching both
      // explicitly avoids relying on the trailing `/:path*` resolving to
      // nothing for the index case. See
      // node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/redirects.md.
      {
        source: "/news",
        destination: "/blogs",
        permanent: true,
      },
      {
        source: "/news/:slug",
        destination: "/blogs/:slug",
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Block MIME-type sniffing.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Don't leak full URLs to third parties (the planner calls the
          // Nominatim geocoder and loads external map tiles).
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Clickjacking: nothing on this site is intended to be framed.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Deny the powerful APIs this site does not use. `geolocation` is
          // explicitly kept for same-origin because /designer's "Use my
          // current location" button calls navigator.geolocation.
          {
            key: "Permissions-Policy",
            value:
              "geolocation=(self), camera=(), microphone=(), payment=(), usb=()",
          },
          // 2 years, subdomains included. `preload` is deliberately NOT set:
          // that submits the domain to the browser-baked HSTS list and is
          // effectively irreversible, which is not a launch-day decision.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
