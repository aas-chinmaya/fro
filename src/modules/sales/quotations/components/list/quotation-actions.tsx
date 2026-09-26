


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { notify } from "@/lib/toast";
import { useDeleteQuotationMutation } from "../../api/quotation.api";
import type { QuotationStatus } from "../../types/quotation.types";

type QuotationActionsProps = {
  id: string;
  quotationNumber?: string;
  status?: string | null;
};

const LOCKED_STATUSES: QuotationStatus[] = [
  "ACCEPTED",
  "REJECTED",
  "CANCELLED",
  "EXPIRED",
];

export default function QuotationActions({
  id,
  quotationNumber,
  status,
}: QuotationActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteQuotation, { isLoading: isDeleting }] =
    useDeleteQuotationMutation();

  const normalized = (status || "").toUpperCase() as QuotationStatus;
  const canEdit = !LOCKED_STATUSES.includes(normalized);
  const canDelete = canEdit;
  const label = quotationNumber || id;

  const handleDelete = async () => {
    try {
      const res = await deleteQuotation(id).unwrap();
      notify.success(res.message || "Quotation deleted successfully");
      setOpen(false);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string };
      notify.error(
        e?.data?.message || e?.message || "Failed to delete quotation",
      );
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="View quotation"
          title="View quotation"
          onClick={() => router.push(`/sales/quotations/${id}`)}
          className="hover:bg-violet-50 hover:text-violet-600"
        >
          <Eye className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Edit quotation"
          title={
            canEdit
              ? "Edit quotation"
              : `Cannot edit when status is ${normalized || "locked"}`
          }
          disabled={!canEdit}
          onClick={() => {
            if (!canEdit) return;
            router.push(`/sales/quotations/${id}/edit`);
          }}
          className="hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Pencil className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Delete quotation"
          title={
            canDelete
              ? "Delete quotation"
              : `Cannot delete when status is ${normalized || "locked"}`
          }
          disabled={!canDelete || isDeleting}
          onClick={() => setOpen(true)}
          className="hover:bg-red-50 hover:text-red-600 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <ConfirmDialog
        open={open}
        title="Delete quotation?"
        description={`This will permanently delete quotation ${label}. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}