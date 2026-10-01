import type {
  Quotation,
  QuotationCreatePayload,
  QuotationUpdatePayload,
  TaxType,
  DiscountType,
  QuotationItem,
} from "../types/quotation.types";
import type { QuotationFormValues } from "../types/quotation-form.types";
import { getStateCode } from "@/modules/sales/shared/utils/state-code";

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function toNum(v: unknown, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Keep amounts within production limits before API */
function clampMoney(n: number, max = 10_00_00_000) {
  const v = toNum(n);
  if (v < 0) return 0;
  if (v > max) return max;
  return round2(v);
}

function clampQty(n: number) {
  const v = toNum(n);
  if (v < 0) return 0;
  if (v > 1_00_000) return 1_00_000;
  return v;
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

  if (maxLen > 0 && s.length > maxLen) {
    s = s.slice(0, maxLen);
  }

  return s;
}

/** Keep safe rich-text HTML; limit by plain-text length (maxChars). */
export function sanitizeRichText(raw: unknown, maxPlain = 1000): string {
  let html = String(raw ?? "");

  html = html
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(
      /\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,
      "",
    )
    .replace(/(javascript|vbscript)\s*:/gi, "");

  const plain = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxPlain) {
    return html.trim();
  }

  return html.trim();
}

/** Ensure API gets full ISO datetime (date-only inputs → start/end of day) */
export function toIsoDateTime(
  value: string | null | undefined,
  endOfDay = false,
): string {
  if (!value) return new Date().toISOString();

  const raw = String(value).trim();

  if (/T\d{2}:\d{2}/.test(raw)) {
    const d = new Date(raw);

    return Number.isNaN(d.getTime())
      ? new Date().toISOString()
      : d.toISOString();
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, day] = raw.split("-").map(Number);

    const d = endOfDay
      ? new Date(y, m - 1, day, 23, 59, 59, 999)
      : new Date(y, m - 1, day, 0, 0, 0, 0);

    return d.toISOString();
  }

  const d = new Date(raw);

  return Number.isNaN(d.getTime())
    ? new Date().toISOString()
    : d.toISOString();
}

