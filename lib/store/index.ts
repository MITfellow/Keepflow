import "server-only";

import { fileWaitlistStore } from "@/lib/store/file";
import {
  isSupabaseConfigured,
  supabaseWaitlistStore,
} from "@/lib/store/supabase";
import {
  WaitlistStoreNotConfiguredError,
  type WaitlistStore,
} from "@/lib/store/types";

let store: WaitlistStore | null = null;

function shouldUseFileStore(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  if (process.env.WAITLIST_ALLOW_FILE_STORE === "true") return true;
  if (process.env.WAITLIST_PREVIEW_STORE === "file") return true;
  return false;
}

export function getWaitlistStore(): WaitlistStore {
  if (store) return store;

  if (isSupabaseConfigured()) {
    store = supabaseWaitlistStore;
    return store;
  }

  if (shouldUseFileStore()) {
    store = fileWaitlistStore;
    return store;
  }

  throw new WaitlistStoreNotConfiguredError();
}

export { WaitlistStoreNotConfiguredError };
export type { WaitlistStore } from "@/lib/store/types";
