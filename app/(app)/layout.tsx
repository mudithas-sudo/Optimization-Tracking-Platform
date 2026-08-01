import type { ReactNode } from "react";
import { requireActiveUser } from "@/lib/auth";
import { getGrantedPermissionKeysForCurrentUser } from "@/lib/permissions";
import { getNotificationsForGroup } from "@/lib/notifications";
import { AppShell } from "@/components/layout/AppShell";
import { USER_GROUP_LABEL } from "@/components/layout/navConfig";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireActiveUser();
  const [granted, notifications] = await Promise.all([getGrantedPermissionKeysForCurrentUser(), getNotificationsForGroup(user.userGroup)]);

  return (
    <AppShell granted={[...granted]} groupLabel={USER_GROUP_LABEL[user.userGroup]} notifications={notifications}>
      {children}
    </AppShell>
  );
}
