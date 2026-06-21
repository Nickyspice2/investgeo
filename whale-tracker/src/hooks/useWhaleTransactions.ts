"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import { fetchWhaleTransactions } from "@/services/whaleService";
import { whaleWsClient } from "@/services/webSocketService";
import type { LoadState, TransactionFilters, WhaleTransaction } from "@/types";
import { REFRESH_INTERVALS } from "@/lib/constants";

interface TransactionState {
  transactions: WhaleTransaction[];
  loadState: LoadState;
  error: string | null;
  lastUpdated: number | null;
  totalCount: number;
}

type TransactionAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: { items: WhaleTransaction[]; total: number } }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "PREPEND"; payload: WhaleTransaction[] };

const MAX_BUFFERED_TRANSACTIONS = 500;

function transactionReducer(state: TransactionState, action: TransactionAction): TransactionState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loadState: "loading", error: null };

    case "FETCH_SUCCESS":
      return {
        ...state,
        loadState: "success",
        transactions: action.payload.items,
        totalCount: action.payload.total,
        lastUpdated: Date.now(),
        error: null,
      };

    case "FETCH_ERROR":
      return { ...state, loadState: "error", error: action.payload };

    case "PREPEND":
      // Merge new real-time transactions, deduplicate by id, cap buffer
      return {
        ...state,
        transactions: [
          ...action.payload,
          ...state.transactions.filter((t) => !action.payload.some((n) => n.id === t.id)),
        ].slice(0, MAX_BUFFERED_TRANSACTIONS),
        lastUpdated: Date.now(),
      };

    default:
      return state;
  }
}

const initialState: TransactionState = {
  transactions: [],
  loadState: "idle",
  error: null,
  lastUpdated: null,
  totalCount: 0,
};

interface UseWhaleTransactionsOptions {
  filters?: Partial<TransactionFilters>;
  enableLiveUpdates?: boolean;
}

export function useWhaleTransactions(options: UseWhaleTransactionsOptions = {}) {
  const { filters, enableLiveUpdates = true } = options;
  const [state, dispatch] = useReducer(transactionReducer, initialState);
  const pendingRef = useRef<WhaleTransaction[]>([]);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const response = await fetchWhaleTransactions({ filters });
      dispatch({
        type: "FETCH_SUCCESS",
        payload: { items: response.data.items, total: response.data.total },
      });
    } catch (err) {
      dispatch({ type: "FETCH_ERROR", payload: err instanceof Error ? err.message : "Fetch failed" });
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVALS.transactions);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    if (!enableLiveUpdates) return;

    whaleWsClient.connectMock();

    const subscription = whaleWsClient.subscribeToTransactions((message) => {
      pendingRef.current.push(message.data);

      // Batch flush every 2s to avoid per-message re-renders
      if (!flushTimerRef.current) {
        flushTimerRef.current = setTimeout(() => {
          if (pendingRef.current.length > 0) {
            dispatch({ type: "PREPEND", payload: [...pendingRef.current] });
            pendingRef.current = [];
          }
          flushTimerRef.current = null;
        }, 2_000);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    };
  }, [enableLiveUpdates]);

  return { ...state, refetch: fetchData };
}
