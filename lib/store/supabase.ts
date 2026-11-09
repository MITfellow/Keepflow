import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

import { createReferralCode } from "@/lib/crypto";
import { hasPriorityAccess } from "@/lib/referrals";
import type {
  DailySignupCount,
  JoinWaitlistInput,
  JoinWaitlistResult,
  WaitlistEntry,
  WaitlistStats,
  WaitlistStore,
} from "@/lib/store/types";

type WaitlistRow = {
  id: string;
  email: string;
  created_at: string;
  referral_code: string;
  referred_by: string | null;
  referral_count: number;
  position: number;
  source: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  ip_hash: string | null;
  unsubscribe_token: string;
  unsubscribed_at: string | null;
};

type Client = SupabaseClient;

let client: Client | null = null;

function getClient(): Client {
  if (client) return client;

  const url = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  client = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "X-Client-Info": "keepflow-waitlist/1.0",
      },
    },
  });

  return client;
}

function toEntry(row: WaitlistRow): WaitlistEntry {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at,
    referralCode: row.referral_code,
    referredBy: row.referred_by,
    referralCount: Number(row.referral_count ?? 0),
    position: Number(row.position),
    source: row.source,
    utmSource: row.utm_source,
    utmMedium: row.utm_medium,
    utmCampaign: row.utm_campaign,
    ipHash: row.ip_hash,
    unsubscribeToken: row.unsubscribe_token,
    unsubscribedAt: row.unsubscribed_at,
  };
}

async function findByEmail(db: Client, email: string): Promise<WaitlistEntry | null> {
  const { data, error } = await db
    .from("waitlist")
    .select("*")
    .eq("email", email)
    .maybeSingle<WaitlistRow>();

  if (error) throw error;
  return data ? toEntry(data) : null;
}

async function findReferrer(
  db: Client,
  referralCode: string,
): Promise<{ id: string } | null> {
  const { data, error } = await db
    .from("waitlist")
    .select("id")
    .eq("referral_code", referralCode)
    .is("unsubscribed_at", null)
    .maybeSingle<{ id: string }>();

  if (error) throw error;
  return data ?? null;
}

async function countRows(
  db: Client,
  filters?: { unsubscribed?: boolean },
): Promise<number> {
  let query = db.from("waitlist").select("id", { count: "exact", head: true });

  if (filters?.unsubscribed === false) {
    query = query.is("unsubscribed_at", null);
  }

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

async function countPriority(db: Client): Promise<number> {
  const { count, error } = await db
    .from("waitlist")
    .select("id", { count: "exact", head: true })
    .is("unsubscribed_at", null)
    .gte("referral_count", 3);

  if (error) throw error;
  return count ?? 0;
}

async function countSince(db: Client, sinceIso: string): Promise<number> {
  const { count, error } = await db
    .from("waitlist")
    .select("id", { count: "exact", head: true })
    .gte("created_at", sinceIso);

  if (error) throw error;
  return count ?? 0;
}

function groupCreatedAtByDay(rows: Array<{ created_at: string }>, days: number): DailySignupCount[] {
  const today = new Date();
  const daily: DailySignupCount[] = [];

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - offset),
    );
    daily.push({ date: date.toISOString().slice(0, 10), count: 0 });
  }

  const byDate = new Map(daily.map((day) => [day.date, day]));

  for (const row of rows) {
    const date = row.created_at.slice(0, 10);
    const day = byDate.get(date);
    if (day) day.count += 1;
  }

  return daily;
}

