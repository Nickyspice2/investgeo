"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MockOrderBookService } from "@/services/orderbookService";
import { snapshotToFrame, computeNormalizationMaxima } from "@/lib/orderbookProcessor";
import type { HeatmapFrame, LiquidityConfig } from "@/types";

const DEFAULT_CONFIG: LiquidityConfig = {
  symbol: "BTC/USDT",
  priceRangePct: 0.04,  // show ±2% of mid price
  numBuckets: 80,
  maxFrames: 120,        // ~2 minutes at 1s ticks
  updateIntervalMs: 1_000,
};

const BTC_INITIAL_PRICE = 65_234;

interface LiquidityDataState {
  frames: HeatmapFrame[];
  currentMidPrice: number;
  maxBid: number;
  maxAsk: number;
  config: LiquidityConfig;
  isLive: boolean;
}

/**
 * Manages a rolling buffer of HeatmapFrames fed by a mock order-book service.
 * Exposes pre-computed normalization maxima so the renderer never needs to
 * scan the frame array itself on every draw call.
 */
export function useLiquidityData(config: LiquidityConfig = DEFAULT_CONFIG): LiquidityDataState {
  const [frames, setFrames] = useState<HeatmapFrame[]>([]);
  const [currentMidPrice, setCurrentMidPrice] = useState(BTC_INITIAL_PRICE);
  const [isLive, setIsLive] = useState(false);

  // Persist the service instance across renders without triggering re-mounts
  const serviceRef = useRef<MockOrderBookService | null>(null);

  useEffect(() => {
    const service = new MockOrderBookService(config, BTC_INITIAL_PRICE);
    serviceRef.current = service;

    const unsubscribe = service.subscribe((snapshot) => {
      const frame = snapshotToFrame(snapshot, config);

      setFrames((prev) => {
        const next = [...prev, frame];
        // Cap the buffer to maxFrames (sliding window)
        return next.length > config.maxFrames ? next.slice(next.length - config.maxFrames) : next;
      });

      setCurrentMidPrice(snapshot.midPrice);
      setIsLive(true);
    });

    service.start();

    return () => {
      unsubscribe();
      service.stop();
      setIsLive(false);
    };
  }, [config]);

  // Recompute normalization maxima only when the frames array reference changes.
  // Memoizing this prevents the canvas renderer from triggering needless work.
  const { maxBid, maxAsk } = useMemo(
    () => computeNormalizationMaxima(frames),
    [frames]
  );

  return { frames, currentMidPrice, maxBid, maxAsk, config, isLive };
}
