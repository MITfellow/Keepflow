import { isAuthenticatedAdmin } from "@/lib/admin-auth";
import { toCsv } from "@/lib/csv";
import { effectivePosition } from "@/lib/referrals";
import { getWaitlistStore, WaitlistStoreNotConfiguredError } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const columns = [
  "position",
  "effective_position",
  "email",
  "created_at",
  "referral_code",
  "referral_count",
  "referred_by",
  "source",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "unsubscribed_at",
];

export async function GET() {
  if (!(await isAuthenticatedAdmin())) {
    return Response.json(
      { ok: false, code: "unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const entries = await getWaitlistStore().listForExport();
    const rows = entries.map((entry) => ({
      position: entry.position,
      effective_position: effectivePosition(entry.position, entry.referralCount),
      email: entry.email,
      created_at: entry.createdAt,
      referral_code: entry.referralCode,
      referral_count: entry.referralCount,
      referred_by: entry.referredBy ?? "",
      source: entry.source ?? "",
      utm_source: entry.utmSource ?? "",
      utm_medium: entry.utmMedium ?? "",
      utm_campaign: entry.utmCampaign ?? "",
      unsubscribed_at: entry.unsubscribedAt ?? "",
    }));

    const csv = toCsv(rows, columns);
    const date = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="rill-waitlist-${date}.csv"`,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof WaitlistStoreNotConfiguredError) {
      return Response.json(
        { ok: false, code: "unavailable" },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    console.error("[admin] export failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });

    return Response.json(
      { ok: false, code: "server_error" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
