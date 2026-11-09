import { AgentPanel } from "@/components/agent-panel";
import { AmbientContours } from "@/components/ambient-contours";
import { Faq } from "@/components/faq";
import {
  ArrowUpRight,
  DownloadIcon,
  LockIcon,
  ShieldIcon,
  TrashIcon,
} from "@/components/icons";
import { WaitlistCount } from "@/components/waitlist-count";
import { WaitlistForm } from "@/components/waitlist-form";
import { absoluteUrl, site } from "@/lib/site";

const capabilities = [
  {
    index: "01",
    title: "Replies that already sound like you.",
    body: "Keepflow reads the thread, checks your calendar, and drafts the reply in your voice. You approve, edit, or send — the judgment stays yours.",
    example: "Draft ready · Re: Thursday's call",
  },
  {
    index: "02",
    title: "A week with room to think.",
    body: "Meetings land in the right hours. Focus time is defended. Conflicts are resolved before they reach your morning.",
    example: "Thu 9:00 · Focus held",
  },
  {
    index: "03",
    title: "Nothing dropped on your watch.",
    body: "Follow-ups, promises, and small loose ends are tracked until they are closed. You get one quiet nudge, not ten.",
    example: "Follow-up sent · Intro to Maya",
  },
];

const steps = [
  {
    number: "01",
    title: "Join the list.",
    body: "Tell us where to write. That is the whole application. No demo call, no questionnaire.",
  },
  {
    number: "02",
    title: "Set your terms.",
    body: "Choose what Keepflow can read, draft, and send. Draft-and-approve is the default, and nothing happens off the record.",
  },
  {
    number: "03",
    title: "Hand over the small stuff.",
    body: "Keepflow starts with email and calendar. As trust builds, it earns more of your day — never the other way around.",
  },
];

const trustItems = [
  {
    icon: ShieldIcon,
    title: "Your inbox is not training data.",
    body: "Keepflow does not train shared models on your mail, and does not sell or rent it. Your context stays yours.",
  },
  {
    icon: LockIcon,
    title: "Permission before motion.",
    body: "Every send, booking, and change has a boundary you set. Draft-and-approve is the default, not a setting you have to find.",
  },
  {
    icon: DownloadIcon,
    title: "Leave with everything.",
    body: "Export or delete your data, including what the agent remembers, at any time. No retention theatre.",
  },
  {
    icon: TrashIcon,
    title: "One email, then silence.",
    body: "The waitlist is not a newsletter. We write when your spot is ready, and not before.",
  },
];

