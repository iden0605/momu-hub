"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type UnlockResult = { ok: false; error: string };

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

/* Grants every role to the signed-in user when the admin password matches. */
export async function unlockAdmin(_prev: UnlockResult | null, formData: FormData): Promise<UnlockResult> {
  const user = await getAppUser();
  if (!user) redirect("/login");

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return { ok: false, error: "Admin unlock isn't set up on this deployment" };

  // Constant time compare on equal length digests
  const given = String(formData.get("password") ?? "");
  if (!timingSafeEqual(digest(given), digest(expected))) {
    await new Promise((r) => setTimeout(r, 600));
    return { ok: false, error: "That password isn't right" };
  }

  const { error } = await createAdminClient()
    .from("app_users")
    .update({ roles: ["member", "committee", "admin"] })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  redirect("/");
}
