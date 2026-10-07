"use client";

import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

type CreditNoteActionsProps = {
  id: string;
};

/** List page: view only (cancel lives on view page). */
export default function CreditNoteActions({ id }: CreditNoteActionsProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-end">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="View credit note"
        title="View credit note"
        onClick={() => router.push(`/sales/credit-notes/${id}`)}
        className="hover:bg-violet-50 hover:text-violet-600"
      >
        <Eye className="size-4" />
      </Button>
    </div>
  );
}
