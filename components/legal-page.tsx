import Link from "next/link";
import type { ReactNode } from "react";

type LegalPageProps = {
  label: string;
  title: string;
  lead: string;
  updated: string;
  children: ReactNode;
};

export function LegalPage({ label, title, lead, updated, children }: LegalPageProps) {
  return (
    <div className="shell page-shell">
      <header className="page-head">
        <p className="eyebrow">{label}</p>
        <h1>{title}</h1>
        <p className="lead">{lead}</p>
        <p className="page-meta">Last updated {updated}</p>
      </header>

      <div className="prose">
        {children}

        <div className="page-actions">
          <Link className="button button-primary" href="/#join">
            Join the waitlist
          </Link>
          <Link className="button button-ghost" href="/">
            Back to Keepflow
          </Link>
        </div>
      </div>
    </div>
  );
}
