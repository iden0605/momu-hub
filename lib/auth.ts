import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Role } from "@/lib/types";

export interface AppUser {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  roles: Role[];
}

const APP_USER_COLUMNS = "id, email, display_name, avatar_url, roles";

// Comma separated emails that get admin on sign-in
function bootstrapAdmins(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/* Upserts the app row for a Google user, keeping existing roles.
 * Applies a pending invite for the email, ADMIN_EMAILS always get every role.
 */
export async function syncGoogleUser(user: User) {
  const email = (user.email ?? "").toLowerCase();
  if (!email) return;
  const meta = user.user_metadata ?? {};
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("app_users")
    .select("roles")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  let roles: Role[] = existing?.roles ?? [];

  // Invited email with no access yet takes the invite's roles
  if (roles.length === 0) {
    const { data: invite } = await admin
      .from("app_invites")
      .select("id, roles")
      .eq("email", email)
      .maybeSingle();
    if (invite) {
      roles = invite.roles;
      await admin.from("app_invites").delete().eq("id", invite.id);
    }
  }

  // Bootstrap admins always hold every role
  if (bootstrapAdmins().includes(email)) roles = ["member", "committee", "admin"];

  await admin.from("app_users").upsert(
    {
      auth_user_id: user.id,
      email,
      display_name: meta.full_name || meta.name || email.split("@")[0],
      avatar_url: meta.avatar_url || meta.picture || null,
      roles,
    },
    { onConflict: "auth_user_id" }
  );
}

/* Returns the signed-in user's app row, or null if signed out. */
export const getAppUser = cache(async (): Promise<AppUser | null> => {
  const supabase = await createClient();

  // Verifies the session JWT locally, no auth server round trip
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (!userId) return null;

  const { data } = await supabase
    .from("app_users")
    .select(APP_USER_COLUMNS)
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (data) return data;

  // Row missing, e.g. callback skipped, create it now
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  await syncGoogleUser(user);
  const { data: fresh } = await createAdminClient()
    .from("app_users")
    .select(APP_USER_COLUMNS)
    .eq("auth_user_id", user.id)
    .maybeSingle();
  return fresh;
});

/* Signed-in user with at least one role, otherwise redirects to the waiting page. */
export async function requireAppUser(): Promise<AppUser> {
  const appUser = await getAppUser();
  if (!appUser) redirect("/login");
  if (appUser.roles.length === 0) redirect("/access-denied");
  return appUser;
}

export function hasRole(user: AppUser, role: Role): boolean {
  return user.roles.includes(role);
}

/* Committee and admins can create, edit and export events. */
export function canManageEvents(user: AppUser): boolean {
  return hasRole(user, "committee") || hasRole(user, "admin");
}

/* Committee and admins can approve people and send invites. */
export function canManageAccess(user: AppUser): boolean {
  return hasRole(user, "committee") || hasRole(user, "admin");
}

export async function requireAccessManager(): Promise<AppUser> {
  const user = await requireAppUser();
  if (!canManageAccess(user)) redirect("/");
  return user;
}
