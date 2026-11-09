export const REFERRAL_MILESTONE = 3;
export const REFERRAL_STEP = 3;
const MAX_REFERRAL_LIFT = 60;

export function effectivePosition(position: number, referralCount: number): number {
  if (referralCount <= 0) return position;

  const lift = Math.min(
    Math.max(0, Math.trunc(referralCount)) * REFERRAL_STEP,
    MAX_REFERRAL_LIFT,
  );

  return Math.max(1, position - lift);
}

export function hasPriorityAccess(referralCount: number): boolean {
  return referralCount >= REFERRAL_MILESTONE;
}

export function referralsUntilPriority(referralCount: number): number {
  return Math.max(0, REFERRAL_MILESTONE - referralCount);
}
