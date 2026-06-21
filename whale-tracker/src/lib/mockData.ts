import type {
  WhaleTransaction,
  Ticker,
  MarketOverview,
  NetworkActivity,
  NetworkSymbol,
  TransactionType,
  RiskLevel,
} from "@/types";

const EXCHANGE_LABELS = ["Binance", "Coinbase", "Kraken", "OKX", "Bybit", null, null, null];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateWallet(isExchange = false) {
  const hash = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  const label = isExchange ? randomItem(EXCHANGE_LABELS.slice(0, 5)) : randomItem(EXCHANGE_LABELS);
  return { hash, label, isExchange, isCEX: isExchange && label !== null };
}

export function generateWhaleTransaction(overrides: Partial<WhaleTransaction> = {}): WhaleTransaction {
  const networks: NetworkSymbol[] = ["BTC", "ETH", "SOL", "BNB", "USDT", "USDC", "XRP"];
  const types: TransactionType[] = ["transfer", "exchange_deposit", "exchange_withdrawal", "mint", "burn"];
  const riskLevels: RiskLevel[] = ["low", "low", "medium", "medium", "high", "critical"];

  const amountUsd = randomBetween(500_000, 200_000_000);
  const network = randomItem(networks);
  const nativePrices: Record<string, number> = {
    BTC: 65_000, ETH: 3_800, SOL: 140, BNB: 580, USDT: 1, USDC: 1, XRP: 0.55,
  };

  return {
    id: crypto.randomUUID(),
    hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
    timestamp: Date.now() - Math.floor(randomBetween(0, 3_600_000)),
    network,
    type: randomItem(types),
    from: generateWallet(Math.random() > 0.6),
    to: generateWallet(Math.random() > 0.6),
    amountNative: amountUsd / (nativePrices[network] ?? 1),
    amountUsd,
    fee: randomBetween(0.5, 200),
    riskLevel: randomItem(riskLevels),
    blockNumber: Math.floor(randomBetween(18_000_000, 22_000_000)),
    isConfirmed: Math.random() > 0.05,
    ...overrides,
  };
}

export function generateTransactionBatch(count: number): WhaleTransaction[] {
  return Array.from({ length: count }, () => generateWhaleTransaction())
    .sort((a, b) => b.timestamp - a.timestamp);
}

export const MOCK_TICKERS: Ticker[] = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 65_234.18,
    priceChange24h: 1_823.4,
    priceChangePercent24h: 2.87,
    volume24h: 38_400_000_000,
    marketCap: 1_278_000_000_000,
    high24h: 66_100,
    low24h: 63_200,
    trend: "up",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 3_812.55,
    priceChange24h: -45.3,
    priceChangePercent24h: -1.18,
    volume24h: 14_200_000_000,
    marketCap: 457_000_000_000,
    high24h: 3_890,
    low24h: 3_760,
    trend: "down",
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 142.88,
    priceChange24h: 8.42,
    priceChangePercent24h: 6.27,
    volume24h: 4_800_000_000,
    marketCap: 65_000_000_000,
    high24h: 148,
    low24h: 133,
    trend: "up",
  },
  {
    symbol: "BNB",
    name: "BNB",
    price: 582.4,
    priceChange24h: -3.2,
    priceChangePercent24h: -0.55,
    volume24h: 2_100_000_000,
    marketCap: 84_000_000_000,
    high24h: 591,
    low24h: 575,
    trend: "neutral",
  },
];

export const MOCK_MARKET_OVERVIEW: MarketOverview = {
  totalMarketCap: 2_480_000_000_000,
  totalVolume24h: 94_300_000_000,
  btcDominance: 51.5,
  fearGreedIndex: 72,
  fearGreedLabel: "Greed",
  activeCoins: 14_280,
};

export const MOCK_NETWORK_ACTIVITY: NetworkActivity[] = [
  { network: "Ethereum", transactionCount: 1_240_000, volume: 32_400_000_000, averageFee: 4.2, congestionLevel: "medium" },
  { network: "Bitcoin", transactionCount: 380_000, volume: 18_900_000_000, averageFee: 8.1, congestionLevel: "low" },
  { network: "Solana", transactionCount: 48_000_000, volume: 9_200_000_000, averageFee: 0.001, congestionLevel: "low" },
  { network: "BNB Chain", transactionCount: 4_800_000, volume: 6_400_000_000, averageFee: 0.25, congestionLevel: "high" },
];
