"use server";

import { revalidatePath } from "next/cache";
import { requireAccessManager } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { LEVELS, canChangeLevel, levelOf, rolesFor, type Level } from "@/lib/access";
import { parseEmail } from "@/lib/attendance-validation";

export type AccessResult = { ok: true } | { ok: false; error: string };

function parseLevel(raw: FormDataEntryValue | null): Level | null {
  const value = String(raw ?? "");
  return (LEVELS as readonly string[]).includes(value) ? (value as Level) : null;
}

/* Sets a user's access level, "none" sends them back to waiting. */
export async function setUserLevel(userId: string, formData: FormData): Promise<AccessResult> {
  const actor = await requireAccessManager();
  const to = parseLevel(formData.get("level"));
  const admin = createAdminClient();

  const { data: target } = await admin.from("app_users").select("roles").eq("id", userId).maybeSingle();
  if (!target) return { ok: false, error: "That account no longer exists" };
  const from = levelOf(target.roles);

  if (!canChangeLevel(levelOf(actor.roles), from, to)) {
    return { ok: false, error: "Only admins can change admin access" };
  }

  // Keep at least one admin
  if (from === "admin" && to !== "admin") {
    const { count } = await admin
      .from("app_users")
      .select("id", { count: "exact", head: true })
      .contains("roles", ["admin"]);
    if ((count ?? 0) <= 1) return { ok: false, error: "There must be at least one admin" };
  }

  const { error } = await admin.from("app_users").update({ roles: rolesFor(to) }).eq("id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/access");
  return { ok: true };
}

/* Removes a waiting sign-in, they reappear if they sign in again. */
export async function declineUser(userId: string): Promise<AccessResult> {
  await requireAccessManager();
  const admin = createAdminClient();
  const { data: target } = await admin.from("app_users").select("roles").eq("id", userId).maybeSingle();
  if (!target) return { ok: true };
  if (target.roles.length > 0) return { ok: false, error: "Remove their access first" };

  const { error } = await admin.from("app_users").delete().eq("id", userId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/access");
  return { ok: true };
}

/* Pre-approves an email, or updates the access of an existing account with it. */
export async function inviteEmail(formData: FormData): Promise<AccessResult> {
  const actor = await requireAccessManager();
  let email: string | null;
  try {
    email = parseEmail(formData.get("email"), true);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invalid email" };
  }
  const level = parseLevel(formData.get("level"));
  if (!email || !level) return { ok: false, error: "Pick an access level" };
  if (!canChangeLevel(levelOf(actor.roles), null, level)) {
    return { ok: false, error: "Only admins can invite admins" };
  }

  const admin = createAdminClient();

  // Already signed in once, update them directly
  const { data: existing } = await admin.from("app_users").select("id, roles").eq("email", email).maybeSingle();
  if (existing) {
    if (existing.roles.length > 0) return { ok: false, error: "That email already has access, change it below" };
    const { error } = await admin.from("app_users").update({ roles: rolesFor(level) }).eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/access");
    return { ok: true };
  }

  const { error } = await admin
    .from("app_invites")
    .upsert({ email, roles: rolesFor(level), invited_by: actor.id }, { onConflict: "email" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/access");
  return { ok: true };
}

export async function cancelInvite(inviteId: string): Promise<AccessResult> {
  const actor = await requireAccessManager();
  const admin = createAdminClient();
  const { data: invite } = await admin.from("app_invites").select("roles").eq("id", inviteId).maybeSingle();
  if (!invite) return { ok: true };
  if (!canChangeLevel(levelOf(actor.roles), levelOf(invite.roles), null)) {
    return { ok: false, error: "Only admins can cancel admin invites" };
  }
  const { error } = await admin.from("app_invites").delete().eq("id", inviteId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/access");
  return { ok: true };
}
