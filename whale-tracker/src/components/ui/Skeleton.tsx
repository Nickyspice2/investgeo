import { cn } from "@/lib/cn";

interface SkeletonProps {
  className?: string;
  rows?: number;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={cn("block rounded-md bg-surface-3 animate-pulse", className)}
      aria-hidden
    />
  );
}

export function SkeletonTable({ rows = 8 }: SkeletonProps) {
  return (
    <div className="space-y-2 px-4 py-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 h-11">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-32 h-4" />
          <Skeleton className="flex-1 h-4" />
          <Skeleton className="w-28 h-4" />
          <Skeleton className="w-20 h-6 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("surface-card p-5 space-y-3", className)}>
      <Skeleton className="w-24 h-3" />
      <Skeleton className="w-36 h-7" />
      <Skeleton className="w-20 h-3" />
    </div>
  );
}
