"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface CreditNoteFormActionsProps {
  isSubmitting: boolean;
  onCancel?: () => void;
}

export function CreditNoteFormActions({
  isSubmitting,
  onCancel,
}: CreditNoteFormActionsProps) {
  return (
    <div className="sticky bottom-0 z-10 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {onCancel ? (
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={onCancel}
              className="gap-1.5 text-slate-600"
            >
              <ArrowLeft className="size-4" />
              Back
            </Button>
          ) : null}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Saving…" : "Create credit note"}
        </Button>
      </div>
    </div>
  );
}
