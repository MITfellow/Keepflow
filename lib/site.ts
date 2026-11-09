export const site = {
  name: "Rill",
  wordmark: "rill",
  title: "Rill — Your day, quietly handled.",
  description:
    "A personal AI agent that handles email, calendar, and follow-through for people building something of their own. Join the early-access list.",
  tagline: "Your day, quietly handled.",
  launch: "Spring 2027",
  contactEmail: "hello@rill.agent",
  shareText:
    "I just joined the waitlist for Rill — a quieter personal AI agent for email, calendar, and follow-through.",
} as const;

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (configured) return configured;

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return `https://${vercelUrl}`;

  return "http://localhost:3000";
}

export function absoluteUrl(path = "/"): string {
  return new URL(path, getSiteUrl()).toString();
}
