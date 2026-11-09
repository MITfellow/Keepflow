import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .max(320, "Email is too long.")
  .toLowerCase()
  .pipe(z.email("Enter a valid email address."));

export const referralCodeSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]{7,10}$/);

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidEmail(raw: string): boolean {
  return emailSchema.safeParse(raw).success;
}

export function sanitizeOptional(value: unknown, maxLength = 120): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value
    .trim()
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .slice(0, maxLength);
  return cleaned.length > 0 ? cleaned : null;
}
