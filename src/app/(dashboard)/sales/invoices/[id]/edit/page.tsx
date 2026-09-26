"use client";

import { use } from "react";
import InvoiceEditPage from "@/modules/sales/invoices/components/form/invoice-edit-page";

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <InvoiceEditPage id={id} />;
}
