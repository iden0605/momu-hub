"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAppUser, canManageEvents } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { EVENT_TYPES } from "@/lib/types";

// Required for the UMSU attendance CSV export: date/time, venue, and at
// least one event type (with details when "Other" is picked).
function parseEventFields(formData: FormData) {
  const date = String(formData.get("starts_at_date") ?? "").trim();
  const time = String(formData.get("starts_at_time") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error("Event date and time are required");
  }
  const startsAt = `${date}T${time}`;

  const venue = String(formData.get("venue") ?? "").trim();
  if (!venue) throw new Error("Venue is required");

  const eventTypes = EVENT_TYPES.filter((t) => formData.get(`event_type_${t}`));
  if (eventTypes.length === 0) throw new Error("Select at least one event type");

  let otherDetails: string | null = null;
  if (eventTypes.includes("other")) {
    otherDetails = String(formData.get("event_type_other_details") ?? "").trim();
    if (!otherDetails) {
      throw new Error("Details are required when \"Other\" is selected");
    }
  }

  return {
    starts_at: startsAt,
    venue,
    event_types: eventTypes,
    event_type_other_details: otherDetails,
  };
}

export async function createEvent(formData: FormData) {
  const user = await requireAppUser();
  if (!canManageEvents(user)) throw new Error("Not allowed");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");
  const eventFields = parseEventFields(formData);

  const admin = createAdminClient();
  const { error } = await admin.from("events").insert({
    title,
    description: String(formData.get("description") ?? "").trim(),
    created_by: user.id,
    ...eventFields,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/events");
}

export async function setEventOpen(eventId: string, isOpen: boolean) {
  const user = await requireAppUser();
  if (!canManageEvents(user)) throw new Error("Not allowed");

  const admin = createAdminClient();
  const { error } = await admin
    .from("events")
    .update({ is_open: isOpen, closed_at: isOpen ? null : new Date().toISOString() })
    .eq("id", eventId);
  if (error) throw new Error(error.message);
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
}

export async function updateEvent(eventId: string, formData: FormData) {
  const user = await requireAppUser();
  if (!canManageEvents(user)) throw new Error("Not allowed");

  const title = String(formData.get("title") ?? "").trim();
  if (!title) throw new Error("Title is required");
  const eventFields = parseEventFields(formData);

  const admin = createAdminClient();
  const { error } = await admin
    .from("events")
    .update({
      title,
      description: String(formData.get("description") ?? "").trim(),
      ...eventFields,
    })
    .eq("id", eventId);
  if (error) throw new Error(error.message);
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
}

// Only for events created by mistake, refuses once anyone has checked in
export async function deleteEvent(eventId: string) {
  const user = await requireAppUser();
  if (!canManageEvents(user)) throw new Error("Not allowed");

  const admin = createAdminClient();
  const { count, error: countError } = await admin
    .from("attendance_entries")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId);
  if (countError) throw new Error(countError.message);
  if (count && count > 0) {
    throw new Error("Can't delete an event with attendance recorded. Close it instead.");
  }

  const { error } = await admin.from("events").delete().eq("id", eventId);
  if (error) {
    // Check-in added between the count and the delete
    if (error.code === "23503") {
      throw new Error(
        "Can't delete, someone just checked in to to this event. Close it instead."
      );
    }
    throw new Error(error.message);
  }
  revalidatePath("/events");
  redirect("/events");
}
