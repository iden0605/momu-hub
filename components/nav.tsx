import Image from "next/image";
import Link from "next/link";
import { canManageAccess, type AppUser } from "@/lib/auth";
import { highestRoleLabel } from "@/lib/format";
import { LiveRefresh } from "@/components/live-refresh";
import { NavLinks } from "@/components/nav-links";
import { MobileMenu } from "@/components/mobile-menu";

function Avatar({ user }: { user: AppUser }) {
  const initial = (user.display_name || user.email).charAt(0).toUpperCase();
  return user.avatar_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user.avatar_url}
      alt=""
      referrerPolicy="no-referrer"
      className="h-8 w-8 flex-none rounded-full object-cover ring-2 ring-surface"
    />
  ) : (
    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-marigold-soft text-sm font-bold text-warn ring-2 ring-surface">
      {initial}
    </span>
  );
}

/* Sticky top bar, plus the bottom tab bar on phones. */
export function Nav({ user }: { user: AppUser }) {
  const roleLabel = highestRoleLabel(user.roles);
  const canManage = canManageAccess(user);
  return (
    <>
      <LiveRefresh />
      <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/assets/momu-logo.png"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 flex-none rounded-full bg-white"
              priority
            />
            <span className="font-display text-lg font-bold tracking-tight">
              MoMU <span className="text-accent">Hub</span>
            </span>
          </Link>

          <div className="ml-4 hidden sm:block">
            <NavLinks canManage={canManage} />
          </div>

          <details className="group relative ml-auto hidden sm:block">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full p-0.5 hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
              <Avatar user={user} />
            </summary>
            <div className="absolute right-0 top-full z-40 mt-2 w-60 rounded-xl border border-line bg-surface p-3 shadow-soft">
              <p className="truncate text-sm font-semibold">{user.display_name}</p>
              <p className="truncate text-xs text-ink-soft">{user.email}</p>
              {roleLabel && (
                <span className="mt-2 inline-block rounded-full bg-slate-soft px-2.5 py-0.5 text-xs font-semibold text-nav">
                  {roleLabel}
                </span>
              )}
              <form action="/auth/signout" method="post" className="mt-3 border-t border-line pt-3">
                <button
                  type="submit"
                  className="w-full rounded-md px-2 py-1.5 text-left text-sm font-semibold text-danger hover:bg-danger-soft"
                >
                  Sign out
                </button>
              </form>
            </div>
          </details>

          <div className="ml-auto sm:hidden">
            <MobileMenu
              canManage={canManage}
              user={{
                displayName: user.display_name,
                email: user.email,
                avatarUrl: user.avatar_url,
                roleLabel,
              }}
            />
          </div>
        </div>
      </header>
    </>
  );
}

/* Page wrapper with room for the phone tab bar. */
export function Page({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return (
    <main
      className={`animate-rise mx-auto w-full flex-1 px-4 pb-12 pt-5 sm:px-6 sm:pt-8 ${
        narrow ? "max-w-2xl" : "max-w-5xl"
      }`}
    >
      {children}
    </main>
  );
}
