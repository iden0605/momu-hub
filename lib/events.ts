import type { EventFeedItem } from "@/components/event-feed-card";
import type { EventType } from "@/lib/types";

export interface EventRow {
  id: string;
  title: string;
  description: string;
  is_open: boolean;
  starts_at: string | null;
  venue: string | null;
  event_types: EventType[];
  event_type_other_details: string | null;
}

/* Maps event rows plus check-in counts into feed items. */
export function toFeedItems(events: EventRow[], attendance: { event_id: string }[]): EventFeedItem[] {
  const counts = new Map<string, number>();
  for (const a of attendance) counts.set(a.event_id, (counts.get(a.event_id) ?? 0) + 1);
  return events.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    isOpen: e.is_open,
    startsAt: e.starts_at,
    venue: e.venue,
    eventTypes: e.event_types,
    eventTypeOtherDetails: e.event_type_other_details,
    attendanceCount: counts.get(e.id) ?? 0,
  }));
}

export const EVENT_COLUMNS =
  "id, title, description, is_open, starts_at, venue, event_types, event_type_other_details";