export default function HomePage() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: absoluteUrl("/"),
    description: site.description,
    inLanguage: "en",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <section className="hero" id="top">
        <AmbientContours />

        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow load-in load-1">
              A personal agent for people building something of their own.
            </p>

            <h1 className="hero-title load-in load-2">
              <span>Your day,</span>
              <span>kept in flow.</span>
            </h1>

            <p className="hero-subhead load-in load-3">
              Keepflow handles email, calendar, and follow-through — quietly, and always on
              your terms.
            </p>

            <div className="hero-form load-in load-4" id="join">
              <WaitlistForm id="join" source="home-hero" />
            </div>

            <div className="hero-meta load-in load-5">
              <WaitlistCount />
              <span className="meta-item">Early access opens in waves through spring 2027.</span>
            </div>
          </div>

          <div className="hero-visual load-in load-6">
            <AgentPanel />
          </div>
        </div>
      </section>

      <section className="section section-rule" id="capabilities" aria-labelledby="capabilities-title">
        <div className="shell">
          <div className="section-head" data-reveal>
            <div>
              <p className="eyebrow">What changes</p>
              <h2 className="display" id="capabilities-title">
                Three things off your plate.
              </h2>
            </div>
            <p className="lead">
              Keepflow takes the work that sits between you and the work that matters. It is not
              another inbox to check. It is the quiet layer that keeps the day moving.
            </p>
          </div>

          <div className="capabilities">
            {capabilities.map((capability) => (
              <article className="capability" data-reveal key={capability.index}>
                <span className="capability-index">{capability.index}</span>
                <h3>{capability.title}</h3>
                <p>{capability.body}</p>
                <span className="capability-example">{capability.example}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint" id="how" aria-labelledby="how-title">
        <div className="shell">
          <div className="section-head" data-reveal>
            <div>
              <p className="eyebrow">How it works</p>
              <h2 className="display" id="how-title">
                A small handover, then a quieter week.
              </h2>
            </div>
            <p className="lead">
              No new workflow to learn. Keepflow works inside the accounts you already use, within
              limits you can see and change.
            </p>
          </div>

          <div className="steps">
            {steps.map((step) => (
              <div className="step" data-reveal key={step.number}>
                <span className="step-number" aria-hidden="true">
                  {step.number}
                </span>
                <div>
                  <h3>
                    <span className="sr-only">Step {step.number}: </span>
                    {step.title}
                  </h3>
                  <p>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-rule" id="privacy" aria-labelledby="privacy-title">
        <div className="shell trust-grid">
          <div data-reveal>
            <p className="eyebrow">Privacy and trust</p>
            <h2 className="display" id="privacy-title">
              A quiet agent, not a black box.
            </h2>
            <p className="lead">
              Access to your day is a serious thing. Keepflow is built so you can see what it can
              do, change the boundary, and leave without asking permission.
            </p>
            <a className="trust-link" href="/privacy">
              Read the privacy promise
              <ArrowUpRight width={14} height={14} />
            </a>
          </div>

          <ul className="trust-list" data-reveal>
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <li className="trust-item" key={item.title}>
                  <Icon />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section
        className="section section-rule section-blue"
        id="referrals"
        aria-labelledby="referrals-title"
      >
        <div className="shell referral-grid">
          <div data-reveal>
            <p className="eyebrow">Referrals</p>
            <h2 className="display" id="referrals-title">
              Move up the list.
            </h2>
            <p className="lead">
              When you join, you will get a private link. Every friend who joins with it moves
              you closer to the front.
            </p>
            <p className="referral-note">
              Your link arrives with your confirmation email. No leaderboard, no public
              profile, no prize you did not ask for.
            </p>
          </div>

          <div data-reveal>
            <div className="milestones">
              <div className="milestone">
                <span className="milestone-count">
                  1<span>friend</span>
                </span>
                <span className="milestone-label">Earlier access</span>
              </div>
              <div className="milestone">
                <span className="milestone-count">
                  3<span>friends</span>
                </span>
                <span className="milestone-label">Priority onboarding</span>
              </div>
            </div>
            <a className="button button-ghost referral-cta" href="#join">
              Get early access
              <ArrowUpRight width={14} height={14} />
            </a>
          </div>
        </div>
      </section>

      <section className="section section-rule" id="faq" aria-labelledby="faq-title">
        <div className="shell faq-grid">
          <div data-reveal>
            <p className="eyebrow">FAQ</p>
            <h2 className="display" id="faq-title">
              Questions, answered plainly.
            </h2>
            <p className="faq-contact">
              Still unsure? Write to{" "}
              <a href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a>. A person reads
              it.
            </p>
          </div>

          <div data-reveal>
            <Faq />
          </div>
        </div>
      </section>

      <section className="section section-rule final-cta" aria-labelledby="final-title">
        <AmbientContours />
        <div className="shell final-inner" data-reveal>
          <p className="eyebrow">A last quiet minute</p>
          <h2 className="display" id="final-title">
            Make room for what matters.
          </h2>
          <p className="lead">
            Join the list. We will write once, when your spot is ready.
          </p>
          <div className="final-form">
            <WaitlistForm id="join-final" source="home-final" final />
          </div>
        </div>
      </section>
    </>
  );
}
