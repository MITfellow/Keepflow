import "server-only";

import { cookies } from "next/headers";

import { createAdminSessionToken, safeEqual } from "@/lib/crypto";

export const ADMIN_COOKIE_NAME = "keepflow_admin";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

export function getAdminSecret(): string | null {
  const secret = process.env.ADMIN_SECRET?.trim();
  return secret && secret.length >= 16 ? secret : null;
}

export function isAdminConfigured(): boolean {
  return getAdminSecret() !== null;
}

export function verifyAdminSecret(candidate: string): boolean {
  const secret = getAdminSecret();
  if (!secret) return false;

  return safeEqual(candidate, secret);
}

export async function isAuthenticatedAdmin(): Promise<boolean> {
  const secret = getAdminSecret();
  if (!secret) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;

  return safeEqual(token, createAdminSessionToken(secret));
}

export function getAdminCookieValue(): string | null {
  const secret = getAdminSecret();
  return secret ? createAdminSessionToken(secret) : null;
}
