import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppUser } from "@/lib/auth";
import { AdminUnlockForm } from "@/components/admin-unlock-form";

export default async function AccessDeniedPage() {
  const user = await getAppUser();
  if (!user) redirect("/login");
  if (user.roles.length > 0) redirect("/");

  return (
    <main className="flex flex-1 flex-col">
      <div className="momu-stripe h-2 w-full" aria-hidden />
      <div className="animate-rise mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-12">
        <div className="flex flex-col items-center text-center">
          <Image src="/assets/momu-logo.png" alt="" width={96} height={96} className="h-24 w-24" />
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-marigold-soft px-3 py-1 text-xs font-bold text-warn">
            <span className="loader-dot h-1.5 w-1.5 bg-marigold" aria-hidden /> Waiting for approval
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">
            Hang tight, {user.display_name.split(" ")[0]}
          </h1>
          <p className="mt-2 text-ink-soft">
            The MoMU Hub is for club committee only. You&apos;ll get access once a committee member
            accepts <strong className="text-ink">{user.email}</strong>.
          </p>
          <Link href="/" className="mt-3 text-sm font-semibold text-accent hover:underline">
            Check again
          </Link>
        </div>

        <details className="rounded-xl border border-line bg-surface p-4 shadow-soft">
          <summary className="cursor-pointer text-sm font-semibold text-ink-soft">I have the admin password</summary>
          <div className="mt-3">
            <AdminUnlockForm />
          </div>
        </details>

        <form action="/auth/signout" method="post" className="text-center">
          <button type="submit" className="text-sm font-semibold text-ink-soft hover:text-ink">
            Use a different account
          </button>
        </form>
      </div>
    </main>
  );
}
