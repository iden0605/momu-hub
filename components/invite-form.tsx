"use client";

import { useState } from "react";
import { friendlyError } from "@/lib/errors";
import { LEVELS, LEVEL_LABELS, type Level } from "@/lib/access";
import { CustomSelect } from "@/components/custom-select";
import type { AccessResult } from "@/app/(hub)/access/actions";

export interface PendingInvite {
  id: string;
  email: string;
  level: Level;
}

/* Pre-approve emails and list invites that haven't been used yet. */
export function InviteForm({
  actorIsAdmin,
  invites,
  onInvite,
  onCancel,
}: {
  actorIsAdmin: boolean;
  invites: PendingInvite[];
  onInvite: (formData: FormData) => Promise<AccessResult>;
  onCancel: (id: string) => Promise<AccessResult>;
}) {
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState<Level>("member");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const levels = LEVELS.filter((l) => actorIsAdmin || l !== "admin");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.set("email", email);
      fd.set("level", level);
      const result = await onInvite(fd);
      if (result.ok) {
        setMessage({ ok: true, text: `${email.trim()} can now sign in as ${LEVEL_LABELS[level]}.` });
        setEmail("");
      } else {
        setMessage({ ok: false, text: result.error });
      }
    } catch (err) {
      setMessage({ ok: false, text: friendlyError(err, "Couldn't add that email") });
    } finally {
      setPending(false);
    }
  };

  const cancel = async (id: string) => {
    try {
      const result = await onCancel(id);
      if (!result.ok) setMessage({ ok: false, text: result.error });
    } catch (err) {
      setMessage({ ok: false, text: friendlyError(err, "Couldn't cancel that invite") });
    }
  };

  return (
    <div className="rounded-xl border border-line bg-surface p-4 shadow-soft">
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@gmail.com"
          aria-label="Email to add"
          className="min-w-0 flex-1 rounded-full border border-line bg-bg px-4 py-2.5 text-sm focus:border-accent focus:outline-none"
        />
        <div className="flex items-stretch gap-2">
          <CustomSelect
            value={level}
            onChange={(v) => setLevel(v as Level)}
            options={levels.map((l) => ({ value: l, label: LEVEL_LABELS[l] }))}
            ariaLabel="Access level"
            className="flex-1 sm:w-36 sm:flex-none"
            triggerClassName="h-full rounded-full border border-line bg-bg px-4 py-2.5 font-semibold"
          />
          <button
            type="submit"
            disabled={pending}
            className="flex-none rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-60"
          >
            {pending ? "Adding…" : "Add"}
          </button>
        </div>
      </form>
      {message && (
        <p className={`mt-2 text-sm ${message.ok ? "text-success" : "text-danger"}`}>{message.text}</p>
      )}

      {invites.length > 0 && (
        <ul className="mt-4 flex flex-col divide-y divide-line border-t border-line">
          {invites.map((invite) => (
            <li key={invite.id} className="flex items-center gap-3 py-2.5 text-sm">
              <span className="min-w-0 flex-1 truncate">{invite.email}</span>
              <span className="flex-none rounded-full bg-slate-soft px-2.5 py-0.5 text-xs font-semibold text-nav">
                {LEVEL_LABELS[invite.level]}
              </span>
              {(actorIsAdmin || invite.level !== "admin") && (
                <button
                  type="button"
                  onClick={() => cancel(invite.id)}
                  className="flex-none rounded-full px-2.5 py-1 text-xs font-semibold text-ink-soft hover:bg-danger-soft hover:text-danger"
                >
                  Cancel
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
