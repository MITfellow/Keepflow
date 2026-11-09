"use client";

type AnalyticsEvent =
  | "waitlist_form_focus"
  | "waitlist_submit"
  | "waitlist_success"
  | "waitlist_duplicate"
  | "waitlist_error"
  | "referral_link_copy"
  | "referral_share_click"
  | "theme_change";

type AnalyticsProperties = Record<string, string | number | boolean | null>;

export function track(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
  if (typeof window === "undefined") return;

  void import("@vercel/analytics")
    .then(({ track: vercelTrack }) => {
      vercelTrack(event, properties);
    })
    .catch(() => {
      // Analytics must never interrupt a signup.
    });
}
