import { beforeEach, describe, expect, it } from "vitest";

import { checkRateLimit, resetRateLimitsForTests } from "@/lib/rate-limit";

beforeEach(() => {
  resetRateLimitsForTests();
});

describe("rate limiting", () => {
  it("allows requests up to the limit and then blocks", () => {
    const options = { limit: 3, windowMs: 60_000 };

    expect(checkRateLimit("ip-a", options).allowed).toBe(true);
    expect(checkRateLimit("ip-a", options).allowed).toBe(true);
    expect(checkRateLimit("ip-a", options).allowed).toBe(true);

    const blocked = checkRateLimit("ip-a", options);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("keys buckets independently", () => {
    expect(checkRateLimit("ip-a", { limit: 1 }).allowed).toBe(true);
    expect(checkRateLimit("ip-a", { limit: 1 }).allowed).toBe(false);
    expect(checkRateLimit("ip-b", { limit: 1 }).allowed).toBe(true);
  });

  it("reports remaining requests", () => {
    expect(checkRateLimit("ip-c", { limit: 5 }).remaining).toBe(4);
    expect(checkRateLimit("ip-c", { limit: 5 }).remaining).toBe(3);
  });
});
