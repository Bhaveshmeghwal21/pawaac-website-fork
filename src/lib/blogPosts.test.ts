import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  BLOG_POSTS,
  BLOG_POST_SLUGS,
  blogPostPath,
  getBlogPost,
} from "./blogPosts";

// Site-owner request (current session): blog posts moved to their own
// /news/[slug] reading pages, with the index showing only a teaser card.
//
// These cover the failures that would be silent rather than loud — a
// mispositioned pull-quote or a missing image file degrades the page without
// throwing, and a duplicate slug would make one post unreachable while the
// build still succeeds.

describe("blog post data", () => {
  it("publishes at least one post", () => {
    expect(BLOG_POSTS.length).toBeGreaterThan(0);
  });

  it("uses unique, URL-safe slugs", () => {
    expect(new Set(BLOG_POST_SLUGS).size).toBe(BLOG_POST_SLUGS.length);

    BLOG_POST_SLUGS.forEach((slug) => {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    });
  });

  it("builds each post path under /news", () => {
    BLOG_POSTS.forEach((post) => {
      expect(blogPostPath(post.slug)).toBe(`/news/${post.slug}`);
    });
  });

  it("resolves every published slug and nothing else", () => {
    BLOG_POST_SLUGS.forEach((slug) => {
      expect(getBlogPost(slug)?.slug).toBe(slug);
    });

    expect(getBlogPost("not-a-real-post")).toBeUndefined();
    expect(getBlogPost("")).toBeUndefined();
  });

  it("gives every post the copy both the card and the article need", () => {
    BLOG_POSTS.forEach((post) => {
      expect(post.headline.trim()).not.toBe("");
      // The index card renders `teaser`; the article renders `standfirst`.
      // A post missing either renders an empty block rather than failing.
      expect(post.teaser.trim()).not.toBe("");
      expect(post.standfirst.trim()).not.toBe("");
      expect(post.date.trim()).not.toBe("");
      expect(post.category.trim()).not.toBe("");
      expect(post.readingMinutes).toBeGreaterThan(0);
      expect(post.paragraphs.length).toBeGreaterThan(0);
      post.paragraphs.forEach((paragraph) => {
        expect(paragraph.trim()).not.toBe("");
      });
    });
  });

  // The pull-quote is positioned by index. Reordering or removing paragraphs
  // silently moves or drops it, which is exactly the kind of regression that
  // never announces itself in a build.
  it("anchors every pull-quote to a real paragraph index", () => {
    BLOG_POSTS.forEach((post) => {
      if (!post.pullQuote) return;

      expect(post.pullQuote.text.trim()).not.toBe("");
      expect(Number.isInteger(post.pullQuote.afterParagraph)).toBe(true);
      expect(post.pullQuote.afterParagraph).toBeGreaterThanOrEqual(0);
      expect(post.pullQuote.afterParagraph).toBeLessThan(
        post.paragraphs.length,
      );
    });
  });

  // The quote is rendered as its own display element. If the same sentence also
  // sat inside a body paragraph it would print twice.
  it("never duplicates the pull-quote inside the body copy", () => {
    BLOG_POSTS.forEach((post) => {
      if (!post.pullQuote) return;

      const duplicated = post.paragraphs.some((paragraph) =>
        paragraph.includes(post.pullQuote!.text),
      );
      expect(duplicated).toBe(false);
    });
  });

  it("points every lead image at a file that exists, with real alt text", () => {
    const publicDir = join(__dirname, "..", "..", "public");

    BLOG_POSTS.forEach((post) => {
      if (!post.image) return;

      expect(post.image.src.startsWith("/")).toBe(true);
      expect(existsSync(join(publicDir, post.image.src))).toBe(true);

      // Editorial imagery, not decoration: an empty alt would hide the lead
      // image from assistive technology entirely.
      expect(post.image.alt.trim()).not.toBe("");

      // Governance invariant: a photograph of a real, identifiable place or
      // event must carry a visible caption saying it is illustrative, so no
      // reader can infer an operational or customer claim from it.
      expect(post.image.caption.trim()).not.toBe("");
    });
  });

  it("keeps the card teaser and the article standfirst distinct", () => {
    BLOG_POSTS.forEach((post) => {
      expect(post.teaser).not.toBe(post.standfirst);
    });
  });
});
