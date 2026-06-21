"use client";

import { Bell, RefreshCw, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { LiveIndicator } from "@/components/ui/LiveIndicator";
import { Tooltip } from "@/components/ui/Tooltip";
import { useDashboard } from "@/context/DashboardContext";
import { formatRelativeTime } from "@/lib/formatters";

interface HeaderProps {
  lastUpdated: number | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ lastUpdated, onRefresh, isRefreshing }: HeaderProps) {
  const { alertsEnabled, toggleAlerts } = useDashboard();
  const [relativeTime, setRelativeTime] = useState<string>("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const update = () => {
      if (lastUpdated) setRelativeTime(formatRelativeTime(lastUpdated));
    };
    update();
    intervalRef.current = setInterval(update, 10_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [lastUpdated]);

  return (
    <header className="h-14 flex items-center gap-4 px-5 border-b border-border-subtle bg-surface-0 shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-sm">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-surface-2 border border-border-subtle hover:border-border transition-colors">
          <Search size={13} className="text-text-muted shrink-0" />
          <input
            type="text"
            placeholder="Search address, tx hash..."
            className="flex-1 bg-transparent text-sm text-text-secondary placeholder:text-text-muted outline-none"
          />
          <kbd className="text-2xs text-text-muted font-mono bg-surface-3 px-1.5 py-0.5 rounded border border-border-subtle">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Last updated */}
        {lastUpdated && (
          <span className="text-xs text-text-muted font-mono hidden sm:block">
            Updated {relativeTime}
          </span>
        )}

        <LiveIndicator />

        {/* Refresh */}
        <Tooltip content="Refresh data">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              "p-2 rounded-lg text-text-secondary",
              "hover:bg-surface-3 hover:text-text-primary",
              "transition-colors duration-150",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Refresh data"
          >
            <RefreshCw size={15} className={cn(isRefreshing && "animate-spin")} />
          </button>
        </Tooltip>

        {/* Alerts */}
        <Tooltip content={alertsEnabled ? "Disable alerts" : "Enable alerts"}>
          <button
            onClick={toggleAlerts}
            className={cn(
              "p-2 rounded-lg transition-colors duration-150",
              alertsEnabled
                ? "text-accent-cyan hover:bg-accent-cyan/10"
                : "text-text-muted hover:bg-surface-3 hover:text-text-secondary"
            )}
            aria-label="Toggle alerts"
          >
            <Bell size={15} />
          </button>
        </Tooltip>
      </div>
    </header>
  );
}
