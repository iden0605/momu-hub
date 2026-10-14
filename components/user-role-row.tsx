"use client";

import { useState } from "react";
import { friendlyError } from "@/lib/errors";
import { LEVELS, LEVEL_LABELS, canChangeLevel, type Level } from "@/lib/access";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { AccessResult } from "@/app/(hub)/access/actions";

export interface UserRoleRowProps {
  user: { id: string; email: string; displayName: string; avatarUrl: string | null; level: Level | null };
  actorLevel: Level;
  isSelf: boolean;
  onSetLevel: (formData: FormData) => Promise<AccessResult>;
  onDecline: () => Promise<AccessResult>;
}

type Pending = { to: Level | null } | { decline: true };

function Avatar({ name, url }: { name: string; url: string | null }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" referrerPolicy="no-referrer" className="h-10 w-10 flex-none rounded-full" />
  ) : (
    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-marigold-soft font-bold text-warn">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

/* One account, approve or decline when waiting, otherwise a level switch. */
export function UserRoleRow({ user, actorLevel, isSelf, onSetLevel, onDecline }: UserRoleRowProps) {
  const [confirming, setConfirming] = useState<Pending | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const waiting = user.level === null;
  const allowed = (to: Level | null) => canChangeLevel(actorLevel, user.level, to);

  const run = async (p: Pending) => {
    setError(null);
    setSaving(true);
    try {
      let result: AccessResult;
      if ("decline" in p) {
        result = await onDecline();
      } else {
        const fd = new FormData();
        fd.set("level", p.to ?? "none");
        result = await onSetLevel(fd);
      }
      if (!result.ok) setError(result.error);
      setConfirming(null);
    } catch (err) {
      setError(friendlyError(err, "Couldn't save"));
      setConfirming(null);
    } finally {
      setSaving(false);
    }
  };

  // Confirm self changes, removals and admin demotions
  const request = (to: Level | null) => {
    if (to === user.level) return;
    const risky = isSelf || to === null || user.level === "admin";
    if (risky) setConfirming({ to });
    else run({ to });
  };

  const dialogCopy = () => {
    if (!confirming) return { title: "", body: "", label: "" };
    if ("decline" in confirming) {
      return {
        title: "Decline this request?",
        body: `${user.email} will be removed from the waiting list.`,
        label: "Decline",
      };
    }
    const to = confirming.to;
    if (to === null) {
      return {
        title: isSelf ? "Remove your own access?" : "Remove access?",
        body: isSelf
          ? "You'll be signed out of the Hub until someone gives you access again."
          : `${user.displayName} will go back to the waiting list.`,
        label: "Remove access",
      };
    }
    return {
      title: isSelf ? `Change yourself to ${LEVEL_LABELS[to]}?` : `Make ${user.displayName} ${LEVEL_LABELS[to]}?`,
      body: isSelf
        ? "You'll lose the permissions above this level and may not be able to undo it yourself."
        : `They'll lose ${LEVEL_LABELS[user.level!]} permissions.`,
      label: "Change",
    };
  };
  const copy = dialogCopy();
  const destructive = !!confirming && ("decline" in confirming || confirming.to === null || isSelf);

  return (
    <li className="rounded-xl border border-line bg-surface p-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Avatar name={user.displayName || user.email} url={user.avatarUrl} />
          <div className="min-w-0">
            <p className="truncate font-semibold">
              {user.displayName}{" "}
              {isSelf && <span className="text-xs font-normal text-ink-soft">(you)</span>}
            </p>
            <p className="truncate text-sm text-ink-soft">{user.email}</p>
          </div>
        </div>

        {waiting ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {LEVELS.filter(allowed).map((level) => (
              <button
                key={level}
                type="button"
                disabled={saving}
                onClick={() => run({ to: level })}
                className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-60"
              >
                Accept as {LEVEL_LABELS[level]}
              </button>
            ))}
            <button
              type="button"
              disabled={saving}
              onClick={() => setConfirming({ decline: true })}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-danger-soft hover:text-danger"
            >
              Decline
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full bg-surface-2 p-1" role="radiogroup" aria-label="Access level">
              {LEVELS.map((level) => {
                const on = user.level === level;
                const can = on || allowed(level);
                return (
                  <button
                    key={level}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={saving || !can}
                    onClick={() => request(level)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed ${
                      on ? "bg-surface text-accent shadow-soft" : "text-ink-soft hover:text-ink disabled:opacity-40"
                    }`}
                  >
                    {LEVEL_LABELS[level]}
                  </button>
                );
              })}
            </div>
            {allowed(null) && (
              <button
                type="button"
                disabled={saving}
                onClick={() => request(null)}
                aria-label={`Remove access for ${user.displayName}`}
                className="rounded-full px-2.5 py-1 text-xs font-semibold text-ink-soft hover:bg-danger-soft hover:text-danger"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      <ConfirmDialog
        open={!!confirming}
        title={copy.title}
        body={copy.body}
        confirmLabel={copy.label}
        danger={destructive}
        pending={saving}
        onConfirm={() => confirming && run(confirming)}
        onCancel={() => setConfirming(null)}
      />
    </li>
  );
}
