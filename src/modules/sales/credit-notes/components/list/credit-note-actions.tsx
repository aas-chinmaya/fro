"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CreditNote } from "../../types/credit-note.types";
import { cancelCreditNote } from "../../api/credit-note.api";

interface Props {
  creditNote: CreditNote;
  onDone?: () => void;
}

export function CreditNoteActions({ creditNote, onDone }: Props) {
  const canCancel = creditNote.status === "ISSUED";

  const onCancel = async () => {
    if (!canCancel) return;
    if (!window.confirm("Cancel this credit note?")) return;
    try {
      await cancelCreditNote(creditNote.id);
      onDone?.();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Cancel failed");
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Button asChild variant="ghost" size="sm" className="h-8 px-2 text-xs">
        <Link href={`/sales/credit-notes/${creditNote.id}`}>View</Link>
      </Button>
      {canCancel ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs text-red-600 hover:text-red-700"
          onClick={() => void onCancel()}
        >
          Cancel
        </Button>
      ) : null}
      <MoreHorizontal className="h-4 w-4 text-slate-300" aria-hidden />
    </div>
  );
}
