"use client";

import { Button } from "@/components/ui/button";
import type { CreditNote } from "../../../types/credit-note.types";
import { statusLabel } from "../../../utils/credit-note.utils";

interface Props {
  note: CreditNote;
  onPdf?: () => void;
  canAdjust?: boolean;
  onAdjust?: () => void;
}

export function CreditNoteViewHeader({
  note,
  onPdf,
  canAdjust,
  onAdjust,
}: Props) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          {note.creditNoteNumber || "Credit note"}
        </h1>
        <p className="text-sm text-slate-500">
          {note.creditNoteDate
            ? new Date(note.creditNoteDate).toLocaleDateString("en-IN")
            : ""}{" "}
          · {statusLabel(note.status)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {canAdjust ? (
          <Button type="button" variant="outline" onClick={onAdjust}>
            Adjust / settle
          </Button>
        ) : null}
        <Button type="button" variant="outline" onClick={onPdf}>
          Download PDF
        </Button>
      </div>
    </div>
  );
}
