"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Panel } from "@/components/ui/Panel";
import { optimizationSubmissionSchema, type OptimizationSubmissionFormInput, type OptimizationSubmissionFormValues, EVIDENCE_TYPES } from "@/lib/validations/optimizationSubmission";
import { createOptimizationSubmission } from "@/lib/actions/optimizationSubmissions";
import { CollaborationType, FinalOutcome, ReusabilityLevel, ConfidentialityClassification } from "@/generated/prisma/enums";

const FINAL_OUTCOME_LABEL: Record<string, string> = {
  [FinalOutcome.ADOPTED]: "Adopted",
  [FinalOutcome.ADOPTED_WITH_EDITS]: "Adopted with edits",
  [FinalOutcome.REJECTED]: "Rejected",
  [FinalOutcome.DISCARDED]: "Discarded",
};

const REUSABILITY_LABEL: Record<string, string> = {
  [ReusabilityLevel.NONE]: "Not reusable",
  [ReusabilityLevel.TEAM]: "Team",
  [ReusabilityLevel.DEPARTMENT]: "Discipline-wide (BA / Presales)",
  [ReusabilityLevel.ORG_WIDE]: "Org-wide",
};

const CONFIDENTIALITY_LABEL: Record<string, string> = {
  [ConfidentialityClassification.PUBLIC]: "Public",
  [ConfidentialityClassification.INTERNAL]: "Internal",
  [ConfidentialityClassification.CONFIDENTIAL]: "Confidential",
  [ConfidentialityClassification.RESTRICTED]: "Restricted",
};

interface Option {
  id: string;
  name?: string;
  title?: string;
}

