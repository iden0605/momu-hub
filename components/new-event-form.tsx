"use client";

import { friendlyError } from "@/lib/errors";
import { useState } from "react";
import { EventFormFields } from "@/components/event-form-fields";
import { PendingButton } from "@/components/pending-button";

export function NewEventForm({
  onCreate,
}: {
  onCreate: (formData: FormData) => Promise<void>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // Controlled: React clears uncontrolled fields once a form action
  // settles, success or failure, so an uncontrolled title/description would
  // wipe itself out the instant validation fails on a different field.
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  // Remounts EventFormFields (and its own internal state: venue, event
  // type, date, time) on success, since resetting all of that from here
  // would mean threading reset callbacks through every field.
  const [formKey, setFormKey] = useState(0);
  const [open, setOpen] = useState(false);

  // Collapsed into a single button until needed
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink shadow-soft hover:bg-accent-hover"
      >
        <span aria-hidden className="text-lg leading-none">+</span> New event
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        // Not <form action={fn}>: React resets a form's fields directly at
        // the DOM level once that mechanism's action settles, success or
        // failure, bypassing React's own reconciliation for controlled
        // inputs like checkboxes until something else re-renders them. A
        // plain submit handler has no such lifecycle to fight.
        e.preventDefault();
        setError(null);
        setPending(true);
        try {
          await onCreate(new FormData(e.currentTarget));
          setTitle("");
          setDescription("");
          setFormKey((k) => k + 1);
          setOpen(false);
        } catch (err) {
          setError(friendlyError(err, "Couldn't create event"));
        } finally {
          setPending(false);
        }
      }}
      className="animate-rise relative z-20 flex w-full max-w-lg flex-col gap-2.5 rounded-xl border border-line bg-surface p-4 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">New event</h2>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-3 py-1 text-sm font-semibold text-ink-soft hover:bg-surface-2"
        >
          Cancel
        </button>
      </div>
      <input
        name="title"
        required
        placeholder="Event title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="rounded-md border border-line bg-bg px-3.5 py-2.5 text-sm placeholder:text-ink-soft/60"
      />
      <textarea
        name="description"
        rows={2}
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="max-h-40 overflow-y-auto rounded-md border border-line bg-bg px-3.5 py-2.5 text-sm placeholder:text-ink-soft/60"
      />
      <EventFormFields key={formKey} />
      {error && <p className="text-sm text-danger">{error}</p>}
      <PendingButton
        pending={pending}
        className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
      >
        Create event
      </PendingButton>
    </form>
  );
}