/** Prefer price, fall back to rate */
export function getUnitPrice(item: {
  price?: number | string | null;
  rate?: number | string | null;
}) {
  if (item.price != null) {
    return toNum(item.price);
  }

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
 * Real-time line calculation.
 * - discountType PERCENTAGE → % of gross
 * - discountType FIXED → absolute  (capped at gross)
 * - taxType INTER_STATE → full tax as IGST
 * - taxType INTRA_STATE → split 50/50 CGST + SGST
 */
export function calcLine(
  item: {
    quantity?: number | string | null;
    price?: number | string | null;
    rate?: number | string | null;
    discount?: number | string | null;
    discountType?: DiscountType | null;
    taxRate?: number | string | null;
  },
  taxType: TaxType = "INTRA_STATE",
): LineCalcResult {
  const qty = toNum(item.quantity);
  const unitPrice = getUnitPrice(item);
  const discountVal = toNum(item.discount);
  const discountType: DiscountType =
    item.discountType ?? "PERCENTAGE";
  const taxRate = toNum(item.taxRate);

  const gross = round2(qty * unitPrice);

  let discountAmount =
    discountType === "PERCENTAGE"
      ? (gross * discountVal) / 100
      : discountVal;

  discountAmount = round2(
    Math.min(Math.max(discountAmount, 0), gross),
  );

  const taxable = round2(gross - discountAmount);
  const taxAmount = round2((taxable * taxRate) / 100);

  let cgstRate = 0;
  let cgstAmount = 0;
  let sgstRate = 0;
  let sgstAmount = 0;
  let igstRate = 0;
  let igstAmount = 0;

  if (taxType === "INTER_STATE") {
    igstRate = taxRate;
    igstAmount = taxAmount;
  } else {
    cgstRate = round2(taxRate / 2);
    sgstRate = round2(taxRate - cgstRate);

    cgstAmount = round2(taxAmount / 2);
    sgstAmount = round2(taxAmount - cgstAmount);
  }

  const total = round2(taxable + taxAmount);

  return {
    gross,
    discountAmount,
    taxable,
    taxAmount,
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount,
    total,
  };
}

export interface CalculatedTotals {
  items: Array<{
    taxAmount: number;
    amount: number;
    total: number;
    cgstRate: number;
    cgstAmount: number;
    sgstRate: number;
    sgstAmount: number;
    igstRate: number;
    igstAmount: number;
    discountAmount: number;
    taxable: number;
  }>;
  totalItems: number;
  totalQuantity: number;
  taxableAmount: number;
  discountAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  roundOffAmount: number;
  grandTotal: number;
}

export function resolveTaxType(
  businessStateCode?: string | null,
  placeOfSupplyCode?: string | null,
): TaxType {
  const biz = (businessStateCode || "").trim();
  const pos = (placeOfSupplyCode || "").trim();

  if (!biz || !pos) {
    return "INTRA_STATE";
  }

  return biz === pos ? "INTRA_STATE" : "INTER_STATE";
}

export function calculateQuotationTotals(
  items:
    | QuotationFormValues["items"]
    | QuotationItem[]
    | undefined
    | null,
  taxType: TaxType | null | undefined = "INTRA_STATE",
): CalculatedTotals {
  const effectiveTaxType: TaxType =
    taxType ?? "INTRA_STATE";

  let totalQuantity = 0;
  let taxableAmount = 0;
  let discountAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  const list = items ?? [];

  const calculatedItems = list.map((item) => {
    const line = calcLine(item, effectiveTaxType);

    totalQuantity += toNum(item.quantity);
    taxableAmount += line.taxable;
    discountAmount += line.discountAmount;
    cgstAmount += line.cgstAmount;
    sgstAmount += line.sgstAmount;
    igstAmount += line.igstAmount;

    return {
      taxAmount: line.taxAmount,
      amount: line.total,
      total: line.total,
      cgstRate: line.cgstRate,
      cgstAmount: line.cgstAmount,
      sgstRate: line.sgstRate,
      sgstAmount: line.sgstAmount,
      igstRate: line.igstRate,
      igstAmount: line.igstAmount,
      discountAmount: line.discountAmount,
      taxable: line.taxable,
    };
  });

  taxableAmount = round2(taxableAmount);
  discountAmount = round2(discountAmount);
  cgstAmount = round2(cgstAmount);
  sgstAmount = round2(sgstAmount);
  igstAmount = round2(igstAmount);

  const totalTax = round2(
    cgstAmount + sgstAmount + igstAmount,
  );

  const rawGrand = taxableAmount + totalTax;
  const grandTotal = Math.round(rawGrand);
  const roundOffAmount = round2(grandTotal - rawGrand);

  return {
    items: calculatedItems,
    totalItems: list.length,
    totalQuantity: round2(totalQuantity),
    taxableAmount,
    discountAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    cessAmount: 0,
    roundOffAmount,
    grandTotal,
  };
}

export function emptyLineItem(): QuotationFormValues["items"][number] {
  return {
    itemId: null,
    itemName: "",
    description: null,
    hsnSacCode: null,
    quantity: 1,
    unit: "PCS",
    rate: 0,
    price: 0,
    discount: 0,
    discountType: "PERCENTAGE",
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

export function resolveFinancialYear(
  dateStr?: string | null,
): string {
  let y: number;
  let m: number;

  const raw = (dateStr || "").trim();

  const mDate = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})/,
  );

  if (mDate) {
    y = Number(mDate[1]);
    m = Number(mDate[2]);
  } else {
    const d = raw ? new Date(raw) : new Date();

    if (Number.isNaN(d.getTime())) {
      const now = new Date();
      y = now.getFullYear();
      m = now.getMonth() + 1;
    } else {
      y = d.getFullYear();
      m = d.getMonth() + 1;
    }
  }

  if (m >= 4) {
    return `${y}-${String(y + 1).slice(-2)}`;
  }

  return `${y - 1}-${String(y).slice(-2)}`;
}

