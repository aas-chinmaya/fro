"use client";

import { useState } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCreditNote } from "../../api/credit-note.api";
import type { CreditNoteFormProps, CreditNoteFormValues } from "../../types/credit-note-form.types";
import {
  REASON_OPTIONS,
  applyTotalsToValues,
  emptyLineItem,
  formatINR,
  getDefaultCreditNoteValues,
  mapCreditNoteToFormValues,
  toCreatePayload,
} from "../../utils/credit-note.utils";

export function CreditNoteForm({
  mode,
  creditNote,
  onSuccess,
  onCancel,
}: CreditNoteFormProps) {
  const defaults = creditNote
    ? mapCreditNoteToFormValues(creditNote)
    : getDefaultCreditNoteValues();

  const { register, control, handleSubmit, setValue, getValues } =
    useForm<CreditNoteFormValues>({
      defaultValues: defaults,
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const [roundOffOn, setRoundOffOn] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const taxType = useWatch({ control, name: "taxType" }) || "INTRA_STATE";
  const items = useWatch({ control, name: "items" }) || [];
  const reason = useWatch({ control, name: "reason" });

  const live = applyTotalsToValues(
    { ...getValues(), items, taxType } as CreditNoteFormValues,
    roundOffOn,
  );

  const onSubmit = async (values: CreditNoteFormValues) => {
    setSaving(true);
    setError(null);
    try {
      const withTotals = applyTotalsToValues(values, roundOffOn);
      const payload = toCreatePayload(withTotals);
      const res = await createCreditNote(payload);
      onSuccess?.(res.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const isInter = taxType === "INTER_STATE";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header fields */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Date</Label>
          <Input type="date" className="h-9" {...register("creditNoteDate")} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Reason</Label>
          <Select
            value={reason}
            onValueChange={(v) =>
              setValue("reason", v as CreditNoteFormValues["reason"], {
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Reason" />
            </SelectTrigger>
            <SelectContent>
              {REASON_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Tax type</Label>
          <Select
            value={taxType}
            onValueChange={(v) =>
              setValue("taxType", v as CreditNoteFormValues["taxType"], {
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INTRA_STATE">Intra-state (CGST+SGST)</SelectItem>
              <SelectItem value="INTER_STATE">Inter-state (IGST)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Customer + invoice link */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Customer name</Label>
          <Input className="h-9" {...register("customerName")} placeholder="Customer" />
          <input type="hidden" {...register("customerId")} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Customer ID</Label>
          <Input className="h-9" {...register("customerId")} placeholder="cust-…" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Linked invoice #</Label>
          <Input
            className="h-9"
            {...register("salesInvoiceNumber")}
            placeholder="INV-…"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Invoice ID</Label>
          <Input
            className="h-9"
            {...register("salesInvoiceId")}
            placeholder="Optional"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-600">Phone</Label>
          <Input className="h-9" {...register("customerPhone")} />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-600">GSTIN</Label>
          <Input className="h-9" {...register("customerGSTIN")} />
        </div>
      </div>

      {/* Line items */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Items</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={() => append(emptyLineItem())}
          >
            <Plus className="h-3.5 w-3.5" />
            Add line
          </Button>
        </div>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-2 rounded-md border border-slate-100 bg-slate-50/40 p-3 sm:grid-cols-6"
            >
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-[10px] text-slate-500">Item</Label>
                <Input
                  className="h-8 text-sm"
                  {...register(`items.${index}.itemName`)}
                  placeholder="Item name"
                />
                <input type="hidden" {...register(`items.${index}.productId`)} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-slate-500">Qty</Label>
                <Input
                  type="number"
                  step="any"
                  className="h-8 text-sm"
                  {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-slate-500">Rate</Label>
                <Input
                  type="number"
                  step="any"
                  className="h-8 text-sm"
                  {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-slate-500">GST %</Label>
                <Input
                  type="number"
                  step="any"
                  className="h-8 text-sm"
                  {...register(`items.${index}.gstRate`, { valueAsNumber: true })}
                />
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <Label className="text-[10px] text-slate-500">Line total</Label>
                  <p className="h-8 truncate text-sm tabular-nums leading-8 text-slate-700">
                    ₹{formatINR(live.items?.[index]?.lineTotal || 0)}
                  </p>
                </div>
                {fields.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="ml-auto w-full max-w-sm space-y-2 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Taxable</span>
          <span className="tabular-nums">₹{formatINR(live.taxableAmount || 0)}</span>
        </div>
        {isInter ? (
          <div className="flex justify-between text-slate-600">
            <span>IGST</span>
            <span className="tabular-nums">₹{formatINR(live.igstAmount || 0)}</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-slate-600">
              <span>CGST</span>
              <span className="tabular-nums">₹{formatINR(live.cgstAmount || 0)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>SGST</span>
              <span className="tabular-nums">₹{formatINR(live.sgstAmount || 0)}</span>
            </div>
          </>
        )}
        <div className="flex items-center justify-between text-slate-600">
          <span className="flex items-center gap-2">
            Round off
            <Switch checked={roundOffOn} onCheckedChange={setRoundOffOn} />
          </span>
          <span className="tabular-nums">₹{formatINR(live.roundOffAmount || 0)}</span>
        </div>
        <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
          <span>Grand total</span>
          <span className="tabular-nums">₹{formatINR(live.grandTotal || 0)}</span>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-slate-600">Remarks</Label>
        <Textarea
          className="min-h-[72px] resize-none text-sm"
          {...register("remarks")}
          placeholder="Reason details…"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Create"}
        </Button>
      </div>
    </form>
  );
}
