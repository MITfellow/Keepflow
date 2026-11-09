import { z } from "zod";

import { getClientIp } from "@/lib/crypto";
import { hasJsonContentType, isSameOrigin, noStoreJson } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { getWaitlistStore, WaitlistStoreNotConfiguredError } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  token: z
    .string()
    .trim()
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return noStoreJson({ ok: false, code: "forbidden" }, { status: 403 });
  }

  if (!hasJsonContentType(request)) {
    return noStoreJson({ ok: false, code: "unsupported_media_type" }, { status: 415 });
  }

  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return noStoreJson({ ok: false, code: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);

  if (!parsed.success) {
    return noStoreJson({ ok: false, code: "invalid_token" }, { status: 400 });
  }

  const limit = checkRateLimit(`unsubscribe:${getClientIp(request.headers)}`, {
    limit: 10,
    windowMs: 60 * 1_000,
  });

  if (!limit.allowed) {
    return noStoreJson(
      { ok: false, code: "rate_limited", retryAfter: limit.retryAfterSeconds },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    await getWaitlistStore().unsubscribe(parsed.data.token);

    // The response is deliberately identical for valid, used, and unknown tokens.
    return noStoreJson({ ok: true });
  } catch (error) {
    if (error instanceof WaitlistStoreNotConfiguredError) {
      return noStoreJson({ ok: false, code: "unavailable" }, { status: 503 });
    }

    console.error("[waitlist] unsubscribe failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });

    return noStoreJson({ ok: false, code: "server_error" }, { status: 500 });
  }
}
