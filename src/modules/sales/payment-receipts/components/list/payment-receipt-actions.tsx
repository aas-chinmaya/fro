"use client";

import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaymentReceiptActions({ id }: { id: string }) {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="View receipt"
      title="View"
      onClick={() => router.push(`/sales/payment-receipts/${id}`)}
      className="text-slate-500 hover:bg-slate-100 hover:text-slate-900"
    >
      <Eye className="h-4 w-4" />
    </Button>
  );
}
