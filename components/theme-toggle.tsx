"use client";

import type { MouseEvent } from "react";

import { MoonIcon, SunIcon } from "@/components/icons";
import { track } from "@/lib/analytics";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> };
};

export function ThemeToggle() {
  function handleToggle(event: MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement;
    const current = root.dataset.theme === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const apply = () => {
      root.dataset.theme = next;
      root.style.colorScheme = next;
      try {
        window.localStorage.setItem("keepflow-theme", next);
      } catch {
        // Storage can be unavailable in private modes; the theme still applies.
      }
      track("theme_change", { theme: next });
    };

    if (reduceMotion) {
      apply();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.detail === 0 ? rect.left + rect.width / 2 : event.clientX;
    const y = event.detail === 0 ? rect.top + rect.height / 2 : event.clientY;

    root.style.setProperty("--theme-x", `${Math.round(x)}px`);
    root.style.setProperty("--theme-y", `${Math.round(y)}px`);

    const viewDocument = document as ViewTransitionDocument;

    if (typeof viewDocument.startViewTransition === "function") {
      viewDocument.startViewTransition(apply);
      return;
    }

    apply();
  }

  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      onClick={handleToggle}
      aria-label="Switch color theme"
      title="Switch color theme"
    >
      <MoonIcon className="icon-moon" />
      <SunIcon className="icon-sun" />
    </button>
  );
}
