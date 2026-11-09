import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What the Keepflow waitlist collects, why it collects it, who processes it, and how to leave.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      label="Privacy"
      title="Privacy, in plain language."
      lead="The waitlist asks for an email address. This page explains everything else that happens around it, without the fog."
      updated="9 November 2026"
    >
      <h2>What this policy covers</h2>
      <p>
        This policy covers the Keepflow waitlist at this site: the email form, referral links,
        confirmation and waitlist email, and the admin view used by the people running the
        list. It does not cover the Keepflow product, which is not open yet. A separate product
        privacy notice will be published before early access begins.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Your email address.</strong> Used to hold your place and to write when your
          spot is ready.
        </li>
        <li>
          <strong>Referral information.</strong> Your own referral code, and the code of the
          person who referred you, if you arrived through a link.
        </li>
        <li>
          <strong>Campaign parameters.</strong> UTM fields in the link you arrived through, so
          we can tell which channels are worth the effort.
        </li>
        <li>
          <strong>A hashed IP address.</strong> We use a salted one-way hash for rate limiting
          and abuse prevention. We do not store the raw IP address in the waitlist.
        </li>
        <li>
          <strong>Timestamps and status.</strong> When you joined, your position, and whether
          you have unsubscribed.
        </li>
        <li>
          <strong>Local preferences.</strong> Your light or dark theme choice is stored in your
          browser, not on our server.
        </li>
      </ul>
      <p>
        The site uses privacy-friendly, aggregate analytics from Vercel to understand page
        performance and signup events. It does not use advertising cookies or cross-site
        tracking pixels.
      </p>

      <h2>Why we collect it</h2>
      <p>
        To hold your place in line, send the confirmation and launch email you asked for,
        attribute referrals, keep the list free of automated abuse, and understand interest in
        Keepflow in aggregate. We do not use your email for a newsletter or a drip campaign.
      </p>

      <h2>Who processes it</h2>
      <p>
        The waitlist uses Supabase for database storage, Resend for email delivery, and Vercel
        for hosting and aggregate analytics. These providers process data on our instructions
        and under their own terms. We do not sell, rent, or trade waitlist data.
      </p>

      <h2>What we do not do</h2>
      <ul>
        <li>We do not train shared AI models on your waitlist data.</li>
        <li>We do not add you to a marketing list you did not ask for.</li>
        <li>We do not use advertising cookies or sell audience data.</li>
        <li>We do not publish the list or expose email addresses on the site.</li>
      </ul>

      <h2>How long we keep it</h2>
      <p>
        We keep waitlist data while you are on the list, until you ask us to delete it, or
        twelve months after early access ends, whichever comes first. If you unsubscribe, we
        remove your campaign details, IP hash, and referral edge, retire your referral link,
        and keep your email only as a suppression record so you are not added again. A manual
        deletion request removes the record itself. Backups are rotated on a short schedule
        and are not used for any other purpose.
      </p>

      <h2>Your choices</h2>
      <p>
        Every waitlist email includes an unsubscribe link, and you can use the{" "}
        <a href="/unsubscribe">unsubscribe page</a> at any time. You can also write to{" "}
        <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a> to ask for a copy of
        your waitlist data, a correction, or deletion. We aim to respond within 30 days. If you
        are in a region with additional data protection rights, say so in your message and we
        will honor the rights that apply.
      </p>

      <h2>Security</h2>
      <p>
        The site is served over HTTPS. Waitlist data lives in a private database with row-level
        security enabled and no public policies. The service key stays server-side. Admin
        access requires a long secret and an http-only session cookie. No system is perfectly
        secure, but we keep the surface small and the access narrow.
      </p>

      <h2>Children</h2>
      <p>
        The waitlist is not intended for anyone under 16. If you believe a child has joined,
        write to us and we will remove the record.
      </p>

      <h2>Changes</h2>
      <p>
        If this policy changes in a way that affects you, we will update the date above and, for
        a material change, email the waitlist before the change takes effect.
      </p>

      <h2>Contact</h2>
      <p>
        Questions, requests, or corrections:{" "}
        <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>.
      </p>

      <p className="note">
        This page is a plain-language description of the waitlist, not a substitute for the
        product&rsquo;s full privacy notice. Nothing here promises a level of security or
        compliance beyond what the site actually implements.
      </p>
    </LegalPage>
  );
}
