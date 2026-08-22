"use client";

// Spec: pawaac-design-language-evolution — Blogs_Page, post reading view
// Requirements: 4.1, 4.3, 5.1, 5.4
//
// Persona: Both.
//
// Site-owner request (current session): each blog post is read on its own page
// (/news/[slug]) rather than in full on the index. This renders that reading
// view. Copy lives in lib/blogPosts.ts so the index teaser and this article
// cannot drift apart.
//
// Image note (IMPORTANT): a post's lead photograph may be a real, identifiable
// place or event. It is editorial illustration only, never a deployment,
// customer or capability claim, and `BlogPostImage.caption` carries the visible
// statement to that effect. Keep the caption rendered.
//
// Palette note: lead images render in full color rather than the site's usual
// grayscale photo treatment — editorial imagery in color is a documented
// exception to the achromatic palette (see README.md's Design language
// section).
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import ReticleFrame from "@/components/ui/ReticleFrame";
import type { BlogPost } from "@/lib/blogPosts";

export default function BlogPostArticle({ post }: { post: BlogPost }) {
  return (
    <section className="relative overflow-hidden bg-bg px-6 py-28 md:py-36">
      {/* Display_Type oversized background texture (Pattern 1), purely
          decorative — hidden from assistive technology per Requirement 10.6.
          Capped below sm so long words do not run to the section edges on
          narrow phones, same treatment as HomeHero's word-mark span. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-6 select-none text-center font-display text-[15vw] font-bold uppercase leading-none text-fg/[0.04] sm:text-[20vw] md:top-10"
      >
        ESSAY
      </span>

      <article className="relative z-10 mx-auto max-w-3xl">
        <Reveal>
          {/* Back to the index. Placed before the headline so keyboard and
              screen-reader users reach it without traversing the whole essay. */}
          <Link
            href="/news"
            className="group inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-muted transition-colors hover:text-fg"
          >
            <span
              aria-hidden="true"
              className="inline-block transition-transform group-hover:-translate-x-1"
            >
              ←
            </span>
            All blogs
          </Link>

          {/* Technical_Data metadata row (P2). */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="label">{post.date}</span>
            <span className="technical-data border border-line px-2 py-0.5 text-fg">
              {post.category}
            </span>
            <span className="label">{post.readingMinutes} min read</span>
          </div>

          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] text-fg md:text-5xl">
            {post.headline}
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-muted">
            {post.standfirst}
          </p>
        </Reveal>

        {post.image && (
          <Reveal delay={0.1} className="mt-12">
            <figure>
              <div
                className="relative w-full"
                style={{ aspectRatio: "16 / 10" }}
              >
                <Image
                  src={post.image.src}
                  alt={post.image.alt}
                  fill
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="object-cover"
                  preload
                />
                <ReticleFrame variant="dark" />
              </div>
              {/* Kept deliberately: states that the photograph is illustrative
                  and not a deployment claim. See this file's image note. */}
              <figcaption className="mt-3 font-mono text-[11px] leading-relaxed text-muted">
                {post.image.caption}
              </figcaption>
            </figure>
          </Reveal>
        )}

        <Reveal delay={0.15} className="mt-12">
          <div className="grid gap-6">
            {post.paragraphs.map((paragraph, index) => (
              <div key={paragraph.slice(0, 48)}>
                <p className="text-body font-body leading-relaxed text-muted">
                  {paragraph}
                </p>

                {post.pullQuote?.afterParagraph === index && (
                  <blockquote className="mt-8 border-l-2 border-line pl-6">
                    <p className="font-display text-xl leading-relaxed text-fg md:text-2xl">
                      {post.pullQuote.text}
                    </p>
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.2} className="mt-14">
          <div className="flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/company"
              className="group inline-flex items-center gap-2 font-mono text-sm text-fg"
            >
              Read what we are building toward
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>

            <Link
              href="/news"
              className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-muted transition-colors hover:text-fg"
            >
              All blogs
            </Link>
          </div>
        </Reveal>
      </article>
    </section>
  );
}
