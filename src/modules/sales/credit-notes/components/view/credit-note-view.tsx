"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/toast";
import {
  useGetCreditNoteByIdQuery,
  useRefundCreditNoteMutation,
  useExchangeCreditNoteMutation,
} from "@/modules/sales/credit-notes/api/credit-note.api";
import type {
  CreditNote,
  CreditNoteSettlementType,
  PaymentMethod,
} from "@/modules/sales/credit-notes/types/credit-note.types";
import { generateCreditNotePdf } from "@/modules/sales/credit-notes/lib/credit-note-pdf";
import { useBusiness } from "@/modules/sales/shared/hooks/use-business";
import { CreditNoteViewHeader } from "./header/credit-note-view-header";
import { CreditNoteDocument } from "./preview/credit-note-document";
import { CreditNoteAdjustmentPanel } from "./credit-note-adjustment-panel";

interface CreditNoteViewProps {
  id: string;
}

/** Normalize API note: seller often lives on nested salesInvoice; logo from business. */
function enrichCreditNote(
  raw: CreditNote,
  business: {
    logo?: string | null;
    legalName?: string | null;
    name?: string;
    tradeName?: string | null;
    gstin?: string | null;
    pan?: string | null;
    phone?: string | null;
    email?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
  } | null,
): CreditNote & { businessLogo?: string | null } {
  const inv = (raw as { salesInvoice?: Record<string, unknown> }).salesInvoice;
  const cust = (raw as { customer?: Record<string, unknown> }).customer;

  const pick = (...vals: unknown[]) => {
    for (const v of vals) {
      if (v != null && String(v).trim()) return String(v);
    }
    return null;
  };

  return {
    ...raw,
    businessLogo: pick(business?.logo) as string | null,
    sellerLegalName: pick(
      raw.sellerLegalName,
      inv?.sellerLegalName,
      business?.legalName,
      business?.name,
    ),
    sellerTradeName: pick(
      raw.sellerTradeName,
      inv?.sellerTradeName,
      business?.name,
      business?.tradeName,
    ),
    sellerGSTIN: pick(raw.sellerGSTIN, inv?.sellerGSTIN, business?.gstin),
    sellerPAN: pick(raw.sellerPAN, inv?.sellerPAN, business?.pan),
    sellerPhone: pick(raw.sellerPhone, inv?.sellerPhone, business?.phone),
    sellerAddressLine1: pick(
      raw.sellerAddressLine1,
      inv?.sellerAddressLine1,
      business?.addressLine1,
    ),
    sellerCity: pick(raw.sellerCity, inv?.sellerCity, business?.city),
    sellerState: pick(raw.sellerState, inv?.sellerState, business?.state),
    sellerPincode: pick(
      raw.sellerPincode,
      inv?.sellerPincode,
      business?.pincode,
    ),
    customerName: pick(
      raw.customerName,
      cust?.name,
      cust?.companyName,
      inv?.buyerName,
    ) as string,
    customerPhone: pick(
      raw.customerPhone,
      cust?.mobile,
      inv?.buyerPhone,
    ),
    customerGSTIN: pick(raw.customerGSTIN, cust?.gstin, inv?.buyerGSTIN),
    customerEmail: pick(raw.customerEmail, cust?.email, inv?.buyerEmail),
    billingAddressLine1: pick(
      raw.billingAddressLine1,
      inv?.billingAddressLine1,
    ),
    billingCity: pick(raw.billingCity, inv?.billingCity),
    billingState: pick(raw.billingState, inv?.billingState),
    billingPincode: pick(raw.billingPincode, inv?.billingPincode),
    placeOfSupply: pick(raw.placeOfSupply, inv?.placeOfSupply),
    placeOfSupplyCode: pick(raw.placeOfSupplyCode, inv?.placeOfSupplyCode),
    taxType: (pick(raw.taxType, inv?.taxType) as CreditNote["taxType"]) ||
      raw.taxType,
    salesInvoiceNumber: pick(
      raw.salesInvoiceNumber,
      inv?.invoiceNumber,
    ),
  };
}

export function CreditNoteView({ id }: CreditNoteViewProps) {
  const router = useRouter();
  const stableNote = useRef<CreditNote | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);

  const { data: response, isLoading, isFetching, error: queryError, refetch } =
    useGetCreditNoteByIdQuery(id, { skip: !id });

  const { data: businessCtx } = useBusiness();
  const [refundCreditNote] = useRefundCreditNoteMutation();
  const [exchangeCreditNote] = useExchangeCreditNoteMutation();

  const noteFromQuery = response?.data ?? null;
  if (noteFromQuery) stableNote.current = noteFromQuery;

  const note = stableNote.current
    ? enrichCreditNote(stableNote.current, businessCtx?.business ?? null)
    : null;

  const error = queryError
    ? (queryError as { data?: { message?: string }; message?: string })?.data
        ?.message ||
      (queryError as { message?: string })?.message ||
      "Failed to fetch credit note"
    : null;

  const handleDownload = () => {
    if (!note) return;
    try {
      setPdfBusy(true);
      void generateCreditNotePdf(note);
      notify.success("PDF downloaded");
    } catch (e) {
      console.error(e);
      notify.error("Unable to generate PDF");
    } finally {
      setPdfBusy(false);
    }
  };

  if ((isLoading || isFetching) && !note) {
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
        <h2 className="text-base font-semibold text-slate-800">
          Credit note not found
        </h2>
        <p className="max-w-sm text-center text-sm text-slate-500">
          {error ||
            "This credit note may have been deleted or you don't have access."}
        </p>
        <button
          type="button"
          onClick={() => router.push("/sales/credit-notes")}
          className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          Back to credit notes
        </button>
      </div>
    );
  }

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
      notify.error(err?.data?.message || err?.message || "Settlement failed");
      throw e;
    }
  };

  return (
    <div className="flex w-full flex-col bg-white">
      <CreditNoteViewHeader
        creditNote={note}
        onDownload={handleDownload}
        downloadLoading={pdfBusy}
        canAdjust={canAdjust}
        onAdjust={() => setAdjustOpen(true)}
        onCancelled={() => void refetch()}
      />

      <main className="w-full">
        <CreditNoteDocument creditNote={note} />
      </main>

      <CreditNoteAdjustmentPanel
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        creditNote={note}
        onSubmit={onAdjust}
      />
    </div>
  );
}

export default CreditNoteView;
