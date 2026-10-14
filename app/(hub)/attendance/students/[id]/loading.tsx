import { PageLoader, SkeletonBlock } from "@/components/skeleton";

export default function Loading() {
  return (
    <PageLoader>
      <SkeletonBlock className="h-7 w-48" />
      <SkeletonBlock className="mt-2 h-4 w-64" />
      <div className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-14 w-full" />
        ))}
      </div>
    </PageLoader>
  );
}
