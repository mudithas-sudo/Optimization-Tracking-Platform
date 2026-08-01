// submissionId is derived: entityType === 'Submission' -> entityId (the FK to
// OptimizationSubmission); entityType === 'Asset' -> null (no FK for assets
// in this schema, entityType/entityId still capture what happened to it).
export const auditLogs = [
  { id: "al-1", entityType: "Submission", entityId: "OPT-2001", action: "Created", userId: "emp-101", timestamp: new Date("2026-02-10T09:14:00"), details: "Submission created.", submissionId: "OPT-2001" },
  { id: "al-2", entityType: "Submission", entityId: "OPT-2001", action: "Validated", userId: "mgr-201", timestamp: new Date("2026-02-11T11:02:00"), details: "Status changed Submitted -> Validated.", submissionId: "OPT-2001" },
  { id: "al-3", entityType: "Submission", entityId: "OPT-2002", action: "Created", userId: "emp-102", timestamp: new Date("2026-02-18T14:40:00"), details: "Submission created.", submissionId: "OPT-2002" },
  { id: "al-4", entityType: "Submission", entityId: "OPT-2002", action: "Flagged", userId: "mgr-201", timestamp: new Date("2026-02-19T09:20:00"), details: "Status changed Submitted -> Needs Clarification. Comment added on fee cap source.", submissionId: "OPT-2002" },
  { id: "al-5", entityType: "Submission", entityId: "OPT-2010", action: "Created", userId: "emp-109", timestamp: new Date("2026-04-08T16:05:00"), details: "Submission created.", submissionId: "OPT-2010" },
  { id: "al-6", entityType: "Submission", entityId: "OPT-2010", action: "Rejected", userId: "mgr-203", timestamp: new Date("2026-04-09T10:30:00"), details: "Status changed Submitted -> Rejected. Claimed benefit not accepted.", submissionId: "OPT-2010" },
  { id: "al-7", entityType: "Asset", entityId: "rp-crd-outline", action: "Status Changed", userId: "mgr-202", timestamp: new Date("2026-02-19T09:25:00"), details: "Status changed Approved -> Under Review pending accuracy investigation.", submissionId: null },
  { id: "al-8", entityType: "Submission", entityId: "OPT-2049", action: "Created", userId: "emp-102", timestamp: new Date("2026-07-12T10:00:00"), details: "Submission created. System flagged as possible duplicate of OPT-2002.", submissionId: "OPT-2049" },
  { id: "al-9", entityType: "Submission", entityId: "OPT-2050", action: "Created", userId: "emp-106", timestamp: new Date("2026-07-15T13:12:00"), details: "Submission created. System flagged as statistical outlier vs. category baseline.", submissionId: "OPT-2050" },
  { id: "al-10", entityType: "Submission", entityId: "OPT-2051", action: "Rejected", userId: "mgr-202", timestamp: new Date("2026-07-19T15:40:00"), details: "Status changed Submitted -> Rejected. Negligible net saving after review time.", submissionId: "OPT-2051" },
];
