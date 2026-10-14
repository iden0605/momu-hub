"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const DISMISSED_KEY = "momu-hub-help-nudge-dismissed";
const listeners = new Set<() => void>();

function readDismissed() {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "true";
  } catch {
    // Storage unavailable, stay dismissed
    return true;
  }
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/* One-time pointer to the Help page, dismissed per browser. */
export function HelpNudge() {
  const dismissed = useSyncExternalStore(subscribe, readDismissed, () => true);

  function dismiss() {
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {}
    listeners.forEach((l) => l());
  }

  if (dismissed) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-marigold/50 bg-marigold-soft p-3.5 text-sm">
      <span>
        New here?{" "}
        <Link href="/help" className="font-semibold text-accent underline-offset-2 hover:underline">
          Check the Help page
        </Link>{" "}
        for how everything works.
      </span>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="flex-none text-ink-soft transition-colors hover:text-ink"
      >
        ✕
      </button>
    </div>
  );
}
