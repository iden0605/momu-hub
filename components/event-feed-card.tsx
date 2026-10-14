import Link from "next/link";
import { formatEventTime, formatEventTypes } from "@/lib/format";
import type { EventType } from "@/lib/types";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

// Rotating card accents from the logo ring
const TINTS = [
  "bg-accent-soft text-accent",
  "bg-marigold-soft text-warn",
  "bg-slate-soft text-nav",
];

export interface EventFeedItem {
  id: string;
  title: string;
  description: string;
  isOpen: boolean;
  startsAt: string | null;
  venue: string | null;
  eventTypes: EventType[];
  eventTypeOtherDetails: string | null;
  attendanceCount: number;
}

/* Event card with a date tile, used on home and the events feed. */
export function EventFeedCard({ event, index }: { event: EventFeedItem; index: number }) {
  const tint = TINTS[index % TINTS.length];
  const match = event.startsAt?.match(/^(\d{4})-(\d{2})-(\d{2})/);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex gap-4 rounded-xl border border-line bg-surface p-3.5 shadow-soft hover:-translate-y-0.5 hover:border-accent/40"
    >
      <div className={`flex h-16 w-14 flex-none flex-col items-center justify-center rounded-lg ${tint}`}>
        {match ? (
          <>
            <span className="text-[11px] font-bold tracking-wider">{MONTHS[+match[2] - 1]}</span>
            <span className="font-display text-2xl font-bold leading-none">{+match[3]}</span>
          </>
        ) : (
          <span className="text-xs font-bold">TBC</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold leading-snug group-hover:text-accent">
            {event.title}
          </h3>
          {event.isOpen ? (
            <span className="flex flex-none items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-bold text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden /> Open
            </span>
          ) : (
            <span className="flex-none rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-bold text-ink-soft">
              Closed
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm text-ink-soft">
          {[
            event.startsAt && formatEventTime(event.startsAt),
            event.venue,
            formatEventTypes(event.eventTypes, event.eventTypeOtherDetails),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="mt-1.5 text-xs font-semibold text-ink-soft">
          {event.attendanceCount} {event.attendanceCount === 1 ? "person" : "people"} checked in
        </p>
      </div>
    </Link>
  );
}
