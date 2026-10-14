"use client";

import { useActionState } from "react";
import { unlockAdmin } from "@/app/access-denied/actions";

/* Password field that promotes the signed-in user to admin. */
export function AdminUnlockForm() {
  const [state, action, pending] = useActionState(unlockAdmin, null);
  return (
    <form action={action} className="flex flex-col gap-2">
      <label htmlFor="admin-password" className="sr-only">
        Admin password
      </label>
      <div className="flex gap-2">
        <input
          id="admin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex-none rounded-full bg-nav px-5 py-2.5 text-sm font-semibold text-nav-ink hover:bg-nav/90 disabled:opacity-60"
        >
          {pending ? "Checking…" : "Unlock"}
        </button>
      </div>
      {state?.error && <p className="text-sm text-danger">{state.error}</p>}
    </form>
  );
}
