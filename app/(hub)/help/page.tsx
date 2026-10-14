import { requireAppUser, canManageEvents, canManageAccess } from "@/lib/auth";
import { Page } from "@/components/nav";

const TINTS = ["bg-accent-soft text-accent", "bg-marigold-soft text-warn", "bg-slate-soft text-nav"];

function Section({
  title,
  index,
  children,
}: {
  title: string;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <details
      open={index === 0}
      className="group rounded-xl border border-line bg-surface shadow-soft [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
        <span
          className={`flex h-8 w-8 flex-none items-center justify-center rounded-full font-display text-sm font-bold ${
            TINTS[index % TINTS.length]
          }`}
        >
          {index + 1}
        </span>
        <span className="flex-1 font-display font-semibold">{title}</span>
        <span aria-hidden className="text-ink-soft transition-transform group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="space-y-2 px-4 pb-4 text-sm text-ink-soft">{children}</div>
    </details>
  );
}

export default async function HelpPage() {
  const user = await requireAppUser();
  const canManage = canManageEvents(user);
  const canApprove = canManageAccess(user);

  return (
    <>
      <Page narrow>
        <h1 className="font-display text-2xl font-bold tracking-tight">How the Hub works</h1>
        <p className="mt-1 text-sm text-ink-soft">Tap a topic to open it.</p>

        <div className="mt-6 space-y-3">
          <Section index={0} title="Signing in and access">
            <p>
              The Hub is invite only. Sign in with your <strong className="text-ink">Google account</strong>,
              then wait for committee to accept you, unless your email was added ahead of time:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong className="text-ink">Member</strong>, see events and check people in.</li>
              <li><strong className="text-ink">Committee</strong>, also run events and approve people.</li>
              <li><strong className="text-ink">Admin</strong>, also manage admins.</li>
            </ul>
            {canApprove && <p>Accept people and add emails from the <strong className="text-ink">Access</strong> tab.</p>}
          </Section>

          <Section index={1} title="Events">
            <p>Each event has a title, date and time, venue and type.</p>
            {canManage && (
              <p>
                Create events from the Events tab. Closing an event stops check-ins, nothing is deleted.
              </p>
            )}
          </Section>

          <Section index={2} title="Checking people in">
            <ul className="list-disc space-y-1 pl-5">
              <li>Open an event and search the roster by name or student ID.</li>
              <li>Not there yet? Add them on the spot, they&apos;re remembered for next time.</li>
              <li>
                Show the event&apos;s <strong className="text-ink">QR code</strong> so people can check
                themselves in with name, email and student ID, no sign-in needed.
              </li>
            </ul>
          </Section>

          <Section index={3} title="Exports and stats">
            <ul className="list-disc space-y-1 pl-5">
              <li>Download a <strong className="text-ink">UMSU-formatted CSV</strong> from any event.</li>
              <li>The Stats tab shows turnout and how people heard about the event.</li>
            </ul>
          </Section>
        </div>
      </Page>
    </>
  );
}
