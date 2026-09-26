"use client";

import { use } from "react";
import PaymentReceiptView from "@/modules/sales/payment-receipts/components/view/payment-receipt-view";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <PaymentReceiptView id={id} />;
}
