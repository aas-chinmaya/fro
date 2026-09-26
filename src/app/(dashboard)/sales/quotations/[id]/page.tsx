import { QuotationView } from "@/modules/sales/quotations/components/view/quotation-view";

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuotationView id={id} />;
}
