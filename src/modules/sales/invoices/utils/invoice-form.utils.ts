
import type { Invoice } from "../types/invoice.types";
import type { InvoiceFormValues, InvoiceItemFormValues } from "../types/invoice-form.types";
import type { TaxType } from "../types/invoice.types";

export function formatINR(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function amountInWords(amount: number): string {
  // thin wrapper — prefer shared if available
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { amountInWords: aw } = require("@/modules/sales/shared/utils/amount-in-words");
    return aw(amount);
  } catch {
    return "";
  }
}

function num(v: unknown) {
  return Number(v) || 0;
}

export function resolveTaxType(
  sellerStateCode?: string | null,
  placeOfSupplyCode?: string | null,
): TaxType {
  if (!sellerStateCode || !placeOfSupplyCode) return "INTRA_STATE";
  return String(sellerStateCode) === String(placeOfSupplyCode)
    ? "INTRA_STATE"
    : "INTER_STATE";
}

export function resolveFinancialYear(dateStr?: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  // Indian FY Apr–Mar
  return m >= 4 ? `${y}-${String(y + 1).slice(-2)}` : `${y - 1}-${String(y).slice(-2)}`;
}

export function emptyLineItem(): InvoiceItemFormValues {
  return {
    itemId: null,
    itemName: "",
    productName: "",
    description: "",
    hsnSac: "",
    quantity: 1,
    unit: "PCS",
    rate: 0,
    price: 0,
    discountType: "PERCENTAGE",
    discountValue: 0,
    discount: 0,
    taxRate: 18,
    taxAmount: 0,
    cgstRate: 9,
    cgstAmount: 0,
    sgstRate: 9,
    sgstAmount: 0,
    igstRate: 0,
    igstAmount: 0,
    amount: 0,
    total: 0,
    stockAvailable: null,
  };
}

export function getDefaultInvoiceValues(
  _businessId = "",
  _userId = "",
): InvoiceFormValues {
  return {
    invoiceType: "B2B",
    invoiceDate: new Date().toISOString().slice(0, 10),
    financialYear: resolveFinancialYear(new Date().toISOString()),
    buyerName: "",
    buyerCompanyName: "",
    buyerPhone: "",
    buyerEmail: null,
    buyerGSTIN: "",
    buyerPAN: "",
    billingAddressLine1: "",
    billingAddressLine2: "",
    billingCity: "",
    billingState: "",
    billingStateCode: "",
    billingPincode: "",
    billingCountry: "India",
    sameAsBilling: true,
    placeOfSupply: "",
    placeOfSupplyCode: "",
    taxType: "INTRA_STATE",
    reverseCharge: false,
    isExport: false,
    isSEZ: false,
    currency: "INR",
    items: [emptyLineItem()],
    totalItems: 0,
    totalQuantity: 0,
    taxableAmount: 0,
    discountAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    cessAmount: 0,
    roundOffAmount: 0,
    grandTotal: 0,
    paymentStatus: "PENDING",
    paymentMethod: "Cash",
    paidAmount: 0,
    paymentDate: null,
    transactionId: null,
    notes: "",
    termsAndConditions: "",
    signature: null,
    showBankDetails: false,
    showUPIDetails: false,
    status: "DRAFT",
  };
}

/** Map session business → seller fields (never send tenant/createdBy) */
export function getSessionFormDefaults(session: {
  business?: Record<string, unknown> | null;
  user?: Record<string, unknown> | null;
} | null | undefined): Partial<InvoiceFormValues> {
  const b = (session?.business || {}) as Record<string, unknown>;
  return {
    sellerTradeName: String(b.name || b.tradeName || ""),
    sellerLegalName: String(b.legalName || b.name || ""),
    sellerGSTIN: String(b.gstin || b.GSTIN || ""),
    sellerPAN: String(b.pan || b.PAN || ""),
    sellerPhone: String(b.phone || ""),
    sellerEmail: (b.email as string) || null,
    sellerAddressLine1: String(b.addressLine1 || b.address || ""),
    sellerAddressLine2: String(b.addressLine2 || ""),
    sellerCity: String(b.city || ""),
    sellerState: String(b.state || ""),
    sellerStateCode: String(b.stateCode || ""),
    sellerPincode: String(b.pincode || ""),
    sellerCountry: String(b.country || "India"),
    sellerBankName: String(b.bankName || ""),
    sellerBankAccountNumber: String(b.bankAccountNumber || b.accountNumber || ""),
    sellerBankIFSC: String(b.bankIFSC || b.ifsc || ""),
    sellerBankBranch: String(b.bankBranch || ""),
    sellerUPIId: String(b.upiId || b.upi || ""),
    businessLogo: (b.logo as string) || (b.businessLogo as string) || null,
  };
}

