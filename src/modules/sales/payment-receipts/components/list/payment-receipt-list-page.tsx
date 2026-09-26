"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/modules/sales/shared/components/ui/page-header";
import PaymentReceiptTable from "./payment-receipt-table";

export default function PaymentReceiptListPage() {
  const router = useRouter();

  return (
    <div className="flex w-full min-w-0 flex-col space-y-6">
      <PageHeader
        title="Payment receipts"
        description="Manage customer payment receipts"
        actionLabel="Create receipt"
        onAction={() => router.push("/sales/payment-receipts/create")}
      />
      <PaymentReceiptTable />
    </div>
  );
}
