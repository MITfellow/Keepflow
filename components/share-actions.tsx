"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  CheckIcon,
  CopyIcon,
  LinkedInIcon,
  ShareIcon,
  WhatsAppIcon,
  XIcon,
} from "@/components/icons";
import { track } from "@/lib/analytics";

const emptySubscribe = () => () => {};
const getCanNativeShare = () =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";
const getCanNativeShareServer = () => false;

type ShareActionsProps = {
  url: string;
  text: string;
  className?: string;
  context?: "referral" | "site";
};

async function writeToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();

    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      document.body.removeChild(area);
    }
  }
}

export function ShareActions({ url, text, className = "share-row", context = "site" }: ShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const canNativeShare = useSyncExternalStore(
    emptySubscribe,
    getCanNativeShare,
    getCanNativeShareServer,
  );
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  async function handleCopy() {
    const didCopy = await writeToClipboard(url);

    if (!didCopy) return;

    setCopied(true);
    track(context === "referral" ? "referral_link_copy" : "referral_share_click", {
      action: "copy",
      surface: context,
    });

    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  }

  async function handleNativeShare() {
    if (!navigator.share) return;

    try {
      await navigator.share({ title: "Rill", text, url });
      track("referral_share_click", { action: "native" });
    } catch {
      // A cancelled share is not an error worth surfacing.
    }
  }

  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  const xHref = `https://x.com/intent/post?text=${encodedText}&url=${encodedUrl}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  return (
    <div className={className}>
      <button type="button" onClick={() => void handleCopy()}>
        {copied ? <CheckIcon /> : <CopyIcon />}
        {copied ? "Copied" : "Copy link"}
      </button>

      {canNativeShare ? (
        <button type="button" onClick={() => void handleNativeShare()}>
          <ShareIcon />
          Share
        </button>
      ) : null}

      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("referral_share_click", { action: "x" })}
      >
        <XIcon />
        X
      </a>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("referral_share_click", { action: "whatsapp" })}
      >
        <WhatsAppIcon />
        WhatsApp
      </a>
      <a
        href={linkedinHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("referral_share_click", { action: "linkedin" })}
      >
        <LinkedInIcon />
        LinkedIn
      </a>

      <span className="sr-only" aria-live="polite">
        {copied ? "Link copied to clipboard." : ""}
      </span>
    </div>
  );
}
