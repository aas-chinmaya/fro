"use client";

import { useRouter } from "next/navigation";
import { QuotationForm } from "./quotation-form";
import { FormPageHeader } from "@/modules/sales/shared/components/ui/form-page-header";

export default function QuotationCreatePage() {
  const router = useRouter();

  return (
    <div className=" space-y-6 ">
      <FormPageHeader
        title="New quotation"
         description="Fill in the details to create a quotation"      />
      <QuotationForm
        mode="create"
        onSuccess={(q) => router.push(`/sales/quotations/${q.id}`)}
        onCancel={() => router.push("/sales/quotations")}
      />
    </div>
  );
}
