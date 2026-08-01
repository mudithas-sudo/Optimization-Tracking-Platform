import type { ReactNode } from "react";
import { Info } from "lucide-react";

export function ProgressBar({ value, color = "#4650c2", height = 6 }: { value: number; color?: string; height?: number }) {
  return (
    <div className="rounded-full bg-surface-alt overflow-hidden" style={{ height }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
    </div>
  );
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white shrink-0 bg-brand-800"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
      <div>
        {eyebrow && <p className="text-[11px] font-semibold tracking-wide uppercase text-brand-600 mb-1">{eyebrow}</p>}
        <h2 className="text-xl font-bold text-ink-900">{title}</h2>
        {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="relative inline-flex group align-middle ml-1">
      <Info size={13} className="text-ink-400 cursor-help" />
      <span className="pointer-events-none absolute z-50 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-64 rounded-lg bg-ink-900 text-white text-[11.5px] leading-snug px-3 py-2 shadow-lg">
        {text}
      </span>
    </span>
  );
}