export function getDefaultQuotationValues(): QuotationFormValues {
  return {
    quotationDate: new Date().toISOString().slice(0, 10),
    validUntil: "",
    financialYear: resolveFinancialYear(
      new Date().toISOString(),
    ),

    businessName: "",
    businessLegalName: null,
    businessGSTIN: null,
    businessPAN: null,
    businessPhone: null,
    businessEmail: null,
    businessAddressLine1: null,
    businessAddressLine2: null,
    businessCity: null,
    businessState: null,
    businessStateCode: null,
    businessPincode: null,
    businessCountry: "India",

    prospectName: "",
    prospectCompanyName: null,
    prospectGSTIN: null,
    prospectPAN: null,
    prospectPhone: "",
    prospectEmail: null,
    prospectAddressLine1: "",
    prospectAddressLine2: null,
    prospectCity: "",
    prospectState: "",
    prospectStateCode: null,
    prospectPincode: "",
    prospectCountry: "India",

    placeOfSupply: "",
    placeOfSupplyCode: null,
    taxType: "INTRA_STATE",
    reverseCharge: false,
    isExport: false,
    isSEZ: false,
    currency: "INR",
    exchangeRate: null,

    items: [emptyLineItem()],

    totalItems: 1,
    totalQuantity: 0,
    taxableAmount: 0,
    discountAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    cessAmount: 0,
    roundOffAmount: 0,
    grandTotal: 0,

    notes: null,
    termsAndConditions: "",
  } as QuotationFormValues;
}

export function mapQuotationToFormValues(
  q: Quotation,
): QuotationFormValues {
  return {
    quotationDate: q.quotationDate?.slice(0, 10) ?? "",
    validUntil: q.validUntil?.slice(0, 10) ?? "",
    financialYear: resolveFinancialYear(q.quotationDate),

    businessName: q.businessName ?? "",
    businessLegalName: q.businessLegalName ?? null,
    businessGSTIN: q.businessGSTIN ?? null,
    businessPAN: q.businessPAN ?? null,
    businessPhone: q.businessPhone ?? null,
    businessEmail: q.businessEmail ?? null,
    businessAddressLine1:
      q.businessAddressLine1 ?? null,
    businessAddressLine2:
      q.businessAddressLine2 ?? null,
    businessCity: q.businessCity ?? null,
    businessState: q.businessState ?? null,
    businessStateCode:
      q.businessStateCode ?? null,
    businessPincode: q.businessPincode ?? null,
    businessCountry:
      q.businessCountry ?? "India",

    prospectName: q.prospectName ?? "",
    prospectCompanyName:
      q.prospectCompanyName ?? null,
    prospectGSTIN: q.prospectGSTIN ?? null,
    prospectPAN: q.prospectPAN ?? null,
    prospectPhone: q.prospectPhone ?? "",
    prospectEmail: q.prospectEmail ?? null,
    prospectAddressLine1:
      q.prospectAddressLine1 ?? "",
    prospectAddressLine2:
      q.prospectAddressLine2 ?? null,
    prospectCity: q.prospectCity ?? "",
    prospectState: q.prospectState ?? "",
    prospectStateCode:
      q.prospectStateCode ?? null,
    prospectPincode:
      q.prospectPincode ?? "",
    prospectCountry:
      q.prospectCountry ?? "India",

    placeOfSupply: q.placeOfSupply ?? "",
    placeOfSupplyCode:
      q.placeOfSupplyCode ?? null,
    taxType: q.taxType ?? "INTRA_STATE",
    reverseCharge: q.reverseCharge ?? false,
    isExport: q.isExport ?? false,
    isSEZ: q.isSEZ ?? false,
    currency: q.currency ?? "INR",
    exchangeRate: q.exchangeRate ?? null,

    items:
      q.items?.length > 0
        ? q.items.map((item) => {
            const unitPrice = getUnitPrice(item);

            return {
              id: item.id,
              itemId: item.itemId ?? null,
              itemName: item.itemName ?? "",
              description:
                item.description ?? null,
              hsnSacCode:
                item.hsnSacCode ??
                (item as { hsnSac?: string }).hsnSac ??
                null,
              quantity: item.quantity ?? 1,
              unit: item.unit ?? "PCS",
              rate: unitPrice,
              price: unitPrice,
              discount: item.discount ?? 0,
              discountType:
                item.discountType ?? "PERCENTAGE",
              taxRate: item.taxRate ?? 0,
              taxAmount: item.taxAmount ?? 0,
              cgstRate: item.cgstRate ?? 0,
              cgstAmount: item.cgstAmount ?? 0,
              sgstRate: item.sgstRate ?? 0,
              sgstAmount: item.sgstAmount ?? 0,
              igstRate: item.igstRate ?? 0,
              igstAmount: item.igstAmount ?? 0,
              amount:
                item.amount ?? item.total ?? 0,
              total:
                item.total ?? item.amount ?? 0,
              stockAvailable: null,
            };
          })
        : [emptyLineItem()],

    totalItems: q.totalItems ?? 0,
    totalQuantity: q.totalQuantity ?? 0,
    taxableAmount: q.taxableAmount ?? 0,
    discountAmount: q.discountAmount ?? 0,
    cgstAmount: q.cgstAmount ?? 0,
    sgstAmount: q.sgstAmount ?? 0,
    igstAmount: q.igstAmount ?? 0,
    cessAmount: q.cessAmount ?? 0,
    roundOffAmount: q.roundOffAmount ?? 0,
    grandTotal: q.grandTotal ?? 0,

    notes: q.notes ?? null,
    termsAndConditions:
      q.termsAndConditions ?? "",
  } as QuotationFormValues;
}

