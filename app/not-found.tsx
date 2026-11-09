import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell status-page">
      <div className="status-inner">
        <p className="eyebrow">404</p>
        <h1>This page went quiet.</h1>
        <p>
          The current doesn&rsquo;t run here. Head back to Rill, or join the list while
          you&rsquo;re here.
        </p>
        <div className="page-actions">
          <Link className="button button-primary" href="/">
            Back to the beginning
          </Link>
          <Link className="button button-ghost" href="/#join">
            Join the waitlist
          </Link>
        </div>
      </div>
    </div>
  );
}
