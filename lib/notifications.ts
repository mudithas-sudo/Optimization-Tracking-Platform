import { prisma } from "./db";
import type { UserGroup } from "@/generated/prisma/client";
import type { TopbarNotification } from "@/components/layout/Topbar";

export async function getNotificationsForGroup(group: UserGroup): Promise<TopbarNotification[]> {
  const rows = await prisma.notification.findMany({
    where: { audienceRoles: { has: group } },
    orderBy: { date: "desc" },
  });
  return rows.map((n) => ({
    id: n.id,
    type: n.type,
    message: n.message,
    severity: n.severity,
    date: n.date.toISOString().slice(0, 10),
  }));
}
