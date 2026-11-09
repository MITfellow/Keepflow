import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { createReferralCode } from "@/lib/crypto";
import { effectivePosition, hasPriorityAccess } from "@/lib/referrals";
import type {
  DailySignupCount,
  JoinWaitlistInput,
  JoinWaitlistResult,
  WaitlistEntry,
  WaitlistStats,
  WaitlistStore,
} from "@/lib/store/types";

type FileDatabase = {
  version: 1;
  sequence: number;
  entries: WaitlistEntry[];
};

const EMPTY_DATABASE = (): FileDatabase => ({ version: 1, sequence: 0, entries: [] });

let mutationQueue: Promise<unknown> = Promise.resolve();

function getStorePath(): string {
  const configured = process.env.WAITLIST_FILE_PATH?.trim();
  if (configured) return configured;

  if (process.env.VERCEL) {
    return path.join("/tmp", "rill-waitlist.json");
  }

  return path.join(process.cwd(), ".data", "waitlist.json");
}

async function readDatabase(): Promise<FileDatabase> {
  const storePath = getStorePath();

  try {
    const raw = await readFile(/* turbopackIgnore: true */ storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<FileDatabase>;

    if (!Array.isArray(parsed.entries)) return EMPTY_DATABASE();

    return {
      version: 1,
      sequence: Number.isFinite(parsed.sequence) ? Number(parsed.sequence) : parsed.entries.length,
      entries: parsed.entries,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return EMPTY_DATABASE();
    }
    throw error;
  }
}

async function writeDatabase(database: FileDatabase): Promise<void> {
  const storePath = getStorePath();
  await mkdir(path.dirname(storePath), { recursive: true });

  const temporaryPath = `${storePath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(database, null, 2)}\n`, "utf8");
  await rename(temporaryPath, storePath);
}

function mutate<T>(operation: () => Promise<T>): Promise<T> {
  const next = mutationQueue.then(operation, operation);
  mutationQueue = next.catch(() => undefined);
  return next;
}

function groupByUtcDay(entries: WaitlistEntry[], days: number): DailySignupCount[] {
  const today = new Date();
  const daily: DailySignupCount[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - offset),
    );
    daily.push({ date: date.toISOString().slice(0, 10), count: 0 });
  }

  const byDate = new Map(daily.map((day) => [day.date, day]));

  for (const entry of entries) {
    const date = entry.createdAt.slice(0, 10);
    const day = byDate.get(date);
    if (day) day.count += 1;
  }

  return daily;
}

export const fileWaitlistStore: WaitlistStore = {
  async join(input: JoinWaitlistInput): Promise<JoinWaitlistResult> {
    return mutate(async () => {
      const database = await readDatabase();
      const email = input.email.trim().toLowerCase();
      const existing = database.entries.find((entry) => entry.email === email);

      if (existing) {
        if (!existing.unsubscribedAt) {
          return { entry: existing, alreadyJoined: true };
        }

        // A returning subscriber keeps their original place. Referral credit is
        // not granted twice, and any previous unsubscribe state is cleared.
        existing.unsubscribedAt = null;
        existing.source = input.source;
        existing.utmSource = input.utmSource;
        existing.utmMedium = input.utmMedium;
        existing.utmCampaign = input.utmCampaign;
        existing.ipHash = input.ipHash;
        await writeDatabase(database);

        return { entry: existing, alreadyJoined: false };
      }

      const referrer = input.referredByCode
        ? database.entries.find(
            (entry) =>
              entry.referralCode === input.referredByCode && entry.unsubscribedAt === null,
          )
        : undefined;

      let referralCode = createReferralCode();
      while (database.entries.some((entry) => entry.referralCode === referralCode)) {
        referralCode = createReferralCode();
      }

      database.sequence += 1;
      const entry: WaitlistEntry = {
        id: randomUUID(),
        email,
        createdAt: new Date().toISOString(),
        referralCode,
        referredBy: referrer?.id ?? null,
        referralCount: 0,
        position: database.sequence,
        source: input.source,
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
        ipHash: input.ipHash,
        unsubscribeToken: randomUUID(),
        unsubscribedAt: null,
      };

      if (referrer) {
        referrer.referralCount += 1;
      }

      database.entries.push(entry);
      await writeDatabase(database);

      return { entry, alreadyJoined: false };
    });
  },

  async getCount(): Promise<number> {
    const database = await readDatabase();
    return database.entries.filter((entry) => entry.unsubscribedAt === null).length;
  },

  async getStats(days = 14): Promise<WaitlistStats> {
    const database = await readDatabase();
    const activeEntries = database.entries.filter((entry) => entry.unsubscribedAt === null);
    const windowStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1_000).toISOString();

    return {
      total: database.entries.length,
      active: activeEntries.length,
      priority: activeEntries.filter((entry) => hasPriorityAccess(entry.referralCount)).length,
      last7Days: database.entries.filter((entry) => entry.createdAt >= windowStart).length,
      daily: groupByUtcDay(database.entries, days),
    };
  },

  async listForExport(): Promise<WaitlistEntry[]> {
    const database = await readDatabase();
    return database.entries.toSorted((left, right) => left.position - right.position);
  },

  async unsubscribe(token: string): Promise<boolean> {
    return mutate(async () => {
      const database = await readDatabase();
      const entry = database.entries.find((item) => item.unsubscribeToken === token);

      if (!entry) return false;

      if (!entry.unsubscribedAt) {
        entry.unsubscribedAt = new Date().toISOString();

        // Keep only the minimum needed to honour the opt-out and keep the
        // historical position: no campaign source, IP hash, or referral edge.
        entry.source = null;
        entry.utmSource = null;
        entry.utmMedium = null;
        entry.utmCampaign = null;
        entry.ipHash = null;
        entry.referredBy = null;

        let retiredCode = createReferralCode();
        while (database.entries.some((item) => item.referralCode === retiredCode)) {
          retiredCode = createReferralCode();
        }
        entry.referralCode = retiredCode;

        await writeDatabase(database);
      }

      return true;
    });
  },
};

export function getEffectivePosition(entry: WaitlistEntry): number {
  return effectivePosition(entry.position, entry.referralCount);
}
