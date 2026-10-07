import type {
  CreditNote,
  CreditNoteReason,
  CreditNoteStatus,
  TaxType,
} from "../types/credit-note.types";
import type {
  CreditNoteFormValues,
  CreditNoteItemFormValues,
} from "../types/credit-note-form.types";

export const REASON_OPTIONS: { value: CreditNoteReason; label: string }[] = [
  { value: "SALES_RETURN", label: "Sales return" },
  { value: "PRICE_ADJUSTMENT", label: "Price adjustment" },
  { value: "POST_SALE_DISCOUNT", label: "Post-sale discount" },
  { value: "TAX_ADJUSTMENT", label: "Tax adjustment" },
  { value: "RATE_DIFFERENCE", label: "Rate difference" },
  { value: "BILLING_CORRECTION", label: "Billing correction" },
  { value: "OTHER", label: "Other" },
];

export const STATUS_OPTIONS: { value: CreditNoteStatus; label: string }[] = [
  { value: "ISSUED", label: "Issued" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "EXCHANGED", label: "Exchanged" },
  { value: "ADJUSTED", label: "Adjusted" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function formatINR(value: number) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function reasonLabel(reason?: string | null) {
  return REASON_OPTIONS.find((r) => r.value === reason)?.label || reason || "—";
}

export function statusLabel(status?: string | null) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label || status || "—";
}

export function resolveFinancialYear(dateStr?: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  return m >= 4 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

function num(v: unknown) {
  return Number(v) || 0;
}

export function sanitizePlainText(raw: unknown, maxLen = 1000): string {
  return String(raw ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/javascript\s*:/gi, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

export function emptyLineItem(): CreditNoteItemFormValues {
  return {
    productId: "",
    itemName: "",
    itemCode: "",
    hsnSacCode: "",
    unit: "PCS",
    quantity: 1,
    unitPrice: 0,
    discountType: "PERCENTAGE",
    discountValue: 0,
    discountAmount: 0,
    gstRate: 18,
    taxRate: 18,
    taxableAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    lineTotal: 0,
  };
}

export function getDefaultCreditNoteValues(): CreditNoteFormValues {
  const today = new Date().toISOString().slice(0, 10);
  return {
    creditNoteDate: today,
    financialYear: resolveFinancialYear(today),
    reason: "SALES_RETURN",
    status: "ISSUED",
    customerId: "",
    customerName: "",
    customerPhone: null,
    customerGSTIN: null,
    salesInvoiceId: null,
    salesInvoiceNumber: null,
    placeOfSupply: "",
    placeOfSupplyCode: "",
    taxType: "INTRA_STATE",
    items: [emptyLineItem()],
    taxableAmount: 0,
    discountAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    cessAmount: 0,
    roundOffAmount: 0,
    grandTotal: 0,
    remarks: "",
    notes: "",
    termsAndConditions: "",
  };
}

/** Line calc — same GST split pattern as invoices */
export function calcLine(
  item: {
    quantity?: number | string | null;
    unitPrice?: number | string | null;
    rate?: number | string | null;
    price?: number | string | null;
    discount?: number | string | null;
    discountValue?: number | string | null;
    discountAmount?: number | string | null;
    discountType?: string | null;
    gstRate?: number | string | null;
    taxRate?: number | string | null;
  },
  taxType: TaxType = "INTRA_STATE",
) {
  const qty = num(item.quantity);
  const unitPrice = num(item.unitPrice ?? item.price ?? item.rate);
  const gross = Math.round(qty * unitPrice * 100) / 100;
  const dtype = String(item.discountType || "PERCENTAGE").toUpperCase();
  const discVal = num(item.discount ?? item.discountValue ?? item.discountAmount);
  let discountAmount = 0;
  if (dtype === "FIXED") discountAmount = Math.min(discVal, gross);
  else discountAmount = (gross * discVal) / 100;
  discountAmount = Math.round(Math.min(Math.max(discountAmount, 0), gross) * 100) / 100;
  const taxable = Math.max(0, Math.round((gross - discountAmount) * 100) / 100);
  const taxRate = num(item.gstRate ?? item.taxRate);
  const taxAmount = Math.round(((taxable * taxRate) / 100) * 100) / 100;
  const isInter = taxType === "INTER_STATE";
  const cgstAmt = isInter ? 0 : Math.round((taxAmount / 2) * 100) / 100;
  const sgstAmt = isInter ? 0 : Math.round((taxAmount - cgstAmt) * 100) / 100;
  const lineTotal = Math.round((taxable + taxAmount) * 100) / 100;
  return {
    gross,
    discountAmount,
    taxable,
    taxAmount,
    cgstRate: isInter ? 0 : taxRate / 2,
    sgstRate: isInter ? 0 : taxRate / 2,
    igstRate: isInter ? taxRate : 0,
    cgstAmount: cgstAmt,
    sgstAmount: sgstAmt,
    igstAmount: isInter ? taxAmount : 0,
    lineTotal,
    total: lineTotal,
    amount: taxable,
  };
}

export function applyTotalsToValues(
  values: CreditNoteFormValues,
  roundOffEnabled?: boolean,
): CreditNoteFormValues {
  const taxType = (values.taxType || "INTRA_STATE") as TaxType;
  const items = (values.items || []).map((it) => {
    const calc = calcLine(it, taxType);
    return {
      ...it,
      discountAmount: calc.discountAmount,
      taxableAmount: calc.taxable,
      cgstRate: calc.cgstRate,
      sgstRate: calc.sgstRate,
      igstRate: calc.igstRate,
      cgstAmount: calc.cgstAmount,
      sgstAmount: calc.sgstAmount,
      igstAmount: calc.igstAmount,
      lineTotal: calc.lineTotal,
      taxRate: num(it.gstRate ?? it.taxRate),
      gstRate: num(it.gstRate ?? it.taxRate),
    };
  });
  const filled = items.filter((it) => (it.itemName || "").trim() || it.productId);
  let taxable = 0;
  let discount = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  for (const it of filled) {
    taxable += num(it.taxableAmount);
    discount += num(it.discountAmount);
    cgst += num(it.cgstAmount);
    sgst += num(it.sgstAmount);
    igst += num(it.igstAmount);
  }
  const raw = taxable + cgst + sgst + igst;
  let roundOff = num(values.roundOffAmount);
  if (roundOffEnabled === false) roundOff = 0;
  else if (roundOffEnabled === true) {
    const nearest = Math.round(raw);
    roundOff = Math.round((nearest - raw) * 100) / 100;
  }
  const grand = Math.round((raw + roundOff) * 100) / 100;
  return {
    ...values,
    items,
    taxableAmount: Math.round(taxable * 100) / 100,
    discountAmount: Math.round(discount * 100) / 100,
    cgstAmount: Math.round(cgst * 100) / 100,
    sgstAmount: Math.round(sgst * 100) / 100,
    igstAmount: Math.round(igst * 100) / 100,
    roundOffAmount: roundOff,
    grandTotal: grand,
  };
}

export function mapCreditNoteToFormValues(cn: CreditNote): CreditNoteFormValues {
  return {
    ...getDefaultCreditNoteValues(),
    creditNoteDate: String(cn.creditNoteDate || "").slice(0, 10),
    financialYear: cn.financialYear || resolveFinancialYear(cn.creditNoteDate),
    reason: cn.reason || "SALES_RETURN",
    status: cn.status,
    customerId: cn.customerId || "",
    customerName: cn.customerName || "",
    customerPhone: cn.customerPhone || null,
    customerGSTIN: cn.customerGSTIN || null,
    salesInvoiceId: cn.salesInvoiceId || null,
    salesInvoiceNumber: cn.salesInvoiceNumber || null,
    placeOfSupply: cn.placeOfSupply || "",
    placeOfSupplyCode: cn.placeOfSupplyCode || "",
    taxType: cn.taxType || "INTRA_STATE",
    items: (cn.items || []).map((it) => ({
      id: it.id,
      productId: it.productId,
      itemName: it.itemName || "",
      itemCode: it.itemCode || "",
      hsnSacCode: it.hsnSacCode || "",
      unit: it.unit || it.unitName || "PCS",
      quantity: num(it.quantity),
      unitPrice: num(it.unitPrice ?? it.rate),
      discountType: it.discountType || "PERCENTAGE",
      discountValue: num(it.discountValue ?? it.discountAmount),
      discountAmount: num(it.discountAmount),
      gstRate: num(it.gstRate ?? it.taxRate),
      taxRate: num(it.taxRate ?? it.gstRate),
      taxableAmount: num(it.taxableAmount),
      cgstAmount: num(it.cgstAmount),
      sgstAmount: num(it.sgstAmount),
      igstAmount: num(it.igstAmount),
      lineTotal: num(it.lineTotal),
    })),
    taxableAmount: num(cn.taxableAmount),
    discountAmount: num(cn.discountAmount),
    cgstAmount: num(cn.cgstAmount),
    sgstAmount: num(cn.sgstAmount),
    igstAmount: num(cn.igstAmount),
    roundOffAmount: num(cn.roundOffAmount),
    grandTotal: num(cn.grandTotal),
    remarks: cn.remarks || "",
    notes: cn.notes || "",
    termsAndConditions: cn.termsAndConditions || "",
  };
}

/**
 * Map form values → backend CreateCreditNoteRequest.
 * Required item fields: productId, itemCode, itemName, hsnSacCode,
 * itemType, unitCode, unitName, quantity, unitPrice, taxableAmount,
 * gstRate, lineTotal.
 */
export function toCreatePayload(values: CreditNoteFormValues) {
  const recomputed = applyTotalsToValues(values, undefined);
  const filled = (recomputed.items || []).filter(
    (it) => (it.itemName || "").trim() || it.productId,
  );

  const items = filled.map((it, index) => {
    const unit = (it.unit || "PCS").trim() || "PCS";
    const itemType =
      it.classification === "SERVICES" ? ("SERVICES" as const) : ("GOODS" as const);
    return {
      productId: it.productId,
      itemCode: (it.itemCode || "NA").trim() || "NA",
      itemName: (it.itemName || "Item").trim() || "Item",
      description: it.description || undefined,
      hsnSacCode: (it.hsnSacCode || "NA").trim() || "NA",
      itemType,
      unitCode: unit,
      unitName: unit,
      quantity: num(it.quantity),
      unitPrice: num(it.unitPrice),
      discountAmount: num(it.discountAmount),
      taxableAmount: num(it.taxableAmount),
      gstRate: num(it.gstRate ?? it.taxRate),
      cgstAmount: num(it.cgstAmount),
      sgstAmount: num(it.sgstAmount),
      igstAmount: num(it.igstAmount),
      cessAmount: 0,
      lineTotal: num(it.lineTotal),
      lineNumber: index + 1,
    };
  });

  const totalQuantity = items.reduce((s, x) => s + num(x.quantity), 0);

  return {
    creditNoteDate: values.creditNoteDate,
    reason: values.reason,
    customerId: values.customerId,
    salesInvoiceId: values.salesInvoiceId || undefined,
    totalItems: items.length,
    totalQuantity,
    taxableAmount: recomputed.taxableAmount,
    discountAmount: recomputed.discountAmount,
    cgstAmount: recomputed.cgstAmount,
    sgstAmount: recomputed.sgstAmount,
    igstAmount: recomputed.igstAmount,
    cessAmount: recomputed.cessAmount ?? 0,
    roundOffAmount: recomputed.roundOffAmount,
    grandTotal: recomputed.grandTotal,
    remarks: values.remarks?.trim() || undefined,
    notes: values.notes?.trim() || undefined,
    items,
  };
}


export function creditNoteDateRange(
  period: string,
): { startDate?: string; endDate?: string } {
  if (period === "all") return {};
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  switch (period) {
    case "today":
      return { startDate: fmt(now), endDate: fmt(now) };
    case "7d": {
      const from = new Date(now);
      from.setDate(now.getDate() - 6);
      return { startDate: fmt(from), endDate: fmt(now) };
    }
    case "30d": {
      const from = new Date(now);
      from.setDate(now.getDate() - 29);
      return { startDate: fmt(from), endDate: fmt(now) };
    }
    case "month":
      return {
        startDate: fmt(new Date(now.getFullYear(), now.getMonth(), 1)),
        endDate: fmt(now),
      };
    case "year":
      return {
        startDate: fmt(new Date(now.getFullYear(), 0, 1)),
        endDate: fmt(now),
      };
    default:
      return {};
  }
}