export function mapInvoiceToFormValues(
  inv: Invoice,
  _businessId?: string,
  _userId?: string,
): InvoiceFormValues {
  return {
    ...getDefaultInvoiceValues(),
    invoiceType: inv.invoiceType || "B2B",
    invoiceDate: inv.invoiceDate?.slice(0, 10) || "",
    financialYear: inv.financialYear || "",
    buyerName: inv.buyerName || "",
    buyerCompanyName: inv.buyerCompanyName || "",
    buyerPhone: inv.buyerPhone || "",
    buyerEmail: inv.buyerEmail || null,
    buyerGSTIN: inv.buyerGSTIN || "",
    buyerPAN: inv.buyerPAN || "",
    billingAddressLine1: inv.billingAddressLine1 || "",
    billingAddressLine2: inv.billingAddressLine2 || "",
    billingCity: inv.billingCity || "",
    billingState: inv.billingState || "",
    billingStateCode: inv.billingStateCode || "",
    billingPincode: inv.billingPincode || "",
    billingCountry: inv.billingCountry || "India",
    sameAsBilling: inv.sameAsBilling ?? true,
    shippingAddressLine1: inv.shippingAddressLine1 || "",
    shippingAddressLine2: inv.shippingAddressLine2 || "",
    shippingCity: inv.shippingCity || "",
    shippingState: inv.shippingState || "",
    shippingStateCode: inv.shippingStateCode || "",
    shippingPincode: inv.shippingPincode || "",
    shippingCountry: inv.shippingCountry || "",
    placeOfSupply: inv.placeOfSupply || "",
    placeOfSupplyCode: inv.placeOfSupplyCode || "",
    taxType: inv.taxType || "INTRA_STATE",
    reverseCharge: inv.reverseCharge ?? false,
    isExport: inv.isExport ?? false,
    isSEZ: inv.isSEZ ?? false,
    currency: inv.currency || "INR",
    items: (inv.items || []).map((it) => ({
      id: it.id,
      itemId: it.itemId,
      productId: it.productId || "",
      itemName: it.itemName || it.productName || "",
      productName: it.productName || it.itemName || "",
      quantity: num(it.quantity),
      rate: num(it.rate ?? it.price),
      price: num(it.price ?? it.rate),
      discountType: it.discountType || "PERCENTAGE",
      discountValue: num(it.discountValue ?? it.discount),
      discount: num(it.discount ?? it.discountValue),
      taxRate: num(it.taxRate ?? it.gstRate),
      taxAmount: num(it.taxAmount),
      total: num(it.total ?? it.amount),
      amount: num(it.amount ?? it.total),
      unit: it.unit || "",
      hsnSac: it.hsnSac || it.hsnSacCode || "",
      description: it.description || "",
    })),
    taxableAmount: num(inv.taxableAmount),
    discountAmount: num(inv.discountAmount),
    cgstAmount: num(inv.cgstAmount),
    sgstAmount: num(inv.sgstAmount),
    igstAmount: num(inv.igstAmount),
    cessAmount: num(inv.cessAmount),
    roundOffAmount: num(inv.roundOffAmount),
    grandTotal: num(inv.grandTotal),
    paymentStatus: inv.paymentStatus || "PENDING",
    paymentMethod: inv.paymentMethod || "Cash",
    paidAmount: num(inv.paidAmount),
    paymentDate: inv.paymentDate || null,
    transactionId: inv.transactionId || null,
    notes: inv.notes || "",
    termsAndConditions: inv.termsAndConditions || "",
    signature: inv.signature || null,
    sellerTradeName: inv.sellerTradeName || "",
    sellerLegalName: inv.sellerLegalName || "",
    sellerGSTIN: inv.sellerGSTIN || "",
    sellerPAN: inv.sellerPAN || "",
    sellerPhone: inv.sellerPhone || "",
    sellerEmail: inv.sellerEmail || null,
    sellerAddressLine1: inv.sellerAddressLine1 || "",
    sellerAddressLine2: inv.sellerAddressLine2 || "",
    sellerCity: inv.sellerCity || "",
    sellerState: inv.sellerState || "",
    sellerStateCode: inv.sellerStateCode || "",
    sellerPincode: inv.sellerPincode || "",
    sellerCountry: inv.sellerCountry || "India",
    sellerBankName: inv.sellerBankName || "",
    sellerBankAccountNumber: inv.sellerBankAccountNumber || "",
    sellerBankIFSC: inv.sellerBankIFSC || "",
    sellerBankBranch: inv.sellerBankBranch || "",
    sellerUPIId: inv.sellerUPIId || "",
    showBankDetails: inv.showBankDetails ?? false,
    showUPIDetails: inv.showUPIDetails ?? false,
    businessLogo: (inv as { businessLogo?: string | null }).businessLogo || null,
  };
}

