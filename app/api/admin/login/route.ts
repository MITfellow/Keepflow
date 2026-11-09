import { NextResponse } from "next/server";
import { z } from "zod";

import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE,
  getAdminCookieValue,
  isAdminConfigured,
  verifyAdminSecret,
} from "@/lib/admin-auth";
import { getClientIp } from "@/lib/crypto";
import { hasJsonContentType, isSameOrigin, noStoreJson } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  secret: z.string().min(1).max(512),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return noStoreJson({ ok: false, code: "forbidden" }, { status: 403 });
  }

  if (!hasJsonContentType(request)) {
    return noStoreJson({ ok: false, code: "unsupported_media_type" }, { status: 415 });
  }

  if (!isAdminConfigured()) {
    return noStoreJson({ ok: false, code: "admin_unavailable" }, { status: 503 });
  }

  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return noStoreJson({ ok: false, code: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);

  if (!parsed.success) {
    return noStoreJson({ ok: false, code: "invalid_request" }, { status: 400 });
  }

  const limit = checkRateLimit(`admin-login:${getClientIp(request.headers)}`, {
    limit: 6,
    windowMs: 15 * 60 * 1_000,
  });

  if (!limit.allowed) {
    return noStoreJson(
      { ok: false, code: "rate_limited", retryAfter: limit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  if (!verifyAdminSecret(parsed.data.secret)) {
    return noStoreJson({ ok: false, code: "invalid_credentials" }, { status: 401 });
  }

  const token = getAdminCookieValue();

  if (!token) {
    return noStoreJson({ ok: false, code: "admin_unavailable" }, { status: 503 });
  }

  const response = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );

  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  return response;
}
