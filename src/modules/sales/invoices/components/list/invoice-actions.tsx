


"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { notify } from "@/lib/toast";
import { useDeleteInvoiceMutation } from "../../api/invoice.api";
import type { InvoiceStatus } from "../../types/invoice.types";

type InvoiceActionsProps = {
  id: string;
  invoiceNumber?: string;
  status?: string | null;
};

const LOCKED_STATUSES = [
  "PAID",
  "CANCELLED",
  "FINALIZED",
];

export default function InvoiceActions({
  id,
  invoiceNumber,
  status,
}: InvoiceActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleteInvoice, { isLoading: isDeleting }] =
    useDeleteInvoiceMutation();

  const normalized = (status || "").toUpperCase() as InvoiceStatus;
  const canEdit = !LOCKED_STATUSES.includes(normalized);
  const canDelete = canEdit;
  const label = invoiceNumber || id;

  const handleDelete = async () => {
    try {
      const res = await deleteInvoice(id).unwrap();
      notify.success(res.message || "Invoice deleted successfully");
      setOpen(false);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string };
      notify.error(
        e?.data?.message || e?.message || "Failed to delete invoice",
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
          aria-label="View invoice"
          title="View invoice"
          onClick={() => router.push(`/sales/invoices/${id}`)}
          className="hover:bg-violet-50 hover:text-violet-600"
        >
          <Eye className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Edit invoice"
          title={
            canEdit
              ? "Edit invoice"
              : `Cannot edit when status is ${normalized || "locked"}`
          }
          disabled={!canEdit}
          onClick={() => {
            if (!canEdit) return;
            router.push(`/sales/invoices/${id}/edit`);
          }}
          className="hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Pencil className="size-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Delete invoice"
          title={
            canDelete
              ? "Delete invoice"
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
        title="Delete invoice?"
        description={`This will permanently delete invoice ${label}. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}