export function AddOptimizationForm({
  projects,
  categories,
  aiTools,
  aiModels,
  reusableAssets,
  coeSessions,
}: {
  projects: Option[];
  categories: { id: string; name: string; group: string }[];
  aiTools: Option[];
  aiModels: { name: string; toolId: string }[];
  reusableAssets: { id: string; title: string; categoryId: string }[];
  coeSessions: { id: string; title: string; activityCategoryId: string | null }[];
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OptimizationSubmissionFormInput, unknown, OptimizationSubmissionFormValues>({
    resolver: zodResolver(optimizationSubmissionSchema),
    defaultValues: {
      activityDate: new Date().toISOString().slice(0, 10),
      projectId: "",
      activityCategoryId: "",
      activitySubcategory: "",
      taskDescription: "",
      aiToolId: "",
      aiModel: "",
      promptOrWorkflow: "",
      reusablePromptUsed: false,
      reusablePromptId: "",
      coeSessionId: "",
      collaborationType: CollaborationType.INDIVIDUAL,
      collaboratorsCount: 1,
      aiOutputSummary: "",
      finalOutputSummary: "",
      finalOutcome: FinalOutcome.ADOPTED,
      estEffortWithoutAI: 0,
      actualEffortWithAI: 0,
      reviewCorrectionTime: 0,
      iterations: 1,
      qualityBefore: 3,
      qualityAfter: 3,
      defectsBefore: 0,
      defectsAfter: 0,
      reworkTimeAvoided: 0,
      evidenceType: "",
      evidenceFileName: "",
      supportingLink: "",
      reusabilityLevel: ReusabilityLevel.NONE,
      confidentialityClassification: ConfidentialityClassification.INTERNAL,
    },
  });

  const activityCategoryId = watch("activityCategoryId");
  const aiToolId = watch("aiToolId");
  const reusablePromptUsed = watch("reusablePromptUsed");
  const evidenceFileName = watch("evidenceFileName");
  const supportingLink = watch("supportingLink");

  const availableModels = aiToolId ? aiModels.filter((m) => m.toolId === aiToolId) : [];
  const relevantAssets = activityCategoryId ? reusableAssets.filter((a) => a.categoryId === activityCategoryId) : reusableAssets;
  const relevantCoeSessions = activityCategoryId ? coeSessions.filter((s) => s.activityCategoryId === activityCategoryId || !s.activityCategoryId) : coeSessions;

  async function onSubmit(values: OptimizationSubmissionFormValues) {
    setServerError("");
    const result = await createOptimizationSubmission(values);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    router.push(`/optimizations/${result.id}`);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Panel title="1. Activity Context">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Activity date" required error={errors.activityDate?.message}>
            <input type="date" required {...register("activityDate")} className={inputCls} />
          </Field>
          <Field label="Project / proposal">
            <select {...register("projectId")} className={inputCls}>
              <option value="">Select project (optional)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Activity category" required error={errors.activityCategoryId?.message}>
            <select required {...register("activityCategoryId")} className={inputCls}>
              <option value="">Select category</option>
              <optgroup label="Business Analysis">
                {categories
                  .filter((c) => c.group === "Business Analysis")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="Presales">
                {categories
                  .filter((c) => c.group === "Presales")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
            </select>
          </Field>
          <Field label="Activity subcategory">
            <input {...register("activitySubcategory")} placeholder="e.g. Fee schedule module" className={inputCls} />
          </Field>
        </div>
        <Field label="Description of original task" className="mt-4">
          <textarea {...register("taskDescription")} rows={2} className={inputCls} />
        </Field>
      </Panel>

      <Panel title="2. AI Usage">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="AI tool used" required error={errors.aiToolId?.message}>
            <select required {...register("aiToolId")} className={inputCls}>
              <option value="">Select tool</option>
              {aiTools.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="AI model used">
            <select {...register("aiModel")} className={inputCls}>
              <option value="">Select model</option>
              {availableModels.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Prompt or workflow used" className="mt-4">
          <textarea {...register("promptOrWorkflow")} rows={2} className={inputCls} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field label="COE session that enabled this activity">
            <select {...register("coeSessionId")} className={inputCls}>
              <option value="">None</option>
              {relevantCoeSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Individual or collaborative?">
            <select {...register("collaborationType")} className={inputCls}>
              <option value={CollaborationType.INDIVIDUAL}>Individual</option>
              <option value={CollaborationType.COLLABORATIVE}>Collaborative</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field label="Reusable prompt/template used?">
            <select {...register("reusablePromptUsed", { setValueAs: (v) => v === "yes" })} className={inputCls}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </Field>
          {reusablePromptUsed && (
            <Field label="Which reusable asset?">
              <select {...register("reusablePromptId")} className={inputCls}>
                <option value="">Select asset</option>
                {relevantAssets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>
      </Panel>

      <Panel title="3. Output">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Output generated using AI">
            <textarea {...register("aiOutputSummary")} rows={2} className={inputCls} />
          </Field>
          <Field label="Final output after human review">
            <textarea {...register("finalOutputSummary")} rows={2} className={inputCls} />
          </Field>
        </div>
        <Field label="Final outcome" className="mt-4">
          <select {...register("finalOutcome")} className={inputCls}>
            {Object.values(FinalOutcome).map((v) => (
              <option key={v} value={v}>
                {FINAL_OUTCOME_LABEL[v]}
              </option>
            ))}
          </select>
        </Field>
      </Panel>

      <Panel title="4. Effort" subtitle="Do not round in your favor - unfavorable results are expected and valuable to record.">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Field label="Estimated effort without AI (hrs)" required error={errors.estEffortWithoutAI?.message}>
            <input type="number" step="0.1" required {...register("estEffortWithoutAI")} className={inputCls} />
          </Field>
          <Field label="Actual effort with AI (hrs)" required error={errors.actualEffortWithAI?.message}>
            <input type="number" step="0.1" required {...register("actualEffortWithAI")} className={inputCls} />
          </Field>
          <Field label="Review / correction time (hrs)">
            <input type="number" step="0.1" {...register("reviewCorrectionTime")} className={inputCls} />
          </Field>
          <Field label="Number of iterations">
            <input type="number" min="1" {...register("iterations")} className={inputCls} />
          </Field>
        </div>
      </Panel>

      <Panel title="5. Quality">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <Field label="Quality before (1-5)">
            <input type="number" min="1" max="5" {...register("qualityBefore")} className={inputCls} />
          </Field>
          <Field label="Quality after (1-5)">
            <input type="number" min="1" max="5" {...register("qualityAfter")} className={inputCls} />
          </Field>
          <Field label="Defects before">
            <input type="number" min="0" {...register("defectsBefore")} className={inputCls} />
          </Field>
          <Field label="Defects after">
            <input type="number" min="0" {...register("defectsAfter")} className={inputCls} />
          </Field>
          <Field label="Rework time avoided (hrs)">
            <input type="number" step="0.1" {...register("reworkTimeAvoided")} className={inputCls} />
          </Field>
        </div>
      </Panel>

      <Panel title="6. Evidence & Governance">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Evidence type">
            <select {...register("evidenceType")} className={inputCls}>
              <option value="">Select evidence type</option>
              {EVIDENCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Evidence attachment (file name)">
            <input {...register("evidenceFileName")} placeholder="e.g. mom-timestamps.png" className={inputCls} />
          </Field>
          <Field label="Supporting link">
            <input {...register("supportingLink")} placeholder="https://..." className={inputCls} />
          </Field>
          <Field label="Reusability level">
            <select {...register("reusabilityLevel")} className={inputCls}>
              {Object.values(ReusabilityLevel).map((v) => (
                <option key={v} value={v}>
                  {REUSABILITY_LABEL[v]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Confidentiality classification">
            <select {...register("confidentialityClassification")} className={inputCls}>
              {Object.values(ConfidentialityClassification).map((v) => (
                <option key={v} value={v}>
                  {CONFIDENTIALITY_LABEL[v]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {!evidenceFileName && !supportingLink && (
          <p className="text-[12px] text-warning-600 bg-warning-100 rounded-lg px-3 py-2 mt-4">
            No evidence attached. This submission will start with a lower confidence score until evidence is added or a manager validates it.
          </p>
        )}
      </Panel>

      {serverError && <p className="text-[13px] text-danger-600 bg-danger-100 rounded-lg px-3 py-2.5">{serverError}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold text-[13.5px] rounded-xl px-5 py-2.5 transition-colors"
        >
          {isSubmitting ? "Submitting..." : "Submit for Validation"}
        </button>
        <button type="button" onClick={() => reset()} className="text-[13px] font-medium text-ink-500 hover:text-ink-900 px-3 py-2.5">
          Reset
        </button>
      </div>
    </form>
  );
}

const inputCls = "w-full border border-ink-300/40 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-500/25 focus:border-brand-500 bg-white";

function Field({
  label,
  required,
  error,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[12px] font-medium text-ink-700 block mb-1">
        {label} {required && <span className="text-danger-600">*</span>}
      </span>
      {children}
      {error && <span className="text-[11px] text-danger-600 block mt-1">{error}</span>}
    </label>
  );
}
