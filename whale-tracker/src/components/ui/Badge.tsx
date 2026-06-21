import { cn } from "@/lib/cn";
import type { RiskLevel } from "@/types";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: "bg-surface-3 text-text-secondary border-border-subtle",
  success: "bg-accent-green/10 text-accent-green border-accent-green/20",
  warning: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
  danger: "bg-accent-red/10 text-accent-red border-accent-red/20",
  info: "bg-accent-cyan/10 text-accent-cyan border-accent-cyan/20",
  neutral: "bg-text-muted/10 text-text-muted border-border-subtle",
};

const DOT_COLORS: Record<BadgeVariant, string> = {
  default: "bg-text-secondary",
  success: "bg-accent-green",
  warning: "bg-accent-amber",
  danger: "bg-accent-red",
  info: "bg-accent-cyan",
  neutral: "bg-text-muted",
};

export function Badge({ children, variant = "default", className, dot, pulse }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5",
        "rounded-md border text-xs font-medium font-mono",
        VARIANT_STYLES[variant],
        className
      )}
    >
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", DOT_COLORS[variant], pulse && "animate-pulse-slow")} />
      )}
      {children}
    </span>
  );
}

/** Convenience component for displaying a RiskLevel as a badge. */
export function RiskBadge({ level }: { level: RiskLevel }) {
  const variantMap: Record<RiskLevel, BadgeVariant> = {
    low: "success",
    medium: "warning",
    high: "danger",
    critical: "danger",
  };

  return (
    <Badge variant={variantMap[level]} dot pulse={level === "critical"}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </Badge>
  );
}
