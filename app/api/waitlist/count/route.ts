import { noStoreJson } from "@/lib/http";
import { getWaitlistStore, WaitlistStoreNotConfiguredError } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await getWaitlistStore().getCount();
    return noStoreJson({ ok: true, count });
  } catch (error) {
    if (error instanceof WaitlistStoreNotConfiguredError) {
      return noStoreJson({ ok: false, count: null, code: "unavailable" }, { status: 503 });
    }

    console.error("[waitlist] count failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });

    return noStoreJson({ ok: false, count: null, code: "server_error" }, { status: 500 });
  }
}
