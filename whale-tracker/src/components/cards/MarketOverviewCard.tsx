import { Activity, BarChart2, Bitcoin, Gauge } from "lucide-react";
import { formatUsd, formatNumber, formatPercent } from "@/lib/formatters";
import { cn } from "@/lib/cn";
import type { MarketOverview } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";

interface MarketOverviewCardProps {
  overview: MarketOverview | null;
  loading?: boolean;
}

const FEAR_GREED_COLORS: Record<string, string> = {
  "Extreme Fear": "text-accent-red",
  Fear: "text-accent-amber",
  Neutral: "text-text-secondary",
  Greed: "text-accent-green",
  "Extreme Greed": "text-accent-cyan",
};

interface StatRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  valueClass?: string;
}

function StatRow({ icon: Icon, label, value, valueClass }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-b-0">
      <div className="flex items-center gap-2 text-text-secondary">
        <Icon size={13} strokeWidth={1.75} />
        <span className="text-xs">{label}</span>
      </div>
      <span className={cn("text-xs font-mono font-semibold text-text-primary", valueClass)}>{value}</span>
    </div>
  );
}

export function MarketOverviewCard({ overview, loading }: MarketOverviewCardProps) {
  if (loading || !overview) {
    return (
      <div className="surface-card p-5 space-y-3">
        <Skeleton className="w-32 h-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-8" />
        ))}
      </div>
    );
  }

  const fearGreedColor = FEAR_GREED_COLORS[overview.fearGreedLabel] ?? "text-text-secondary";

  return (
    <div className="surface-card p-5">
      <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest mb-4">
        Market Overview
      </h3>

      <StatRow
        icon={BarChart2}
        label="Total Market Cap"
        value={formatUsd(overview.totalMarketCap)}
      />
      <StatRow
        icon={Activity}
        label="24h Volume"
        value={formatUsd(overview.totalVolume24h)}
      />
      <StatRow
        icon={Bitcoin}
        label="BTC Dominance"
        value={formatPercent(overview.btcDominance, 1)}
        valueClass="text-accent-amber"
      />
      <StatRow
        icon={Gauge}
        label={`Fear & Greed · ${overview.fearGreedLabel}`}
        value={String(overview.fearGreedIndex)}
        valueClass={fearGreedColor}
      />
      <StatRow
        icon={Activity}
        label="Active Coins"
        value={formatNumber(overview.activeCoins, 0)}
      />
    </div>
  );
}
