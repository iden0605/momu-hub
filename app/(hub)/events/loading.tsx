import { PageLoader, SkeletonBlock } from "@/components/skeleton";

export default function Loading() {
  return (
    <PageLoader>
        <SkeletonBlock className="h-6 w-28" />
        <SkeletonBlock className="mt-2 h-4 w-64" />
        <SkeletonBlock className="mt-6 h-9 w-48" />
        <div className="mt-4 flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-24 w-full" />
          ))}
        </div>
    </PageLoader>
  );
}
