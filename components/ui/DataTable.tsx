"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUpDown } from "lucide-react";
import { EmptyState } from "./Panel";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  searchKeys = [],
  searchPlaceholder = "Search...",
  getRowHref,
  onRowClick,
  getRowKey,
  emptyLabel = "No records found.",
  pageSize = 12,
}: {
  columns: Column<T>[];
  rows: T[];
  searchKeys?: string[];
  searchPlaceholder?: string;
  getRowHref?: (row: T) => string;
  onRowClick?: (row: T) => void;
  getRowKey?: (row: T) => string;
  emptyLabel?: string;
  pageSize?: number;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter((r) => searchKeys.some((k) => String(getVal(r, k) ?? "").toLowerCase().includes(q)));
  }, [rows, query, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = getVal(a, sortKey);
      const bv = getVal(b, sortKey);
      if (av === bv) return 0;
      const cmp = (av as string | number) > (bv as string | number) ? 1 : -1;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  }

  return (
    <div>
      {searchKeys.length > 0 && (
        <div className="relative mb-3 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="w-full bg-surface border border-ink-300/30 rounded-lg pl-8 pr-3 py-1.5 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500"
          />
        </div>
      )}
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-ink-300/20">
              {columns.map((c) => (
                <th
                  key={c.key}
                  onClick={() => c.sortable !== false && toggleSort(c.key)}
                  className={`px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-500 whitespace-nowrap ${c.sortable !== false ? "cursor-pointer select-none hover:text-ink-700" : ""}`}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.label}
                    {c.sortable !== false && <ArrowUpDown size={11} className="text-ink-300" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row, i) => (
              <tr
                key={getRowKey ? getRowKey(row) : i}
                onClick={() => (getRowHref ? router.push(getRowHref(row)) : onRowClick?.(row))}
                className={`border-b border-ink-300/10 last:border-0 ${getRowHref || onRowClick ? "cursor-pointer hover:bg-surface/70" : ""}`}
              >
                {columns.map((c) => (
                  <td key={c.key} className="px-3 py-2.5 text-[12.5px] text-ink-700 whitespace-nowrap">
                    {c.render ? c.render(row) : (getVal(row, c.key) as ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {paged.length === 0 && <EmptyState title={emptyLabel} />}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-[12px] text-ink-500">
          <span>
            Showing {page * pageSize + 1}-{Math.min(sorted.length, (page + 1) * pageSize)} of {sorted.length}
          </span>
          <div className="flex gap-1.5">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="px-2.5 py-1 rounded-lg border border-ink-300/30 disabled:opacity-40 hover:bg-surface">
              Prev
            </button>
            <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)} className="px-2.5 py-1 rounded-lg border border-ink-300/30 disabled:opacity-40 hover:bg-surface">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getVal(obj: unknown, key: string): unknown {
  return key.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}
