"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import {
  AlertIcon,
  ArrowUpRight,
  CheckIcon,
} from "@/components/icons";
import { ShareActions } from "@/components/share-actions";
import { track } from "@/lib/analytics";
import { formatOrdinal } from "@/lib/format";
import { site } from "@/lib/site";
import { isValidEmail } from "@/lib/validation";

type WaitlistFormProps = {
  id: string;
  source: string;
  final?: boolean;
};

type JoinResponse = {
  ok?: boolean;
  status?: "joined" | "duplicate" | "success";
  position?: number | null;
  referralUrl?: string | null;
  referralCount?: number;
  emailSent?: boolean;
};

type Result = {
  kind: "joined" | "duplicate";
  position: number | null;
  referralUrl: string | null;
  emailSent: boolean;
};

type FormError = {
  code: string;
  message: string;
};

export function WaitlistForm({ id, source, final = false }: WaitlistFormProps) {
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<FormError | null>(null);
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const reduceMotion = useReducedMotion();

  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mountedAt = useRef<number>(0);
  const alive = useRef(true);

  useEffect(() => {
    mountedAt.current = Date.now();
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (status === "done") {
      headingRef.current?.focus();
    }
  }, [status]);

  function handleChange(value: string) {
    setEmail(value);
    if (error) setError(null);
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setError(null);
    setEmail("");
    setCompany("");
    mountedAt.current = Date.now();
    window.setTimeout(() => inputRef.current?.focus(), 30);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "submitting") return;

    const normalized = email.trim();

    if (!normalized) {
      setError({ code: "empty", message: "Enter your email address to join." });
      inputRef.current?.focus();
      return;
    }

    if (!isValidEmail(normalized)) {
      setError({
        code: "invalid_email",
        message: "That email address doesn't look right. Check it and try again.",
      });
      inputRef.current?.focus();
      return;
    }

    setStatus("submitting");
    setError(null);
    track("waitlist_submit", { source, final });

    const params = new URLSearchParams(window.location.search);
    const referral = params.get("ref");
    const utmSource = params.get("utm_source");
    const utmMedium = params.get("utm_medium");
    const utmCampaign = params.get("utm_campaign");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: normalized,
          referral,
          source,
          utmSource,
          utmMedium,
          utmCampaign,
          company,
          elapsedMs: Date.now() - mountedAt.current,
        }),
        signal: AbortSignal.timeout(15_000),
      });

      const data = (await response.json().catch(() => ({}))) as JoinResponse & {
        error?: string;
        code?: string;
        retryAfter?: number;
      };

      if (!alive.current) return;

      if (!response.ok) {
        const code = data.code ?? "server_error";
        let message = "We couldn't save your spot just now. Please try again in a moment.";

        if (response.status === 429 || code === "rate_limited") {
          message = "Too many tries in a short window. Give it a minute, then try again.";
        } else if (code === "too_fast") {
          message = "That was a little too quick. Please try once more.";
        } else if (code === "invalid_email") {
          message = "That email address doesn't look right. Check it and try again.";
        }

        setStatus("idle");
        setError({ code, message });
        track("waitlist_error", { code });
        return;
      }

      if (data.status === "duplicate") {
        setResult({
          kind: "duplicate",
          position: null,
          referralUrl: null,
          emailSent: false,
        });
        setStatus("done");
        track("waitlist_duplicate", { source });
        return;
      }

      setResult({
        kind: "joined",
        position: typeof data.position === "number" ? data.position : null,
        referralUrl: typeof data.referralUrl === "string" ? data.referralUrl : null,
        emailSent: Boolean(data.emailSent),
      });
      setStatus("done");
      track("waitlist_success", {
        source,
        position: data.position ?? 0,
        referred: Boolean(referral),
      });
    } catch {
      if (!alive.current) return;
      setStatus("idle");
      setError({
        code: "network_error",
        message: "We couldn't reach the list just now. Check your connection and try again.",
      });
      track("waitlist_error", { code: "network_error" });
    }
  }

  const titleId = `${id}-title`;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="join">
      <motion.div layout={!reduceMotion} transition={transition}>
        <AnimatePresence mode="wait" initial={false}>
          {status === "done" && result ? (
            <motion.div
              key="receipt"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={transition}
            >
              <div className="receipt" aria-live="polite">
                <p className="receipt-label">
                  {result.kind === "joined" ? <CheckIcon width={14} height={14} /> : null}
                  {result.kind === "joined" ? "You're on the list" : "Already on the list"}
                </p>

                {result.kind === "joined" ? (
                  <>
                    <h3
                      id={titleId}
                      ref={headingRef}
                      tabIndex={-1}
                      className="receipt-title"
                    >
                      {result.position ? (
                        <>
                          You&rsquo;re <span className="receipt-position">{formatOrdinal(result.position)}</span> in
                          line.
                        </>
                      ) : (
                        <>You&rsquo;re in line.</>
                      )}
                    </h3>
                    <p className="receipt-detail">
                      {result.emailSent
                        ? `A confirmation is on its way to ${email.trim()}. We'll write once more, when your spot is ready.`
                        : "We'll write once, when your spot is ready. Nothing else in between."}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 id={titleId} ref={headingRef} tabIndex={-1} className="receipt-title">
                      You&rsquo;re already in line.
                    </h3>
                    <p className="receipt-detail">
                      This email is already on the list. Your place is safe. If you need your
                      referral link, use the one in your confirmation email.
                    </p>
                  </>
                )}

                {result.referralUrl ? (
                  <div className="receipt-share">
                    <p className="receipt-share-label">Your private referral link</p>
                    <div className="referral-link">
                      <code>{result.referralUrl}</code>
                    </div>

                    <ShareActions url={result.referralUrl} text={site.shareText} context="referral" />

                    <ul className="receipt-milestones">
                      <li>1 friend — earlier access</li>
                      <li>3 friends — priority onboarding</li>
                    </ul>
                  </div>
                ) : null}

                <button type="button" className="button-quiet receipt-reset" onClick={reset}>
                  {result.kind === "joined" ? "Use a different email" : "Try another email"}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={false}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={transition}
              noValidate
            >
              <div
                className={`join-well${error && (error.code === "invalid_email" || error.code === "empty") ? " is-invalid" : ""}`}
              >
                <div className="join-row">
                  <div className="join-field">
                    <label className="join-label" htmlFor={`${id}-email`}>
                      Email address
                    </label>
                    <input
                      ref={inputRef}
                      id={`${id}-email`}
                      name="email"
                      type="email"
                      className="join-input"
                      placeholder="you@yourwork.com"
                      autoComplete="email"
                      inputMode="email"
                      spellCheck={false}
                      maxLength={320}
                      required
                      value={email}
                      disabled={status === "submitting"}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={`${helperId}${error ? ` ${errorId}` : ""}`}
                      onChange={(event) => handleChange(event.target.value)}
                      onFocus={() => track("waitlist_form_focus", { source, final })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="button button-primary join-submit"
                    disabled={status === "submitting"}
                  >
                    {status === "submitting" ? (
                      <>
                        <span className="spinner" aria-hidden="true" />
                        Saving your spot…
                      </>
                    ) : (
                      <>
                        Get early access
                        <ArrowUpRight width={15} height={15} />
                      </>
                    )}
                  </button>
                </div>

                <div className="hp" aria-hidden="true">
                  <label htmlFor={`${id}-company`}>Company</label>
                  <input
                    id={`${id}-company`}
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                  />
                </div>
              </div>

              <div id={errorId} aria-live="polite">
                {error ? (
                  <p className="join-error">
                    <AlertIcon />
                    <span>{error.message}</span>
                  </p>
                ) : null}
              </div>

              <p id={helperId} className="join-note">
                No spam. One email when your spot is ready. By joining, you agree to our{" "}
                <a href="/privacy">Privacy Policy</a>. Unsubscribe anytime.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
