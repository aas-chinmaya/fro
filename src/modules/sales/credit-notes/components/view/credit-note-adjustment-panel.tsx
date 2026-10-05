"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CreditNoteSettlementType } from "../../types/credit-note.types";

interface Props {
  maxAmount: number;
  onSubmit: (payload: {
    type: CreditNoteSettlementType;
    settlementDate: string;
    amount: number;
    remarks?: string;
  }) => Promise<void>;
  onClose: () => void;
}

export function CreditNoteAdjustmentPanel({
  maxAmount,
  onSubmit,
  onClose,
}: Props) {
  const [type, setType] = useState<CreditNoteSettlementType>("ADJUSTMENT");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState(maxAmount);
  const [remarks, setRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        type,
        settlementDate: date,
        amount: Number(amount) || 0,
        remarks: remarks || undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-800">Settlement</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Type</Label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as CreditNoteSettlementType)}
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="REFUND">Refund</SelectItem>
              <SelectItem value="EXCHANGE">Exchange</SelectItem>
              <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Date</Label>
          <Input
            type="date"
            className="h-9"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Amount</Label>
          <Input
            type="number"
            step="0.01"
            className="h-9"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs text-slate-600">Remarks</Label>
        <Input
          className="h-9"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Optional"
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button type="button" disabled={saving} onClick={() => void submit()}>
          {saving ? "Saving…" : "Confirm"}
        </Button>
      </div>
    </div>
  );
}
