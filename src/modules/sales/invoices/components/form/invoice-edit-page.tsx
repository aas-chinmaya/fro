"use client";

import { useRouter } from "next/navigation";
import InvoiceForm from "./invoice-form";
import { useGetInvoiceByIdQuery } from "../../api/invoice.api";
import { FormPageHeader } from "@/modules/sales/shared/components/ui/form-page-header";

export default function InvoiceEditPage({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useGetInvoiceByIdQuery(id);

  if (isLoading) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Loading invoice…
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="py-10 text-center text-sm text-destructive">
        Unable to load invoice.
      </div>
    );
  }

  const invoice = data.data;
  const status = String(invoice.invoiceStatus || "").toUpperCase();
  if (status && status !== "DRAFT") {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-sm text-destructive">
          Only draft invoices can be edited.
        </p>
        <button
          type="button"
          className="text-sm text-primary underline"
          onClick={() => router.push(`/sales/invoices/${id}`)}
        >
          Back to invoice
        </button>
      </div>
    );
  }

  return (
    <div className=" space-y-6 ">
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
