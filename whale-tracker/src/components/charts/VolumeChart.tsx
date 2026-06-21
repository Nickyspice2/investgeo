"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { formatUsd } from "@/lib/formatters";
import type { WhaleTransaction } from "@/types";

interface VolumeChartProps {
  transactions: WhaleTransaction[];
  className?: string;
}

interface VolumePoint {
  label: string;
  volume: number;
  count: number;
}

/**
 * Buckets the last 24h of transactions into 24 hourly volume points.
 */
function buildHourlyVolume(transactions: WhaleTransaction[]): VolumePoint[] {
  const now = Date.now();
  const buckets = Array.from({ length: 24 }, (_, i) => ({
    hour: now - (23 - i) * 3_600_000,
    volume: 0,
    count: 0,
  }));

  for (const tx of transactions) {
    const bucketIndex = buckets.findIndex(
      (b, i) => tx.timestamp >= b.hour && (i === 23 || tx.timestamp < buckets[i + 1].hour)
    );
    if (bucketIndex >= 0) {
      buckets[bucketIndex].volume += tx.amountUsd;
      buckets[bucketIndex].count += 1;
    }
  }

  return buckets.map((b) => ({
    label: new Date(b.hour).toLocaleTimeString("en-US", { hour: "numeric", hour12: false }),
    volume: b.volume,
    count: b.count,
  }));
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: VolumePoint }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const { volume, count } = payload[0].payload;

  return (
    <div className="bg-surface-3 border border-border rounded-lg px-3 py-2 shadow-card text-xs">
      <p className="text-text-muted mb-1 font-mono">{label}:00</p>
      <p className="text-text-primary font-bold font-mono">{formatUsd(volume)}</p>
      <p className="text-text-secondary font-mono">{count} txns</p>
    </div>
  );
}

export function VolumeChart({ transactions, className }: VolumeChartProps) {
  const data = useMemo(() => buildHourlyVolume(transactions), [transactions]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle">
        <h2 className="text-md font-semibold text-text-primary">Hourly Volume (24h)</h2>
        <span className="text-xs text-text-muted font-mono">USD</span>
      </div>

      <div className="px-2 pt-4 pb-2 h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262D" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#484F58", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              interval={5}
            />
            <YAxis
              tick={{ fill: "#484F58", fontSize: 10, fontFamily: "JetBrains Mono, monospace" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatUsd(v as number, true)}
              width={64}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#30363D", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#00D4FF"
              strokeWidth={1.5}
              fill="url(#volumeGradient)"
              activeDot={{ r: 3, fill: "#00D4FF", stroke: "#0D1117", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
