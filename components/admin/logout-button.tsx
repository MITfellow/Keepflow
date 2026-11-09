"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { LogOutIcon } from "@/components/icons";

export function AdminLogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    if (busy) return;
    setBusy(true);

    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        signal: AbortSignal.timeout(10_000),
      });
    } finally {
      router.replace("/admin");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      className="button button-ghost button-small"
      onClick={() => void handleLogout()}
      disabled={busy}
    >
      <LogOutIcon />
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
