// Blog post content, shared by the Blogs index (/blogs) and each post's own
// reading page (/blogs/[slug]).
//
// Site-owner request (current session): each post is read on its own page, and
// the index carries only a title, a short teaser paragraph and a small button
// through to the full essay. Keeping the copy here rather than inside either
// component means the index teaser and the article can never drift apart, and
// generateStaticParams / the sitemap can both enumerate posts from one place.
//
// Deliberately a plain TypeScript module, not MDX or a CMS: there is one post.
// Adding a build pipeline for that would be cost without benefit. If the volume
// grows to where authoring in TSX is the bottleneck, this is the seam to
// replace — everything downstream reads `BLOG_POSTS` and `getBlogPost`.
//
// Content governance: posts here publish no figures, customer names, operating
// locations, deployment claims or capability assertions, so they need no
// Change_Proposal gate and pass bannedTerms/sensitiveContent as written.

export type BlogPostImage = {
  src: string;
  /** Empty string is not allowed: this image is editorial, not decorative. */
  alt: string;
  /**
   * Visible caption. For any photograph of a real, identifiable place or event
   * this MUST state that the image is illustrative rather than a deployment,
   * so no reader can infer an operational claim from it.
   */
  caption: string;
};

export type BlogPost = {
  /** URL segment under /blogs. Lowercase, hyphenated, stable once published. */
  slug: string;
  headline: string;
  /** One-line deck shown under the headline on the article page. */
  standfirst: string;
  /** Short paragraph shown on the Blogs index card. */
  teaser: string;
  date: string;
  category: string;
  /** Minutes, rounded, shown as a reading-time hint on the index and article. */
  readingMinutes: number;
  image?: BlogPostImage;
  /** Body paragraphs, in reading order. */
  paragraphs: string[];
  /**
   * Optional display quote. `afterParagraph` is a zero-based index into
   * `paragraphs`; the quote renders directly after that paragraph so the
   * accessibility tree's reading order still matches the visual order. The
   * quote text is its own standalone sentence and is never duplicated inside
   * `paragraphs`.
   */
  pullQuote?: {
    text: string;
    afterParagraph: number;
  };
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "what-it-costs-to-keep-watch",
    headline: "What it costs to keep watch",
    standfirst:
      "On sustained attention, the invisibility of a job done well, and why we kept asking people to do the one thing minds are worst at.",
    teaser:
      "Watching is close to the worst thing you can ask of a human mind, and not because it is difficult. It is because almost nothing happens. An essay on vigilance, the invisibility of a watch kept well, and why we have had the division of labour backwards.",
    date: "August 22, 2026",
    category: "Essay",
    readingMinutes: 6,
    image: {
      src: "/images/dev-dipawali-varanasi.jpeg",
      alt: "An elevated night view of a dense crowd gathered along a riverfront during a festival, lit by strings of lamps.",
      caption:
        "Dev Deepawali at the Varanasi ghats. Used here to illustrate the kind of gathering this essay is about, not a Pawaac deployment.",
    },
    pullQuote: {
      text: "A watch kept perfectly and a watch not kept at all produce the same evening.",
      afterParagraph: 4,
    },
    paragraphs: [
      "Look at a crowd like this one and try to find the person responsible for it. There isn't one. There are several, and none of them can see the whole thing at once. Somewhere above or behind this frame, someone is standing at a barrier or sitting in front of a screen, holding in their head a rough model of a place that is far too large and too dense to hold, and hoping that if something begins to go wrong they will notice it while it is still small.",
      "That hope is the entire job. It is also, psychologically, close to the worst thing you can ask of a human mind.",
      "The problem has a name. Vigilance decrement is the well documented tendency of attention to degrade over a sustained watch, and the cruel part of it is the mechanism: the mind is not failing because the task is hard. It is failing because almost nothing happens. Attention is calibrated by feedback, and a quiet perimeter offers none. Hour after hour of nothing does not train alertness, it trains expectation, and what a person comes to expect is more nothing. By the time the exception arrives, the watcher has been quietly taught, by every uneventful minute leading up to it, that it will not.",
      "No amount of professionalism fully removes this. Discipline can slow it. Rotation can interrupt it. Caffeine can mask it. But the underlying shape of the problem is structural, not moral, and treating it as moral is how institutions end up blaming the person who was staring at the right screen at the wrong moment.",
      "There is a second cruelty layered on the first, and it is the one that gets discussed least. The work is invisible when it succeeds.",
      "There is no artifact, no output, no moment of visible competence. The only time the job becomes legible to anyone else is the night it fails. Which means the feedback a watcher receives across an entire career is overwhelmingly silence, punctuated, if they are unlucky, by catastrophe and an inquiry.",
      "Ask what we are really requesting when we put a person on watch, and the answer is uncomfortable. We are asking them to sustain readiness for an event that will probably not come, to receive no confirmation that they are doing it well, and to carry the moral weight if it comes and they miss it. That is a form of exposure most work does not involve. We have simply gotten used to asking for it, because until recently there was no alternative.",
      "This is the part where a company like ours is supposed to say that machines do not get tired. It is true, and it is also the least interesting thing about it. The more honest framing is that we have had the division of labour backwards. We have been spending human attention on the part of the problem that is uniform, unrewarded and endless, and then asking whatever attention survives that to perform the part that actually requires a mind: understanding what something means, and deciding what to do about it.",
      "Judgment is the scarce thing. Not watching. Watching is merely expensive, and it is expensive in a currency we should not be paying with. A machine can hold a horizon indefinitely at no cost to itself, and it is indifferent to the tedium in a way no person can train themselves to be. What it cannot do is understand a situation. It cannot weigh a crowd's mood, or know which of two bad options a commander would accept, or recognise that the thing it has flagged is a family looking for a child rather than a threat. Those remain human, and they should.",
      "So the argument for autonomy here is not that it replaces the watcher. It is that it stops wasting them. Let the tedium be absorbed by something that cannot be worn down by it, so that when the moment arrives, the person who has to decide arrives at it with their attention unspent.",
      "It is worth being clear about what this does not do. Autonomy does not remove responsibility from the situation. It relocates it. Someone still decides, and someone is still accountable for that decision, and building the system that hands them the moment carries its own obligations about restraint, oversight and what the machine is permitted to conclude on its own. Those obligations are the real work, and we would rather argue about them in the open than pretend the technology settles them.",
      "But the starting point is simple enough to state plainly. Places like the one in the photograph above depend, tonight and every night, on somebody not looking away. That has always been asked of people who cannot physically deliver it, not through any failing of theirs, but because no mind is built for it. It should not have to be asked of them much longer.",
    ],
  },
];

/** Every post slug, for generateStaticParams and the sitemap. */
export const BLOG_POST_SLUGS = BLOG_POSTS.map((post) => post.slug);

/** The canonical path a post is read at. */
export function blogPostPath(slug: string): string {
  return `/blogs/${slug}`;
}

/** Returns the post for `slug`, or undefined so the caller can 404. */
export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((post) => post.slug === slug);
}
