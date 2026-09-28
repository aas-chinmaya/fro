"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { notify } from "@/lib/toast";

import { useGetInvoicesQuery } from "@/modules/sales/invoices/api/invoice.api";
import { useCreatePaymentAdjustmentMutation } from "../../api/payment-adjustment.api";
import type {
  PaymentReceipt,
  PaymentAdjustmentPayload,
} from "../../types/payment-receipt.types";
import {
  LIMITS,
  sanitizeNotesInput,
  sanitizeLiveText,
} from "../../schemas/payment-receipt.schema";

interface PaymentAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentReceipt: PaymentReceipt;
}

function formatInr(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function PaymentAdjustmentDialog({
  open,
  onOpenChange,
  paymentReceipt,
}: PaymentAdjustmentDialogProps) {
  const receiptAmount = Number(paymentReceipt.amount) || 0;

  const customerId =
    paymentReceipt.customerId ||
    paymentReceipt.customer?.id ||
    "";

  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [invoiceFocused, setInvoiceFocused] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"ADVANCE" | "INSTALLMENT">(
    "ADVANCE",
  );
  const [remarks, setRemarks] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");

  /** Only this customer's invoices — pass customerId to list API */
  const {
    data: invoiceResponse,
    isLoading: invoicesLoading,
    isFetching: invoicesFetching,
    refetch: refetchInvoices,
  } = useGetInvoicesQuery(
    {
      page: 1,
      limit: 100,
      // Backend filters by customer when provided
      customerId: customerId || undefined,
      search: invoiceQuery.trim() || undefined,
    } as {
      page: number;
      limit: number;
      customerId?: string;
      search?: string;
    },
    { skip: !open || !customerId },
  );

  const invoices = useMemo(() => {
    const list = invoiceResponse?.data ?? [];
    // Client-side safety filter: only this customer
    if (!customerId) return [];
    return list.filter((inv) => {
      const invCustomer =
        (inv as { customerId?: string; buyerId?: string }).customerId ||
        (inv as { customerId?: string; buyerId?: string }).buyerId ||
        "";
      // If API already filtered, keep all; if row has customerId mismatch, drop
      if (!invCustomer) return true;
      return String(invCustomer) === String(customerId);
    });
  }, [invoiceResponse?.data, customerId]);

  const [createAdjustment, { isLoading: adjustmentLoading }] =
    useCreatePaymentAdjustmentMutation();

  const resetForm = () => {
    setInvoiceQuery("");
    setDocumentId("");
    setDocumentNumber("");
    setAdjustmentType("ADVANCE");
    setRemarks("");
    setInvoiceFocused(false);
  };

  useEffect(() => {
    if (open) {
      resetForm();
      if (customerId) {
        void refetchInvoices();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customerId]);

  const matchingInvoices = useMemo(() => {
    const q = (invoiceQuery || "").trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter((inv) => {
      const num = String(
        (inv as { invoiceNumber?: string }).invoiceNumber || inv.id || "",
      ).toLowerCase();
      const name = String(
        (inv as { buyerName?: string; customerName?: string }).buyerName ||
          (inv as { customerName?: string }).customerName ||
          "",
      ).toLowerCase();
      return num.includes(q) || name.includes(q) || String(inv.id).toLowerCase().includes(q);
    });
  }, [invoiceQuery, invoices]);

  const selectInvoice = (inv: (typeof invoices)[number]) => {
    const pending = Number(
      (inv as { pendingAmount?: number }).pendingAmount ??
        (inv as { balanceDue?: number }).balanceDue ??
        (inv as { grandTotal?: number }).grandTotal ??
        0,
    );

    if (pending > 0 && pending < receiptAmount) {
      notify.error(
        "This invoice cannot fully settle the cash receipt amount",
      );
      return;
    }

    setDocumentId(String(inv.id));
    setDocumentNumber(
      String(
        (inv as { invoiceNumber?: string }).invoiceNumber || inv.id,
      ),
    );
    setInvoiceQuery(
      String(
        (inv as { invoiceNumber?: string }).invoiceNumber || inv.id,
      ),
    );
    setInvoiceFocused(false);
  };

  const clearInvoice = () => {
    setDocumentId("");
    setDocumentNumber("");
    setInvoiceQuery("");
  };

  const handleSubmit = async () => {
    try {
      if (!customerId) {
        notify.error("Customer is missing on this receipt");
        return;
      }
      if (!documentId) {
        notify.error("Please select an invoice");
        return;
      }

      const payload: PaymentAdjustmentPayload = {
        tenantId: paymentReceipt.tenantId || undefined,
        branchId: paymentReceipt.branchId || undefined,
        customerId,
        paymentId:
          paymentReceipt.paymentId || paymentReceipt.payment?.id || undefined,
        documentType: "SALES_INVOICE",
        documentId,
        documentNumber,
        amount: receiptAmount,
        adjustmentType,
        adjustmentDate: new Date().toISOString(),
        remarks: sanitizeNotesInput(remarks, LIMITS.REMARKS) || undefined,
        createdBy: paymentReceipt.createdBy,
      };

      await createAdjustment(payload).unwrap();
      notify.success("Payment adjustment created successfully");
      onOpenChange(false);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string }; message?: string };
      notify.error(
        e?.data?.message || e?.message || "Failed to create adjustment",
      );
    }
  };

  const loadingInvoices = invoicesLoading || invoicesFetching;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm gap-0 p-0">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="text-sm font-semibold">
            Payment Adjustment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 px-4 py-4">
          <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              Cash received
            </p>
            <p className="mt-0.5 text-base font-semibold text-slate-900">
              ₹ {formatInr(receiptAmount)}
            </p>
            {paymentReceipt.customerName ? (
              <p className="mt-1 truncate text-xs text-slate-500">
                Customer: {paymentReceipt.customerName}
              </p>
            ) : null}
          </div>

          {!customerId ? (
            <p className="text-xs text-red-500">
              This receipt has no customer linked. Cannot load invoices.
            </p>
          ) : null}

          {/* Invoice — only this customer's */}
          <div className="space-y-1.5">
            <Label className="text-xs">
              Invoice <span className="text-red-500">*</span>
            </Label>

            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />

              <Input
                value={invoiceQuery}
                onFocus={() => setInvoiceFocused(true)}
                onBlur={() => setTimeout(() => setInvoiceFocused(false), 150)}
                onChange={(e) => {
                  setInvoiceQuery(e.target.value);
                  setInvoiceFocused(true);
                }}
                placeholder="Search this customer’s invoices…"
                className="h-9 pl-8 pr-7 text-sm"
                disabled={adjustmentLoading || !customerId}
              />

              {invoiceQuery && !adjustmentLoading ? (
                <button
                  type="button"
                  onClick={clearInvoice}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}

              {invoiceFocused && customerId ? (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[220px] overflow-y-auto rounded-md border bg-white p-1 shadow-lg">
                  {loadingInvoices ? (
                    <div className="flex items-center gap-2 px-2 py-2 text-xs text-slate-500">
                      <Loader2 className="size-3 animate-spin" />
                      Loading invoices…
                    </div>
                  ) : matchingInvoices.length ? (
                    matchingInvoices.map((inv) => {
                      const isSelected = String(documentId) === String(inv.id);
                      const totalAmount = Number(
                        (inv as { grandTotal?: number }).grandTotal ??
                          (inv as { totalAmount?: number }).totalAmount ??
                          0,
                      );
                      const pendingAmount = Number(
                        (inv as { pendingAmount?: number }).pendingAmount ??
                          (inv as { balanceDue?: number }).balanceDue ??
                          totalAmount,
                      );
                      const eligible =
                        pendingAmount <= 0 || pendingAmount >= receiptAmount;

                      return (
                        <button
                          key={inv.id}
                          type="button"
                          onClick={() => eligible && selectInvoice(inv)}
                          disabled={!eligible}
                          className={`flex w-full items-start justify-between gap-2 rounded px-2.5 py-2 text-left text-xs transition-colors ${
                            !eligible
                              ? "cursor-not-allowed opacity-60"
                              : isSelected
                                ? "bg-violet-50"
                                : "cursor-pointer hover:bg-slate-50"
                          }`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5">
                              <span className="truncate font-medium">
                                {(inv as { invoiceNumber?: string })
                                  .invoiceNumber || inv.id}
                              </span>
                              <span
                                className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                                  eligible
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-600"
                                }`}
                              >
                                {eligible ? "Eligible" : "Not eligible"}
                              </span>
                            </span>
                            <span className="mt-0.5 block text-[10px] text-slate-500">
                              Total: ₹ {formatInr(totalAmount)}
                              {" · "}
                              Pending: ₹ {formatInr(pendingAmount)}
                            </span>
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-2 py-3 text-center text-xs text-slate-500">
                      No invoices found for this customer
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Type */}
          <div className="space-y-1.5">
            <Label className="text-xs">Type</Label>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="adjustmentType"
                  value="ADVANCE"
                  checked={adjustmentType === "ADVANCE"}
                  onChange={() => setAdjustmentType("ADVANCE")}
                  disabled={adjustmentLoading}
                  className="size-3.5"
                />
                Advance
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="adjustmentType"
                  value="INSTALLMENT"
                  checked={adjustmentType === "INSTALLMENT"}
                  onChange={() => setAdjustmentType("INSTALLMENT")}
                  disabled={adjustmentLoading}
                  className="size-3.5"
                />
                Installment
              </label>
            </div>
          </div>

          {/* Remarks — typable/pasteable, soft live sanitize */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Remarks</Label>
              <span className="text-[10px] text-slate-400">
                {remarks.length}/{LIMITS.REMARKS}
              </span>
            </div>
            <Textarea
              placeholder="Optional remarks (plain text)…"
              value={remarks}
              onChange={(e) => {
                setRemarks(
                  sanitizeLiveText(e.target.value, LIMITS.REMARKS, true),
                );
              }}
              onPaste={(e) => {
                e.preventDefault();
                const pasted = e.clipboardData.getData("text") || "";
                setRemarks(
                  sanitizeLiveText(remarks + pasted, LIMITS.REMARKS, true),
                );
              }}
              maxLength={LIMITS.REMARKS}
              rows={2}
              className="resize-none text-sm"
              disabled={adjustmentLoading}
            />
          </div>
        </div>

        <DialogFooter className="border-t px-4 py-2.5">
          <Button
            variant="outline"
            onClick={resetForm}
            disabled={adjustmentLoading}
            className="h-8 text-sm"
          >
            Reset
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={adjustmentLoading || !documentId || !customerId}
            className="h-8 min-w-[100px] text-sm"
          >
            {adjustmentLoading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="size-3.5 animate-spin" />
                Saving…
              </span>
            ) : (
              "Adjust"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
