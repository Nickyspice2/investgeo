/** A single resting limit order at a specific price level. */
export interface PriceLevel {
  readonly price: number;
  readonly size: number;
}

/** Raw order book snapshot as emitted by the exchange/mock feed. */
export interface OrderBookSnapshot {
  readonly timestamp: number;
  readonly symbol: string;
  readonly midPrice: number;
  readonly spread: number;
  /** Sorted descending by price (best bid first). */
  readonly bids: PriceLevel[];
  /** Sorted ascending by price (best ask first). */
  readonly asks: PriceLevel[];
}

/** Aggregated volume for one price bucket in a rendered frame. */
export interface HeatmapCell {
  bidVolume: number;
  askVolume: number;
}

/**
 * A single time-slice of the heatmap.
 * Cells are ordered bottom-to-top (cells[0] = priceMin, cells[N-1] = priceMax).
 */
export interface HeatmapFrame {
  readonly timestamp: number;
  readonly midPrice: number;
  readonly priceMin: number;
  readonly priceMax: number;
  readonly cells: HeatmapCell[];
}

/** Drives how the heatmap is bucketed and displayed. */
export interface LiquidityConfig {
  readonly symbol: string;
  /** Visible price range expressed as a fraction of mid price (e.g. 0.02 = ±1%). */
  readonly priceRangePct: number;
  /** Number of vertical price buckets (Y resolution). */
  readonly numBuckets: number;
  /** Rolling time window — maximum number of frames kept in memory. */
  readonly maxFrames: number;
  /** Milliseconds between mock feed ticks. */
  readonly updateIntervalMs: number;
}

export type OrderBookCallback = (snapshot: OrderBookSnapshot) => void;
