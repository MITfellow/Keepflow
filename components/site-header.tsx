import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="wordmark" aria-label="Keepflow home">
          keepflow
        </Link>

        <nav className="site-nav" aria-label="Primary">
          <Link href="/#capabilities">What changes</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#privacy">Privacy</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          <Link href="/#join" className="button button-small header-cta">
            <span className="cta-long">Join the waitlist</span>
            <span className="cta-short">Join</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
