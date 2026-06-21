/**
 * Formats a USD value with dynamic precision based on magnitude.
 * Sub-thousand values show 2 decimal places; above that uses compact notation.
 */
export function formatUsd(value: number, compact = true): string {
  if (compact && value >= 1_000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercent(value: number, decimals = 2): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatCrypto(value: number, symbol: string): string {
  const decimals = value < 0.01 ? 6 : value < 1 ? 4 : 2;
  return `${formatNumber(value, decimals)} ${symbol}`;
}

/**
 * Truncates a wallet hash for display, preserving start and end.
 * e.g. 0xAB...1234
 */
export function truncateHash(hash: string, startChars = 6, endChars = 4): string {
  if (hash.length <= startChars + endChars + 3) return hash;
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}
