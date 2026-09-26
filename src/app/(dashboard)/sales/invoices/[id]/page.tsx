import { InvoiceView } from "@/modules/sales/invoices/components/view/invoice-view";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvoiceView id={id} />;
}
