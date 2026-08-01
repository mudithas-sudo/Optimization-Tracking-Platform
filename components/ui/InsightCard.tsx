"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb } from "lucide-react";
import { ConfidenceBadge } from "./Badge";
import type { ConfidenceLevel } from "@/generated/prisma/client";

export interface Insight {
  id: string;
  title: string;
  supportingMetric: string;
  comparisonPeriod: string;
  confidenceLevel: ConfidenceLevel;
  affected: string;
  possibleCause: string;
  recommendedAction: string;
}

export function InsightCard({ insight }: { insight: Insight }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-ink-300/25 rounded-xl overflow-hidden bg-white">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left hover:bg-surface/60 transition-colors">
        <div className="flex items-start gap-2.5 min-w-0">
          <Lightbulb size={15} className="text-brand-600 mt-0.5 shrink-0" />
          <p className="text-[13px] font-semibold text-ink-900 leading-snug">{insight.title}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ConfidenceBadge level={insight.confidenceLevel} size="sm" />
          <ChevronDown size={15} className={`text-ink-400 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 text-[12.5px] text-ink-600 space-y-1.5 border-t border-ink-300/15">
          <Row label="Supporting metric" value={insight.supportingMetric} />
          <Row label="Comparison period" value={insight.comparisonPeriod} />
          <Row label="Affected" value={insight.affected} />
          <Row label="Possible cause" value={insight.possibleCause} />
          <Row label="Recommended action" value={insight.recommendedAction} emphasis />
        </div>
      )}
    </div>
  );
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <p className="leading-snug">
      <span className="font-semibold text-ink-500">{label}: </span>
      <span className={emphasis ? "text-brand-700 font-medium" : ""}>{value}</span>
    </p>
  );
}
