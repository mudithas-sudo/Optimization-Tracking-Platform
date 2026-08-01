import type { ConfidenceLevel, ValidationStatus, FinalOutcome, ApprovalStatus } from "@/generated/prisma/client";

const CONFIDENCE_MAP: Record<ConfidenceLevel, { bg: string; text: string; dot: string }> = {
  HIGH: { bg: "#dcf5f1", text: "#0f6d63", dot: "#159c8f" },
  MEDIUM: { bg: "#fef3c7", text: "#92400e", dot: "#d97706" },
  LOW: { bg: "#ffe8d4", text: "#9a4a12", dot: "#ea8a3b" },
  UNVERIFIED: { bg: "#eef0f4", text: "#5b6579", dot: "#8b93a3" },
};

const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  UNVERIFIED: "Unverified",
};

export function ConfidenceBadge({ level, size = "md" }: { level: ConfidenceLevel; size?: "sm" | "md" }) {
  const s = CONFIDENCE_MAP[level] ?? CONFIDENCE_MAP.UNVERIFIED;
  const sizes = size === "sm" ? "text-[10.5px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizes}`} style={{ background: s.bg, color: s.text }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.dot }} />
      {CONFIDENCE_LABEL[level]}
    </span>
  );
}

const STATUS_MAP: Record<ValidationStatus, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: "#eef0f4", text: "#5b6579", label: "Draft" },
  SUBMITTED: { bg: "#dbeafe", text: "#1d4ed8", label: "Submitted" },
  UNDER_REVIEW: { bg: "#fef3c7", text: "#92400e", label: "Under Review" },
  VALIDATED: { bg: "#dcfce7", text: "#15803d", label: "Validated" },
  REJECTED: { bg: "#fee2e2", text: "#b91c1c", label: "Rejected" },
  NEEDS_CLARIFICATION: { bg: "#ffe8d4", text: "#9a4a12", label: "Needs Clarification" },
};

export function StatusBadge({ status }: { status: ValidationStatus }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.DRAFT;
  return (
    <span className="inline-flex items-center rounded-full text-[11px] font-semibold px-2 py-0.5" style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

export function SeverityPill({ severity }: { severity: "HIGH" | "MEDIUM" | "LOW" }) {
  const map = {
    HIGH: { bg: "#fee2e2", text: "#b91c1c", label: "High" },
    MEDIUM: { bg: "#fef3c7", text: "#92400e", label: "Medium" },
    LOW: { bg: "#dbeafe", text: "#1d4ed8", label: "Low" },
  } as const;
  const s = map[severity] ?? map.LOW;
  return (
    <span className="inline-flex items-center rounded-full text-[11px] font-semibold px-2 py-0.5" style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

const OUTCOME_LABEL: Record<FinalOutcome, string> = {
  ADOPTED: "Adopted",
  ADOPTED_WITH_EDITS: "Adopted with edits",
  REJECTED: "Rejected",
  DISCARDED: "Discarded",
};

export function OutcomeBadge({ outcome }: { outcome: FinalOutcome }) {
  const positive = outcome === "ADOPTED";
  const neutral = outcome === "ADOPTED_WITH_EDITS";
  const bg = positive ? "#dcfce7" : neutral ? "#fef3c7" : "#fee2e2";
  const text = positive ? "#15803d" : neutral ? "#92400e" : "#b91c1c";
  return (
    <span className="inline-flex items-center rounded-full text-[11px] font-semibold px-2 py-0.5" style={{ background: bg, color: text }}>
      {OUTCOME_LABEL[outcome]}
    </span>
  );
}

const APPROVAL_MAP: Record<ApprovalStatus, { bg: string; text: string; label: string }> = {
  APPROVED: { bg: "#dcfce7", text: "#15803d", label: "Approved" },
  UNDER_REVIEW: { bg: "#fef3c7", text: "#92400e", label: "Under Review" },
  DEPRECATED: { bg: "#eef0f4", text: "#5b6579", label: "Deprecated" },
};

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  const s = APPROVAL_MAP[status] ?? APPROVAL_MAP.UNDER_REVIEW;
  return (
    <span className="inline-flex items-center rounded-full text-[11px] font-semibold px-2 py-0.5" style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}