export function getSessionFormDefaults(
  session: {
    user: { id: string } | null;
    business: {
      id: string;
      name: string;
      legalName?: string | null;
      gstin?: string | null;
      pan?: string | null;
      phone?: string | null;
      email?: string | null;
      addressLine1?: string | null;
      addressLine2?: string | null;
      city?: string | null;
      state?: string | null;
      stateCode?: string | null;
      pincode?: string | null;
      country: string;
    } | null;
  } | null,
): Partial<QuotationFormValues> {
  if (!session) return {};

  const { business } = session;

  const stateCode =
    business?.stateCode ||
    getStateCode(business?.state || undefined) ||
    null;

  return {
    businessName: business?.name ?? "",
    businessLegalName:
      business?.legalName ?? null,
    businessGSTIN:
      business?.gstin ?? null,
    businessPAN:
      business?.pan ?? null,
    businessPhone:
      business?.phone ?? null,
    businessEmail:
      business?.email ?? null,
    businessAddressLine1:
      business?.addressLine1 ?? null,
    businessAddressLine2:
      business?.addressLine2 ?? null,
    businessCity:
      business?.city ?? null,
    businessState:
      business?.state ?? null,
    businessStateCode: stateCode,
    businessPincode:
      business?.pincode ?? null,
    businessCountry:
      business?.country ?? "India",
    businessLogo:
      (
        business as {
          logo?: string | null;
        } | null | undefined
      )?.logo ?? null,
  };
}

/** Apply live totals + per-line GST split into form values */
export function applyTotalsToValues(
  values: QuotationFormValues,
): QuotationFormValues {
  const taxType =
    values.taxType ??
    resolveTaxType(
      values.businessStateCode,
      values.placeOfSupplyCode,
    );

  const totals = calculateQuotationTotals(
    values.items,
    taxType,
  );

  const items = values.items.map((item, i) => {
    const line = totals.items[i];
    const unitPrice = getUnitPrice(item);

    return {
      ...item,
      rate: unitPrice,
      price: unitPrice,
      taxAmount: line?.taxAmount ?? 0,
      amount: line?.amount ?? 0,
      total: line?.total ?? 0,
      cgstRate: line?.cgstRate ?? 0,
      cgstAmount: line?.cgstAmount ?? 0,
      sgstRate: line?.sgstRate ?? 0,
      sgstAmount: line?.sgstAmount ?? 0,
      igstRate: line?.igstRate ?? 0,
      igstAmount: line?.igstAmount ?? 0,
    };
  });

  return {
    ...values,
    taxType,
    items,
    totalItems: totals.totalItems,
    totalQuantity: totals.totalQuantity,
    taxableAmount: totals.taxableAmount,
    discountAmount: totals.discountAmount,
    cgstAmount: totals.cgstAmount,
    sgstAmount: totals.sgstAmount,
    igstAmount: totals.igstAmount,
    cessAmount: totals.cessAmount,
    roundOffAmount: totals.roundOffAmount,
    grandTotal: totals.grandTotal,
  };
}

