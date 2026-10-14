// Placeholder block with a warm shimmer
export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} />;
}

/* Page area loader, three dots in the logo colours above the skeleton. */
export function PageLoader({ children }: { children: React.ReactNode }) {
  return (
    <main
      aria-busy="true"
      aria-label="Loading"
      className="mx-auto w-full max-w-5xl flex-1 px-4 pb-12 pt-5 sm:px-6 sm:pt-8"
    >
      <div className="mb-5 flex gap-1.5" aria-hidden>
        <span className="loader-dot bg-accent" />
        <span className="loader-dot bg-marigold [animation-delay:120ms]" />
        <span className="loader-dot bg-nav [animation-delay:240ms]" />
      </div>
      {children}
    </main>
  );
}
