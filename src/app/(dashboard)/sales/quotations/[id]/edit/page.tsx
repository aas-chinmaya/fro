"use client";

import { use } from "react";
import QuotationEditPage from "@/modules/sales/quotations/components/form/quotation-edit-page";

export default function EditQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <QuotationEditPage id={id} />;
}
