import type { LiquidityConfig, OrderBookCallback, OrderBookSnapshot, PriceLevel } from "@/types";

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

interface LiquidityWall {
  price: number;
  bidSize: number;
  askSize: number;
  /** Fraction decayed per tick (e.g. 0.97 = 3% per tick). */
  decayRate: number;
}

/**
 * Simulates a realistic level-2 order book with:
 * - Geometric Brownian Motion price drift
 * - Exponentially decaying base liquidity around the spread
 * - Persistent "liquidity walls" at psychological price levels that decay over time
 * - Random new wall events to simulate large resting orders appearing
 */
export class MockOrderBookService {
  private midPrice: number;
  private readonly config: LiquidityConfig;
  private walls: LiquidityWall[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly subscribers = new Set<OrderBookCallback>();

  constructor(config: LiquidityConfig, initialPrice: number) {
    this.config = config;
    this.midPrice = initialPrice;
    this.walls = this.seedInitialWalls();
  }

  subscribe(cb: OrderBookCallback): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  start(): void {
    if (this.intervalId !== null) return;
    // Emit an initial snapshot immediately so the UI isn't blank on mount
    this.emit();
    this.intervalId = setInterval(() => this.tick(), this.config.updateIntervalMs);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick(): void {
    this.driftPrice();
    this.decayWalls();
    this.maybeSpawnWall();
    this.emit();
  }

  /** Geometric random walk — realistic log-normal price motion. */
  private driftPrice(): void {
    const volatility = 0.00015;
    const drift = (Math.random() - 0.5) * volatility;
    this.midPrice *= 1 + drift;
  }

  /** Reduce all wall sizes each tick; remove walls that are negligibly small. */
  private decayWalls(): void {
    this.walls = this.walls.filter((w) => {
      w.bidSize *= w.decayRate;
      w.askSize *= w.decayRate;
      return w.bidSize > 5 || w.askSize > 5;
    });
  }

  /**
   * 8% chance per tick of a new large resting order appearing.
   * Walls cluster slightly below/above the mid to simulate iceberg orders
   * and institutional support/resistance.
   */
  private maybeSpawnWall(): void {
    if (Math.random() > 0.08) return;

    const side = Math.random() < 0.5 ? "bid" : "ask";
    // Walls tend to cluster at distances of 0.1% to 2% from mid
    const distancePct = rand(0.001, 0.02);
    const sign = side === "bid" ? -1 : 1;
    const wallPrice = this.midPrice * (1 + sign * distancePct);

    this.walls.push({
      price: wallPrice,
      bidSize: side === "bid" ? rand(400, 2_000) : 0,
      askSize: side === "ask" ? rand(400, 2_000) : 0,
      decayRate: rand(0.93, 0.99),
    });
  }

  /**
   * Generates walls at round-number psychological levels (every 0.5% of price).
   * These are pre-seeded on construction and will decay naturally.
   */
  private seedInitialWalls(): LiquidityWall[] {
    const walls: LiquidityWall[] = [];
    const levels = 14;

    for (let i = 1; i <= levels; i++) {
      const offset = i * 0.005;

      walls.push({
        price: this.midPrice * (1 - offset),
        bidSize: rand(200, 1_200),
        askSize: 0,
        decayRate: rand(0.97, 0.995),
      });

      walls.push({
        price: this.midPrice * (1 + offset),
        bidSize: 0,
        askSize: rand(200, 1_200),
        decayRate: rand(0.97, 0.995),
      });
    }

    return walls;
  }

  private buildSnapshot(): OrderBookSnapshot {
    const spread = this.midPrice * 0.0002;
    const bestBid = this.midPrice - spread / 2;
    const bestAsk = this.midPrice + spread / 2;
    const tickSize = this.midPrice * 0.0001;
    const numLevels = 60;

    const bids: PriceLevel[] = [];
    const asks: PriceLevel[] = [];

    for (let i = 0; i < numLevels; i++) {
      const bidPrice = bestBid - i * tickSize;
      const askPrice = bestAsk + i * tickSize;

      // Base liquidity decays exponentially with distance from the spread
      const decay = Math.exp(-i * 0.055);
      let bidSize = decay * rand(8, 45);
      let askSize = decay * rand(8, 45);

      // Accumulate wall contributions within ±2 ticks of each level
      const priceWindow = tickSize * 2;
      for (const wall of this.walls) {
        if (wall.bidSize > 0 && Math.abs(wall.price - bidPrice) < priceWindow) {
          bidSize += wall.bidSize * (1 - Math.abs(wall.price - bidPrice) / priceWindow);
        }
        if (wall.askSize > 0 && Math.abs(wall.price - askPrice) < priceWindow) {
          askSize += wall.askSize * (1 - Math.abs(wall.price - askPrice) / priceWindow);
        }
      }

      bids.push({ price: bidPrice, size: bidSize });
      asks.push({ price: askPrice, size: askSize });
    }

    return {
      timestamp: Date.now(),
      symbol: this.config.symbol,
      midPrice: this.midPrice,
      spread,
      bids: bids.sort((a, b) => b.price - a.price),
      asks: asks.sort((a, b) => a.price - b.price),
    };
  }

  private emit(): void {
    const snapshot = this.buildSnapshot();
    this.subscribers.forEach((cb) => cb(snapshot));
  }
}
