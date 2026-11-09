import type { Metadata } from "next";
import { Suspense } from "react";

import { UnsubscribeForm } from "@/components/unsubscribe-form";

export const metadata: Metadata = {
  title: "Unsubscribe",
  description: "Remove your email from the Rill waitlist.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function UnsubscribePage() {
  return (
    <div className="shell status-page">
      <div className="status-inner">
        <p className="eyebrow">Waitlist</p>
        <h1>Leave the list.</h1>
        <p>
          No questions, no retention offer. Confirm below and your waitlist email will be
          removed.
        </p>

        <Suspense
          fallback={
            <div className="unsubscribe-card">
              <p className="receipt-detail">Reading your link…</p>
            </div>
          }
        >
          <UnsubscribeForm />
        </Suspense>
      </div>
    </div>
  );
}
