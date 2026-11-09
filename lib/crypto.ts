import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const REFERRAL_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function createReferralCode(length = 8): string {
  const bytes = randomBytes(length);
  let code = "";

  for (let index = 0; index < length; index += 1) {
    code += REFERRAL_ALPHABET[bytes[index] % REFERRAL_ALPHABET.length];
  }

  return code;
}

export function hashForPrivacy(value: string, salt = process.env.IP_HASH_SALT || "rill-dev"): string {
  return createHmac("sha256", salt).update(value).digest("hex");
}

export function createAdminSessionToken(secret: string): string {
  return createHmac("sha256", secret).update("rill-admin-session:v1").digest("hex");
}

export function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";

  return headers.get("x-real-ip")?.trim() || "unknown";
}

export function hashEmail(email: string): string {
  return hashForPrivacy(email).slice(0, 12);
}
