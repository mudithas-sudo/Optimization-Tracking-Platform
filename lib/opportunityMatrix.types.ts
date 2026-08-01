// Pure types/constants for the Opportunity Matrix - deliberately has zero
// imports from ./db or ./submissions so Client Components (e.g.
// OpportunityMatrixClient.tsx) can import from here without pulling the
// Node-only Prisma runtime into the browser bundle. The actual data-fetching
// logic lives in ./opportunityMatrix.ts (server-only).
export type Classification =
  | "Quick Wins"
  | "High-Value Strategic Opportunities"
  | "Training Opportunities"
  | "Standardization Opportunities"
  | "Automation Candidates"
  | "Low-Priority Opportunities"
  | "High-Risk AI Use Cases";

export interface Opportunity {
  categoryId: string;
  name: string;
  group: string;
  frequency: number;
  avgEffort: number;
  timeSavingPotential: number | null;
  qualityPotential: number | null;
  riskLevel: "High" | "Medium" | "Low";
  standardizationLevel: "High" | "Medium" | "Low";
  automationFeasibility: "High" | "Medium" | "Low";
  classification: Classification;
}

export const CLASSIFICATION_COLORS: Record<Classification, string> = {
  "Quick Wins": "#159c8f",
  "High-Value Strategic Opportunities": "#333da3",
  "Training Opportunities": "#d97706",
  "Standardization Opportunities": "#6b73d1",
  "Automation Candidates": "#0f6d63",
  "Low-Priority Opportunities": "#8b93a3",
  "High-Risk AI Use Cases": "#b91c1c",
};
