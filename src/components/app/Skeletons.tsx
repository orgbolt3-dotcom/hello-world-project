import { Skeleton } from "@/components/ui/skeleton";
import { Surface } from "./Surface";
import { cn } from "@/lib/utils";

/**
 * Generic loading shells. Match the silhouette of real content so the page
 * doesn't shift when data arrives.
 */

export function SkeletonLine({ className }: { className?: string }) {
  return <Skeleton className={cn("h-3 rounded-full", className)} />;
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} className={i === lines - 1 ? "w-2/3" : "w-full"} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <Surface variant="elevated" padding="md" className="space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonLine className="w-1/2" />
          <SkeletonLine className="w-1/3" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </Surface>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
