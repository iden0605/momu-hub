"use client";

import { useState } from "react";
import { EventFeedCard, type EventFeedItem } from "@/components/event-feed-card";

type Filter = "open" | "closed" | "all";

/* Filter chips over the event card list. */
export function EventFeed({ events }: { events: EventFeedItem[] }) {
  const [filter, setFilter] = useState<Filter>("open");
  const counts = {
    open: events.filter((e) => e.isOpen).length,
    closed: events.filter((e) => !e.isOpen).length,
    all: events.length,
  };
  const shown = events.filter((e) => filter === "all" || (filter === "open") === e.isOpen);

  return (
    <>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {(["open", "closed", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`flex-none rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${
              filter === f ? "bg-nav text-nav-ink" : "bg-surface text-ink-soft shadow-soft hover:text-ink"
            }`}
          >
            {f} <span className="opacity-70">{counts[f]}</span>
          </button>
        ))}
      </div>

      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {shown.map((event, i) => (
          <li key={event.id}>
            <EventFeedCard event={event} index={i} />
          </li>
        ))}
      </ul>
      {shown.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-line p-8 text-center text-sm text-ink-soft">
          {filter === "open" ? "No open events right now." : "Nothing here yet."}
        </div>
      )}
    </>
  );
}
