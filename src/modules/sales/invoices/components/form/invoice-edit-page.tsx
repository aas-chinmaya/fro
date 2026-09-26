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

  return (
    <div className=" space-y-6 ">
      <FormPageHeader
        title="Edit invoice"
        description={invoice.invoiceNumber || id}
      />
      <InvoiceForm
        mode="edit"
        invoice={invoice}
        onSuccess={() => router.push("/sales/invoices")}
        onCancel={() => router.push(`/sales/invoices/${id}`)}
      />
    </div>
  );
}
