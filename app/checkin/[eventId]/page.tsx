import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { SelfCheckinForm } from "@/components/self-checkin-form";
import { checkExistingMatch, publicSelfCheckIn } from "./actions";

interface EventRow {
  title: string;
  venue: string | null;
  is_open: boolean;
}

// No requireAppUser() anywhere on this page: reached by scanning an
// event's QR code, no sign-in at all. Listed in PUBLIC_PATHS
// (lib/supabase/middleware.ts) so the auth middleware doesn't redirect
// visitors to /login.
export default async function PublicCheckinPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const admin = createAdminClient();
  const { data } = await admin
    .from("events")
    .select("title, venue, is_open")
    .eq("id", eventId)
    .maybeSingle();

  if (!data) {
    return <Shell title="Event not found">This check-in link doesn&apos;t exist.</Shell>;
  }
  const event = data as EventRow;

  if (!event.is_open) {
    return (
      <Shell title={event.title}>This event isn&apos;t currently open for check-in.</Shell>
    );
  }

  return (
    <main className="flex flex-1 flex-col">
      <div className="momu-stripe h-2 w-full" aria-hidden />
      <div className="animate-rise mx-auto flex w-full max-w-md flex-1 flex-col px-4 pb-10 pt-6">
      <div className="flex items-center gap-3">
        <Image src="/assets/momu-logo.png" alt="MoMU" width={56} height={56} className="h-14 w-14" />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-accent">Check in</p>
          <h1 className="font-display text-2xl font-bold leading-tight tracking-tight">{event.title}</h1>
          {event.venue && <p className="text-sm text-ink-soft">{event.venue}</p>}
        </div>
      </div>

      <div className="mt-6">
        <SelfCheckinForm
          onCheckMatch={checkExistingMatch.bind(null, eventId)}
          onSubmit={publicSelfCheckIn.bind(null, eventId)}
        />
      </div>
      </div>
    </main>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center p-4 text-center sm:p-6">
      <h1 className="font-display text-lg font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-ink-soft">{children}</p>
    </main>
  );
}
