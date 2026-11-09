"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { AlertIcon, CheckIcon } from "@/components/icons";
import { site } from "@/lib/site";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const validToken = UUID_PATTERN.test(token);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleUnsubscribe() {
    if (!validToken || status === "submitting") return;

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
        signal: AbortSignal.timeout(15_000),
      });

      if (response.ok) {
        setStatus("done");
        return;
      }

      if (response.status === 429) {
        setMessage("Too many tries in a short window. Give it a minute, then try again.");
      } else {
        setMessage("We could not process that request just now. Please try again in a moment.");
      }
      setStatus("error");
    } catch {
      setMessage("We could not reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  if (!validToken) {
    return (
      <div className="unsubscribe-card">
        <p className="receipt-label">
          <AlertIcon width={14} height={14} />
          Link incomplete
        </p>
        <p className="receipt-detail">
          This unsubscribe link is missing its private token. Open the link from your
          confirmation email again, or write to{" "}
          <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> and we will remove
          you by hand.
        </p>
        <Link className="button button-ghost" href="/">
          Back to Rill
        </Link>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="unsubscribe-card" aria-live="polite">
        <p className="receipt-label">
          <CheckIcon width={14} height={14} />
          Removed
        </p>
        <h2 className="receipt-title">You&rsquo;re off the list.</h2>
        <p className="receipt-detail">
          We will not email you again about early access. If a confirmation was already on its
          way, you can ignore it. Your referral link no longer adds to a waitlist place.
        </p>
        <Link className="button button-ghost" href="/">
          Back to Rill
        </Link>
      </div>
    );
  }

  return (
    <div className="unsubscribe-card">
      <p className="receipt-label">One click</p>
      <h2 className="receipt-title">Remove this email from the waitlist?</h2>
      <p className="receipt-detail">
        This removes your place and stops waitlist email. It does not affect any Rill product
        account you may create later.
      </p>

      <button
        type="button"
        className="button button-primary"
        onClick={() => void handleUnsubscribe()}
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Removing…
          </>
        ) : (
          "Unsubscribe me"
        )}
      </button>

      <div aria-live="polite">
        {status === "error" ? (
          <p className="join-error">
            <AlertIcon />
            <span>{message}</span>
          </p>
        ) : null}
      </div>

      <p className="join-hint">
        Changed your mind? <Link href="/#join">Keep your place</Link>.
      </p>
    </div>
  );
}