function lineTotals(item: InvoiceItemFormValues, taxType: TaxType) {
  const qty = num(item.quantity);
  const rate = num(item.rate ?? item.price);
  const discVal = num(item.discountValue ?? item.discount);
  const dtype = item.discountType || "PERCENTAGE";
  let taxable = qty * rate;
  if (dtype === "PERCENTAGE") taxable -= (taxable * discVal) / 100;
  else taxable -= discVal;
  taxable = Math.max(0, taxable);
  const taxRate = num(item.taxRate ?? item.gstRate);
  const tax = (taxable * taxRate) / 100;
  const half = tax / 2;
  const isInter = taxType === "INTER_STATE";
  return {
    ...item,
    taxableAmount: taxable,
    taxAmount: tax,
    cgstRate: isInter ? 0 : taxRate / 2,
    sgstRate: isInter ? 0 : taxRate / 2,
    igstRate: isInter ? taxRate : 0,
    cgstAmount: isInter ? 0 : half,
    sgstAmount: isInter ? 0 : half,
    igstAmount: isInter ? tax : 0,
    amount: taxable,
    total: taxable + tax,
  };
}

export function applyTotalsToValues(
  values: InvoiceFormValues,
): InvoiceFormValues {
  const taxType = (values.taxType || "INTRA_STATE") as TaxType;
  const items = (values.items || []).map((it) => lineTotals(it, taxType));
  const filled = items.filter(
    (it) => (it.itemName || it.productName || "").trim().length > 0,
  );
  let taxable = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let qty = 0;
  for (const it of filled) {
    taxable += num(it.taxableAmount);
    cgst += num(it.cgstAmount);
    sgst += num(it.sgstAmount);
    igst += num(it.igstAmount);
    qty += num(it.quantity);
  }
  const grand = taxable + cgst + sgst + igst + num(values.roundOffAmount);
  return {
    ...values,
    items,
    totalItems: filled.length,
    totalQuantity: qty,
    taxableAmount: taxable,
    cgstAmount: cgst,
    sgstAmount: sgst,
    igstAmount: igst,
    grandTotal: grand,
  };
}

