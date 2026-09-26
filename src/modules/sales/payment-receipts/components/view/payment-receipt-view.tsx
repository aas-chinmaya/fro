"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Scale } from "lucide-react";

import { Button } from "@/components/ui/button";
import { notify } from "@/lib/toast";
import { useGetPaymentReceiptByIdQuery } from "../../api/payment-receipt.api";
import type { PaymentReceipt } from "../../types/payment-receipt.types";
import ReceiptPreview from "./receipt-preview";
import PaymentAdjustmentDialog from "./payment-adjustment-dialog";

interface Props {
  id: string;
}

export default function PaymentReceiptView({ id }: Props) {
  const router = useRouter();
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const stableReceipt = useRef<PaymentReceipt | null>(null);

  const {
    data: response,
    isLoading,
    isFetching,
    error: queryError,
  } = useGetPaymentReceiptByIdQuery(id);

  const paymentReceipt = response?.data ?? null;
  if (paymentReceipt) {
    stableReceipt.current = paymentReceipt;
  }
  const receipt = stableReceipt.current;

  const error = queryError
    ? (queryError as { data?: { message?: string }; message?: string })?.data
        ?.message ||
      (queryError as { message?: string })?.message ||
      "Failed to fetch payment receipt"
    : null;

  useEffect(() => {
    if (error && !receipt) {
      notify.error(error);
    }
  }, [error, receipt]);

  if ((isLoading || isFetching) && !receipt) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
          <p className="text-sm text-gray-500">Loading receipt…</p>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gray-50">
        <p className="text-sm text-gray-500">Receipt not found</p>
        <button
          type="button"
          onClick={() => router.push("/sales/payment-receipts")}
          className="text-sm text-primary underline underline-offset-2"
        >
          Go back
        </button>
      </div>
    );
  }

  const canAdjust =
    String(receipt.receiptStatus || "").toUpperCase() === "RECEIVED" &&
    String(receipt.adjustmentStatus || "UNADJUSTED").toUpperCase() !==
      "ADJUSTED";

  return (
    <div className="flex min-h-screen w-full flex-col overflow-hidden rounded-lg bg-gray-50">
      {/* Header: Back + title + status + Adjust only */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/sales/payment-receipts")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            title="Back to list"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>Sales</span>
              <span>/</span>
              <span>Payment Receipt</span>
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h1 className="truncate text-sm font-semibold text-gray-900">
                {receipt.receiptNumber ?? "—"}
              </h1>
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-medium text-white">
                {String(receipt.receiptStatus || "RECEIVED").toUpperCase()}
              </span>
              {receipt.adjustmentStatus ? (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                  {String(receipt.adjustmentStatus).replaceAll("_", " ")}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {canAdjust ? (
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={() => setAdjustmentOpen(true)}
            >
              <Scale className="size-3.5" />
              Adjust payment
            </Button>
          ) : null}
        </div>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <ReceiptPreview paymentReceipt={receipt} />
      </main>

      <PaymentAdjustmentDialog
        open={adjustmentOpen}
        onOpenChange={setAdjustmentOpen}
        paymentReceipt={receipt}
      />
    </div>
  );
}
