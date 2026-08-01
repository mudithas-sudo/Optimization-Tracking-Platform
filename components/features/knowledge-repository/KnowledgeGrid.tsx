"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ThumbsUp, ThumbsDown } from "lucide-react";
import { ApprovalStatusBadge } from "@/components/ui/Badge";
import { numFmt } from "@/lib/format";
import type { ApprovalStatus } from "@/generated/prisma/client";

export interface KnowledgeCardItem {
  id: string;
  title: string;
  problemAddressed: string;
  approvalStatus: ApprovalStatus;
  successfulUses: number;
  avgTimeSaved: number;
  helpfulVotes: number;
  notHelpfulVotes: number;
  version: string;
  activityCategory: { group: string; name: string };
  recommendedTool: { name: string };
}

export function KnowledgeGrid({ items }: { items: KnowledgeCardItem[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((k) => k.title.toLowerCase().includes(q) || k.problemAddressed.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <>
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search use cases..."
          className="w-full bg-white border border-ink-300/30 rounded-lg pl-9 pr-3 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((k) => (
          <Link
            key={k.id}
            href={`/knowledge-repository/${k.id}`}
            className="block bg-white border border-ink-300/25 rounded-2xl p-4 cursor-pointer hover:border-brand-400/50 hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">
                {k.activityCategory.group} · {k.activityCategory.name}
              </p>
              <ApprovalStatusBadge status={k.approvalStatus} />
            </div>
            <h3 className="text-[14.5px] font-semibold text-ink-900 leading-snug mb-1.5">{k.title}</h3>
            <p className="text-[12.5px] text-ink-500 mb-3 line-clamp-2">{k.problemAddressed}</p>
            <div className="flex items-center justify-between text-[12px] text-ink-500">
              <span>{k.recommendedTool.name}</span>
              <span>
                {k.successfulUses} uses · {k.avgTimeSaved >= 0 ? "+" : ""}
                {numFmt(k.avgTimeSaved)}h avg
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2 pt-2 border-t border-ink-300/10 text-[11.5px] text-ink-400">
              <span className="inline-flex items-center gap-1">
                <ThumbsUp size={12} /> {k.helpfulVotes}
              </span>
              <span className="inline-flex items-center gap-1">
                <ThumbsDown size={12} /> {k.notHelpfulVotes}
              </span>
              <span>v{k.version}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
