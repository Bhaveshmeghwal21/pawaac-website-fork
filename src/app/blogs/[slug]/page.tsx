import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/layout/Footer";
import BlogPostArticle from "@/components/sections/BlogPostArticle";
import { BLOG_POSTS, getBlogPost } from "@/lib/blogPosts";
import { absoluteUrl } from "@/lib/site";

// Site-owner request (current session): the whole Blogs route moved from
// /news to /blogs (see src/app/blogs/page.tsx's note and the permanent
// redirect in next.config.ts). Individual posts are read on their own page
// rather than in full on the Blogs index, which shows a title, a short
// teaser and a button through to here.
//
// `params` is a Promise in this version of Next and must be awaited — see
// node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md
// ("Creating a dynamic segment"). AGENTS.md's standing instruction applies:
// this release differs from older ones, so the bundled docs are the reference
// rather than recall.
//
// generateStaticParams enumerates every slug so these pages are prerendered at
// build time like the rest of the site, and `dynamicParams = false` makes any
// other slug a 404 instead of an attempted on-demand render — the post set is
// a fixed, hand-authored list, so there is nothing legitimate to render for an
// unknown slug.
export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) return {};

  const canonical = absoluteUrl(`/blogs/${post.slug}`);

  return {
    title: `${post.headline} · PAWAAC Drones`,
    description: post.standfirst,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: post.headline,
      description: post.standfirst,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: post.headline,
      description: post.standfirst,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  return (
    <>
      <BlogPostArticle post={post} />
      <Footer />
    </>
  );
}
