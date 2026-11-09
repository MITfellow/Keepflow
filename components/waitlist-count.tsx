"use client";

import { useEffect, useState } from "react";

import { formatNumber } from "@/lib/format";

type CountState =
  | { status: "loading"; count: null }
  | { status: "ready"; count: number }
  | { status: "unavailable"; count: null };

export function WaitlistCount() {
  const [state, setState] = useState<CountState>({ status: "loading", count: null });

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const response = await fetch("/api/waitlist/count", {
          cache: "no-store",
          signal: AbortSignal.timeout(8_000),
        });

        if (!response.ok) throw new Error("Count unavailable");

        const data = (await response.json()) as { count?: number };

        if (!alive) return;

        if (typeof data.count === "number") {
          setState({ status: "ready", count: data.count });
        } else {
          setState({ status: "unavailable", count: null });
        }
      } catch {
        if (alive) setState({ status: "unavailable", count: null });
      }
    }

    void load();

    return () => {
      alive = false;
    };
  }, []);

  let copy = "The list is open.";

  if (state.status === "ready") {
    copy =
      state.count === 0
        ? "The list is open. Be first in line."
        : `Join ${formatNumber(state.count)} ${state.count === 1 ? "person" : "people"} on the list.`;
  } else if (state.status === "unavailable") {
    copy = "The list is open for early access.";
  }

  return (
    <span className="meta-item waitlist-count" aria-busy={state.status === "loading"}>
      <span className="live-dot" aria-hidden="true" />
      <span>{copy}</span>
    </span>
  );
}
