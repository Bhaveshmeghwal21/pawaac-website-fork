"use client";

// Spec: pawaac-design-language-evolution — Task 5 (Reveal_On_Scroll)
// Requirements: 9.8
// Design: design.md -> Shared Components -> Reveal_On_Scroll;
//         Reduced-Motion Fallback Matrix
//
// This is the pre-existing scroll-reveal component, extended in place rather
// than duplicated: its prop API (children, y, delay, className) is
// preserved so every existing call site (Contact.tsx, Traction.tsx, and the
// ~8 others) keeps working unchanged. The underlying technique combines a
// `clip-path: inset(...)` wipe with a small paired translateY + scale, both
// triggered once the element is judged to be in view, per the
// Reveal_On_Scroll spec.
// The clip-path wipe alone reads as a flat mask; pairing it with a short
// (<=14px) settle-in translate and a subtle scale gives revealed content a
// sense of physical weight/momentum instead of just unmasking in place.
//
// Trigger mechanism (bugfix): originally driven purely by framer-motion's
// `whileInView` prop. That has a known failure mode for content that is
// already in the viewport at first paint (e.g. the Homepage hero) when an
// ancestor has `overflow-hidden` and the element's own initial state is
// clip-path-clipped to zero visible area — some browsers'
// IntersectionObserver never reports an initial "intersecting" callback in
// that combination, so `once: true` never fires and the content stays
// permanently invisible (see HOMEPAGE_MISSING_PARTS.md's first item).
// Fixed by driving the reveal off framer-motion's `useInView` hook instead
// (same IntersectionObserver under the hood), plus a short safety-timeout
// fallback that force-reveals the content if the observer hasn't fired
// within 1.2s of mount regardless of cause — belt-and-suspenders against
// this exact class of bug recurring, and also the mechanism that covers
// environments where IntersectionObserver itself never fires at all.
//
// The `y` prop is repurposed from "initial pixel offset" to "reveal
// direction": its sign selects whether the clip-path wipe opens bottom-up
// (y >= 0, matching the old "enters from below" intent) or top-down (y < 0).
// Its magnitude no longer drives the clip-path itself, but is still used
// (clamped small) to size the paired settle-in translate distance below.
//
// Reduced-motion fallback (Requirement 9.8): when
// `usePrefersReducedMotion()` is true, this renders children directly in
// their final, fully-revealed state with no clip-path keyframe and no
// transform.
//
// Same-session reload fix (site-owner report, current session): "when I
// reload the page the content appears very slow" — on every reload after
// the first in a browser session, this now renders already-revealed
// immediately, the same way the reduced-motion branch already does, rather
// than re-running the ~0.7s clip-path wipe again. The very first load of a
// session (or first load in a new tab/private window) is unaffected and
// still plays the full entrance, matching Preloader.tsx's own splash,
// which uses the identical `sessionStorage["pawaac-loaded"]` flag to make
// the same "have we already shown this session's first-load moment"
// decision. Applies on every page: Reveal is the shared entrance mechanism
// used by all ~29 section components across the site, not homepage-only.
//
// The flag is read through `useSyncExternalStore` rather than a plain call
// during render, because this component *branches its rendered output* on
// the result. Reading sessionStorage directly during render made the server
// (which has no sessionStorage, so always "play the animation") disagree
// with the client's first render on any reload, which is a real hydration
// mismatch — React reported it as "a tree hydrated but some attributes of
// the server rendered HTML didn't match". `getServerSnapshot` pins the
// server render *and the hydration pass that has to match it* to the
// animated branch; React then reads the real value immediately after
// hydration and re-renders straight to the revealed branch. Same primitive,
// same reasoning as hooks/useMediaQuery.ts, which documents why an
// effect-based correction is both wrong here and a
// `react-hooks/set-state-in-effect` lint error in this config.
//
// HeroHeadline.tsx and HomeMotionSection.tsx call the plain
// `hasCompletedIntroThisSession()` instead, which is correct for them: they
// only consult it inside an effect and their JSX does not branch on it, so
// they produce identical server and client markup and cannot mismatch.
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useInView } from "framer-motion";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { hasCompletedIntroThisSession } from "@/lib/motion/pageReady";

// Preloader writes the session flag once, on first load, and nothing clears
// it for the life of the page — so there is no store to subscribe to.
const subscribeToNothing = () => () => {};

// Server render + hydration pass: always "play the animation". Anything
// else would have the server guess at client-only state.
const getIntroSkipServerSnapshot = () => false;

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 30,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const skipIntro = useSyncExternalStore(
    subscribeToNothing,
    hasCompletedIntroThisSession,
    getIntroSkipServerSnapshot,
  );
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const [forceRevealed, setForceRevealed] = useState(false);

  // Safety net: if the IntersectionObserver-driven `inView` state never
  // flips true (the exact failure mode this component previously hit for
  // above-the-fold content), force the revealed state after a short delay
  // regardless of cause, so content can never be stuck invisible.
  useEffect(() => {
    if (inView || prefersReducedMotion || skipIntro) return;
    const t = setTimeout(() => setForceRevealed(true), 1200);
    return () => clearTimeout(t);
  }, [inView, prefersReducedMotion, skipIntro]);

  if (prefersReducedMotion || skipIntro) {
    return <div className={className}>{children}</div>;
  }

  const revealed = inView || forceRevealed;

  // Bottom-up wipe for y >= 0 (default / legacy "enters from below" call
  // sites); top-down wipe for y < 0.
  const direction = y < 0 ? -1 : 1;
  const closedClipPath =
    y < 0 ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)";
  const openClipPath = "inset(0% 0% 0% 0%)";

  // Small, clamped settle-in distance (<=14px) paired with the wipe, so
  // content has physical weight/momentum rather than just unmasking flat
  // in place. Independent of the (much larger) legacy `y` magnitudes some
  // call sites still pass, which now only matter for their sign.
  const settleDistance = Math.min(Math.abs(y), 14) * direction;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ clipPath: closedClipPath, y: settleDistance, scale: 0.985 }}
      animate={
        revealed
          ? { clipPath: openClipPath, y: 0, scale: 1 }
          : { clipPath: closedClipPath, y: settleDistance, scale: 0.985 }
      }
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ willChange: "clip-path, transform" }}
    >
      {children}
    </motion.div>
  );
}
