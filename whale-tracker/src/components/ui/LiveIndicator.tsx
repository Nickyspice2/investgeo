import { cn } from "@/lib/cn";

interface LiveIndicatorProps {
  active?: boolean;
  label?: string;
  className?: string;
}

export function LiveIndicator({ active = true, label = "LIVE", className }: LiveIndicatorProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5",
        "rounded-md text-2xs font-bold font-mono tracking-widest",
        active
          ? "bg-accent-red/10 text-accent-red border border-accent-red/30"
          : "bg-surface-3 text-text-muted border border-border-subtle",
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", active ? "bg-accent-red animate-pulse" : "bg-text-muted")} />
      {label}
    </span>
  );
}
