"use client";

import { useRouter } from "next/navigation";
import QuotationForm from "./quotation-form";
import { useGetQuotationByIdQuery } from "../../api/quotation.api";
import { FormPageHeader } from "@/modules/sales/shared/components/ui/form-page-header";

export default function QuotationEditPage({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading, isError } = useGetQuotationByIdQuery(id);

  if (isLoading) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Loading quotation…
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="py-10 text-center text-sm text-destructive">
        Unable to load quotation.
      </div>
    );
  }

  const quotation = data.data;

  return (
    <div className=" space-y-6 ">
      <FormPageHeader
        title="Edit quotation"
        description={quotation.quotationNumber || id}
      />
      <QuotationForm
        mode="edit"
        quotation={quotation}
        onSuccess={() => router.push("/sales/quotations")}
        onCancel={() => router.push(`/sales/quotations/${id}`)}
      />
    </div>
  );
}
