import { describe, expect, it } from "vitest";

import {
  createAdminSessionToken,
  createReferralCode,
  hashForPrivacy,
  safeEqual,
} from "@/lib/crypto";

describe("crypto helpers", () => {
  it("creates unambiguous referral codes", () => {
    const codes = new Set(Array.from({ length: 50 }, () => createReferralCode()));

    expect(codes.size).toBe(50);
    for (const code of codes) {
      expect(code).toMatch(/^[a-hj-km-np-z2-9]{8}$/);
    }
  });

  it("hashes deterministically with the same salt", () => {
    expect(hashForPrivacy("203.0.113.4", "salt-a")).toBe(
      hashForPrivacy("203.0.113.4", "salt-a"),
    );
    expect(hashForPrivacy("203.0.113.4", "salt-a")).not.toBe(
      hashForPrivacy("203.0.113.4", "salt-b"),
    );
  });

  it("compares secrets without accepting different lengths", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
  });

  it("derives a stable admin token from the secret", () => {
    const token = createAdminSessionToken("a-long-admin-secret");

    expect(token).toHaveLength(64);
    expect(createAdminSessionToken("a-long-admin-secret")).toBe(token);
    expect(createAdminSessionToken("another-secret")).not.toBe(token);
  });
});
