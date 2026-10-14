import { PageLoader, SkeletonBlock } from "@/components/skeleton";

export default function Loading() {
  return (
    <PageLoader>
        <SkeletonBlock className="h-6 w-40" />
        <div className="mt-4 flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-14 w-full" />
          ))}
        </div>
    </PageLoader>
  );
}
