"use client";

import { useEffect, useRef } from "react";

/* Modal asking to confirm an action, closes on cancel, backdrop click or Escape. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  danger = false,
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  // Sync the native dialog with the open prop
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-0 text-ink shadow-soft backdrop:bg-ink/30 backdrop:backdrop-blur-sm open:animate-rise"
    >
      <div className="p-5">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <div className="mt-2 text-sm text-ink-soft">{body}</div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-full px-4 py-2 text-sm font-semibold text-ink-soft hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`rounded-full px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 ${
              danger ? "bg-danger hover:bg-danger/90" : "bg-accent hover:bg-accent-hover"
            }`}
          >
            {pending ? "Saving…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
