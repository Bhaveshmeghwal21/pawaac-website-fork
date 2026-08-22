import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// robots.txt.
//
// Nothing on this site is private, so the whole thing is crawlable. /api/ is
// disallowed because those two routes only accept POST — a crawler following
// them gets a 405 and learns nothing, and they should not appear in an index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
