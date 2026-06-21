"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useMemo } from "react";
import { formatUsd, formatPercent } from "@/lib/formatters";
import { NETWORK_COLORS, NETWORK_LABELS } from "@/lib/constants";
import type { WhaleTransaction, NetworkSymbol } from "@/types";

interface NetworkDistributionChartProps {
  transactions: WhaleTransaction[];
}

interface NetworkSlice {
  name: string;
  symbol: NetworkSymbol;
  volume: number;
  count: number;
  color: string;
}

function buildNetworkSlices(transactions: WhaleTransaction[]): NetworkSlice[] {
  const totals = new Map<NetworkSymbol, { volume: number; count: number }>();

  for (const tx of transactions) {
    const existing = totals.get(tx.network) ?? { volume: 0, count: 0 };
    totals.set(tx.network, { volume: existing.volume + tx.amountUsd, count: existing.count + 1 });
  }

  return Array.from(totals.entries())
    .map(([symbol, { volume, count }]) => ({
      name: NETWORK_LABELS[symbol] ?? symbol,
      symbol,
      volume,
      count,
      color: NETWORK_COLORS[symbol] ?? "#8B949E",
    }))
    .sort((a, b) => b.volume - a.volume);
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: NetworkSlice }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const { name, volume, count, color } = payload[0].payload;

  return (
    <div className="bg-surface-3 border border-border rounded-lg px-3 py-2 shadow-card text-xs">
      <p className="font-semibold mb-1" style={{ color }}>{name}</p>
      <p className="text-text-primary font-mono">{formatUsd(volume)}</p>
      <p className="text-text-secondary font-mono">{count} transactions</p>
    </div>
  );
}

export function NetworkDistributionChart({ transactions }: NetworkDistributionChartProps) {
  const slices = useMemo(() => buildNetworkSlices(transactions), [transactions]);
  const totalVolume = slices.reduce((sum, s) => sum + s.volume, 0);

  return (
    <div>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle">
        <h2 className="text-md font-semibold text-text-primary">Network Distribution</h2>
      </div>

      <div className="flex items-center gap-6 px-5 py-4">
        <div className="w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={slices}
                dataKey="volume"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {slices.map((slice) => (
                  <Cell key={slice.symbol} fill={slice.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-2">
          {slices.slice(0, 5).map((slice) => (
            <div key={slice.symbol} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                <span className="text-xs text-text-secondary truncate">{slice.name}</span>
              </div>
              <span className="text-xs font-mono text-text-muted shrink-0">
                {formatPercent((slice.volume / totalVolume) * 100, 1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
