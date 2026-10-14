import { requireAccessManager } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { levelOf, LEVEL_LABELS } from "@/lib/access";
import { Page } from "@/components/nav";
import { UserRoleRow } from "@/components/user-role-row";
import { InviteForm, type PendingInvite } from "@/components/invite-form";
import type { Role } from "@/lib/types";
import { cancelInvite, declineUser, inviteEmail, setUserLevel } from "./actions";

interface UserRow {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  roles: Role[];
}

export default async function AccessPage() {
  const me = await requireAccessManager();
  const actorLevel = levelOf(me.roles)!;
  const admin = createAdminClient();
  const [{ data }, { data: inviteData }] = await Promise.all([
    admin
      .from("app_users")
      .select("id, email, display_name, avatar_url, roles")
      .order("created_at", { ascending: false }),
    admin.from("app_invites").select("id, email, roles").order("created_at", { ascending: false }),
  ]);
  const users = (data ?? []) as UserRow[];
  const waiting = users.filter((u) => u.roles.length === 0);
  const active = users.filter((u) => u.roles.length > 0);
  const invites: PendingInvite[] = ((inviteData ?? []) as { id: string; email: string; roles: Role[] }[]).map(
    (i) => ({ id: i.id, email: i.email, level: levelOf(i.roles)! })
  );

  const row = (u: UserRow) => (
    <UserRoleRow
      key={u.id}
      user={{
        id: u.id,
        email: u.email,
        displayName: u.display_name,
        avatarUrl: u.avatar_url,
        level: levelOf(u.roles),
      }}
      actorLevel={actorLevel}
      isSelf={u.id === me.id}
      onSetLevel={setUserLevel.bind(null, u.id)}
      onDecline={declineUser.bind(null, u.id)}
    />
  );

  return (
    <Page>
      <h1 className="font-display text-2xl font-bold tracking-tight">Access</h1>
      <p className="mt-1 text-sm text-ink-soft">
        The Hub is invite only. Accept people who&apos;ve signed in, or add their email ahead of time.
      </p>

      <section className="mt-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          Waiting for approval
          {waiting.length > 0 && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-accent-ink">{waiting.length}</span>
          )}
        </h2>
        {waiting.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-line p-5 text-center text-sm text-ink-soft">
            Nobody is waiting right now.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">{waiting.map(row)}</ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">Add by email</h2>
        <p className="mt-1 text-sm text-ink-soft">
          They get this access as soon as they sign in with that Google account.
        </p>
        <div className="mt-3">
          <InviteForm
            actorIsAdmin={actorLevel === "admin"}
            invites={invites}
            onInvite={inviteEmail}
            onCancel={cancelInvite}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold">
          Has access <span className="text-sm font-normal text-ink-soft">{active.length}</span>
        </h2>
        <ul className="mt-3 flex flex-col gap-2">{active.map(row)}</ul>
      </section>

      <section className="mt-8 rounded-xl border border-dashed border-line p-4 text-sm text-ink-soft">
        <p>
          <strong className="text-ink">{LEVEL_LABELS.member}</strong> can see events and check people in.{" "}
          <strong className="text-ink">{LEVEL_LABELS.committee}</strong> can also run events and approve people.{" "}
          <strong className="text-ink">{LEVEL_LABELS.admin}</strong> can also manage admins.
        </p>
      </section>
    </Page>
  );
}
