import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { BLOG_POST_SLUGS, blogPostPath } from "@/lib/blogPosts";

// Sitemap for the 13 public routes.
//
// Without this, /commitments and /blogs were effectively undiscoverable: the
// footer does not link to them (Footer.tsx's link groups omit both), so nothing
// on the site pointed a crawler at them.
//
// `priority` here is the sitemap's own relevance hint, unrelated to next/image's
// deprecated `priority` prop. Values are relative within this site only —
// entry points and the pages a prospect is sent to rank highest, the two
// placeholder subsystem pages lowest, since they currently hold a single line
// of copy each.
//
// One `lastModified` timestamp is taken per build rather than per route.
// Claiming a specific edit date per page would be fabricated precision, and
// this file is a static route (no request-time API), so the value is fixed at
// build time.
const ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/product", changeFrequency: "monthly", priority: 0.9 },
  // /autonomy, /product/hawkai, /product/sentrivion,
  // /product/software-stack and /product/docking-system deliberately
  // excluded — all five hidden from navigation (site-owner request). The
  // /product top-level route stays listed above; only its four individual
  // sub-pages are hidden, and the Platform primary nav item (renamed from
  // "Product") is now a plain link with no dropdown as a result. Re-add
  // `{ path: "/autonomy", changeFrequency: "monthly", priority: 0.8 }`,
  // `{ path: "/product/hawkai", changeFrequency: "monthly", priority: 0.8 }`,
  // `{ path: "/product/sentrivion", changeFrequency: "monthly", priority: 0.8 }`,
  // `{ path: "/product/software-stack", changeFrequency: "monthly", priority: 0.5 }`
  // and `{ path: "/product/docking-system", changeFrequency: "monthly",
  // priority: 0.5 }` here when each is unhidden.
  { path: "/contact", changeFrequency: "yearly", priority: 0.7 },
  { path: "/designer", changeFrequency: "yearly", priority: 0.7 },
  { path: "/company", changeFrequency: "monthly", priority: 0.6 },
  { path: "/careers", changeFrequency: "weekly", priority: 0.5 },
  { path: "/blogs", changeFrequency: "weekly", priority: 0.5 },
  { path: "/commitments", changeFrequency: "yearly", priority: 0.4 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Individual blog posts (site-owner request, current session: each post is
  // read on its own /blogs/[slug] page). Derived from BLOG_POSTS rather than
  // hardcoded, so publishing a post cannot silently leave it out of the
  // sitemap. Ranked just under the index that links to them.
  const postRoutes = BLOG_POST_SLUGS.map((slug) => ({
    path: blogPostPath(slug),
    changeFrequency: "yearly" as const,
    priority: 0.45,
  }));

  return [...ROUTES, ...postRoutes].map(
    ({ path, changeFrequency, priority }) => ({
      url: absoluteUrl(path),
      lastModified,
      changeFrequency,
      priority,
    }),
  );
}
