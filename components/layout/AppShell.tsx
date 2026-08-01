import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar, type TopbarNotification } from "./Topbar";
import type { PermissionKey } from "@/lib/permissions";

export function AppShell({
  granted,
  groupLabel,
  notifications,
  children,
}: {
  granted: PermissionKey[];
  groupLabel: string;
  notifications: TopbarNotification[];
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar granted={granted} groupLabel={groupLabel} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar notifications={notifications} />
        <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