export function sanitizeCreatePayload(
  values: QuotationFormValues,
): QuotationCreatePayload {
  const withTotals = applyTotalsToValues(values);
  const rest = withTotals;

  return {
    quotationDate: toIsoDateTime(
      rest.quotationDate,
      false,
    ),

    validUntil: toIsoDateTime(
      rest.validUntil,
      true,
    ),

    financialYear:
      resolveFinancialYear(rest.quotationDate),

    businessName: rest.businessName,
    businessLegalName:
      rest.businessLegalName || null,
    businessGSTIN:
      rest.businessGSTIN || null,
    businessPAN:
      rest.businessPAN || null,
    businessPhone:
      rest.businessPhone || null,
    businessEmail:
      rest.businessEmail || null,
    businessAddressLine1:
      rest.businessAddressLine1 || null,
    businessAddressLine2:
      rest.businessAddressLine2 || null,
    businessCity:
      rest.businessCity || null,
    businessState:
      rest.businessState || null,
    businessStateCode:
      rest.businessStateCode || null,
    businessPincode:
      rest.businessPincode || null,
    businessCountry:
      rest.businessCountry || "India",

    businessLogo:
      rest.businessLogo || null,

    prospectName: rest.prospectName,
    prospectCompanyName:
      rest.prospectCompanyName || null,
    prospectGSTIN:
      rest.prospectGSTIN || null,
    prospectPAN:
      rest.prospectPAN || null,
    prospectPhone:
      rest.prospectPhone || null,
    prospectEmail:
      rest.prospectEmail || null,
    prospectAddressLine1:
      rest.prospectAddressLine1 || null,
    prospectAddressLine2:
      rest.prospectAddressLine2 || null,
    prospectCity:
      rest.prospectCity || null,
    prospectState:
      rest.prospectState || null,
    prospectStateCode:
      rest.prospectStateCode || null,
    prospectPincode:
      rest.prospectPincode || null,
    prospectCountry:
      rest.prospectCountry || "India",

    placeOfSupply:
      rest.placeOfSupply || null,
    placeOfSupplyCode:
      rest.placeOfSupplyCode || null,

    taxType:
      rest.taxType || "INTRA_STATE",
    reverseCharge:
      rest.reverseCharge ?? false,
    isExport:
      rest.isExport ?? false,
    isSEZ:
      rest.isSEZ ?? false,

    currency:
      rest.currency || "INR",
    exchangeRate:
      rest.exchangeRate ?? null,

    items: rest.items.map((item) => {
      const unitPrice = getUnitPrice(item);

      return {
        id: item.id,
        itemId: item.itemId || null,
        itemName: sanitizePlainText(
          item.itemName,
          200,
        ),
        description: (() => {
          const d = sanitizePlainText(
            item.description,
            1000,
          );

          return d || null;
        })(),
        hsnSacCode: (() => {
          const h = sanitizePlainText(
            item.hsnSacCode ??
              (item as { hsnSac?: string }).hsnSac,
            12,
          ).replace(/[^0-9A-Za-z]/g, "");

          return h || null;
        })(),
        quantity: clampQty(item.quantity),
        unit: item.unit || null,
        rate: clampMoney(unitPrice),
        price: clampMoney(unitPrice),
        discount: clampMoney(item.discount),
        discountType:
          item.discountType || "PERCENTAGE",
        taxRate: toNum(item.taxRate),
        taxAmount: toNum(item.taxAmount),
        cgstRate: toNum(item.cgstRate),
        cgstAmount: toNum(item.cgstAmount),
        sgstRate: toNum(item.sgstRate),
        sgstAmount: toNum(item.sgstAmount),
        igstRate: toNum(item.igstRate),
        igstAmount: toNum(item.igstAmount),
        amount: toNum(
          item.amount ?? item.total,
        ),
        total: toNum(
          item.total ?? item.amount,
        ),
      };
    }),

    totalItems: rest.totalItems,
    totalQuantity: rest.totalQuantity,
    taxableAmount: rest.taxableAmount,
    discountAmount: rest.discountAmount,
    cgstAmount: rest.cgstAmount,
    sgstAmount: rest.sgstAmount,
    igstAmount: rest.igstAmount,
    cessAmount: rest.cessAmount,
    roundOffAmount:
      rest.roundOffAmount,
    grandTotal: rest.grandTotal,

    notes: (() => {
      const n = sanitizePlainText(
        rest.notes,
        10000,
      );

      return n || null;
    })(),

    termsAndConditions: (() => {
      const t = sanitizeRichText(
        rest.termsAndConditions,
        1000,
      );

      return t || null;
    })(),

    status:
      (
        rest.status as
          | import("../types/quotation.types").QuotationStatus
          | undefined
      ) ?? "DRAFT",
  };
}

