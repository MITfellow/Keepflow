import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "The plain-language terms for the Keepflow pre-launch waitlist.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <LegalPage
      label="Terms"
      title="Waitlist terms, in plain language."
      lead="These terms cover the pre-launch waitlist only. They are short because the list is a small, free arrangement."
      updated="9 November 2026"
    >
      <h2>Using the waitlist</h2>
      <p>
        By joining the Keepflow waitlist, you agree to these terms. If you do not agree, do not
        submit your email address. You must be at least 16 years old to join.
      </p>

      <h2>What the waitlist is</h2>
      <p>
        The waitlist is a free expression of interest in Keepflow, a personal AI agent that is still
        in development. Joining does not create a contract for the product, does not reserve a
        specific launch date, and does not guarantee access. Early access will open in waves
        through spring 2027, and we may change the timing or the shape of the product as it
        develops.
      </p>
      <p>
        No payment is required to join. If a paid plan is introduced later, you will see the
        price and terms before you are asked to pay anything.
      </p>

      <h2>Your email and your place</h2>
      <p>
        Use an email address you control. One place per person is the intent; automated bulk
        signups, disposable-address farming, and attempts to game positions or referrals may
        result in removal from the list. Your position is an estimate for planning, not a
        contractual guarantee.
      </p>

      <h2>Referrals</h2>
      <p>
        Referral links are private and tied to your signup. Every friend who joins through your
        link moves your effective position up. Three referrals unlock priority onboarding.
        There is no cash value, transferability, or prize beyond earlier access and priority
        onboarding. We may adjust or remove referral credit obtained through spam, impersonation,
        or automated signups.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not submit someone else&rsquo;s email address without their permission.</li>
        <li>Do not use the site to send spam, malware, or unlawful content.</li>
        <li>Do not attempt to break, overload, scrape, or bypass the site&rsquo;s security.</li>
        <li>Do not impersonate Keepflow, its team, or another waitlist member.</li>
      </ul>

      <h2>Content and ownership</h2>
      <p>
        The Keepflow name, wordmark, page design, and written content belong to their respective
        owners. You may share the site and your referral link. You may not copy the site or its
        brand into a competing product. Feedback you send us may be used to improve Keepflow
        without obligation to you.
      </p>

      <h2>Availability and disclaimers</h2>
      <p>
        The waitlist is provided as is and as available. We aim to keep it working, but we do
        not promise uninterrupted access, error-free operation, or that any particular feature
        will ship. To the extent permitted by law, we disclaim implied warranties and are not
        liable for indirect or consequential losses arising from your use of the waitlist. These
        terms do not limit rights that cannot be limited by law.
      </p>

      <h2>Ending your place</h2>
      <p>
        You can leave at any time through the unsubscribe link in any email or the{" "}
        <a href="/unsubscribe">unsubscribe page</a>. We may remove a place if these terms are
        broken, if a signup appears automated, or if keeping it would create a legal or security
        risk.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms as the waitlist evolves. The date above will change, and for a
        material change we will email the list before it takes effect. Continuing on the list
        after a change means you accept the updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>

      <p className="note">
        This is a plain-language summary for a pre-launch waitlist, not the full agreement for
        the Keepflow product. A product agreement and privacy notice will be published before early
        access begins.
      </p>
    </LegalPage>
  );
}
