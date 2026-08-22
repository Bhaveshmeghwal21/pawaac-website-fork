"use client";

// Spec: pawaac-design-language-evolution — Blogs_Page (formerly News_Page)
// Requirements: 4.1, 4.3, 5.1, 5.4
// Design: design.md -> Page Specifications -> News_Page, Section 1
//
// Persona: Both.
//
// Site-owner request (current session), in two steps:
//   1. The original product announcement item ("Pawaac introduces HawkAI Plus
//      and Sentrivion") was replaced with a real long-form essay.
//   2. That essay then moved to its own reading page (/blogs/[slug]), and this
//      index became a card list: title, a short teaser paragraph, and a small
//      button through to the full post.
//
// Copy lives in lib/blogPosts.ts, so a card here and the article at
// components/sections/BlogPostArticle.tsx cannot drift apart.
//
// The whole card is not one big link. The headline is the link and the button
// repeats it, because a card-sized anchor wrapping a heading, metadata and a
// paragraph produces a single unreadable accessible name and gives screen
// reader users no way to skim the list. Both controls point at the same href
// and the button is marked aria-hidden so the destination is announced once.
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import ReticleFrame from "@/components/ui/ReticleFrame";
import { BLOG_POSTS, blogPostPath } from "@/lib/blogPosts";

export default function NewsList() {
  return (
    <div className="relative z-10 mx-auto mt-16 max-w-3xl">
      <ul className="flex flex-col gap-px border border-line bg-line">
        {BLOG_POSTS.map((post, i) => (
          <li key={post.slug} className="bg-bg p-8 md:p-10">
            <Reveal delay={0.1 * i}>
              {/* Site-owner request (current session): the card carries a
                  small thumbnail of the post's lead image. Two columns from
                  sm up, stacked on phones where a 200px column would leave
                  the teaser unreadably narrow. */}
              <div
                className={
                  post.image
                    ? "grid gap-6 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-8"
                    : undefined
                }
              >
                {post.image && (
                  // Redundant click target, same pattern as the Read essay
                  // button below: `tabIndex={-1}` with `aria-hidden` removes it
                  // from both the tab order and the accessibility tree
                  // together, so the headline link remains the single
                  // announced route to the post. `alt=""` because in this
                  // context the thumbnail is decoration — the headline
                  // immediately beside it already names the destination, and
                  // the same image carries real alt text on the article page.
                  <Link
                    href={blogPostPath(post.slug)}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="relative block w-full"
                    style={{ aspectRatio: "16 / 10" }}
                  >
                    <Image
                      src={post.image.src}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 200px, 100vw"
                      className="object-cover"
                    />
                    <ReticleFrame variant="dark" />
                  </Link>
                )}

                <div>
                  {/* Technical_Data metadata row (P2): date, category and a
                      reading-time hint, all Label_Caps-styled (P2). */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="label">{post.date}</span>
                    <span className="technical-data border border-line px-2 py-0.5 text-fg">
                      {post.category}
                    </span>
                    <span className="label">
                      {post.readingMinutes} min read
                    </span>
                  </div>

                  <h2 className="mt-4 font-display text-2xl font-bold leading-tight text-fg md:text-3xl">
                    <Link
                      href={blogPostPath(post.slug)}
                      className="transition-colors hover:text-muted"
                    >
                      {post.headline}
                    </Link>
                  </h2>

                  <p className="mt-3 text-body font-body leading-relaxed text-muted">
                    {post.teaser}
                  </p>

                  {/* Redundant click target: the same destination as the
                      headline link above, styled as the button. */}
                  <Link
                    href={blogPostPath(post.slug)}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="mt-6 inline-flex items-center gap-2 border border-fg px-5 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-fg transition-colors hover:bg-fg hover:text-bg"
                  >
                    Read essay
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}
