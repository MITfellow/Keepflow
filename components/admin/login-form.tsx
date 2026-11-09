"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";

import { AlertIcon } from "@/components/icons";

export function AdminLoginForm() {
  const router = useRouter();
  const fieldId = useId();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ secret }),
        signal: AbortSignal.timeout(15_000),
      });

      if (response.ok) {
        setSecret("");
        router.refresh();
        return;
      }

      if (response.status === 429) {
        setError("Too many attempts. Wait a few minutes, then try again.");
      } else if (response.status === 503) {
        setError("Admin access is not configured for this deployment.");
      } else {
        setError("That secret did not match. Check it and try again.");
      }
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-login">
      <p className="eyebrow">Private</p>
      <h1>Waitlist admin</h1>
      <p>
        Enter the admin secret for this deployment. The session lasts eight hours and is
        stored in an http-only cookie.
      </p>

      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor={fieldId}>Admin secret</label>
        <input
          id={fieldId}
          className="admin-input"
          type="password"
          name="secret"
          autoComplete="current-password"
          value={secret}
          onChange={(event) => {
            setSecret(event.target.value);
            if (error) setError(null);
          }}
          required
        />

        <button
          type="submit"
          className="button button-primary"
          disabled={submitting || secret.length === 0}
        >
          {submitting ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Checking…
            </>
          ) : (
            "Enter admin"
          )}
        </button>

        <div aria-live="polite">
          {error ? (
            <p className="admin-error">
              <AlertIcon width={14} height={14} /> {error}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
