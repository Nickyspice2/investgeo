"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatPercent, formatUsd } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/Skeleton";
import { NETWORK_COLORS } from "@/lib/constants";
import type { Ticker } from "@/types";

interface TickerItemProps {
  ticker: Ticker;
}

function TickerItem({ ticker }: TickerItemProps) {
  const isUp = ticker.trend === "up";
  const isDown = ticker.trend === "down";
  const networkColor = NETWORK_COLORS[ticker.symbol as keyof typeof NETWORK_COLORS];

  return (
    <div className="flex items-center gap-2.5 px-4 border-r border-border-subtle last:border-r-0 shrink-0">
      <div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: networkColor ?? "#8B949E" }}
      />
      <span className="text-xs font-bold text-text-secondary font-mono">{ticker.symbol}</span>
      <span className="text-xs font-tabular text-text-primary font-mono">
        {formatUsd(ticker.price, false)}
      </span>
      <span
        className={cn(
          "flex items-center gap-0.5 text-xs font-tabular font-mono",
          isUp && "text-accent-green",
          isDown && "text-accent-red",
          !isUp && !isDown && "text-text-muted"
        )}
      >
        {isUp && <TrendingUp size={10} strokeWidth={2.5} />}
        {isDown && <TrendingDown size={10} strokeWidth={2.5} />}
        {formatPercent(ticker.priceChangePercent24h)}
      </span>
    </div>
  );
}

interface TickerBarProps {
  tickers: Ticker[];
  loading?: boolean;
}

export function TickerBar({ tickers, loading }: TickerBarProps) {
  return (
    <div className="h-9 flex items-center border-b border-border-subtle bg-surface-1 overflow-hidden shrink-0">
      {loading ? (
        <div className="flex items-center gap-4 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-40 h-4" />
          ))}
        </div>
      ) : (
        <div className="flex items-center h-full overflow-x-auto no-scrollbar">
          {tickers.map((t) => (
            <TickerItem key={t.symbol} ticker={t} />
          ))}
        </div>
      )}
    </div>
  );
}
