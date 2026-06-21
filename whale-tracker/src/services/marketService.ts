import type { ApiResponse, MarketOverview, NetworkActivity, Ticker } from "@/types";
import { MOCK_MARKET_OVERVIEW, MOCK_NETWORK_ACTIVITY, MOCK_TICKERS } from "@/lib/mockData";
import { MOCK_DELAY_MS } from "@/lib/constants";

async function simulateDelay(): Promise<void> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
}

/** Applies minor random drift to prices to simulate live data. */
function applyPriceDrift(ticker: Ticker): Ticker {
  const drift = (Math.random() - 0.48) * 0.002;
  const newPrice = ticker.price * (1 + drift);
  const delta = newPrice - ticker.price;

  return {
    ...ticker,
    price: newPrice,
    priceChange24h: ticker.priceChange24h + delta,
    trend: delta > 0 ? "up" : delta < -0.01 ? "down" : "neutral",
  };
}

export async function fetchTickers(): Promise<ApiResponse<Ticker[]>> {
  await simulateDelay();

  return {
    data: MOCK_TICKERS.map(applyPriceDrift),
    timestamp: Date.now(),
    status: "ok",
  };
}

export async function fetchMarketOverview(): Promise<ApiResponse<MarketOverview>> {
  await simulateDelay();

  return {
    data: {
      ...MOCK_MARKET_OVERVIEW,
      totalVolume24h: MOCK_MARKET_OVERVIEW.totalVolume24h * (1 + (Math.random() - 0.5) * 0.05),
    },
    timestamp: Date.now(),
    status: "ok",
  };
}

export async function fetchNetworkActivity(): Promise<ApiResponse<NetworkActivity[]>> {
  await simulateDelay();

  return {
    data: MOCK_NETWORK_ACTIVITY.map((n) => ({
      ...n,
      transactionCount: Math.floor(n.transactionCount * (1 + (Math.random() - 0.5) * 0.02)),
    })),
    timestamp: Date.now(),
    status: "ok",
  };
}
