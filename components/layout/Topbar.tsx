"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { SeverityPill } from "../ui/Badge";
import { NAV_ITEMS } from "./navConfig";

export interface TopbarNotification {
  id: string;
  type: string;
  message: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  date: string;
}

export function Topbar({ notifications }: { notifications: TopbarNotification[] }) {
  const [openNotif, setOpenNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const current = NAV_ITEMS.find((n) => pathname === n.path || pathname.startsWith(`${n.path}/`));
  const pageTitle = current?.label ?? "Dashboard";

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setOpenNotif(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="h-16 shrink-0 bg-white border-b border-ink-300/25 flex items-center justify-between px-4 sm:px-6 gap-4 sticky top-0 z-30">
      <p className="text-[15px] font-bold text-ink-900 truncate">{pageTitle}</p>

      <div className="flex items-center gap-2 shrink-0">
        <div className="relative" ref={notifRef}>
          <button onClick={() => setOpenNotif((v) => !v)} className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface transition-colors">
            <Bell size={18} className="text-ink-700" />
            {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger-600 ring-2 ring-white" />}
          </button>
          {openNotif && (
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl border border-ink-300/25 shadow-xl overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-ink-300/15 flex items-center justify-between">
                <p className="text-sm font-semibold text-ink-900">Notifications</p>
                <span className="text-[11px] text-ink-400">{notifications.length} active</span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 && <p className="text-[13px] text-ink-400 px-4 py-6 text-center">You&apos;re all caught up.</p>}
                {notifications.slice(0, 10).map((n) => (
                  <div key={n.id} className="px-4 py-3 border-b border-ink-300/10 last:border-0 hover:bg-surface/70">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11.5px] font-semibold text-ink-700">{n.type}</span>
                      <SeverityPill severity={n.severity} />
                    </div>
                    <p className="text-[12.5px] text-ink-700 leading-snug">{n.message}</p>
                    <p className="text-[11px] text-ink-400 mt-1">{n.date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <UserButton />
      </div>
    </header>
  );
}
