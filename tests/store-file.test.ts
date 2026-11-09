import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { fileWaitlistStore, getEffectivePosition } from "@/lib/store/file";
import type { JoinWaitlistInput } from "@/lib/store/types";

let directory = "";

function input(overrides: Partial<JoinWaitlistInput> = {}): JoinWaitlistInput {
  return {
    email: "person@example.com",
    referralCode: "",
    referredByCode: null,
    source: null,
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    ipHash: "hash",
    ...overrides,
  };
}

beforeEach(async () => {
  directory = await mkdtemp(path.join(os.tmpdir(), "rill-waitlist-test-"));
  process.env.WAITLIST_FILE_PATH = path.join(directory, "waitlist.json");
});

afterEach(async () => {
  delete process.env.WAITLIST_FILE_PATH;
  await rm(directory, { recursive: true, force: true });
});

describe("file waitlist store", () => {
  it("creates the first entry at position one", async () => {
    const { entry, alreadyJoined } = await fileWaitlistStore.join(
      input({ email: "  First@Example.com ", source: "hero" }),
    );

    expect(alreadyJoined).toBe(false);
    expect(entry.email).toBe("first@example.com");
    expect(entry.position).toBe(1);
    expect(entry.referralCode).toMatch(/^[a-z0-9]{8}$/);
    expect(entry.referralCount).toBe(0);
    expect(entry.source).toBe("hero");
    expect(entry.unsubscribedAt).toBeNull();
    await expect(fileWaitlistStore.getCount()).resolves.toBe(1);
  });

  it("treats a duplicate email as the same place", async () => {
    const first = await fileWaitlistStore.join(input({ email: "same@example.com" }));
    const second = await fileWaitlistStore.join(input({ email: "SAME@example.com" }));

    expect(second.alreadyJoined).toBe(true);
    expect(second.entry.id).toBe(first.entry.id);
    expect(second.entry.position).toBe(1);
    await expect(fileWaitlistStore.getCount()).resolves.toBe(1);
  });

  it("credits referrals and unlocks priority at three", async () => {
    const referrer = await fileWaitlistStore.join(input({ email: "referrer@example.com" }));

    await fileWaitlistStore.join(
      input({ email: "one@example.com", referredByCode: referrer.entry.referralCode }),
    );
    await fileWaitlistStore.join(
      input({ email: "two@example.com", referredByCode: referrer.entry.referralCode }),
    );

    let entries = await fileWaitlistStore.listForExport();
    let refreshed = entries.find((entry) => entry.email === "referrer@example.com");

    expect(refreshed?.referralCount).toBe(2);
    expect(await fileWaitlistStore.getStats()).toMatchObject({ priority: 0 });

    await fileWaitlistStore.join(
      input({ email: "three@example.com", referredByCode: referrer.entry.referralCode }),
    );

    entries = await fileWaitlistStore.listForExport();
    refreshed = entries.find((entry) => entry.email === "referrer@example.com");

    expect(refreshed?.referralCount).toBe(3);
    expect(refreshed && getEffectivePosition(refreshed)).toBe(1);
    expect(await fileWaitlistStore.getStats()).toMatchObject({ priority: 1 });
  });

  it("ignores an unknown referral code", async () => {
    const { entry } = await fileWaitlistStore.join(
      input({ email: "new@example.com", referredByCode: "doesnot1" }),
    );

    expect(entry.referredBy).toBeNull();
    const entries = await fileWaitlistStore.listForExport();
    expect(entries.every((item) => item.referralCount === 0)).toBe(true);
  });

  it("unsubscribes idempotently and scrubs campaign and referral details", async () => {
    const { entry } = await fileWaitlistStore.join(
      input({
        email: "leave@example.com",
        source: "hero",
        utmSource: "newsletter",
        utmMedium: "email",
        utmCampaign: "launch",
        referredByCode: null,
      }),
    );

    await expect(fileWaitlistStore.unsubscribe(entry.unsubscribeToken)).resolves.toBe(true);
    await expect(fileWaitlistStore.unsubscribe(entry.unsubscribeToken)).resolves.toBe(true);
    await expect(fileWaitlistStore.unsubscribe("00000000-0000-4000-8000-000000000000")).resolves.toBe(false);

    await expect(fileWaitlistStore.getCount()).resolves.toBe(0);
    const stats = await fileWaitlistStore.getStats();
    expect(stats.total).toBe(1);
    expect(stats.active).toBe(0);
    expect(stats.daily.reduce((sum, day) => sum + day.count, 0)).toBe(1);

    const [stored] = await fileWaitlistStore.listForExport();
    expect(stored.unsubscribedAt).not.toBeNull();
    expect(stored.source).toBeNull();
    expect(stored.utmSource).toBeNull();
    expect(stored.utmMedium).toBeNull();
    expect(stored.utmCampaign).toBeNull();
    expect(stored.ipHash).toBeNull();
    expect(stored.referredBy).toBeNull();
    expect(stored.referralCode).not.toBe(entry.referralCode);
  });

  it("reactivates a returning subscriber without granting referral credit twice", async () => {
    const referrer = await fileWaitlistStore.join(input({ email: "host@example.com" }));
    const returning = await fileWaitlistStore.join(
      input({
        email: "return@example.com",
        referredByCode: referrer.entry.referralCode,
      }),
    );

    await fileWaitlistStore.unsubscribe(returning.entry.unsubscribeToken);

    const rejoined = await fileWaitlistStore.join(
      input({
        email: "RETURN@example.com",
        referredByCode: referrer.entry.referralCode,
        source: "home-hero",
      }),
    );

    expect(rejoined.alreadyJoined).toBe(false);
    expect(rejoined.entry.id).toBe(returning.entry.id);
    expect(rejoined.entry.position).toBe(returning.entry.position);
    expect(rejoined.entry.unsubscribedAt).toBeNull();
    expect(rejoined.entry.source).toBe("home-hero");
    expect(await fileWaitlistStore.getCount()).toBe(2);

    const entries = await fileWaitlistStore.listForExport();
    const refreshedReferrer = entries.find((entry) => entry.email === "host@example.com");
    expect(refreshedReferrer?.referralCount).toBe(1);
  });

  it("does not credit a referral from someone who has left", async () => {
    const referrer = await fileWaitlistStore.join(input({ email: "gone@example.com" }));
    await fileWaitlistStore.unsubscribe(referrer.entry.unsubscribeToken);

    const friend = await fileWaitlistStore.join(
      input({ email: "friend@example.com", referredByCode: referrer.entry.referralCode }),
    );

    expect(friend.entry.referredBy).toBeNull();
    const entries = await fileWaitlistStore.listForExport();
    const refreshed = entries.find((entry) => entry.email === "gone@example.com");
    expect(refreshed?.referralCount).toBe(0);
  });

  it("orders exports by position", async () => {
    await fileWaitlistStore.join(input({ email: "a@example.com" }));
    await fileWaitlistStore.join(input({ email: "b@example.com" }));
    await fileWaitlistStore.join(input({ email: "c@example.com" }));

    const entries = await fileWaitlistStore.listForExport();
    expect(entries.map((entry) => entry.position)).toEqual([1, 2, 3]);
  });
});
