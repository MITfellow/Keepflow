import Link from "next/link";

import { ShareActions } from "@/components/share-actions";
import { absoluteUrl, site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="wordmark" aria-label="Rill home">
              rill
            </Link>
            <p>A quieter personal agent for people building something of their own.</p>
          </div>

          <div className="footer-groups">
            <div className="footer-group">
              <h2>The list</h2>
              <ul>
                <li>
                  <Link href="/#join">Join the waitlist</Link>
                </li>
                <li>
                  <Link href="/#how">How it works</Link>
                </li>
                <li>
                  <Link href="/#faq">FAQ</Link>
                </li>
                <li>
                  <Link href="/unsubscribe">Unsubscribe</Link>
                </li>
              </ul>
            </div>

            <div className="footer-group">
              <h2>Fine print</h2>
              <ul>
                <li>
                  <Link href="/privacy">Privacy</Link>
                </li>
                <li>
                  <Link href="/terms">Terms</Link>
                </li>
                <li>
                  <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>
                </li>
              </ul>
            </div>

            <div className="footer-group">
              <h2>Share Rill</h2>
              <ShareActions
                url={absoluteUrl("/")}
                text={site.shareText}
                className="share-buttons"
              />
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {new Date().getFullYear()} Rill. Pre-launch. This site collects waitlist
            emails only.
          </p>
          <p>{site.launch} · Early access in waves</p>
        </div>
      </div>
    </footer>
  );
}
