"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchTickers, fetchMarketOverview, fetchNetworkActivity } from "@/services/marketService";
import type { LoadState, MarketOverview, NetworkActivity, Ticker } from "@/types";
import { REFRESH_INTERVALS } from "@/lib/constants";

interface MarketDataState {
  tickers: Ticker[];
  overview: MarketOverview | null;
  networkActivity: NetworkActivity[];
  loadState: LoadState;
  error: string | null;
}

export function useMarketData() {
  const [state, setState] = useState<MarketDataState>({
    tickers: [],
    overview: null,
    networkActivity: [],
    loadState: "idle",
    error: null,
  });

  const fetchAll = useCallback(async () => {
    setState((prev) => ({ ...prev, loadState: "loading", error: null }));
    try {
      const [tickersRes, overviewRes, networkRes] = await Promise.all([
        fetchTickers(),
        fetchMarketOverview(),
        fetchNetworkActivity(),
      ]);

      setState({
        tickers: tickersRes.data,
        overview: overviewRes.data,
        networkActivity: networkRes.data,
        loadState: "success",
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loadState: "error",
        error: err instanceof Error ? err.message : "Market data fetch failed",
      }));
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, REFRESH_INTERVALS.ticker);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { ...state, refetch: fetchAll };
}