export function sanitizeUpdatePayload(
  values: QuotationFormValues,
): QuotationUpdatePayload {
  return sanitizeCreatePayload(values) as QuotationUpdatePayload;
}

/** Format INR for display */
export function formatINR(value: number) {
  return Number(value || 0).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  );
}

/** Indian numbering amount-in-words (Rupees) */
const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];

  const t = Math.floor(n / 10);
  const o = n % 10;

  return `${TENS[t]}${o ? ` ${ONES[o]}` : ""}`.trim();
}

function threeDigits(n: number): string {
  if (n === 0) return "";

  const h = Math.floor(n / 100);
  const r = n % 100;

  const head = h ? `${ONES[h]} Hundred` : "";
  const tail = r ? twoDigits(r) : "";

  return [head, tail]
    .filter(Boolean)
    .join(" ");
}

export function amountInWords(amount: number): string {
  const n = Math.round(
    Math.abs(Number(amount) || 0),
  );

  if (n === 0) {
    return "Zero Rupees Only";
  }

  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor(
    (n % 10000000) / 100000,
  );
  const thousand = Math.floor(
    (n % 100000) / 1000,
  );
  const hundred = n % 1000;

  const parts: string[] = [];

  if (crore) {
    parts.push(`${threeDigits(crore)} Crore`);
  }

  if (lakh) {
    parts.push(`${threeDigits(lakh)} Lakh`);
  }

  if (thousand) {
    parts.push(
      `${threeDigits(thousand)} Thousand`,
    );
  }

  if (hundred) {
    parts.push(threeDigits(hundred));
  }

  return `${parts.join(" ")} Rupees Only`;
}

/** List filter: period key → fromDate / toDate (YYYY-MM-DD) */
export function quotationDateRange(
  period: string,
): { fromDate?: string; toDate?: string } {
  if (period === "all") return {};

  const now = new Date();

  const fmt = (d: Date) =>
    d.toISOString().split("T")[0];

  switch (period) {
    case "today":
      return {
        fromDate: fmt(now),
        toDate: fmt(now),
      };

    case "7d": {
      const from = new Date(now);
      from.setDate(now.getDate() - 6);

      return {
        fromDate: fmt(from),
        toDate: fmt(now),
      };
    }

    case "30d": {
      const from = new Date(now);
      from.setDate(now.getDate() - 29);

      return {
        fromDate: fmt(from),
        toDate: fmt(now),
      };
    }

    case "month":
      return {
        fromDate: fmt(
          new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
          ),
        ),
        toDate: fmt(now),
      };

    case "year":
      return {
        fromDate: fmt(
          new Date(
            now.getFullYear(),
            0,
            1,
          ),
        ),
        toDate: fmt(now),
      };

    default:
      return {};
  }
}