"use client";

import { ArrowRight, ArrowUpDown, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { formatRelativeTime, formatUsd, truncateHash } from "@/lib/formatters";
import { NETWORK_COLORS } from "@/lib/constants";
import { Badge, RiskBadge } from "@/components/ui/Badge";
import { Tooltip } from "@/components/ui/Tooltip";
import { SkeletonTable } from "@/components/ui/Skeleton";
import type { SortDirection, WhaleTransaction } from "@/types";

type SortField = "timestamp" | "amountUsd" | "riskLevel";

interface SortState {
  field: SortField;
  direction: SortDirection;
}

const RISK_SORT_ORDER = { low: 0, medium: 1, high: 2, critical: 3 };

const TYPE_LABELS: Record<WhaleTransaction["type"], string> = {
  transfer: "Transfer",
  exchange_deposit: "CEX Deposit",
  exchange_withdrawal: "CEX Withdrawal",
  mint: "Mint",
  burn: "Burn",
};

interface ColumnHeaderProps {
  label: string;
  field?: SortField;
  sort: SortState;
  onSort?: (field: SortField) => void;
  align?: "left" | "right";
}

function ColumnHeader({ label, field, sort, onSort, align = "left" }: ColumnHeaderProps) {
  const isActive = field && sort.field === field;

  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-2.5 text-2xs font-semibold uppercase tracking-widest text-text-muted",
        "border-b border-border-subtle select-none",
        align === "right" && "text-right",
        field && "cursor-pointer hover:text-text-secondary transition-colors"
      )}
      onClick={() => field && onSort?.(field)}
    >
      <span className="flex items-center gap-1.5" style={{ justifyContent: align === "right" ? "flex-end" : "flex-start" }}>
        {label}
        {field && (
          <ArrowUpDown
            size={10}
            strokeWidth={isActive ? 2.5 : 1.75}
            className={cn(isActive ? "text-accent-cyan" : "text-text-muted")}
          />
        )}
      </span>
    </th>
  );
}

interface TransactionRowProps {
  tx: WhaleTransaction;
}

function TransactionRow({ tx }: TransactionRowProps) {
  const networkColor = NETWORK_COLORS[tx.network] ?? "#8B949E";

  return (
    <tr
      className={cn(
        "group border-b border-border-subtle",
        "hover:bg-surface-2/40 transition-colors duration-100",
        "animate-fade-in"
      )}
    >
      {/* Time */}
      <td className="px-4 py-3 whitespace-nowrap">
        <Tooltip content={new Date(tx.timestamp).toLocaleString()} side="right">
          <span className="text-xs text-text-muted font-mono tabular-nums cursor-default">
            {formatRelativeTime(tx.timestamp)}
          </span>
        </Tooltip>
      </td>

      {/* Network */}
      <td className="px-4 py-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: networkColor }} />
          <span className="text-xs font-mono font-semibold" style={{ color: networkColor }}>
            {tx.network}
          </span>
        </span>
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <Badge variant="default" className="text-2xs">{TYPE_LABELS[tx.type]}</Badge>
      </td>

      {/* From → To */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <AddressCell address={tx.from.hash} label={tx.from.label} isExchange={tx.from.isExchange} />
          <ArrowRight size={11} className="text-text-muted shrink-0" />
          <AddressCell address={tx.to.hash} label={tx.to.label} isExchange={tx.to.isExchange} />
        </div>
      </td>

      {/* Amount */}
      <td className="px-4 py-3 text-right">
        <div className="flex flex-col items-end">
          <span className="text-sm font-bold text-text-primary font-tabular font-mono">
            {formatUsd(tx.amountUsd)}
          </span>
          <span className="text-2xs text-text-muted font-mono">
            {tx.amountNative.toLocaleString("en-US", { maximumFractionDigits: 3 })} {tx.network}
          </span>
        </div>
      </td>

      {/* Risk */}
      <td className="px-4 py-3 text-right">
        <RiskBadge level={tx.riskLevel} />
      </td>

      {/* Link */}
      <td className="px-4 py-3">
        <Tooltip content="View on explorer">
          <a
            href={`#tx/${tx.hash}`}
            className="p-1.5 rounded-md text-text-muted hover:text-accent-cyan hover:bg-accent-cyan/10 transition-colors inline-flex opacity-0 group-hover:opacity-100"
            aria-label="View transaction"
          >
            <ExternalLink size={12} />
          </a>
        </Tooltip>
      </td>
    </tr>
  );
}

function AddressCell({ address, label, isExchange }: { address: string; label: string | null; isExchange: boolean }) {
  return (
    <Tooltip content={address} side="top">
      <span
        className={cn(
          "text-xs font-mono cursor-default",
          isExchange ? "text-accent-amber" : "text-text-secondary"
        )}
      >
        {label ?? truncateHash(address)}
      </span>
    </Tooltip>
  );
}

interface WhaleTransactionTableProps {
  transactions: WhaleTransaction[];
  loading?: boolean;
  className?: string;
}

export function WhaleTransactionTable({ transactions, loading, className }: WhaleTransactionTableProps) {
  const [sort, setSort] = useState<SortState>({ field: "timestamp", direction: "desc" });

  const handleSort = (field: SortField) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const sorted = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const dir = sort.direction === "asc" ? 1 : -1;
      if (sort.field === "timestamp") return (a.timestamp - b.timestamp) * dir;
      if (sort.field === "amountUsd") return (a.amountUsd - b.amountUsd) * dir;
      if (sort.field === "riskLevel") {
        return (RISK_SORT_ORDER[a.riskLevel] - RISK_SORT_ORDER[b.riskLevel]) * dir;
      }
      return 0;
    });
  }, [transactions, sort]);

  return (
    <div className={cn("surface-card overflow-hidden", className)}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle">
        <h2 className="text-md font-semibold text-text-primary">Whale Transactions</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted font-mono">
            {transactions.length.toLocaleString()} events
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-surface-1/50">
            <tr>
              <ColumnHeader label="Time" field="timestamp" sort={sort} onSort={handleSort} />
              <ColumnHeader label="Network" sort={sort} />
              <ColumnHeader label="Type" sort={sort} />
              <ColumnHeader label="From → To" sort={sort} />
              <ColumnHeader label="Amount" field="amountUsd" sort={sort} onSort={handleSort} align="right" />
              <ColumnHeader label="Risk" field="riskLevel" sort={sort} onSort={handleSort} align="right" />
              <ColumnHeader label="" sort={sort} />
            </tr>
          </thead>
          <tbody>
            {loading && transactions.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <SkeletonTable rows={10} />
                </td>
              </tr>
            ) : sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-16 text-text-muted text-sm">
                  No transactions found
                </td>
              </tr>
            ) : (
              sorted.map((tx) => <TransactionRow key={tx.id} tx={tx} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
