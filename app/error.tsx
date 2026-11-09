"use client";

import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="shell error-page">
      <div className="status-inner">
        <p className="eyebrow">Something broke</p>
        <h1>That didn&rsquo;t hold.</h1>
        <p>
          The page hit an error before it could finish. Nothing was sent. You can try again, or
          head back to Rill.
        </p>
        <div className="page-actions">
          <button type="button" className="button button-primary" onClick={reset}>
            Try again
          </button>
          <Link className="button button-ghost" href="/">
            Back to Rill
          </Link>
        </div>
      </div>
    </div>
  );
}
