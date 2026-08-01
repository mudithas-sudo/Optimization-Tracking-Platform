"use client";

import { FileImage, FileSpreadsheet, FileText, Link2, ShieldAlert } from "lucide-react";

function iconFor(fileName: string | null) {
  if (!fileName) return FileText;
  if (/\.(png|jpg|jpeg)$/i.test(fileName)) return FileImage;
  if (/\.(xlsx|csv)$/i.test(fileName)) return FileSpreadsheet;
  return FileText;
}

export function EvidencePreview({
  evidenceType,
  evidenceFileName,
  supportingLink,
}: {
  evidenceType: string | null;
  evidenceFileName: string | null;
  supportingLink: string | null;
}) {
  const hasEvidence = evidenceFileName || supportingLink;
  if (!hasEvidence) {
    return (
      <div className="flex items-center gap-2 text-[12.5px] text-warning-600 bg-warning-100 rounded-lg px-3 py-2.5">
        <ShieldAlert size={15} className="shrink-0" /> No evidence attached for this submission.
      </div>
    );
  }
  const Icon = iconFor(evidenceFileName);
  return (
    <div className="space-y-2">
      {evidenceType && <p className="text-[11.5px] text-ink-400">Evidence type: {evidenceType}</p>}
      {evidenceFileName && (
        <div className="flex items-center gap-2 text-[12.5px] text-ink-700 border border-ink-300/25 rounded-lg px-3 py-2 bg-surface/60">
          <Icon size={15} className="text-brand-600 shrink-0" /> {evidenceFileName}
        </div>
      )}
      {supportingLink && (
        <a href={supportingLink} onClick={(e) => e.preventDefault()} className="flex items-center gap-2 text-[12.5px] text-brand-700 border border-ink-300/25 rounded-lg px-3 py-2 hover:bg-surface/60">
          <Link2 size={14} className="shrink-0" /> {supportingLink}
        </a>
      )}
    </div>
  );
}
