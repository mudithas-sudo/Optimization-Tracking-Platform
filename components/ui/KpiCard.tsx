import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { InfoTooltip } from "./Misc";

type Tone = "good" | "watch" | "bad" | "neutral";

const TONE_MAP: Record<Tone, { text: string; bg: string }> = {
  good: { text: "#15803d", bg: "#dcfce7" },
  watch: { text: "#92400e", bg: "#fef3c7" },
  bad: { text: "#b91c1c", bg: "#fee2e2" },
  neutral: { text: "#333da3", bg: "#e6e8fb" },
};

export function KpiCard({
  label,
  value,
  sub,
  tone = "neutral",
  formula,
  href,
  dense = false,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: Tone;
  formula?: string;
  href?: string;
  dense?: boolean;
}) {
  const t = TONE_MAP[tone];

  const content = (
    <div className={`rounded-2xl border border-ink-300/25 bg-white ${dense ? "p-4" : "p-5"} ${href ? "hover:border-brand-400/50 hover:shadow-sm transition-all" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12.5px] font-medium text-ink-500 flex items-center">
          {label}
          {formula && <InfoTooltip text={formula} />}
        </p>
        {tone !== "neutral" && (
          <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold rounded-full px-1.5 py-0.5 shrink-0" style={{ color: t.text, background: t.bg }}>
            {tone === "bad" ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
          </span>
        )}
      </div>
      <p className="text-[22px] font-bold text-ink-900 mt-2 leading-none">{value}</p>
      {sub && <p className="text-[12px] text-ink-400 mt-1.5">{sub}</p>}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export function TargetKpiCard({
  label,
  actual,
  target,
  formatFn,
  direction = "min",
  formula,
}: {
  label: string;
  actual: number;
  target: number;
  formatFn: (v: number) => string;
  direction?: "min" | "max";
  formula?: string;
}) {
  const attainment = direction === "max" ? (target ? Math.max(0, 100 - ((actual - target) / target) * 100) : 100) : target ? (actual / target) * 100 : 0;
  const good = direction === "max" ? actual <= target : attainment >= 100;
  const watch = direction === "max" ? actual <= target * 1.15 : attainment >= 85 && attainment < 100;
  const barColor = good ? "#15803d" : watch ? "#b45309" : "#b91c1c";

  return (
    <div className="rounded-2xl border border-ink-300/25 bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="text-[12.5px] font-medium text-ink-500 flex items-center">
          {label}
          {formula && <InfoTooltip text={formula} />}
        </p>
        <span
          className="inline-flex items-center gap-0.5 text-[11px] font-semibold rounded-full px-1.5 py-0.5"
          style={{ color: good ? "#15803d" : watch ? "#92400e" : "#b91c1c", background: good ? "#dcfce7" : watch ? "#fef3c7" : "#fee2e2" }}
        >
          {attainment.toFixed(0)}%
        </span>
      </div>
      <p className="text-[22px] font-bold text-ink-900 mt-2 leading-none">{formatFn(actual)}</p>
      <p className="text-[12px] text-ink-400 mt-1">
        {direction === "max" ? "vs. max" : "of"} {formatFn(target)} target
      </p>
      <div className="mt-3 h-1.5 rounded-full bg-surface-alt overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(4, attainment))}%`, background: barColor }} />
      </div>
    </div>
  );
}
