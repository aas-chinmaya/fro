"use client";

import { useRouter } from "next/navigation";
import { InvoiceForm } from "./invoice-form";
import { FormPageHeader } from "@/modules/sales/shared/components/ui/form-page-header";

export default function InvoiceCreatePage() {
  const router = useRouter();

  return (
    <div className=" space-y-6 ">
      <FormPageHeader
        title="New invoice"
        description="Customer, issuer, items, and payment"
      />
      <InvoiceForm
        mode="create"
        onSuccess={(q) => router.push(`/sales/invoices/${q.id}`)}
        onCancel={() => router.push("/sales/invoices")}
      />
    </div>
  );
}
