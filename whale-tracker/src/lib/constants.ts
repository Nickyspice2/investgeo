import type { NetworkSymbol, RiskLevel } from "@/types";

export const WHALE_THRESHOLD_USD = 1_000_000;

export const NETWORK_COLORS: Record<NetworkSymbol, string> = {
  BTC: "#F7931A",
  ETH: "#627EEA",
  SOL: "#9945FF",
  BNB: "#F0B90B",
  USDT: "#26A17B",
  USDC: "#2775CA",
  XRP: "#00AAE4",
  ADA: "#0033AD",
};

export const NETWORK_LABELS: Record<NetworkSymbol, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  SOL: "Solana",
  BNB: "BNB Chain",
  USDT: "Tether",
  USDC: "USD Coin",
  XRP: "Ripple",
  ADA: "Cardano",
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  low: "#00E676",
  medium: "#FFB020",
  high: "#FF3D57",
  critical: "#FF1744",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const REFRESH_INTERVALS = {
  ticker: 5_000,
  transactions: 10_000,
  marketOverview: 30_000,
  networkActivity: 15_000,
} as const;

export const MOCK_DELAY_MS = 400;
