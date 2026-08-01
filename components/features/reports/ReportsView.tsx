import { prisma } from "@/lib/db";
import { getEnrichedSubmissions } from "@/lib/submissions";
import { ReportsClient } from "./ReportsClient";

export async function ReportsView() {
  // Select only {id, name} (+ country for the region filter) - these cross
  // into the Client Component ReportsClient, and the full Prisma rows carry
  // Decimal fields that aren't plain serializable objects.
  const [submissions, employees, projects, customers, categories, tools] = await Promise.all([
    getEnrichedSubmissions(),
    prisma.user.findMany({ select: { id: true, name: true, country: true }, orderBy: { name: "asc" } }),
    prisma.project.findMany({ select: { id: true, name: true } }),
    prisma.customer.findMany({ select: { id: true, name: true } }),
    prisma.activityCategory.findMany({ select: { id: true, name: true } }),
    prisma.aITool.findMany({ select: { id: true, name: true } }),
  ]);

  const regions = [...new Set(employees.map((u) => u.country))];

  return (
    <ReportsClient submissions={submissions} employees={employees} projects={projects} customers={customers} categories={categories} tools={tools} regions={regions} />
  );
}
