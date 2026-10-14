import Image from "next/image";
import { SignInButton } from "@/components/sign-in-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex flex-1 flex-col">
      <div className="momu-stripe h-2 w-full" aria-hidden />
      <div className="animate-rise mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-6 py-12">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/assets/momu-logo.png"
            alt="Malaysians of Melbourne University"
            width={160}
            height={160}
            className="h-36 w-36 sm:h-40 sm:w-40"
            priority
          />
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
            Selamat datang!
          </h1>
          <p className="mt-2 text-ink-soft">
            The MoMU Hub keeps our events and attendance in one place.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <SignInButton />
          {error && (
            <p className="rounded-md bg-danger-soft px-3 py-2 text-center text-sm text-danger">
              Something went wrong signing in. Please try again.
            </p>
          )}
          <p className="text-center text-xs text-ink-soft">
            Committee members get access once an admin adds them.
          </p>
        </div>
      </div>
    </main>
  );
}
