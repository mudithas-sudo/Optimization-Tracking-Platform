"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDef {
  key: string;
  label: string;
  type?: "select" | "date";
  options?: FilterOption[];
}

export function FilterBar({
  filters,
  values,
  onChange,
  onClear,
}: {
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}) {
  const hasActive = Object.values(values).some((v) => v);
  return (
    <div className="flex flex-wrap items-center gap-2.5 bg-white border border-ink-300/25 rounded-2xl px-4 py-3 mb-5">
      {filters.map((f) => (
        <div key={f.key} className="flex flex-col gap-1">
          {f.type === "date" ? (
            <input
              type="date"
              value={values[f.key] || ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              className="border border-ink-300/30 rounded-lg px-2.5 py-1.5 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500"
            />
          ) : (
            <select
              value={values[f.key] || ""}
              onChange={(e) => onChange(f.key, e.target.value)}
              className="border border-ink-300/30 rounded-lg px-2.5 py-1.5 text-[12.5px] bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 min-w-[140px]"
            >
              <option value="">{f.label}</option>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
      {hasActive && (
        <button onClick={onClear} className="flex items-center gap-1 text-[12px] font-medium text-ink-500 hover:text-ink-900 px-2 py-1.5">
          <X size={13} /> Clear filters
        </button>
      )}
    </div>
  );
}

export function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`text-[12px] font-medium rounded-full px-3 py-1.5 border transition-colors ${
        active ? "bg-brand-700 text-white border-brand-700" : "bg-white text-ink-600 border-ink-300/30 hover:bg-surface"
      }`}
    >
      {children}
    </button>
  );
}
