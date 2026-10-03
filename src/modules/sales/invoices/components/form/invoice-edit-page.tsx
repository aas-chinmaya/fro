"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, FileX2, Lock } from "lucide-react";
import InvoiceForm from "./invoice-form";
import { useGetInvoiceByIdQuery } from "../../api/invoice.api";
import { FormPageHeader } from "@/modules/sales/shared/components/ui/form-page-header";
import { Button } from "@/components/ui/button";

export default function InvoiceEditPage({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useGetInvoiceByIdQuery(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
          <p className="text-sm text-slate-500">Loading invoice…</p>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 bg-white px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <FileX2 className="h-7 w-7 text-slate-400" />
        </div>
        <div className="text-center">
          <h2 className="text-base font-semibold text-slate-800">
            Invoice not found
          </h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            This invoice may have been deleted or you don’t have access to it.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-1.5"
          onClick={() => router.push("/sales/invoices")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to invoices
        </Button>
      </div>
    );
  }

  const invoice = data.data;
  const status = String(invoice.invoiceStatus || "").toUpperCase();
  if (status && status !== "DRAFT") {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 bg-white px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
          <Lock className="h-7 w-7 text-amber-600" />
        </div>
        <div className="text-center">
          <h2 className="text-base font-semibold text-slate-800">
            Editing not allowed
          </h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Only draft invoices can be edited. This invoice is{" "}
            <span className="font-medium text-slate-700">
              {status.replaceAll("_", " ").toLowerCase()}
            </span>
            .
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            onClick={() => router.push("/sales/invoices")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to invoices
          </Button>
          <Button
            type="button"
            onClick={() => router.push(`/sales/invoices/${id}`)}
          >
            View invoice
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FormPageHeader
        title="Edit invoice"
        description={invoice.invoiceNumber || id}
      />
      <InvoiceForm
        mode="edit"
        invoice={invoice}
        onSuccess={() => {
          router.push("/sales/invoices");
        }}
        onCancel={() => router.push(`/sales/invoices/${id}`)}
      />
    </div>
  );
}
