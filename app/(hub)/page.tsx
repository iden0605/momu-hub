import Link from "next/link";
import { requireAppUser, canManageEvents } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Page } from "@/components/nav";
import { HelpNudge } from "@/components/help-nudge";
import { EventFeedCard } from "@/components/event-feed-card";
import { EVENT_COLUMNS, toFeedItems, type EventRow } from "@/lib/events";

// Greeting by Melbourne time of day
function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", hour: "numeric", hour12: false }).format(
      new Date()
    )
  );
  if (hour < 12) return "Selamat pagi";
  if (hour < 18) return "Selamat petang";
  return "Selamat malam";
}

export default async function HubHome() {
  const user = await requireAppUser();
  const supabase = await createClient();

  const [{ data: eventData }, { data: attendanceData }, { count: memberCount }] = await Promise.all([
    supabase.from("events").select(EVENT_COLUMNS).order("starts_at", { ascending: false, nullsFirst: true }),
    supabase.from("attendance_entries").select("event_id"),
    supabase.from("attendance_members").select("id", { count: "exact", head: true }),
  ]);
  const events = toFeedItems((eventData ?? []) as EventRow[], attendanceData ?? []);
  const openEvents = events.filter((e) => e.isOpen);
  const recent = events.filter((e) => !e.isOpen).slice(0, 4);

  const stats = [
    { label: "Open events", value: openEvents.length, tint: "bg-accent-soft text-accent" },
    { label: "Check-ins", value: attendanceData?.length ?? 0, tint: "bg-marigold-soft text-warn" },
    { label: "People", value: memberCount ?? 0, tint: "bg-slate-soft text-nav" },
  ];

  return (
    <>
      <Page>
        <section className="relative overflow-hidden rounded-xl bg-nav p-5 text-nav-ink sm:p-7">
          <div className="momu-stripe absolute inset-x-0 bottom-0 h-1.5" aria-hidden />
          <p className="text-sm font-semibold text-nav-ink/70">{greeting()},</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {user.display_name.split(" ")[0]} 👋
          </h1>
          <p className="mt-2 max-w-md text-sm text-nav-ink/80">
            Here&apos;s what&apos;s happening at MoMU.
          </p>
          {canManageEvents(user) && (
            <Link
              href="/events"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:bg-accent-hover"
            >
              <span aria-hidden>+</span> Plan an event
            </Link>
          )}
        </section>

        <HelpNudge />

        <dl className="mt-4 grid grid-cols-3 gap-2.5">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-surface p-3 shadow-soft sm:p-4">
              <dd className={`inline-block rounded-md px-2 font-display text-2xl font-bold sm:text-3xl ${s.tint}`}>
                {s.value}
              </dd>
              <dt className="mt-1 text-xs font-semibold text-ink-soft sm:text-sm">{s.label}</dt>
            </div>
          ))}
        </dl>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Happening now</h2>
            <Link href="/events" className="text-sm font-semibold text-accent hover:underline">
              All events
            </Link>
          </div>
          {openEvents.length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-line p-6 text-center text-sm text-ink-soft">
              No open events right now.
            </div>
          ) : (
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {openEvents.map((e, i) => (
                <li key={e.id}>
                  <EventFeedCard event={e} index={i} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {recent.length > 0 && (
          <section className="mt-8">
            <h2 className="font-display text-lg font-semibold">Recently wrapped up</h2>
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {recent.map((e, i) => (
                <li key={e.id}>
                  <EventFeedCard event={e} index={i + 1} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </Page>
    </>
  );
}
