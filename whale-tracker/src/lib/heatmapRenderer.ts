import type { HeatmapFrame } from "@/types";

// ---------------------------------------------------------------------------
// Color Lookup Tables (LUTs)
// ---------------------------------------------------------------------------
// Pre-computing 256 RGBA entries at module-load time avoids per-pixel Math
// calls in the hot draw path. Color stops are chosen for a finance aesthetic:
//
//  Bid side (buy pressure) → dark → teal → cyan → near-white
//  Ask side (sell pressure) → dark → deep orange → amber → near-white
//
// At maximum intensity (liquidity wall), both sides converge on bright white
// to create the characteristic "wall" glow effect.
// ---------------------------------------------------------------------------

function lerpChannel(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function buildLUT(
  stops: Array<readonly [number, number, number, number]>
): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(256 * 4);
  const segmentCount = stops.length - 1;

  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    const segIdx = Math.min(Math.floor(t * segmentCount), segmentCount - 1);
    const segT = t * segmentCount - segIdx;

    const [r0, g0, b0, a0] = stops[segIdx];
    const [r1, g1, b1, a1] = stops[segIdx + 1];

    lut[i * 4] = lerpChannel(r0, r1, segT);
    lut[i * 4 + 1] = lerpChannel(g0, g1, segT);
    lut[i * 4 + 2] = lerpChannel(b0, b1, segT);
    lut[i * 4 + 3] = lerpChannel(a0, a1, segT);
  }

  return lut;
}

// [R, G, B, A] color stops from zero intensity → full intensity
export const BID_LUT = buildLUT([
  [8, 11, 16, 0],       // 0%   — transparent background
  [0, 30, 55, 180],     // 20%  — very dark teal
  [0, 100, 160, 230],   // 50%  — mid teal
  [0, 200, 240, 255],   // 80%  — bright cyan
  [220, 248, 255, 255], // 100% — near-white (liquidity wall)
]);

export const ASK_LUT = buildLUT([
  [8, 11, 16, 0],       // 0%   — transparent background
  [60, 15, 0, 180],     // 20%  — very dark amber
  [190, 80, 0, 230],    // 50%  — deep orange
  [255, 170, 20, 255],  // 80%  — bright amber
  [255, 245, 200, 255], // 100% — near-white (liquidity wall)
]);

// ---------------------------------------------------------------------------
// Pixel Rendering Engine
// ---------------------------------------------------------------------------

interface RenderParams {
  frames: HeatmapFrame[];
  maxFrames: number;
  currentMidPrice: number;
  priceRangePct: number;
  maxBid: number;
  maxAsk: number;
}

/**
 * Writes the heatmap directly into a pre-allocated ImageData buffer.
 *
 * Design decisions:
 * - Works at device-pixel resolution via the caller's canvas dimensions.
 * - Frames are laid out left (oldest) → right (newest), with empty columns on
 *   the left until the buffer fills up.
 * - Each frame's price range is re-projected onto the currently visible price
 *   window, so historical frames "drift" vertically as the mid price moves.
 *   This matches the behaviour of professional heatmap tools (e.g. Bookmap).
 * - The bid/ask boundary per frame is its own midPrice, not the global current
 *   mid — so the coloring remains historically accurate.
 */
