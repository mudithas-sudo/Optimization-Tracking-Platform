import { prisma } from "./db";
import { SUBMISSION_INCLUDE, enrich, type EnrichedSubmission } from "./metrics";
import type { Prisma } from "@/generated/prisma/client";

export async function getEnrichedSubmissions(where?: Prisma.OptimizationSubmissionWhereInput): Promise<EnrichedSubmission[]> {
  const rows = await prisma.optimizationSubmission.findMany({
    where,
    include: SUBMISSION_INCLUDE,
    orderBy: { activityDate: "desc" },
  });
  return rows.map(enrich);
}

export async function getEnrichedSubmissionById(id: string): Promise<EnrichedSubmission | null> {
  const row = await prisma.optimizationSubmission.findUnique({
    where: { id },
    include: SUBMISSION_INCLUDE,
  });
  return row ? enrich(row) : null;
}
