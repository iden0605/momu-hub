"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// QR SVG is rendered on the server and passed in as markup
export function AttendanceSharePanel({
  checkinUrl,
  qrSvg,
  eventTitle,
}: {
  checkinUrl: string;
  qrSvg: string;
  eventTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Escape closes, page behind doesn't scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(checkinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const share = async () => {
    // Native share sheet on phones, copy elsewhere
    if (navigator.share) {
      try {
        await navigator.share({ title: `Check in: ${eventTitle}`, url: checkinUrl });
      } catch {}
    } else {
      copy();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-nav px-4 py-2 text-sm font-semibold text-nav-ink shadow-soft hover:bg-nav/90"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 18h2v2h-2zM14 18h2M18 14h2" />
        </svg>
        Show QR check-in
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Self check-in"
            className="fixed inset-0 z-[100] flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={() => setOpen(false)}
          >
            <div
              className="animate-rise relative w-full max-w-sm overflow-hidden rounded-t-2xl bg-surface shadow-soft sm:rounded-2xl"
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="momu-stripe h-1.5 w-full" aria-hidden />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2 hover:text-ink"
              >
                ✕
              </button>

              <div className="flex flex-col items-center px-5 pt-5">
                <p className="text-xs font-bold uppercase tracking-wider text-accent">Scan to check in</p>
                <h2 className="mt-1 max-w-[16rem] text-center font-display text-xl font-bold leading-tight">
                  {eventTitle}
                </h2>

                <div
                  className="mt-4 h-60 w-60 max-w-full flex-none rounded-xl border border-line bg-white p-3 [&_svg]:block [&_svg]:h-full [&_svg]:w-full"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <p className="mt-3 text-center text-sm text-ink-soft">
                  No sign-in needed, they just enter name, email and student ID.
                </p>

                <div className="mt-4 grid w-full grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={copy}
                    className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold hover:bg-surface-2"
                  >
                    {copied ? "Copied ✓" : "Copy link"}
                  </button>
                  <button
                    type="button"
                    onClick={share}
                    className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
                  >
                    Share
                  </button>
                </div>
                <a
                  href={checkinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 text-sm font-semibold text-ink-soft hover:text-accent"
                >
                  Open check-in page &#8599;&#xFE0E;
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