export function renderHeatmapPixels(
  imageData: ImageData,
  params: RenderParams
): void {
  const { frames, maxFrames, currentMidPrice, priceRangePct, maxBid, maxAsk } = params;
  const { data, width, height } = imageData;

  // Clear to background color
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 8; data[i + 1] = 11; data[i + 2] = 16; data[i + 3] = 255;
  }

  if (frames.length === 0) return;

  const visibleHalf = currentMidPrice * (priceRangePct / 2);
  const visiblePriceMin = currentMidPrice - visibleHalf;
  const visiblePriceRange = visibleHalf * 2;

  const stripWidth = width / maxFrames;

  // Newest frame is always at the right edge; older frames fill leftward
  const frameOffset = maxFrames - frames.length;

  for (let fi = 0; fi < frames.length; fi++) {
    const frame = frames[fi];
    const colIdx = frameOffset + fi;

    const xLeft = Math.floor(colIdx * stripWidth);
    const xRight = Math.min(width, Math.ceil((colIdx + 1) * stripWidth));
    if (xLeft >= xRight) continue;

    const numBuckets = frame.cells.length;
    const framePriceRange = frame.priceMax - frame.priceMin;
    const bucketPriceSize = framePriceRange / numBuckets;

    for (let bi = 0; bi < numBuckets; bi++) {
      const cell = frame.cells[bi];
      const bidVol = cell.bidVolume;
      const askVol = cell.askVolume;
      if (bidVol === 0 && askVol === 0) continue;

      // Absolute price of the center of this bucket in this frame
      const bucketPriceMid = frame.priceMin + (bi + 0.5) * bucketPriceSize;

      // Project onto the current visible price window
      const yFraction = (bucketPriceMid - visiblePriceMin) / visiblePriceRange;
      if (yFraction < 0 || yFraction > 1) continue;

      // Invert Y (canvas Y=0 is top; price increases upward)
      const yCentre = height * (1 - yFraction);
      const halfCellPx = Math.max(1, (bucketPriceSize / visiblePriceRange) * height * 0.5);
      const yTop = Math.max(0, Math.floor(yCentre - halfCellPx));
      const yBot = Math.min(height, Math.ceil(yCentre + halfCellPx));

      // Choose side based on this frame's mid price (historically accurate)
      const isBid = bucketPriceMid <= frame.midPrice;
      let lutIdx: number;
      let lut: Uint8ClampedArray;

      if (isBid) {
        const intensity = Math.min(1, bidVol / maxBid);
        lutIdx = Math.floor(intensity * 255) * 4;
        lut = BID_LUT;
      } else {
        const intensity = Math.min(1, askVol / maxAsk);
        lutIdx = Math.floor(intensity * 255) * 4;
        lut = ASK_LUT;
      }

      const r = lut[lutIdx];
      const g = lut[lutIdx + 1];
      const b = lut[lutIdx + 2];
      const a = lut[lutIdx + 3];

      if (a === 0) continue;

      for (let py = yTop; py < yBot; py++) {
        for (let px = xLeft; px < xRight; px++) {
          const pidx = (py * width + px) * 4;
          data[pidx] = r;
          data[pidx + 1] = g;
          data[pidx + 2] = b;
          data[pidx + 3] = 255;
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Vector Overlays (drawn on top of the ImageData layer)
// ---------------------------------------------------------------------------

/**
 * Renders price axis labels and the mid-price line over the heatmap pixels.
 * Called separately after putImageData so vector text stays crisp.
 */
export function renderOverlays(
  ctx: CanvasRenderingContext2D,
  currentMidPrice: number,
  priceRangePct: number,
  frames: HeatmapFrame[],
  crosshair: { x: number; y: number } | null
): void {
  const { width, height } = ctx.canvas;
  const visibleHalf = currentMidPrice * (priceRangePct / 2);
  const visiblePriceMin = currentMidPrice - visibleHalf;
  const visiblePriceMax = currentMidPrice + visibleHalf;

  const priceToY = (price: number): number =>
    height * (1 - (price - visiblePriceMin) / (visiblePriceMax - visiblePriceMin));

  // --- Mid-price dashed line ---
  const midY = priceToY(currentMidPrice);
  ctx.save();
  ctx.strokeStyle = "rgba(0, 212, 255, 0.7)";
  ctx.lineWidth = 1;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(0, midY);
  ctx.lineTo(width - 72, midY);
  ctx.stroke();
  ctx.restore();

  // --- Price axis labels (right edge) ---
  ctx.save();
  ctx.font = "10px 'JetBrains Mono', 'Fira Code', monospace";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";

  const numLabels = 7;
  for (let i = 0; i <= numLabels; i++) {
    const price = visiblePriceMin + (i / numLabels) * (visiblePriceMax - visiblePriceMin);
    const y = priceToY(price);
    if (y < 8 || y > height - 8) continue;

    // Tick mark
    ctx.strokeStyle = "rgba(48, 54, 61, 0.8)";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(width - 68, y);
    ctx.lineTo(width - 64, y);
    ctx.stroke();

    const isMid = Math.abs(price - currentMidPrice) < (visiblePriceMax - visiblePriceMin) / numLabels / 2;
    ctx.fillStyle = isMid ? "#00D4FF" : "#484F58";
    ctx.fillText(price.toFixed(0), width - 4, y);
  }
  ctx.restore();

  // --- Bid / Ask side labels ---
  ctx.save();
  ctx.font = "bold 9px 'JetBrains Mono', monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(0, 200, 240, 0.5)";
  ctx.fillText("BIDS", 6, midY + 6);
  ctx.fillStyle = "rgba(255, 170, 20, 0.5)";
  ctx.textBaseline = "bottom";
  ctx.fillText("ASKS", 6, midY - 6);
  ctx.restore();

  // --- Crosshair ---
  if (crosshair) {
    const crossPrice =
      visiblePriceMin + (1 - crosshair.y / height) * (visiblePriceMax - visiblePriceMin);

    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    ctx.beginPath();
    ctx.moveTo(crosshair.x, 0);
    ctx.lineTo(crosshair.x, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, crosshair.y);
    ctx.lineTo(width - 72, crosshair.y);
    ctx.stroke();

    // Price label beside crosshair
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(13,17,23,0.9)";
    const labelText = crossPrice.toFixed(1);
    const labelW = labelText.length * 7 + 8;
    ctx.fillRect(width - 68, crosshair.y - 9, labelW, 18);
    ctx.fillStyle = "#E6EDF3";
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(labelText, width - 64, crosshair.y);

    // Time label at bottom of crosshair column
    if (frames.length > 0) {
      const maxFrames = 120;
      const frameIdx = Math.floor((crosshair.x / width) * maxFrames) - (maxFrames - frames.length);
      const frame = frames[Math.max(0, Math.min(frames.length - 1, frameIdx))];
      if (frame) {
        const timeStr = new Date(frame.timestamp).toLocaleTimeString("en-US", {
          hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
        });
        ctx.fillStyle = "rgba(13,17,23,0.9)";
        const tw = timeStr.length * 7 + 8;
        ctx.fillRect(crosshair.x - tw / 2, height - 22, tw, 18);
        ctx.fillStyle = "#8B949E";
        ctx.textAlign = "center";
        ctx.fillText(timeStr, crosshair.x, height - 13);
      }
    }

    ctx.restore();
  }

  // --- Elapsed time axis (bottom) ---
  if (frames.length > 1) {
    ctx.save();
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#484F58";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    const firstTs = frames[0].timestamp;
    const lastTs = frames[frames.length - 1].timestamp;
    const totalMs = lastTs - firstTs;

    const numTimeLabels = 4;
    for (let i = 1; i < numTimeLabels; i++) {
      const ratio = i / numTimeLabels;
      const ts = firstTs + ratio * totalMs;
      const xFrac = ((frames.length - 1) * ratio) / 120;
      const x = Math.floor(xFrac * width + (width / 120) * (120 - frames.length));
      const label = `-${Math.round((lastTs - ts) / 1000)}s`;
      ctx.fillText(label, x, height - 2);
    }

    ctx.restore();
  }
}
