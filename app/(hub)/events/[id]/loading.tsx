import { PageLoader, SkeletonBlock } from "@/components/skeleton";

export default function Loading() {
  return (
    <PageLoader>
        <SkeletonBlock className="h-4 w-16" />
        <SkeletonBlock className="mt-3 h-6 w-64" />
        <SkeletonBlock className="mt-4 h-20 w-full" />
        <SkeletonBlock className="mt-3 h-8 w-full max-w-md" />
        <div className="mt-6 flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-14 w-full" />
          ))}
        </div>
    </PageLoader>
  );
}