export function sanitizeCreatePayload(values: InvoiceFormValues) {
  const {
    // never send

    tenantId: _t,
   
    createdBy: _c,
  
    businessId: _b,
    
    branchId: _br,
    ...rest
  } = values as InvoiceFormValues & Record<string, unknown>;

  return {
    invoiceType: rest.invoiceType || "B2B",
    invoiceDate: rest.invoiceDate,
    financialYear: rest.financialYear || null,
    status: rest.status || "DRAFT",
    buyerName: rest.buyerName,
    buyerCompanyName: rest.buyerCompanyName || null,
    buyerGSTIN: rest.buyerGSTIN || null,
    buyerPAN: rest.buyerPAN || null,
    buyerPhone: rest.buyerPhone,
    buyerEmail: rest.buyerEmail || null,
    billingAddressLine1: rest.billingAddressLine1,
    billingAddressLine2: rest.billingAddressLine2 || null,
    billingCity: rest.billingCity,
    billingState: rest.billingState,
    billingStateCode: rest.billingStateCode || null,
    billingPincode: rest.billingPincode,
    billingCountry: rest.billingCountry || "India",
    sameAsBilling: rest.sameAsBilling ?? true,
    // Always send shipping: mirror billing when sameAsBilling
    shippingAddressLine1:
      (rest.sameAsBilling ?? true)
        ? rest.billingAddressLine1 || null
        : rest.shippingAddressLine1 || null,
    shippingAddressLine2:
      (rest.sameAsBilling ?? true)
        ? rest.billingAddressLine2 || null
        : rest.shippingAddressLine2 || null,
    shippingCity:
      (rest.sameAsBilling ?? true)
        ? rest.billingCity || null
        : rest.shippingCity || null,
    shippingState:
      (rest.sameAsBilling ?? true)
        ? rest.billingState || null
        : rest.shippingState || null,
    shippingStateCode:
      (rest.sameAsBilling ?? true)
        ? rest.billingStateCode || null
        : rest.shippingStateCode || null,
    shippingPincode:
      (rest.sameAsBilling ?? true)
        ? rest.billingPincode || null
        : rest.shippingPincode || null,
    shippingCountry:
      (rest.sameAsBilling ?? true)
        ? rest.billingCountry || "India"
        : rest.shippingCountry || null,
    placeOfSupply: rest.placeOfSupply,
    placeOfSupplyCode: rest.placeOfSupplyCode || null,
    taxType: rest.taxType || "INTRA_STATE",
    reverseCharge: rest.reverseCharge ?? false,
    isExport: rest.isExport ?? false,
    isSEZ: rest.isSEZ ?? false,
    currency: "INR",
    items: (rest.items || [])
      .filter((it) => (it.itemName || it.productName || "").trim())
      .map((it) => ({
        itemId: it.itemId || it.productId || null,
        itemName: sanitizePlainText(it.itemName || it.productName || "", 200),
        description: (() => {
          const d = sanitizePlainText(it.description, 500);
          return d || null;
        })(),
        hsnSac: (() => {
          const h = sanitizePlainText(it.hsnSac || it.hsnSacCode, 12).replace(/[^0-9A-Za-z]/g, "");
          return h || null;
        })(),
        unit: (() => {
          const u = sanitizePlainText(it.unit, 20);
          return u || null;
        })(),
        quantity: num(it.quantity),
        rate: num(it.rate ?? it.price),
        discount: num(it.discountValue ?? it.discount),
        discountType: it.discountType || "PERCENTAGE",
        taxRate: num(it.taxRate ?? it.gstRate),
        taxAmount: num(it.taxAmount),
        total: num(it.total),
      })),
    taxableAmount: num(rest.taxableAmount),
    discountAmount: num(rest.discountAmount),
    cgstAmount: num(rest.cgstAmount),
    sgstAmount: num(rest.sgstAmount),
    igstAmount: num(rest.igstAmount),
    cessAmount: num(rest.cessAmount),
    roundOffAmount: num(rest.roundOffAmount),
    grandTotal: num(rest.grandTotal),
    paymentStatus: rest.paymentStatus || "PENDING",
    paymentMethod: rest.paymentMethod || "Cash",
    paidAmount: num(rest.paidAmount),
    paymentDate: rest.paymentDate || null,
    transactionId: rest.transactionId || null,
    showBankDetails: rest.showBankDetails ?? false,
    showUPIDetails: rest.showUPIDetails ?? false,
    businessLogo: rest.businessLogo || null,
    notes: (() => {
      const n = sanitizePlainText(rest.notes, 500);
      return n || null;
    })(),
    termsAndConditions: (() => {
      const x = sanitizePlainText(rest.termsAndConditions, 2000);
      return x || "";
    })(),
    signature: rest.signature || null,
  };
}

