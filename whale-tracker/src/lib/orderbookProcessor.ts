import type { HeatmapCell, HeatmapFrame, LiquidityConfig, OrderBookSnapshot } from "@/types";

/**
 * Converts a raw order book snapshot into a HeatmapFrame by bucketing all
 * resting limit orders into a fixed price grid centered on the snapshot's midPrice.
 *
 * Bucket index 0 = lowest price, index (numBuckets-1) = highest price.
 * Orders outside the visible range are silently discarded.
 */
export function snapshotToFrame(
  snapshot: OrderBookSnapshot,
  config: LiquidityConfig
): HeatmapFrame {
  const { numBuckets, priceRangePct } = config;
  const half = snapshot.midPrice * (priceRangePct / 2);
  const priceMin = snapshot.midPrice - half;
  const priceMax = snapshot.midPrice + half;
  const bucketSize = (priceMax - priceMin) / numBuckets;

  const cells: HeatmapCell[] = Array.from({ length: numBuckets }, () => ({
    bidVolume: 0,
    askVolume: 0,
  }));

  for (const level of snapshot.bids) {
    const idx = Math.floor((level.price - priceMin) / bucketSize);
    if (idx >= 0 && idx < numBuckets) {
      cells[idx].bidVolume += level.size;
    }
  }

  for (const level of snapshot.asks) {
    const idx = Math.floor((level.price - priceMin) / bucketSize);
    if (idx >= 0 && idx < numBuckets) {
      cells[idx].askVolume += level.size;
    }
  }

  return {
    timestamp: snapshot.timestamp,
    midPrice: snapshot.midPrice,
    priceMin,
    priceMax,
    cells,
  };
}

/**
 * Scans all frames and computes the 95th-percentile volume on each side.
 * Using a percentile rather than the raw max prevents a single outlier order
 * from collapsing the entire color scale and hiding normal liquidity.
 */
export function computeNormalizationMaxima(frames: HeatmapFrame[]): {
  maxBid: number;
  maxAsk: number;
} {
  const bidVols: number[] = [];
  const askVols: number[] = [];

  for (const frame of frames) {
    for (const cell of frame.cells) {
      if (cell.bidVolume > 0) bidVols.push(cell.bidVolume);
      if (cell.askVolume > 0) askVols.push(cell.askVolume);
    }
  }

  const percentile95 = (arr: number[]): number => {
    if (arr.length === 0) return 1;
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length * 0.95)] ?? sorted[sorted.length - 1];
  };

  return {
    maxBid: Math.max(1, percentile95(bidVols)),
    maxAsk: Math.max(1, percentile95(askVols)),
  };
}
