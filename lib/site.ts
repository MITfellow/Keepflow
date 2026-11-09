export const site = {
  name: "Keepflow",
  wordmark: "keepflow",
  title: "Keepflow — Your day, kept in flow.",
  description:
    "A personal AI agent that handles email, calendar, and follow-through for people building something of their own. Join the early-access list.",
  tagline: "Your day, kept in flow.",
  launch: "Spring 2027",
  contactEmail: "hello@keepflow.app",
  shareText:
    "I just joined the waitlist for Keepflow — a quieter personal AI agent for email, calendar, and follow-through.",
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
