import { z } from "zod";
import { CollaborationType, FinalOutcome, ReusabilityLevel, ConfidentialityClassification } from "@/generated/prisma/enums";

// Shared between the client form (react-hook-form + zodResolver) and the
// Server Action's own re-validation - client-side checks are a UX nicety,
// never a security boundary.
export const optimizationSubmissionSchema = z.object({
  activityDate: z.string().min(1, "Activity date is required"),
  projectId: z.string().optional(),
  activityCategoryId: z.string().min(1, "Activity category is required"),
  activitySubcategory: z.string().optional(),
  taskDescription: z.string().optional(),

  aiToolId: z.string().min(1, "AI tool is required"),
  aiModel: z.string().optional(),
  promptOrWorkflow: z.string().optional(),
  reusablePromptUsed: z.boolean(),
  reusablePromptId: z.string().optional(),
  coeSessionId: z.string().optional(),
  collaborationType: z.enum(CollaborationType),
  collaboratorsCount: z.coerce.number().int().min(1),

  aiOutputSummary: z.string().optional(),
  finalOutputSummary: z.string().optional(),
  finalOutcome: z.enum(FinalOutcome),

  estEffortWithoutAI: z.coerce.number().positive("Must be greater than 0"),
  actualEffortWithAI: z.coerce.number().min(0),
  reviewCorrectionTime: z.coerce.number().min(0),
  iterations: z.coerce.number().int().min(1),

  qualityBefore: z.coerce.number().int().min(1).max(5),
  qualityAfter: z.coerce.number().int().min(1).max(5),
  defectsBefore: z.coerce.number().int().min(0),
  defectsAfter: z.coerce.number().int().min(0),
  reworkTimeAvoided: z.coerce.number(),

  evidenceType: z.string().optional(),
  evidenceFileName: z.string().optional(),
  supportingLink: z.string().optional(),

  reusabilityLevel: z.enum(ReusabilityLevel),
  confidentialityClassification: z.enum(ConfidentialityClassification),
});

// react-hook-form needs both shapes when a resolver coerces types: the form's
// live field state is the (pre-coercion) input shape, e.g. number inputs can
// hold "" while typing; the submit handler receives the (post-coercion)
// output shape zod actually validated.
export type OptimizationSubmissionFormInput = z.input<typeof optimizationSubmissionSchema>;
export type OptimizationSubmissionFormValues = z.output<typeof optimizationSubmissionSchema>;

export const EVIDENCE_TYPES = [
  "Previous versions of similar documents",
  "Document timestamps",
  "Timesheet entries",
  "Proposal submission history",
  "Email timestamps",
  "CRM records",
  "Project management records",
  "Document revision history",
  "Customer feedback",
  "Internal review comments",
  "Error or defect records",
  "Meeting preparation duration",
  "Recorded task start and completion times",
  "Approved effort estimations",
  "Screenshots or system-generated logs",
];
