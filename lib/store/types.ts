export type WaitlistEntry = {
  id: string;
  email: string;
  createdAt: string;
  referralCode: string;
  referredBy: string | null;
  referralCount: number;
  position: number;
  source: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  ipHash: string | null;
  unsubscribeToken: string;
  unsubscribedAt: string | null;
};

export type JoinWaitlistInput = {
  email: string;
  referralCode: string;
  referredByCode: string | null;
  source: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  ipHash: string | null;
};

export type JoinWaitlistResult = {
  entry: WaitlistEntry;
  alreadyJoined: boolean;
};

export type DailySignupCount = {
  date: string;
  count: number;
};

export type WaitlistStats = {
  total: number;
  active: number;
  priority: number;
  last7Days: number;
  daily: DailySignupCount[];
};

export interface WaitlistStore {
  join(input: JoinWaitlistInput): Promise<JoinWaitlistResult>;
  getCount(): Promise<number>;
  getStats(days?: number): Promise<WaitlistStats>;
  listForExport(): Promise<WaitlistEntry[]>;
  unsubscribe(token: string): Promise<boolean>;
}

export class WaitlistStoreNotConfiguredError extends Error {
  constructor() {
    super(
      "Waitlist storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
    this.name = "WaitlistStoreNotConfiguredError";
  }
}
