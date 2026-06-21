import { type LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/Skeleton";

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  loading?: boolean;
  className?: string;
  accentColor?: "cyan" | "green" | "red" | "amber" | "purple";
}

const ACCENT_STYLES = {
  cyan: "from-accent-cyan/5 to-transparent border-l-accent-cyan/40",
  green: "from-accent-green/5 to-transparent border-l-accent-green/40",
  red: "from-accent-red/5 to-transparent border-l-accent-red/40",
  amber: "from-accent-amber/5 to-transparent border-l-accent-amber/40",
  purple: "from-accent-purple/5 to-transparent border-l-accent-purple/40",
};

const ACCENT_ICON_BG = {
  cyan: "bg-accent-cyan/10 text-accent-cyan",
  green: "bg-accent-green/10 text-accent-green",
  red: "bg-accent-red/10 text-accent-red",
  amber: "bg-accent-amber/10 text-accent-amber",
  purple: "bg-accent-purple/10 text-accent-purple",
};

export function MetricCard({
  label,
  value,
  subValue,
  change,
  changeLabel,
  icon: Icon,
  loading,
  className,
  accentColor = "cyan",
}: MetricCardProps) {
  if (loading) {
    return <div className={cn("surface-card p-5", className)}><Skeleton className="w-24 h-3 mb-3" /><Skeleton className="w-36 h-7 mb-2" /><Skeleton className="w-20 h-3" /></div>;
  }

  const changeIsPositive = (change ?? 0) > 0;
  const changeIsNegative = (change ?? 0) < 0;

  return (
    <div
      className={cn(
        "surface-card p-5 group",
        "bg-gradient-to-br border-l-2",
        ACCENT_STYLES[accentColor],
        "hover:shadow-card-hover transition-shadow duration-200",
        "animate-fade-in",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-text-secondary uppercase tracking-widest">{label}</p>
        {Icon && (
          <div className={cn("p-1.5 rounded-md", ACCENT_ICON_BG[accentColor])}>
            <Icon size={13} strokeWidth={2} />
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-text-primary font-tabular tracking-tight mb-1">{value}</p>

      <div className="flex items-center gap-2 mt-2">
        {change !== undefined && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-mono font-medium",
              changeIsPositive && "text-accent-green",
              changeIsNegative && "text-accent-red",
              !changeIsPositive && !changeIsNegative && "text-text-muted"
            )}
          >
            {changeIsPositive && <TrendingUp size={11} strokeWidth={2.5} />}
            {changeIsNegative && <TrendingDown size={11} strokeWidth={2.5} />}
            {changeIsPositive ? "+" : ""}
            {change?.toFixed(2)}%
          </span>
        )}
        {subValue && <span className="text-xs text-text-muted">{subValue}</span>}
        {changeLabel && <span className="text-xs text-text-muted">{changeLabel}</span>}
      </div>
    </div>
  );
}
