// COE (Community of Expertise) sessions - internal knowledge-transfer sessions
// whose downstream impact is tracked by linking them to the OptimizationSubmission
// records they enabled (see optimizationSubmissions.ts's coeSessionId field).
export const coeSessions = [
  {
    id: "coe-hardware-proposal-template",
    title: "Hardware Proposal Template Workshop",
    description:
      "Walkthrough of the standardized hardware/network-equipment proposal template - section structure, sizing worksheet, and how to use Claude to draft the technical narrative from a requirements list instead of writing it freehand.",
    date: new Date("2026-06-25"),
    facilitatorId: "lead-bse",
    activityCategoryId: "ps-proposal-prep",
  },
  {
    id: "coe-mom-ai-capture",
    title: "Meeting-to-MoM Capture with the Internal AI Assistant",
    description: "Hands-on session on feeding meeting recordings/transcripts into the internal assistant using the approved Meeting-to-MoM Recap prompt, including how to spot-check action-item attribution.",
    date: new Date("2026-02-05"),
    facilitatorId: "lead-bse",
    activityCategoryId: "ba-mom",
  },
  {
    id: "coe-rfp-skeleton",
    title: "RFP Response Skeleton Deep-Dive",
    description: "Deep-dive into the RFP Response Skeleton Workflow for large multi-contributor RFPs - how to split sections across BA/Presales, flag SME-review items, and run a final consistency pass.",
    date: new Date("2026-03-01"),
    facilitatorId: "lead-bse",
    activityCategoryId: "ps-rfp-response",
  },
  {
    id: "coe-competitor-research-prompting",
    title: "Effective Prompting for Competitor Research",
    description: "Session on the Competitor Snapshot Prompt - naming competitors explicitly rather than letting the model infer them, and mandatory citation-checking before using figures in a live deal.",
    date: new Date("2026-03-15"),
    facilitatorId: "lead-bse",
    activityCategoryId: "ps-competitor-comparison",
  },
];
