import { NextResponse } from "next/server";
import { z } from "zod";

import { getClientIp, hashForPrivacy } from "@/lib/crypto";
import { sendConfirmationEmail } from "@/lib/email";
import { hasJsonContentType, isSameOrigin, noStoreJson } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { effectivePosition } from "@/lib/referrals";
import { absoluteUrl } from "@/lib/site";
import { getWaitlistStore, WaitlistStoreNotConfiguredError } from "@/lib/store";
import { emailSchema, referralCodeSchema, sanitizeOptional } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().max(320),
  referral: z.string().max(40).nullish(),
  source: z.string().max(160).nullish(),
  utmSource: z.string().max(160).nullish(),
  utmMedium: z.string().max(160).nullish(),
  utmCampaign: z.string().max(160).nullish(),
  company: z.string().max(240).nullish(),
  elapsedMs: z.number().finite().nullish(),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return noStoreJson({ ok: false, code: "forbidden" }, { status: 403 });
  }

  if (!hasJsonContentType(request)) {
    return noStoreJson(
      { ok: false, code: "unsupported_media_type" },
      { status: 415 },
    );
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

  const body = parsed.data;

  if (typeof body.company === "string" && body.company.trim().length > 0) {
    // Honeypot: accept silently, never persist, never email.
    return noStoreJson({ ok: true, status: "success", position: null });
  }

  if (
    typeof body.elapsedMs === "number" &&
    (body.elapsedMs < 900 || body.elapsedMs > 24 * 60 * 60 * 1_000)
  ) {
    return noStoreJson(
      {
        ok: false,
        code: "too_fast",
        error: "That was a little too quick. Please try once more.",
      },
      { status: 400 },
    );
  }

  const emailResult = emailSchema.safeParse(body.email);

  if (!emailResult.success) {
    return noStoreJson(
      {
        ok: false,
        code: "invalid_email",
        error: "Enter a valid email address.",
      },
      { status: 400 },
    );
  }

  const ip = getClientIp(request.headers);
  const ipHash = hashForPrivacy(ip, process.env.IP_HASH_SALT || "keepflow-dev");
  const limit = checkRateLimit(`waitlist:${ipHash}`, {
    limit: 6,
    windowMs: 15 * 60 * 1_000,
  });

  if (!limit.allowed) {
    return noStoreJson(
      {
        ok: false,
        code: "rate_limited",
        error: "Too many tries in a short window. Give it a minute, then try again.",
        retryAfter: limit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      },
    );
  }

  const referralCandidate =
    typeof body.referral === "string" ? body.referral.trim().toLowerCase() : "";
  const referralParsed = referralCodeSchema.safeParse(referralCandidate);
  const referredByCode = referralParsed.success ? referralParsed.data : null;

  try {
    const store = getWaitlistStore();
    const { entry, alreadyJoined } = await store.join({
      email: emailResult.data,
      referralCode: "",
      referredByCode,
      source: sanitizeOptional(body.source, 160),
      utmSource: sanitizeOptional(body.utmSource, 160),
      utmMedium: sanitizeOptional(body.utmMedium, 160),
      utmCampaign: sanitizeOptional(body.utmCampaign, 160),
      ipHash,
    });

    if (alreadyJoined) {
      return noStoreJson({
        ok: true,
        status: "duplicate",
        position: null,
        referralUrl: null,
        referralCount: entry.referralCount,
        emailSent: false,
      });
    }

    const referralUrl = absoluteUrl(`/?ref=${encodeURIComponent(entry.referralCode)}`);
    const unsubscribeUrl = absoluteUrl(
      `/unsubscribe?token=${encodeURIComponent(entry.unsubscribeToken)}`,
    );

    const email = await sendConfirmationEmail({
      to: entry.email,
      position: effectivePosition(entry.position, entry.referralCount),
      referralUrl,
      unsubscribeUrl,
    });

    return noStoreJson(
      {
        ok: true,
        status: "joined",
        position: effectivePosition(entry.position, entry.referralCount),
        referralUrl,
        referralCount: entry.referralCount,
        emailSent: email.sent,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof WaitlistStoreNotConfiguredError) {
      return noStoreJson(
        {
          ok: false,
          code: "unavailable",
          error: "The waitlist is not open just now. Please try again later.",
        },
        { status: 503 },
      );
    }

    console.error("[waitlist] join failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });

    return noStoreJson(
      {
        ok: false,
        code: "server_error",
        error: "We couldn't save your spot just now. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}

export function GET() {
  return NextResponse.json(
    { ok: false, code: "method_not_allowed" },
    { status: 405, headers: { Allow: "POST", "Cache-Control": "no-store" } },
  );
}
