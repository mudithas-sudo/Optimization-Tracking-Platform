import type { ReactNode } from "react";

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className = "",
  bodyClassName = "",
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-ink-300/25 shadow-[0_1px_2px_rgba(16,21,31,0.04)] ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
          <div>
            {title && <h3 className="text-[15px] font-semibold text-ink-900">{title}</h3>}
            {subtitle && <p className="text-[12.5px] text-ink-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={`px-5 pb-5 ${title || actions ? "" : "pt-5"} ${bodyClassName}`}>{children}</div>
    </div>
  );
}

export function EmptyState({ icon, title, detail }: { icon?: ReactNode; title: string; detail?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      {icon && <div className="mb-3 text-ink-300">{icon}</div>}
      <p className="text-sm font-semibold text-ink-700">{title}</p>
      {detail && <p className="text-xs text-ink-400 mt-1 max-w-xs">{detail}</p>}
    </div>
  );
}
