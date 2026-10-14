import { PageLoader, SkeletonBlock } from "@/components/skeleton";

export default function Loading() {
  return (
    <PageLoader>
        <SkeletonBlock className="h-6 w-40" />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-32 w-full" />
          ))}
        </div>
    </PageLoader>
  );
}
