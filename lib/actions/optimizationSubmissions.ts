"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";
import { optimizationSubmissionSchema } from "@/lib/validations/optimizationSubmission";
import { ValidationStatus } from "@/generated/prisma/enums";

async function nextSubmissionId(): Promise<string> {
  const rows = await prisma.optimizationSubmission.findMany({ select: { id: true } });
  const maxNum = rows.reduce((max, r) => {
    const m = /^OPT-(\d+)$/.exec(r.id);
    return m ? Math.max(max, parseInt(m[1], 10)) : max;
  }, 2000);
  return `OPT-${maxNum + 1}`;
}

export async function createOptimizationSubmission(input: unknown) {
  // Re-checked server-side - a Server Action is a public RPC endpoint, so the
  // form being reachable in the UI is not itself proof of authorization, and
  // client-side zod validation is a UX nicety, never a security boundary.
  const { user } = await requirePermission("add-optimization.use");

  const parsed = optimizationSubmissionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }
  const v = parsed.data;

  const id = await nextSubmissionId();
  const now = new Date();

  await prisma.optimizationSubmission.create({
    data: {
      id,
      employeeId: user.id,
      submissionDate: now,
      activityDate: new Date(v.activityDate),
      projectId: v.projectId || null,
      activityCategoryId: v.activityCategoryId,
      activitySubcategory: v.activitySubcategory || null,
      taskDescription: v.taskDescription || "",
      aiToolId: v.aiToolId,
      aiModel: v.aiModel || null,
      promptOrWorkflow: v.promptOrWorkflow || null,
      reusablePromptUsed: v.reusablePromptUsed,
      reusablePromptId: v.reusablePromptUsed ? v.reusablePromptId || null : null,
      coeSessionId: v.coeSessionId || null,
      collaborationType: v.collaborationType,
      collaboratorsCount: v.collaboratorsCount,
      aiOutputSummary: v.aiOutputSummary || null,
      finalOutputSummary: v.finalOutputSummary || null,
      finalOutcome: v.finalOutcome,
      estEffortWithoutAI: v.estEffortWithoutAI,
      actualEffortWithAI: v.actualEffortWithAI,
      reviewCorrectionTime: v.reviewCorrectionTime,
      iterations: v.iterations,
      qualityBefore: v.qualityBefore,
      qualityAfter: v.qualityAfter,
      defectsBefore: v.defectsBefore,
      defectsAfter: v.defectsAfter,
      reworkTimeAvoided: v.reworkTimeAvoided,
      evidenceType: v.evidenceType || null,
      evidenceFileName: v.evidenceFileName || null,
      supportingLink: v.supportingLink || null,
      validationStatus: ValidationStatus.SUBMITTED,
      reusabilityLevel: v.reusabilityLevel,
      confidentialityClassification: v.confidentialityClassification,
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: "Submission",
      entityId: id,
      action: "Created",
      userId: user.id,
      details: `${user.name} logged a new AI-assisted activity (${id}).`,
      submissionId: id,
    },
  });

  revalidatePath("/my-optimizations");
  revalidatePath("/dashboard");

  return { ok: true as const, id };
}
