"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  adjustCreditNote,
  fetchCreditNoteById,
} from "../../api/credit-note.api";
import type {
  CreditNote,
  CreditNoteSettlementType,
} from "../../types/credit-note.types";
import {
  formatINR,
  reasonLabel,
  statusLabel,
} from "../../utils/credit-note.utils";
import { downloadCreditNotePdf } from "../../lib/credit-note-pdf";
import { CreditNoteViewHeader } from "./header/credit-note-view-header";
import { CreditNoteAdjustmentPanel } from "./credit-note-adjustment-panel";

interface Props {
  id: string;
}

export function CreditNoteView({ id }: Props) {
  const [note, setNote] = useState<CreditNote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [adjustOpen, setAdjustOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCreditNoteById(id);
      setNote(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <p className="p-6 text-sm text-slate-400">Loading…</p>;
  }
  if (error || !note) {
    return <p className="p-6 text-sm text-red-600">{error || "Not found"}</p>;
  }

  const isInter = note.taxType === "INTER_STATE";
  const canAdjust = note.status === "ISSUED";

  const onAdjust = async (payload: {
    type: CreditNoteSettlementType;
    settlementDate: string;
    amount: number;
    remarks?: string;
  }) => {
    await adjustCreditNote(id, payload);
    setAdjustOpen(false);
    await load();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <CreditNoteViewHeader
        note={note}
        onPdf={() => downloadCreditNotePdf(note)}
        canAdjust={canAdjust}
        onAdjust={() => setAdjustOpen(true)}
      />

      {/* Meta */}
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs text-slate-400">Customer</p>
          <p className="font-medium text-slate-800">{note.customerName}</p>
          {note.customerGSTIN ? (
            <p className="text-xs text-slate-500">GSTIN: {note.customerGSTIN}</p>
          ) : null}
        </div>
        <div>
          <p className="text-xs text-slate-400">Linked invoice</p>
          <p className="text-slate-800">{note.salesInvoiceNumber || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Reason</p>
          <p className="text-slate-800">{reasonLabel(note.reason)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Status</p>
          <p className="text-slate-800">{statusLabel(note.status)}</p>
        </div>
      </div>

      {/* Items */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-3 py-2 font-medium">Item</th>
              <th className="px-3 py-2 font-medium text-right">Qty</th>
              <th className="px-3 py-2 font-medium text-right">Rate</th>
              <th className="px-3 py-2 font-medium text-right">Taxable</th>
              <th className="px-3 py-2 font-medium text-right">Tax</th>
              <th className="px-3 py-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(note.items || []).map((it, i) => {
              const tax =
                (it.cgstAmount || 0) +
                (it.sgstAmount || 0) +
                (it.igstAmount || 0);
              return (
                <tr key={it.id || i} className="border-b border-slate-50">
                  <td className="px-3 py-2">
                    <div className="font-medium text-slate-800">
                      {it.itemName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {it.hsnSacCode || it.itemCode || ""}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {it.quantity}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatINR(it.unitPrice)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatINR(it.taxableAmount || 0)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatINR(tax)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatINR(it.lineTotal || 0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="ml-auto w-full max-w-xs space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Taxable</span>
          <span className="tabular-nums">₹{formatINR(note.taxableAmount)}</span>
        </div>
        {isInter ? (
          <div className="flex justify-between text-slate-600">
            <span>IGST</span>
            <span className="tabular-nums">₹{formatINR(note.igstAmount)}</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-slate-600">
              <span>CGST</span>
              <span className="tabular-nums">₹{formatINR(note.cgstAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>SGST</span>
              <span className="tabular-nums">₹{formatINR(note.sgstAmount)}</span>
            </div>
          </>
        )}
        {note.roundOffAmount ? (
          <div className="flex justify-between text-slate-600">
            <span>Round off</span>
            <span className="tabular-nums">
              ₹{formatINR(note.roundOffAmount)}
            </span>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
          <span>Grand total</span>
          <span className="tabular-nums">₹{formatINR(note.grandTotal)}</span>
        </div>
      </div>

      {note.remarks ? (
        <div>
          <p className="text-xs text-slate-400">Remarks</p>
          <p className="text-sm text-slate-700">{note.remarks}</p>
        </div>
      ) : null}

      {note.creditNoteSettlement ? (
        <div className="rounded-md border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-sm">
          <p className="font-medium text-emerald-800">Settlement</p>
          <p className="text-emerald-700">
            {note.creditNoteSettlement.type} · ₹
            {formatINR(note.creditNoteSettlement.amount)} ·{" "}
            {note.creditNoteSettlement.status}
          </p>
        </div>
      ) : null}

      {adjustOpen ? (
        <CreditNoteAdjustmentPanel
          maxAmount={note.grandTotal}
          onSubmit={onAdjust}
          onClose={() => setAdjustOpen(false)}
        />
      ) : null}

      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/sales/credit-notes">Back to list</Link>
        </Button>
      </div>
    </div>
  );
}
