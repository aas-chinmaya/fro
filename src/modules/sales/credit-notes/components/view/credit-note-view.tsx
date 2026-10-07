"use client";

import { useState } from "react";
import { notify } from "@/lib/toast";
import {
  useGetCreditNoteByIdQuery,
  useRefundCreditNoteMutation,
  useExchangeCreditNoteMutation,
} from "../../api/credit-note.api";
import type {
  CreditNoteSettlementType,
  PaymentMethod,
} from "../../types/credit-note.types";
import {
  formatINR,
  reasonLabel,
} from "../../utils/credit-note.utils";
import { downloadCreditNotePdf } from "../../lib/credit-note-pdf";
import { CreditNoteViewHeader } from "./header/credit-note-view-header";
import { CreditNoteAdjustmentPanel } from "./credit-note-adjustment-panel";

interface CreditNoteViewProps {
  id: string;
}

export function CreditNoteView({ id }: CreditNoteViewProps) {
  const { data, isLoading, isError, error, refetch } =
    useGetCreditNoteByIdQuery(id);
  const [refundCreditNote] = useRefundCreditNoteMutation();
  const [exchangeCreditNote] = useExchangeCreditNoteMutation();

  const [pdfBusy, setPdfBusy] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);

  const note = data?.data ?? null;
  const errorMessage =
    isError
      ? ((error as { data?: { message?: string }; message?: string })?.data
          ?.message ||
          (error as { message?: string })?.message ||
          "Failed to load")
      : null;

  const handleDownload = () => {
    if (!note) return;
    try {
      setPdfBusy(true);
      void downloadCreditNotePdf(note);
      notify.success("PDF downloaded");
    } catch {
      notify.error("Unable to generate PDF");
    } finally {
      setPdfBusy(false);
    }
  };

  if (isLoading && !note) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-primary" />
          <p className="text-sm text-slate-500">Loading credit note…</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 bg-white px-4">
        <p className="text-sm text-slate-500">
          {errorMessage || "Credit note not found"}
        </p>
      </div>
    );
  }

  const isInter = note.taxType === "INTER_STATE";
  const canAdjust = note.status === "ISSUED";

  const onAdjust = async (payload: {
    type: CreditNoteSettlementType;
    settlementDate: string;
    amount: number;
    remarks?: string;
    paymentMethod?: PaymentMethod;
    transactionReference?: string;
  }) => {
    try {
      if (payload.type === "REFUND") {
        await refundCreditNote({
          id,
          data: {
            paymentMethod: payload.paymentMethod || "CASH",
            paymentDate: payload.settlementDate,
            transactionReference: payload.transactionReference,
            remarks: payload.remarks,
          },
        }).unwrap();
        notify.success("Credit note refunded successfully");
      } else if (payload.type === "EXCHANGE") {
        await exchangeCreditNote({
          id,
          data: { remarks: payload.remarks },
        }).unwrap();
        notify.success("Credit note exchanged successfully");
      } else {
        notify.error("Invoice adjustment is not available yet");
        return;
      }
      setAdjustOpen(false);
      void refetch();
    } catch (e) {
      const err = e as { data?: { message?: string }; message?: string };
      notify.error(
        err?.data?.message || err?.message || "Settlement failed",
      );
      throw e;
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col bg-white">
      <CreditNoteViewHeader
        creditNote={note}
        onDownload={handleDownload}
        downloadLoading={pdfBusy}
        canAdjust={canAdjust}
        onAdjust={() => setAdjustOpen(true)}
        onCancelled={() => void refetch()}
      />

      <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
        <div className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="font-medium text-slate-900">{note.customerName}</p>
            {note.customerGSTIN ? (
              <p className="text-xs text-slate-500">
                GSTIN: {note.customerGSTIN}
              </p>
            ) : null}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Linked invoice</p>
            <p className="text-slate-800">{note.salesInvoiceNumber || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Reason</p>
            <p className="text-slate-800">{reasonLabel(note.reason)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="text-slate-800">
              {note.creditNoteDate
                ? new Date(note.creditNoteDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2.5 font-medium">Item</th>
                <th className="px-3 py-2.5 text-right font-medium">Qty</th>
                <th className="px-3 py-2.5 text-right font-medium">Rate</th>
                <th className="px-3 py-2.5 text-right font-medium">Taxable</th>
                <th className="px-3 py-2.5 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {(note.items || []).map((it, i) => (
                <tr
                  key={it.id || i}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-slate-800">{it.itemName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {it.hsnSacCode || it.itemCode || ""}
                    </p>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {it.quantity}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatINR(it.unitPrice)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums">
                    {formatINR(it.taxableAmount || 0)}
                  </td>
                  <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                    {formatINR(it.lineTotal || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto w-full max-w-xs space-y-1.5 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Taxable</span>
            <span className="tabular-nums">
              ₹{formatINR(note.taxableAmount)}
            </span>
          </div>
          {isInter ? (
            <div className="flex justify-between text-slate-600">
              <span>IGST</span>
              <span className="tabular-nums">
                ₹{formatINR(note.igstAmount)}
              </span>
            </div>
          ) : (
            <>
              <div className="flex justify-between text-slate-600">
                <span>CGST</span>
                <span className="tabular-nums">
                  ₹{formatINR(note.cgstAmount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>SGST</span>
                <span className="tabular-nums">
                  ₹{formatINR(note.sgstAmount)}
                </span>
              </div>
            </>
          )}
          {Number(note.roundOffAmount) !== 0 ? (
            <div className="flex justify-between text-slate-600">
              <span>Round off</span>
              <span className="tabular-nums">
                ₹{formatINR(note.roundOffAmount)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
            <span>Grand total</span>
            <span className="tabular-nums">
              ₹{formatINR(note.grandTotal)}
            </span>
          </div>
        </div>

        {note.remarks ? (
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
            <p className="text-xs font-medium text-slate-500">Remarks</p>
            <p className="mt-1">{note.remarks}</p>
          </div>
        ) : null}

        {note.creditNoteSettlement ? (
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-sm">
            <p className="text-xs font-medium text-emerald-700">Settlement</p>
            <p className="mt-1 text-slate-800">
              {(
                note.creditNoteSettlement.settlementType ||
                note.creditNoteSettlement.type ||
                ""
              ).toString()}{" "}
              · ₹
              {formatINR(
                Number(note.creditNoteSettlement.amount ?? note.grandTotal),
              )}
            </p>
          </div>
        ) : null}

        {adjustOpen ? (
          <CreditNoteAdjustmentPanel
            maxAmount={Number(note.grandTotal) || 0}
            onSubmit={onAdjust}
            onClose={() => setAdjustOpen(false)}
          />
        ) : null}
      </div>
    </div>
  );
}
