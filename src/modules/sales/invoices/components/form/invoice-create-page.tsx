"use client";

import { useRouter } from "next/navigation";
import InvoiceForm from "./invoice-form";
import { FormPageHeader } from "@/modules/sales/shared/components/ui/form-page-header";

export default function InvoiceCreatePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <FormPageHeader
        title="Create invoice"
        description="Fill in customer, items, and payment details"
      />
      <InvoiceForm
        mode="create"
        onSuccess={() => {
          router.push("/sales/invoices");
        }}
        onCancel={() => router.push("/sales/invoices")}
      />
    </div>
  );
}
