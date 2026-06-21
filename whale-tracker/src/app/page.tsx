"use client";

import { Activity, ArrowUpRight, DollarSign, Zap } from "lucide-react";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/cards/MetricCard";
import { MarketOverviewCard } from "@/components/cards/MarketOverviewCard";
import { WhaleTransactionTable } from "@/components/tables/WhaleTransactionTable";
import { useWhaleTransactions } from "@/hooks/useWhaleTransactions";
import { useMarketData } from "@/hooks/useMarketData";
import { formatUsd, formatNumber } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/Skeleton";

// Recharts requires DOM APIs — avoid SSR for chart components
const VolumeChart = dynamic(
  () => import("@/components/charts/VolumeChart").then((m) => m.VolumeChart),
  { ssr: false, loading: () => <div className="h-52 flex items-center justify-center"><Skeleton className="w-full h-40 mx-4" /></div> }
);

const NetworkDistributionChart = dynamic(
  () => import("@/components/charts/NetworkDistributionChart").then((m) => m.NetworkDistributionChart),
  { ssr: false, loading: () => <div className="h-40 flex items-center justify-center"><Skeleton className="w-32 h-32 rounded-full" /></div> }
);

export default function DashboardPage() {
  const {
    transactions,
    loadState: txLoadState,
    lastUpdated,
    refetch,
    totalCount,
  } = useWhaleTransactions({ enableLiveUpdates: true });

  const {
    overview,
    loadState: marketLoadState,
  } = useMarketData();

  const isRefreshing = txLoadState === "loading" || marketLoadState === "loading";

  const stats = useMemo(() => {
    if (transactions.length === 0) return null;

    const totalVolume = transactions.reduce((sum, tx) => sum + tx.amountUsd, 0);
    const criticalCount = transactions.filter((tx) => tx.riskLevel === "critical").length;
    const largestTx = transactions.reduce((max, tx) => (tx.amountUsd > max.amountUsd ? tx : max));

    return { totalVolume, criticalCount, largestTx };
  }, [transactions]);

  const txLoading = txLoadState === "loading" && transactions.length === 0;
  const marketLoading = marketLoadState === "loading" && !overview;

  return (
    <DashboardLayout
      lastUpdated={lastUpdated}
      onRefresh={refetch}
      isRefreshing={isRefreshing}
    >
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Live Feed</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Monitoring whale movements &gt;$1M across all major networks
          </p>
        </div>
        <div className="text-xs text-text-muted font-mono">
          {totalCount > 0 && `${formatNumber(totalCount, 0)} total events indexed`}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="24h Volume"
          value={stats ? formatUsd(stats.totalVolume) : "—"}
          change={overview ? 4.2 : undefined}
          changeLabel="vs yesterday"
          icon={DollarSign}
          accentColor="cyan"
          loading={txLoading}
        />
        <MetricCard
          label="Active Whales"
          value={stats ? formatNumber(transactions.length, 0) : "—"}
          subValue="unique addresses"
          icon={Activity}
          accentColor="purple"
          loading={txLoading}
        />
        <MetricCard
          label="Largest Move"
          value={stats ? formatUsd(stats.largestTx.amountUsd) : "—"}
          subValue={stats?.largestTx.network}
          icon={ArrowUpRight}
          accentColor="green"
          loading={txLoading}
        />
        <MetricCard
          label="Critical Alerts"
          value={stats ? String(stats.criticalCount) : "—"}
          subValue="high risk transactions"
          icon={Zap}
          accentColor="red"
          loading={txLoading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 surface-card overflow-hidden">
          <VolumeChart transactions={transactions} />
        </div>
        <div className="surface-card overflow-hidden">
          <NetworkDistributionChart transactions={transactions} />
        </div>
      </div>

      {/* Main content: table + sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-3">
          <WhaleTransactionTable
            transactions={transactions}
            loading={txLoading}
          />
        </div>
        <div className="space-y-4">
          <MarketOverviewCard overview={overview} loading={marketLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
}
