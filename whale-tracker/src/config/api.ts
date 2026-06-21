export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "https://api.whale-alert.io/v1",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? "wss://stream.whale-alert.io",
  apiKey: process.env.NEXT_PUBLIC_WHALE_ALERT_KEY ?? "",
  maxRetries: 3,
  retryBackoffMs: 1_000,
  requestTimeoutMs: 8_000,
} as const;

export const ENDPOINTS = {
  transactions: "/transactions",
  transaction: (id: string) => `/transactions/${id}`,
  status: "/status",
} as const;
