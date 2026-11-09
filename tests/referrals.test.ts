import { describe, expect, it } from "vitest";

import {
  effectivePosition,
  hasPriorityAccess,
  referralsUntilPriority,
  REFERRAL_MILESTONE,
  REFERRAL_STEP,
} from "@/lib/referrals";

describe("referral math", () => {
  it("leaves the raw position alone with no referrals", () => {
    expect(effectivePosition(42, 0)).toBe(42);
  });

  it("lifts three places per referral", () => {
    expect(effectivePosition(42, 1)).toBe(42 - REFERRAL_STEP);
    expect(effectivePosition(42, 2)).toBe(42 - REFERRAL_STEP * 2);
  });

  it("never goes below first place", () => {
    expect(effectivePosition(5, 20)).toBe(1);
  });

  it("caps the total lift at sixty places", () => {
    expect(effectivePosition(200, 20)).toBe(140);
    expect(effectivePosition(200, 50)).toBe(140);
  });

  it("ignores negative or fractional referral counts", () => {
    expect(effectivePosition(10, -4)).toBe(10);
    expect(effectivePosition(10, 1.9)).toBe(7);
  });

  it("awards priority at the milestone", () => {
    expect(hasPriorityAccess(REFERRAL_MILESTONE - 1)).toBe(false);
    expect(hasPriorityAccess(REFERRAL_MILESTONE)).toBe(true);
    expect(hasPriorityAccess(REFERRAL_MILESTONE + 1)).toBe(true);
  });

  it("counts referrals until priority", () => {
    expect(referralsUntilPriority(0)).toBe(3);
    expect(referralsUntilPriority(2)).toBe(1);
    expect(referralsUntilPriority(3)).toBe(0);
    expect(referralsUntilPriority(7)).toBe(0);
  });
});
