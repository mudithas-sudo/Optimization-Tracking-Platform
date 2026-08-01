"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ShieldCheck } from "lucide-react";
import { getVisibleNavItems } from "./navConfig";
import type { PermissionKey } from "@/lib/permissions";

export function Sidebar({ granted, groupLabel }: { granted: PermissionKey[]; groupLabel: string }) {
  const pathname = usePathname();
  const items = getVisibleNavItems(granted);

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-brand-950 text-white flex flex-col z-50 hidden lg:flex">
      <div className="px-5 pt-6 pb-5 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
          <Sparkles size={18} className="text-brand-800" />
        </div>
        <div>
          <p className="text-[13px] font-bold leading-tight">AI Optimization</p>
          <p className="text-[11px] text-white/55 leading-tight">Analytics Platform</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-[10.5px] font-semibold tracking-wider uppercase text-white/35 px-3 mb-2">{groupLabel} Menu</p>
        <ul className="space-y-1">
          {items.map((item) => {
            const href = item.path;
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={item.path}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                    isActive ? "bg-white/12 text-white" : "text-white/65 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <item.icon size={16} strokeWidth={2} className="shrink-0" />
                  <span className="leading-tight">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-[11px] text-white/45">
          <ShieldCheck size={14} />
          <span>Validated vs. claimed benefits tracked separately</span>
        </div>
      </div>
    </aside>
  );
}
