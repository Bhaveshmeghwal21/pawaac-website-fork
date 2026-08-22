import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/layout/Footer";

// 404.
//
// Without this file Next renders its own unstyled default: a white page with
// black system-font text, on a site that is otherwise entirely #080808. That
// contrast break reads as "this site is broken" rather than "that page does not
// exist". Styled with the same label / heading / supporting-sentence pattern as
// the placeholder Product routes, and given the real navigation via the footer
// so a mistyped URL is recoverable instead of a dead end.
export const metadata: Metadata = {
  title: "Page not found · PAWAAC Drones",
  description: "That page does not exist.",
};

const DESTINATIONS = [
  { href: "/", label: "Home" },
  { href: "/product", label: "Platform" },
  { href: "/designer", label: "Coverage planner" },
  { href: "/contact", label: "Contact" },
] as const;

export default function NotFound() {
  return (
    <>
      <section className="relative bg-bg px-6 py-28 md:py-36">
        <div className="mx-auto max-w-3xl">
          <p className="label">Error / 404</p>
          <h1 className="mt-3 text-heading font-display text-fg">
            That page does not exist
          </h1>
          <p className="mt-4 max-w-md text-body font-body text-muted">
            The link may be out of date, or the address may have a typo. Here is
            the way back.
          </p>

          <nav
            aria-label="Suggested pages"
            className="mt-10 flex flex-wrap gap-x-6 gap-y-3"
          >
            {DESTINATIONS.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="font-mono text-[12px] uppercase tracking-[0.12em] text-fg underline decoration-line decoration-1 underline-offset-4 transition hover:decoration-fg"
              >
                {d.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>
      <Footer />
    </>
  );
}
