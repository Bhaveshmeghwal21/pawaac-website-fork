// Fixed-window rate limiting for the public, unauthenticated form endpoints.
//
// /api/contact and /api/careers accept POSTs from anyone with no auth, no
// captcha and no session. Before lead delivery was wired up that only cost a
// log line; now that a submission sends real email, an unthrottled endpoint is
// a way to flood the company inbox (and burn the email provider's quota) from a
// single script. This is the floor, not a complete answer.
//
// KNOWN LIMITATION, stated plainly: the counter lives in module memory, so it
// is per server instance. On a platform that runs several instances or scales
// serverless functions per request, the effective limit is
// `LIMIT x instanceCount`, and a cold start resets it. That is still a large
// improvement over no limit at all, but if abuse actually happens the fix is a
// shared store (Redis/Upstash) or a captcha, not a bigger number here.

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

// Bound the map so a stream of spoofed X-Forwarded-For values cannot grow it
// without limit. Expired entries are swept first; if everything is still live
// we stop inserting rather than consume unbounded memory.
const MAX_TRACKED_KEYS = 10_000;

function sweep(now: number) {
  for (const [key, win] of windows) {
    if (win.resetAt <= now) windows.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  /** Seconds until the current window resets. Suitable for `Retry-After`. */
  retryAfterSeconds: number;
};

/**
 * Records a hit for `key` and reports whether it is allowed.
 *
 * @param key      Caller identity — use `clientKeyFromHeaders`.
 * @param limit    Maximum requests permitted per window.
 * @param windowMs Window length in milliseconds.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    if (windows.size >= MAX_TRACKED_KEYS) {
      sweep(now);
      // Still full of live windows: refuse to track anything new. Allowing the
      // request is the deliberate choice — dropping legitimate traffic because
      // an attacker filled the table would turn a spam problem into an outage.
      if (windows.size >= MAX_TRACKED_KEYS) {
        return { allowed: true, retryAfterSeconds: 0 };
      }
    }
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Best-effort caller identity from proxy headers.
 *
 * `NextRequest.ip` does not exist in Next 16, so this reads the forwarding
 * headers the host sets. These are client-controllable in principle; behind a
 * platform proxy (Vercel, Cloudflare, a configured nginx) the leftmost entry of
 * `x-forwarded-for` is the real client. Falls back to a single shared bucket
 * when no header is present, which is stricter rather than looser.
 */
export function clientKeyFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/** Exposed only so tests can start from a clean slate. */
export function __resetRateLimitForTests() {
  windows.clear();
}
