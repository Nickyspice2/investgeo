export type TransactionType = "transfer" | "exchange_deposit" | "exchange_withdrawal" | "mint" | "burn";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type NetworkSymbol = "BTC" | "ETH" | "SOL" | "BNB" | "USDT" | "USDC" | "XRP" | "ADA";

export interface WalletAddress {
  readonly hash: string;
  label: string | null;
  isExchange: boolean;
  isCEX: boolean;
}

export interface WhaleTransaction {
  readonly id: string;
  readonly hash: string;
  readonly timestamp: number;
  readonly network: NetworkSymbol;
  readonly type: TransactionType;
  readonly from: WalletAddress;
  readonly to: WalletAddress;
  readonly amountNative: number;
  readonly amountUsd: number;
  readonly fee: number;
  readonly riskLevel: RiskLevel;
  readonly blockNumber: number;
  readonly isConfirmed: boolean;
}

export interface TransactionFilters {
  networks: NetworkSymbol[];
  minAmountUsd: number;
  maxAmountUsd: number | null;
  riskLevels: RiskLevel[];
  types: TransactionType[];
  dateRange: [number, number] | null;
}

export interface TransactionStats {
  totalVolume24h: number;
  totalCount24h: number;
  largestTransaction: WhaleTransaction | null;
  averageSize: number;
  volumeChange24h: number;
}
