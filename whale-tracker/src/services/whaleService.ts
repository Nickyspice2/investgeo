import { API_CONFIG, ENDPOINTS } from "@/config/api";
import type { ApiResponse, Paginated, WhaleTransaction, TransactionFilters } from "@/types";
import { generateTransactionBatch } from "@/lib/mockData";
import { MOCK_DELAY_MS, WHALE_THRESHOLD_USD } from "@/lib/constants";

interface FetchTransactionsParams {
  page?: number;
  pageSize?: number;
  filters?: Partial<TransactionFilters>;
}

/**
 * Simulates network latency for mock data during development.
 * Replaced by real fetch in production.
 */
async function simulateDelay(): Promise<void> {
  await new Promise((r) => setTimeout(r, MOCK_DELAY_MS + Math.random() * 200));
}

export async function fetchWhaleTransactions(
  params: FetchTransactionsParams = {}
): Promise<ApiResponse<Paginated<WhaleTransaction>>> {
  const { page = 1, pageSize = 25 } = params;

  // In production: replace with authenticated fetch to API_CONFIG.baseUrl
  if (process.env.NEXT_PUBLIC_API_URL && API_CONFIG.apiKey) {
    const url = new URL(`${API_CONFIG.baseUrl}${ENDPOINTS.transactions}`);
    url.searchParams.set("min_value", String(WHALE_THRESHOLD_USD));
    url.searchParams.set("limit", String(pageSize));
    url.searchParams.set("start", String(Math.floor((Date.now() - 86_400_000) / 1000)));

    const response = await fetch(url.toString(), {
      headers: { "X-WA-API-KEY": API_CONFIG.apiKey },
      signal: AbortSignal.timeout(API_CONFIG.requestTimeoutMs),
    });

    if (!response.ok) throw new Error(`Whale Alert API error: ${response.status}`);
    return response.json();
  }

  await simulateDelay();

  const allItems = generateTransactionBatch(200);
  const start = (page - 1) * pageSize;
  const items = allItems.slice(start, start + pageSize);

  return {
    data: {
      items,
      total: 200,
      page,
      pageSize,
      hasMore: start + pageSize < 200,
    },
    timestamp: Date.now(),
    status: "ok",
  };
}

export async function fetchTransactionById(id: string): Promise<ApiResponse<WhaleTransaction | null>> {
  await simulateDelay();

  const [tx] = generateTransactionBatch(1);
  return { data: { ...tx, id }, timestamp: Date.now(), status: "ok" };
}
