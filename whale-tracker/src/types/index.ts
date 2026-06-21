export type * from "./transaction";
export type * from "./market";
export type * from "./orderbook";

export type SortDirection = "asc" | "desc";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  data: T;
  timestamp: number;
  status: "ok" | "error";
  error?: string;
}

export interface WebSocketMessage<T = unknown> {
  event: string;
  channel: string;
  data: T;
  timestamp: number;
}

export type LoadState = "idle" | "loading" | "success" | "error";