export function sanitizeUpdatePayload(values: InvoiceFormValues) {
  return sanitizeCreatePayload(values);
}


function toNum(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Strip HTML tags, scripts, event handlers, and control chars from free-text fields */
export function sanitizePlainText(raw: unknown, maxLen = 1000): string {
  if (raw == null) return "";
  let s = String(raw);
  s = s.replace(/<[^>]*>/g, " ");
  s = s.replace(/&lt;/gi, " ").replace(/&gt;/gi, " ").replace(/&quot;/gi, '"');
  s = s.replace(/javascript\s*:/gi, "");
  s = s.replace(/vbscript\s*:/gi, "");
  s = s.replace(/data\s*:\s*text\/html/gi, "");
  s = s.replace(/on\w+\s*=/gi, "");
  s = s.replace(/https?:\/\/[^\s]+/gi, "");
  s = s.replace(/www\.[^\s]+/gi, "");
  s = s.replace(/ftp:\/\/[^\s]+/gi, "");
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
  s = s.replace(/\s+/g, " ").trim();
  if (maxLen > 0 && s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}

export function getUnitPrice(item: {
  price?: number | null;
  rate?: number | null;
}) {
  if (item.price != null && item.price !== undefined) return toNum(item.price);
  return toNum(item.rate);
}

export interface LineCalcResult {
  gross: number;
  discountAmount: number;
  taxable: number;
  taxAmount: number;
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  total: number;
}

/**
 * Real-time line calculation for invoice items.
 */
export function calcLine(
  item: {
    quantity?: number | null;
    price?: number | null;
    rate?: number | null;
    discount?: number | null;
    discountValue?: number | null;
    discountType?: string | null;
    taxRate?: number | null;
    gstRate?: number | null;
  },
  taxType: TaxType = "INTRA_STATE",
): LineCalcResult {
  const qty = toNum(item.quantity);
  const unitPrice = getUnitPrice(item);
  const discountVal = toNum(item.discountValue ?? item.discount);
  const dtype = String(item.discountType || "PERCENTAGE").toUpperCase();
  const gross = qty * unitPrice;
  let discountAmount = 0;
  if (dtype === "FIXED" || dtype === "fixed") {
    discountAmount = Math.min(discountVal, gross);
  } else {
    discountAmount = (gross * discountVal) / 100;
  }
  const taxable = Math.max(0, gross - discountAmount);
  const taxRate = toNum(item.taxRate ?? item.gstRate);
  const taxAmount = (taxable * taxRate) / 100;
  const isInter = taxType === "INTER_STATE";
  const halfRate = taxRate / 2;
  const halfAmt = taxAmount / 2;
  return {
    gross,
    discountAmount,
    taxable,
    taxAmount,
    cgstRate: isInter ? 0 : halfRate,
    cgstAmount: isInter ? 0 : halfAmt,
    sgstRate: isInter ? 0 : halfRate,
    sgstAmount: isInter ? 0 : halfAmt,
    igstRate: isInter ? taxRate : 0,
    igstAmount: isInter ? taxAmount : 0,
    total: taxable + taxAmount,
  };
}


/** List filter: period key → fromDate / toDate (YYYY-MM-DD) */
export function invoiceDateRange(
  period: string,
): { fromDate?: string; toDate?: string } {
  if (period === "all") return {};
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  switch (period) {
    case "today":
      return { fromDate: fmt(now), toDate: fmt(now) };
    case "7d": {
      const from = new Date(now);
      from.setDate(now.getDate() - 6);
      return { fromDate: fmt(from), toDate: fmt(now) };
    }
    case "30d": {
      const from = new Date(now);
      from.setDate(now.getDate() - 29);
      return { fromDate: fmt(from), toDate: fmt(now) };
    }
    case "month":
      return {
        fromDate: fmt(new Date(now.getFullYear(), now.getMonth(), 1)),
        toDate: fmt(now),
      };
    case "year":
      return {
        fromDate: fmt(new Date(now.getFullYear(), 0, 1)),
        toDate: fmt(now),
      };
    default:
      return {};
  }
}
