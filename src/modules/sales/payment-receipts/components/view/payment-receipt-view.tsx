"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useGetPaymentReceiptByIdQuery } from "../../api/payment-receipt.api";

interface Props {
  id: string;
}

function formatDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatINR(n: number) {
  return `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PaymentReceiptView({ id }: Props) {
  const router = useRouter();
  const { data: response, isLoading, error } = useGetPaymentReceiptByIdQuery(id, {
    skip: !id,
  });

  const receipt =
    response && typeof response === "object" && "data" in response
      ? (response as { data: NonNullable<typeof response> extends { data: infer D } ? D : never }).data
      : null;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2">
        <p className="text-sm text-red-600">
          {(error as { data?: { message?: string } })?.data?.message ||
            "Receipt not found"}
        </p>
        <button
          type="button"
          className="text-sm text-primary underline"
          onClick={() => router.back()}
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-col">
      <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3 sm:h-14 sm:px-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-slate-900">
            {receipt.receiptNumber || "Payment receipt"}
          </h1>
          <p className="truncate text-[11px] text-slate-500">
            {receipt.receiptStatus} · {receipt.customerName}
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto bg-slate-50 p-4 sm:p-6">
        <div className="mx-auto max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="text-center">
            <h2 className="text-base font-bold tracking-wide text-slate-900">
              PAYMENT RECEIPT
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {formatDate(receipt.receiptDate)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Receipt no.
              </p>
              <p className="mt-0.5 font-medium text-slate-900">
                {receipt.receiptNumber || "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Financial year
              </p>
              <p className="mt-0.5 font-medium text-slate-900">
                {receipt.financialYear || "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Customer
              </p>
              <p className="mt-0.5 font-medium text-slate-900">
                {receipt.customerName}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Method
              </p>
              <p className="mt-0.5 font-medium text-slate-900">
                {receipt.paymentMethod || "—"}
              </p>
            </div>
            {receipt.transactionReference ? (
              <div className="col-span-2">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Reference
                </p>
                <p className="mt-0.5 font-medium text-slate-900">
                  {receipt.transactionReference}
                </p>
              </div>
            ) : null}
            {receipt.notes ? (
              <div className="col-span-2">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  Notes
                </p>
                <p className="mt-0.5 text-slate-700">{receipt.notes}</p>
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm text-slate-600">Amount</span>
            <span className="text-lg font-bold text-slate-900">
              {formatINR(Number(receipt.amount))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
