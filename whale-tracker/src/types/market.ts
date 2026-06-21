export type TrendDirection = "up" | "down" | "neutral";

export interface Ticker {
  readonly symbol: string;
  readonly name: string;
  readonly price: number;
  readonly priceChange24h: number;
  readonly priceChangePercent24h: number;
  readonly volume24h: number;
  readonly marketCap: number;
  readonly high24h: number;
  readonly low24h: number;
  readonly trend: TrendDirection;
}

export interface OHLCVCandle {
  readonly timestamp: number;
  readonly open: number;
  readonly high: number;
  readonly low: number;
  readonly close: number;
  readonly volume: number;
}

export interface MarketOverview {
  readonly totalMarketCap: number;
  readonly totalVolume24h: number;
  readonly btcDominance: number;
  readonly fearGreedIndex: number;
  readonly fearGreedLabel: "Extreme Fear" | "Fear" | "Neutral" | "Greed" | "Extreme Greed";
  readonly activeCoins: number;
}

export interface NetworkActivity {
  readonly network: string;
  readonly transactionCount: number;
  readonly volume: number;
  readonly averageFee: number;
  readonly congestionLevel: "low" | "medium" | "high";
}
