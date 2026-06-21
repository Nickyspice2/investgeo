"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { NetworkSymbol, RiskLevel, TransactionType } from "@/types";

interface FilterState {
  networks: NetworkSymbol[];
  minAmountUsd: number;
  riskLevels: RiskLevel[];
  types: TransactionType[];
}

interface DashboardContextValue {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  resetFilters: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  alertsEnabled: boolean;
  toggleAlerts: () => void;
}

const DEFAULT_FILTERS: FilterState = {
  networks: [],
  minAmountUsd: 1_000_000,
  riskLevels: [],
  types: [],
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);
  const toggleSidebar = useCallback(() => setSidebarCollapsed((prev) => !prev), []);
  const toggleAlerts = useCallback(() => setAlertsEnabled((prev) => !prev), []);

  const value = useMemo(
    () => ({ filters, setFilters, resetFilters, sidebarCollapsed, toggleSidebar, alertsEnabled, toggleAlerts }),
    [filters, resetFilters, sidebarCollapsed, toggleSidebar, alertsEnabled, toggleAlerts]
  );

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside <DashboardProvider>");
  return ctx;
}
