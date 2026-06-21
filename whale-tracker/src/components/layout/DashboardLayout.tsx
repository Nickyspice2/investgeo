"use client";

import { type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TickerBar } from "./TickerBar";
import { useMarketData } from "@/hooks/useMarketData";

interface DashboardLayoutProps {
  children: ReactNode;
  lastUpdated?: number | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardLayout({ children, lastUpdated, onRefresh, isRefreshing }: DashboardLayoutProps) {
  const { tickers, loadState } = useMarketData();

  return (
    <div className="flex h-screen overflow-hidden bg-surface-0">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          lastUpdated={lastUpdated ?? null}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
        <TickerBar tickers={tickers} loading={loadState === "loading" && tickers.length === 0} />

        <main className="flex-1 overflow-y-auto bg-surface-0 bg-grid-pattern bg-grid">
          <div className="p-5 space-y-5">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
