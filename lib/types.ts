// Core domain types — keep in sync with the Supabase schema.

export const ROLES = ["member", "committee", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const EVENT_TYPES = ["function", "camp", "excursion", "other"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

// How an attendee heard about the event, captured per check-in for the
// committee's own outreach tracking.
export const EVENT_DISCOVERY_SOURCES = [
  "instagram",
  "facebook",
  "whatsapp",
  "newsletter",
  "another_club",
  "umsu_website",
  "friend",
  "other",
] as const;
export type EventDiscoverySource = (typeof EVENT_DISCOVERY_SOURCES)[number];

// startsAt/venue/eventTypes are required for new events (UMSU attendance
// CSV export needs them) but nullable/empty on events created before this
// existed — those can be edited to backfill them if the committee wants to
// export their attendance too.
export interface Event {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  isOpen: boolean;
  startsAt: string | null;
  venue: string | null;
  eventTypes: EventType[];
  eventTypeOtherDetails: string | null;
  createdAt: string;
}

// A student (or other attendee) recorded once and reused across every
// event they attend. studentNumber is a University of Melbourne student
// number (exactly 7 digits) when the member is a student, null otherwise
// (rendered as 'N/A' on CSV export, matching UMSU's own attendance form).
export interface AttendanceMember {
  id: string;
  fullName: string;
  email: string | null;
  studentNumber: string | null;
  course: string | null;
  isClubMember: boolean;
  createdAt: string;
}

// One row per member checked in at an event. Any signed-in committee or
// subcommittee member can add or remove entries on any event, not just the
// event's creator. A member can only appear once per event (DB unique
// constraint on event_id + member_id).
export interface AttendanceEntry {
  id: string;
  eventId: string;
  memberId: string;
  checkedInBy: string;
  foundVia: EventDiscoverySource | null;
  foundViaOtherDetails: string | null;
  createdAt: string;
}
