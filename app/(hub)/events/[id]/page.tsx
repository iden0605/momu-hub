import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { requireAppUser, canManageEvents } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Page } from "@/components/nav";
import { EventHeader } from "@/components/event-header";
import { EventDetailTabs } from "@/components/event-detail-tabs";
import { AttendanceSharePanel } from "@/components/attendance-share-panel";
import { AttendanceStatsPanel } from "@/components/attendance-stats-panel";
import {
  AttendanceList,
  type AttendanceEntryRow,
  type AttendanceMemberOption,
} from "@/components/attendance-list";
import { computeAttendanceStats } from "@/lib/attendance-stats";
import type { EventDiscoverySource, EventType } from "@/lib/types";
import { setEventOpen, updateEvent, deleteEvent } from "../actions";
import {
  checkInMember,
  addNewMemberAndCheckIn,
  removeAttendanceEntry,
} from "@/app/(hub)/attendance/actions";

interface EventDetail {
  id: string;
  title: string;
  description: string;
  is_open: boolean;
  created_at: string;
  closed_at: string | null;
  starts_at: string | null;
  venue: string | null;
  event_types: EventType[];
  event_type_other_details: string | null;
  creator: { display_name: string } | null;
}

interface AttendanceRow {
  id: string;
  member_id: string;
  created_at: string;
  member: {
    full_name: string;
    student_number: string | null;
    course: string | null;
    is_club_member: boolean;
  } | null;
  checked_in_by_user: { display_name: string } | null;
  found_via: EventDiscoverySource | null;
  found_via_other_details: string | null;
}

interface MemberRow {
  id: string;
  full_name: string;
  student_number: string | null;
  course: string | null;
  is_club_member: boolean;
}


export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const user = await requireAppUser();
  const supabase = await createClient();

  const [{ data }, { data: attendanceData }, { data: memberData }] =
    await Promise.all([
      supabase
        .from("events")
        .select(
          "id, title, description, is_open, created_at, closed_at, starts_at, venue, event_types, event_type_other_details, creator:app_users!events_created_by_fkey (display_name)"
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("attendance_entries")
        .select(
          "id, member_id, created_at, found_via, found_via_other_details, member:attendance_members!attendance_entries_member_id_fkey (full_name, email, student_number, course, is_club_member), checked_in_by_user:app_users!attendance_entries_checked_in_by_fkey (display_name)"
        )
        .eq("event_id", id)
        .order("created_at", { ascending: false }),
      // Full roster, for the check-in search box (search-and-select instead
      // of re-entering a returning student's details).
      supabase
        .from("attendance_members")
        .select("id, full_name, student_number, course, is_club_member")
        .order("full_name", { ascending: true }),
    ]);
  if (!data) notFound();
  const event = data as unknown as EventDetail;
  const attendance = (attendanceData ?? []) as unknown as AttendanceRow[];
  const attendanceEntries: AttendanceEntryRow[] = attendance.map((a) => ({
    id: a.id,
    memberId: a.member_id,
    fullName: a.member?.full_name ?? "unknown",
    studentNumber: a.member?.student_number ?? null,
    course: a.member?.course ?? null,
    isClubMember: a.member?.is_club_member ?? false,
    foundVia: a.found_via,
    foundViaOtherDetails: a.found_via_other_details,
    createdAt: a.created_at,
    // Null checked_in_by is how a self check-in (the public /checkin link,
    // no signed-in staff member involved) is represented, not a data gap.
    checkedInByName: a.checked_in_by_user?.display_name ?? "self check-in",
  }));
  const members: AttendanceMemberOption[] = (
    (memberData ?? []) as MemberRow[]
  ).map((m) => ({
    id: m.id,
    fullName: m.full_name,
    course: m.course,
    isClubMember: m.is_club_member,
    studentNumber: m.student_number,
  }));

  const canManage = canManageEvents(user);
  const stats = computeAttendanceStats(attendanceEntries);

  // No self-check-in link without a public URL to build it from (unset in
  // local dev, per .env.example, where nothing external can reach it
  // anyway).
  const checkinUrl = process.env.APP_URL ? `${process.env.APP_URL}/checkin/${event.id}` : null;
  const qrSvg = checkinUrl
    ? await QRCode.toString(checkinUrl, { type: "svg", margin: 0 })
    : null;

  return (
    <>
      <Page>
        <Link
          href="/events"
          className="text-sm text-ink-soft underline-offset-2 hover:underline"
        >
          ← Events
        </Link>

        <EventHeader
          event={{
            id: event.id,
            title: event.title,
            description: event.description,
            is_open: event.is_open,
            created_at: event.created_at,
            closed_at: event.closed_at,
            startsAt: event.starts_at,
            venue: event.venue,
            eventTypes: event.event_types,
            eventTypeOtherDetails: event.event_type_other_details,
            creatorName: event.creator?.display_name ?? "unknown",
          }}
          canManage={canManage}
          deleteBlocked={attendanceEntries.length > 0}
          onToggleOpen={setEventOpen.bind(null, event.id, !event.is_open)}
          onUpdate={updateEvent.bind(null, event.id)}
          onDelete={deleteEvent.bind(null, event.id)}
        />

        <EventDetailTabs
          defaultTab={tab === "stats" ? "stats" : "attendance"}
          attendanceLabel={`Attendance (${attendanceEntries.length})`}
          attendance={
            <>
              {checkinUrl && qrSvg && (
                <div className="mt-4 flex justify-end">
                  <AttendanceSharePanel checkinUrl={checkinUrl} qrSvg={qrSvg} eventTitle={event.title} />
                </div>
              )}
              <AttendanceList
              entries={attendanceEntries}
              members={members}
              onCheckInExisting={checkInMember.bind(null, event.id)}
              onAddNew={addNewMemberAndCheckIn.bind(null, event.id)}
              onRemove={removeAttendanceEntry.bind(null, event.id)}
              exportHref={`/events/${event.id}/attendance/export`}
              canExport={!!event.starts_at && !!event.venue && event.event_types.length > 0}
            />
            </>
          }
          stats={
            <div className="mt-4">
              <AttendanceStatsPanel stats={stats} />
              <Link
                href="/attendance/stats"
                className="mt-4 inline-block text-sm text-accent underline-offset-2 hover:underline"
              >
                View stats for all events →
              </Link>
            </div>
          }
        />
      </Page>
    </>
  );
}
