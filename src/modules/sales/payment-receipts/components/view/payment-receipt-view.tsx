"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileDown, Scale } from "lucide-react";

import { Button } from "@/components/ui/button";
import { notify } from "@/lib/toast";
import { useGetPaymentReceiptByIdQuery } from "../../api/payment-receipt.api";
import type { PaymentReceipt } from "../../types/payment-receipt.types";
import ReceiptPreview from "./receipt-preview";
import PaymentAdjustmentDialog from "./payment-adjustment-dialog";
import { generatePaymentReceiptPdf } from "../../lib/payment-receipt-pdf";
import { useBusiness } from "@/modules/sales/shared/hooks/use-business";

interface Props {
  id: string;
}

export default function PaymentReceiptView({ id }: Props) {
  const router = useRouter();
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const stableReceipt = useRef<PaymentReceipt | null>(null);

  const {
    data: response,
    isLoading,
    isFetching,
    error: queryError,
  } = useGetPaymentReceiptByIdQuery(id);

  const { data: businessCtx } = useBusiness();

  const paymentReceipt = response?.data ?? null;
  if (paymentReceipt) {
    stableReceipt.current = paymentReceipt;
  }

  // Same logo source for view page + PDF (from business context) — mirrors invoice
  const logoFromBusiness = businessCtx?.business?.logo?.trim() || null;
  const businessName =
    businessCtx?.business?.name?.trim() ||
    businessCtx?.business?.legalName?.trim() ||
    null;
  const receipt = stableReceipt.current
    ? {
        ...stableReceipt.current,
        businessLogo:
          logoFromBusiness ||
          stableReceipt.current.businessLogo ||
          null,
        businessName:
          businessName ||
          stableReceipt.current.businessName ||
          null,
      }
    : null;

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
      <div className="flex min-h-[40vh] w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
          <p className="text-sm text-gray-500">Loading receipt…</p>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="flex min-h-[40vh] w-full flex-col items-center justify-center gap-3 bg-white">
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

  const handleDownloadPdf = () => {
    try {
      setPdfBusy(true);
      generatePaymentReceiptPdf(receipt);
      notify.success("PDF downloaded");
    } catch {
      notify.error("Unable to generate PDF");
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div className="flex w-full flex-col bg-white">
      {/* Header — single row, tight, no gap to preview */}
      <div className="flex h-12 w-full shrink-0 items-center justify-between gap-2 border-b border-gray-200 px-3 sm:h-14 sm:px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/sales/payment-receipts")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            title="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <p className="hidden text-[11px] text-gray-500 sm:block">
              Sales / Payment Receipt
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <h1 className="truncate text-sm font-semibold text-gray-900">
                {receipt.receiptNumber ?? "—"}
              </h1>
              <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {String(receipt.receiptStatus || "RECEIVED").toUpperCase()}
              </span>
              {receipt.adjustmentStatus ? (
                <span className="hidden rounded-full bg-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-white sm:inline">
                  {String(receipt.adjustmentStatus).replaceAll("_", " ")}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* 2 solid-color buttons — icon-only on mobile, icon+label on sm+ */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            size="sm"
            disabled={pdfBusy}
            onClick={handleDownloadPdf}
            className="gap-1.5 bg-red-700  text-white hover:bg-red-600 "
            title="Download PDF"
          >
            <FileDown className="size-3.5 shrink-0" />
            <span className="hidden sm:inline">
              {pdfBusy ? "Downloading…" : "Download PDF"}
            </span>
          </Button>

          {canAdjust ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setAdjustmentOpen(true)}
              className=" gap-1.5 bg-primary  text-white  "
              title="Adjust payment"
            >
              <Scale className="size-3.5 shrink-0" />
              <span className="hidden sm:inline">Adjust payment</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Preview — full width, no max-w, no outer padding gap */}
      <main className="w-full">
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
