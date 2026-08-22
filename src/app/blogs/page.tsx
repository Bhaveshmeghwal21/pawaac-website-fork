import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";

// Spec: pawaac-design-language-evolution — Task 59 (News_Page route),
// updated for News_Page real content (resolves OCP-19)
// Requirements: 4.1, 4.3, 5.1, 5.4
// Design: design.md -> Page Specifications -> News_Page
//
// Site-owner request (current session): the route itself is renamed from
// /news to /blogs, matching the "Blogs" label already used everywhere else
// on the site (Navigation.tsx, Footer.tsx labels stayed "News" — see that
// file's own note). A permanent redirect from /news to /blogs is configured
// in next.config.ts, so anything already bookmarked or indexed still
// resolves. See lib/site.ts / next.config.ts for the redirect and
// src/app/blogs/[slug]/page.tsx for individual posts.
//
// This route now renders a real, long-form blog listing — OCP-19 is
// RESOLVED; see NewsHero.tsx / NewsList.tsx for the real content.
import NewsHero from "@/components/sections/NewsHero";

export const metadata: Metadata = {
  title: "Blogs · PAWAAC Drones",
  description:
    "Essays on autonomy, attention, and what it takes to keep watch.",
};

export default function BlogsPage() {
  return (
    <>
      <NewsHero />
      <Footer />
    </>
  );
}
