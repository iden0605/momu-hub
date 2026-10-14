import { requireAppUser, canManageEvents } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Page } from "@/components/nav";
import { NewEventForm } from "@/components/new-event-form";
import { EventFeed } from "@/components/event-feed";
import { EVENT_COLUMNS, toFeedItems, type EventRow } from "@/lib/events";
import { createEvent } from "./actions";

export default async function EventsPage() {
  const user = await requireAppUser();
  const supabase = await createClient();

  const [{ data }, { data: attendanceData }] = await Promise.all([
    supabase
      .from("events")
      .select(EVENT_COLUMNS)
      .order("starts_at", { ascending: false, nullsFirst: true }),
    supabase.from("attendance_entries").select("event_id"),
  ]);
  const items = toFeedItems((data ?? []) as EventRow[], attendanceData ?? []);

  return (
    <>
      <Page>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Events</h1>
            <p className="mt-1 text-sm text-ink-soft">Tap an event to check people in.</p>
          </div>
        </div>
        {canManageEvents(user) && (
          <div className="mt-4">
            <NewEventForm onCreate={createEvent} />
          </div>
        )}
        <EventFeed events={items} />
      </Page>
    </>
  );
}
