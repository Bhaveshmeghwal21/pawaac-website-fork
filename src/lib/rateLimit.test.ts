import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetRateLimitForTests,
  clientKeyFromHeaders,
  rateLimit,
} from "./rateLimit";

// The rate limiter guards the only two unauthenticated write endpoints on the
// site. Its failure modes are asymmetric: letting too much through means spam,
// but blocking too much means a real prospect's demo request is refused and they
// leave. Both directions are pinned here.

describe("rateLimit", () => {
  beforeEach(() => {
    __resetRateLimitForTests();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows exactly `limit` requests inside one window, then blocks", () => {
    for (let i = 0; i < 3; i++) {
      expect(rateLimit("ip-a", 3, 60_000).allowed).toBe(true);
    }
    expect(rateLimit("ip-a", 3, 60_000).allowed).toBe(false);
  });

  it("reports a positive Retry-After only when blocking", () => {
    expect(rateLimit("ip-b", 1, 60_000)).toEqual({
      allowed: true,
      retryAfterSeconds: 0,
    });

    const blocked = rateLimit("ip-b", 1, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it("starts a fresh window once the previous one expires", () => {
    expect(rateLimit("ip-c", 1, 1_000).allowed).toBe(true);
    expect(rateLimit("ip-c", 1, 1_000).allowed).toBe(false);

    vi.advanceTimersByTime(1_001);

    expect(rateLimit("ip-c", 1, 1_000).allowed).toBe(true);
  });

  it("tracks callers independently, so one abuser cannot block everyone", () => {
    expect(rateLimit("ip-d", 1, 60_000).allowed).toBe(true);
    expect(rateLimit("ip-d", 1, 60_000).allowed).toBe(false);

    // A different caller is unaffected.
    expect(rateLimit("ip-e", 1, 60_000).allowed).toBe(true);
  });

  it("keys the two endpoints separately when callers are prefixed", () => {
    expect(rateLimit("contact:ip-f", 1, 60_000).allowed).toBe(true);
    expect(rateLimit("contact:ip-f", 1, 60_000).allowed).toBe(false);
    // Submitting a job application must not be blocked by having just sent a
    // demo request.
    expect(rateLimit("careers:ip-f", 1, 60_000).allowed).toBe(true);
  });
});

describe("clientKeyFromHeaders", () => {
  it("takes the leftmost x-forwarded-for entry, which is the real client", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.9, 70.41.3.18, 150.172.238.178",
    });
    expect(clientKeyFromHeaders(headers)).toBe("203.0.113.9");
  });

  it("trims whitespace around a single forwarded address", () => {
    expect(
      clientKeyFromHeaders(new Headers({ "x-forwarded-for": "  198.51.100.4 " })),
    ).toBe("198.51.100.4");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", () => {
    expect(
      clientKeyFromHeaders(new Headers({ "x-real-ip": "198.51.100.7" })),
    ).toBe("198.51.100.7");
  });

  it("falls back to a single shared bucket when no proxy header is present", () => {
    // Stricter, not looser: unidentifiable callers share one budget rather than
    // each getting their own.
    expect(clientKeyFromHeaders(new Headers())).toBe("unknown");
  });
});