export const supabaseWaitlistStore: WaitlistStore = {
  async join(input: JoinWaitlistInput): Promise<JoinWaitlistResult> {
    const db = getClient();
    const email = input.email.trim().toLowerCase();
    const existing = await findByEmail(db, email);

    if (existing) {
      if (!existing.unsubscribedAt) {
        return { entry: existing, alreadyJoined: true };
      }

      // A returning subscriber keeps their original place. Referral credit is
      // not granted twice, and the previous opt-out state is cleared.
      const { data, error } = await db
        .from("waitlist")
        .update({
          unsubscribed_at: null,
          source: input.source,
          utm_source: input.utmSource,
          utm_medium: input.utmMedium,
          utm_campaign: input.utmCampaign,
          ip_hash: input.ipHash,
        })
        .eq("id", existing.id)
        .select("*")
        .single<WaitlistRow>();

      if (error || !data) {
        throw error instanceof Error
          ? error
          : new Error("Could not reactivate waitlist entry.");
      }

      return { entry: toEntry(data), alreadyJoined: false };
    }

    const referrer = input.referredByCode
      ? await findReferrer(db, input.referredByCode)
      : null;

    let lastError: unknown = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { data, error } = await db
        .from("waitlist")
        .insert({
          email,
          referral_code: createReferralCode(),
          referred_by: referrer?.id ?? null,
          source: input.source,
          utm_source: input.utmSource,
          utm_medium: input.utmMedium,
          utm_campaign: input.utmCampaign,
          ip_hash: input.ipHash,
          unsubscribe_token: randomUUID(),
        })
        .select("*")
        .single<WaitlistRow>();

      if (!error && data) {
        return { entry: toEntry(data), alreadyJoined: false };
      }

      lastError = error;

      if (error?.code === "23505") {
        const racedExisting = await findByEmail(db, email);
        if (racedExisting) {
          return { entry: racedExisting, alreadyJoined: true };
        }
      }
    }

    throw lastError instanceof Error ? lastError : new Error("Could not create waitlist entry.");
  },

  async getCount(): Promise<number> {
    return countRows(getClient(), { unsubscribed: false });
  },

  async getStats(days = 14): Promise<WaitlistStats> {
    const db = getClient();
    const sinceSevenDays = new Date(Date.now() - 7 * 24 * 60 * 60 * 1_000).toISOString();
    const sinceChart = new Date(
      Date.now() - Math.max(1, days) * 24 * 60 * 60 * 1_000,
    ).toISOString();

    const [total, active, priority, last7Days, recent] = await Promise.all([
      countRows(db),
      countRows(db, { unsubscribed: false }),
      countPriority(db),
      countSince(db, sinceSevenDays),
      db
        .from("waitlist")
        .select("created_at")
        .gte("created_at", sinceChart)
        .order("created_at", { ascending: true })
        .limit(10_000),
    ]);

    if (recent.error) throw recent.error;

    return {
      total,
      active,
      priority,
      last7Days,
      daily: groupCreatedAtByDay(recent.data ?? [], days),
    };
  },

  async listForExport(): Promise<WaitlistEntry[]> {
    const db = getClient();
    const pageSize = 1_000;
    const rows: WaitlistRow[] = [];

    for (let from = 0; from < 50_000; from += pageSize) {
      const { data, error } = await db
        .from("waitlist")
        .select("*")
        .order("position", { ascending: true })
        .range(from, from + pageSize - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;

      rows.push(...(data as WaitlistRow[]));
      if (data.length < pageSize) break;
    }

    return rows.map(toEntry);
  },

  async unsubscribe(token: string): Promise<boolean> {
    const db = getClient();

    // Keep only the minimum needed to honour the opt-out and keep the
    // historical position. Retiring the referral code invalidates old links.
    const { data, error } = await db
      .from("waitlist")
      .update({
        unsubscribed_at: new Date().toISOString(),
        source: null,
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        ip_hash: null,
        referred_by: null,
        referral_code: createReferralCode(),
      })
      .eq("unsubscribe_token", token)
      .is("unsubscribed_at", null)
      .select("id")
      .maybeSingle<{ id: string }>();

    if (error) throw error;

    if (data) return true;

    const { data: existing, error: existingError } = await getClient()
      .from("waitlist")
      .select("id")
      .eq("unsubscribe_token", token)
      .maybeSingle<{ id: string }>();

    if (existingError) throw existingError;
    return Boolean(existing);
  },
};

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

export function getSupabaseAdminClient(): Client {
  return getClient();
}

export function isPriority(referralCount: number): boolean {
  return hasPriorityAccess(referralCount);
}
