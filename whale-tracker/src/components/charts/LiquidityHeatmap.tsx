"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { formatUsd } from "@/lib/formatters";
import { renderHeatmapPixels, renderOverlays } from "@/lib/heatmapRenderer";
import { useLiquidityData } from "@/hooks/useLiquidityData";
import { LiveIndicator } from "@/components/ui/LiveIndicator";
import { Skeleton } from "@/components/ui/Skeleton";

const CANVAS_HEIGHT = 340;

interface CrosshairPos {
  x: number;
  y: number;
}

interface LiquidityHeatmapProps {
  className?: string;
}

export function LiquidityHeatmap({ className }: LiquidityHeatmapProps) {
  const { frames, currentMidPrice, maxBid, maxAsk, config, isLive } = useLiquidityData();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(0);

  // Mutable refs that the RAF closure reads without needing to restart the loop
  const framesRef = useRef(frames);
  const maxBidRef = useRef(maxBid);
  const maxAskRef = useRef(maxAsk);
  const midPriceRef = useRef(currentMidPrice);
  const crosshairRef = useRef<CrosshairPos | null>(null);
  const needsRedrawRef = useRef(false);

  // Sync all render-critical values into their refs inside an effect,
  // which is the correct place to mutate refs (outside of render).
  useEffect(() => {
    framesRef.current = frames;
    maxBidRef.current = maxBid;
    maxAskRef.current = maxAsk;
    midPriceRef.current = currentMidPrice;
    needsRedrawRef.current = true;
  }, [frames, maxBid, maxAsk, currentMidPrice]);

  // Responsive canvas sizing via ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const width = Math.floor(entries[0].contentRect.width);
      if (width > 0) setCanvasWidth(width);
    });

    observer.observe(container);
    const initial = Math.floor(container.clientWidth);
    if (initial > 0) setCanvasWidth(initial);

    return () => observer.disconnect();
  }, []);

  // draw is defined before the RAF effect so it can be listed as a dependency
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const { width, height } = ctx.canvas;
      const currentFrames = framesRef.current;

      const imageData = ctx.createImageData(width, height);
      renderHeatmapPixels(imageData, {
        frames: currentFrames,
        maxFrames: config.maxFrames,
        currentMidPrice: midPriceRef.current,
        priceRangePct: config.priceRangePct,
        maxBid: maxBidRef.current,
        maxAsk: maxAskRef.current,
      });
      ctx.putImageData(imageData, 0, 0);

      renderOverlays(
        ctx,
        midPriceRef.current,
        config.priceRangePct,
        currentFrames,
        crosshairRef.current
      );
    },
    [config]
  );

  // RAF loop — repaints only when `needsRedrawRef` is set, keeping CPU idle otherwise
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasWidth === 0) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    if (!ctx) return;

    let rafId: number;

    const loop = () => {
      if (needsRedrawRef.current) {
        needsRedrawRef.current = false;
        draw(ctx);
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [canvasWidth, draw]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    crosshairRef.current = {
      x: Math.floor(e.clientX - rect.left),
      y: Math.floor(e.clientY - rect.top),
    };
    needsRedrawRef.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    crosshairRef.current = null;
    needsRedrawRef.current = true;
  }, []);

  const priceMin = currentMidPrice * (1 - config.priceRangePct / 2);
  const priceMax = currentMidPrice * (1 + config.priceRangePct / 2);
  const isWaiting = frames.length === 0;

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-md font-semibold text-text-primary">Liquidity Heatmap</h2>
          <span className="text-xs text-text-muted font-mono">{config.symbol}</span>
        </div>
        <div className="flex items-center gap-3">
          <PriceRangeLabel priceMin={priceMin} priceMax={priceMax} />
          <LiveIndicator active={isLive} />
        </div>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        className="relative w-full bg-surface-0"
        style={{ height: CANVAS_HEIGHT }}
      >
        {isWaiting ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-none" />
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={CANVAS_HEIGHT}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="block cursor-crosshair"
            style={{ width: "100%", height: CANVAS_HEIGHT }}
          />
        )}
      </div>

      {/* Footer: legend + live stats */}
      <div className="flex items-center justify-between px-5 py-2.5 border-t border-border-subtle shrink-0">
        <div className="flex items-center gap-5">
          <LegendEntry side="bid" label="Bid / Buy Pressure" />
          <LegendEntry side="ask" label="Ask / Sell Pressure" />
        </div>
        <div className="flex items-center gap-4 text-xs text-text-muted font-mono">
          <span>
            Mid <span className="text-accent-cyan font-semibold">{formatUsd(currentMidPrice, false)}</span>
          </span>
          <span>{frames.length}/{config.maxFrames} frames</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PriceRangeLabel({ priceMin, priceMax }: { priceMin: number; priceMax: number }) {
  return (
    <span className="text-2xs text-text-muted font-mono hidden sm:inline-block">
      {formatUsd(priceMin, false)} – {formatUsd(priceMax, false)}
    </span>
  );
}

function LegendEntry({ side, label }: { side: "bid" | "ask"; label: string }) {
  const gradient =
    side === "bid"
      ? "linear-gradient(to right, rgba(0,30,55,0.6), rgba(0,100,160,1), rgba(0,200,240,1), rgba(220,248,255,1))"
      : "linear-gradient(to right, rgba(60,15,0,0.6), rgba(190,80,0,1), rgba(255,170,20,1), rgba(255,245,200,1))";

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2.5 rounded-sm" style={{ background: gradient }} />
      <span className="text-2xs text-text-muted font-mono">{label}</span>
    </div>
  );
}
