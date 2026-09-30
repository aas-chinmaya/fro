
import type { Invoice } from "../types/invoice.types";
import type { InvoiceFormValues, InvoiceItemFormValues } from "../types/invoice-form.types";
import type { TaxType } from "../types/invoice.types";


/** Ensure API gets full ISO datetime (date-only inputs → start/end of day) */
export function toIsoDateTime(
  value: string | null | undefined,
  endOfDay = false,
): string | null {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  if (/T\d{2}:\d{2}/.test(raw)) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, day] = raw.split("-").map(Number);
    const d = endOfDay
      ? new Date(y, m - 1, day, 23, 59, 59, 999)
      : new Date(y, m - 1, day, 0, 0, 0, 0);
    return d.toISOString();
  }

  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

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


export function normalizePaymentMethod(raw: unknown): string {
  const s = String(raw || "CASH").trim().toUpperCase().replace(/\s+/g, "_");
  const map: Record<string, string> = {
    CASH: "CASH",
    UPI: "UPI",
    CARD: "CARD",
    NET_BANKING: "NET_BANKING",
    NETBANKING: "NET_BANKING",
    BANK_TRANSFER: "NET_BANKING",
    BANKTRANSFER: "NET_BANKING",
    CHEQUE: "CASH",
    OTHER: "CASH",
  };
  return map[s] || "CASH";
}

export function sanitizeBusinessLogo(raw: unknown): string | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) {
    if (s.length > 2000) return null;
    if (/[<>"']/.test(s)) return null;
    return s.slice(0, 2000);
  }
  if (!/^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=\s]+$/i.test(s)) {
    return null;
  }
  if (s.length > 500_000) return null;
  return s;
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
  // Indian FY Apr–Mar — full years (backend expects e.g. 2026-2027)
  return m >= 4 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

export function emptyLineItem(): InvoiceItemFormValues {
  return {
    itemId: null,
    itemName: "",
    productName: "",
    description: "",
    hsnSacCode: "",
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

export function getDefaultInvoiceValues(): InvoiceFormValues {
  return {
    invoiceType: "B2B",
    invoiceDate: new Date().toISOString().slice(0, 10),
    financialYear: resolveFinancialYear(new Date().toISOString()),
    customerId: null,
    buyerName: "",
    buyerCompanyName: "",
    buyerPhone: "",
    buyerEmail: null,
    buyerGSTIN: "",
    buyerPAN: "",
    buyerType: "UNREGISTERED",
    buyerContactPerson: "",
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
    exchangeRate: 1,
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
    paymentMethod: "CASH",
    paidAmount: 0,
    pendingAmount: 0,
    paymentDate: null,
    transactionId: null,
    receivedAccount: "",
    notes: "",
    termsAndConditions: "",
    status: "DRAFT",
    invoiceStatus: "DRAFT",
  };
}

/** Map session business → seller fields */
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
    businessLogo: sanitizeBusinessLogo(b.logo ?? b.businessLogo ?? b.logoUrl ?? null),
  };
}

export function mapInvoiceToFormValues(
  inv: Invoice,
): InvoiceFormValues {
  return {
    ...getDefaultInvoiceValues(),
    invoiceType: inv.invoiceType || "B2B",
    invoiceDate: inv.invoiceDate?.slice(0, 10) || "",
    financialYear: inv.financialYear || resolveFinancialYear(inv.invoiceDate),
    customerId: (inv as { customerId?: string | null }).customerId || null,
    buyerName: inv.buyerName || "",
    buyerCompanyName: inv.buyerCompanyName || "",
    buyerPhone: inv.buyerPhone || "",
    buyerEmail: inv.buyerEmail || null,
    buyerGSTIN: inv.buyerGSTIN || "",
    buyerPAN: inv.buyerPAN || "",
    buyerType: inv.buyerType || "REGISTERED",
    buyerContactPerson: inv.buyerContactPerson || "",
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
    exchangeRate: num(inv.exchangeRate) || 1,
    items: (inv.items || []).map((it) => ({
      id: it.id,
      itemId: it.itemId,
      productId: it.productId || "",
      itemName: it.itemName || it.productName || "",
      productName: it.productName || it.itemName || "",
      itemCode: it.itemCode || "",
      classification: it.classification || "GOODS",
      quantity: num(it.quantity),
      rate: num(it.rate ?? it.price),
      price: num(it.price ?? it.rate),
      discountType: it.discountType || "PERCENTAGE",
      discountValue: num(it.discountValue ?? it.discount),
      discount: num(it.discount ?? it.discountValue),
      taxRate: num(it.taxRate ?? it.gstRate),
      gstRate: num(it.gstRate ?? it.taxRate),
      taxAmount: num(it.taxAmount),
      total: num(it.total ?? it.amount),
      amount: num(it.amount ?? it.total),
      unit: it.unit || "",
      hsnSacCode: (it as { hsnSacCode?: string; hsnSac?: string }).hsnSacCode || (it as { hsnSac?: string }).hsnSac || "",
      description: it.description || "",
      cgstAmount: num(it.cgstAmount),
      sgstAmount: num(it.sgstAmount),
      igstAmount: num(it.igstAmount),
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
    paymentMethod: normalizePaymentMethod(inv.paymentMethod),
    paidAmount: num(inv.paidAmount),
    pendingAmount: num(inv.pendingAmount),
    paymentDate: inv.paymentDate ? String(inv.paymentDate).slice(0, 10) : null,
    transactionId: inv.transactionId || null,
    receivedAccount: inv.receivedAccount || "",
    notes: inv.notes || "",
    termsAndConditions: inv.termsAndConditions || "",
    status: inv.invoiceStatus || inv.status || "DRAFT",
    invoiceStatus: inv.invoiceStatus || inv.status || "DRAFT",
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

/**
 * Recalculate line + invoice totals from current form values.
 * @param roundOffEnabled when true, auto nearest-rupee round-off;
 *   when false, force 0; when undefined, keep existing roundOffAmount.
 */
export function applyTotalsToValues(
  values: InvoiceFormValues,
  roundOffEnabled?: boolean,
): InvoiceFormValues {
  const taxType = (values.taxType || "INTRA_STATE") as TaxType;
  const items = (values.items || []).map((it) => {
    // Prefer discountValue; fall back to discount (item-row writes "discount")
    const normalized = {
      ...it,
      discountValue: num(it.discountValue ?? it.discount),
      discount: num(it.discount ?? it.discountValue),
      rate: num(it.rate ?? it.price),
      price: num(it.price ?? it.rate),
      taxRate: num(it.taxRate ?? it.gstRate),
      gstRate: num(it.gstRate ?? it.taxRate),
    };
    const calc = calcLine(normalized, taxType);
    return {
      ...normalized,
      taxableAmount: Math.round(calc.taxable * 100) / 100,
      taxAmount: Math.round(calc.taxAmount * 100) / 100,
      cgstRate: calc.cgstRate,
      sgstRate: calc.sgstRate,
      igstRate: calc.igstRate,
      cgstAmount: Math.round(calc.cgstAmount * 100) / 100,
      sgstAmount: Math.round(calc.sgstAmount * 100) / 100,
      igstAmount: Math.round(calc.igstAmount * 100) / 100,
      amount: Math.round(calc.taxable * 100) / 100,
      total: Math.round(calc.total * 100) / 100,
      discountAmount: Math.round(calc.discountAmount * 100) / 100,
    } as InvoiceItemFormValues & { discountAmount?: number };
  });
  const filled = items.filter(
    (it) => (it.itemName || it.productName || "").trim().length > 0,
  );
  let taxable = 0;
  let discount = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let qty = 0;
  for (const it of filled) {
    taxable += num(it.taxableAmount);
    discount += num((it as { discountAmount?: number }).discountAmount);
    cgst += num(it.cgstAmount);
    sgst += num(it.sgstAmount);
    igst += num(it.igstAmount);
    qty += num(it.quantity);
  }
  const rawGrand = taxable + cgst + sgst + igst;
  let roundOff = num(values.roundOffAmount);
  if (roundOffEnabled === false) {
    roundOff = 0;
  } else if (roundOffEnabled === true) {
    const nearest = Math.round(rawGrand);
    roundOff = Math.round((nearest - rawGrand) * 100) / 100;
  }
  // else keep existing roundOffAmount
  const grand = Math.round((rawGrand + roundOff) * 100) / 100;
  return {
    ...values,
    items,
    totalItems: filled.length,
    totalQuantity: qty,
    taxableAmount: Math.round(taxable * 100) / 100,
    discountAmount: Math.round(discount * 100) / 100,
    cgstAmount: Math.round(cgst * 100) / 100,
    sgstAmount: Math.round(sgst * 100) / 100,
    igstAmount: Math.round(igst * 100) / 100,
    roundOffAmount: roundOff,
    grandTotal: grand,
  };
}


export function sanitizeCreatePayload(values: InvoiceFormValues) {
  const {
    tenantId: _tenant,
    branchId: _branch,
    businessId: _biz,
    createdBy: _created,
    updatedBy: _updated,
    createdAt: _ca,
    updatedAt: _ua,
    ...rest
  } = values as InvoiceFormValues & Record<string, unknown>;

  // Always recompute totals from lines so backend grandTotal check passes
  const taxType = (rest.taxType || "INTRA_STATE") as TaxType;
  const recomputed = applyTotalsToValues(
    { ...rest, taxType } as InvoiceFormValues,
    // keep existing round-off amount as-is (undefined = preserve)
    undefined,
  );
  // If round-off is 0, still ensure grand = taxable+tax exactly (2dp)
  const rTaxable = num(recomputed.taxableAmount);
  const rCgst = num(recomputed.cgstAmount);
  const rSgst = num(recomputed.sgstAmount);
  const rIgst = num(recomputed.igstAmount);
  const rCess = num(recomputed.cessAmount);
  let rRound = num(recomputed.roundOffAmount);
  const raw = Math.round((rTaxable + rCgst + rSgst + rIgst + rCess) * 100) / 100;
  // Force grandTotal = components + roundOff (single source of truth)
  const grand = Math.round((raw + rRound) * 100) / 100;
  // Sync roundOff so raw + roundOff === grand
  rRound = Math.round((grand - raw) * 100) / 100;

  const paid = Math.min(Math.max(num(rest.paidAmount), 0), grand);
  const pending = Math.max(Math.round((grand - paid) * 100) / 100, 0);

  // Use recomputed items for line amounts
  let lineItems = (recomputed.items || rest.items || []).filter(
    (it) => (it.itemName || it.productName || "").trim().length > 0,
  );

  const statusUpper = String(
    rest.status || rest.invoiceStatus || "DRAFT",
  ).toUpperCase();
  const isDraft = statusUpper === "DRAFT";


  // Soft defaults for draft so backend required fields don't block partial save
  const draftPhone =
    String(rest.buyerPhone || "").trim() ||
    (isDraft ? "0000000000" : "");
  const draftName =
    String(rest.buyerName || "").trim() ||
    (isDraft ? "Draft customer" : "");
  const draftAddr =
    String(rest.billingAddressLine1 || "").trim() ||
    (isDraft ? "—" : "");
  const draftCity =
    String(rest.billingCity || "").trim() || (isDraft ? "—" : "");
  const draftPin =
    String(rest.billingPincode || "").trim() ||
    (isDraft ? "000000" : "");
  const draftState =
    String(rest.billingState || "").trim() || (isDraft ? "—" : "");
  const draftCountry =
    String(rest.billingCountry || "").trim() ||
    (isDraft ? "India" : "India");
  const draftPos =
    String(rest.placeOfSupply || "").trim() ||
    draftState ||
    (isDraft ? "—" : "");

  return {
    invoiceType: rest.invoiceType || "B2B",
    invoiceDate:
      toIsoDateTime(rest.invoiceDate as string) ||
      (isDraft
        ? new Date().toISOString()
        : rest.invoiceDate || null),
    financialYear: rest.financialYear || null,
    // Backend accepts either; send both for compatibility with past API
    status: rest.status || rest.invoiceStatus || "DRAFT",
    invoiceStatus: rest.invoiceStatus || rest.status || "DRAFT",
    customerId: (rest as { customerId?: string | null }).customerId || null,
    buyerName: draftName || rest.buyerName,
    buyerCompanyName: rest.buyerCompanyName || null,
    buyerGSTIN: rest.buyerGSTIN || null,
    buyerPAN: rest.buyerPAN || null,
    buyerPhone: draftPhone || rest.buyerPhone,
    buyerEmail: rest.buyerEmail || null,
    buyerType: (() => {
      const t = String(rest.buyerType || "").trim().toUpperCase();
      if (t === "REGISTERED" || t === "UNREGISTERED" || t === "EXPORT") return t;
      const gstin = String(rest.buyerGSTIN || "").trim();
      return gstin ? "REGISTERED" : "UNREGISTERED";
    })(),
    buyerContactPerson: rest.buyerContactPerson || rest.buyerName || null,
    billingAddressLine1: draftAddr || rest.billingAddressLine1,
    billingAddressLine2: rest.billingAddressLine2 || null,
    billingCity: draftCity || rest.billingCity,
    billingState: draftState || rest.billingState,
    billingStateCode: rest.billingStateCode || null,
    billingPincode: draftPin || rest.billingPincode,
    billingCountry: draftCountry,
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
    placeOfSupply: draftPos || rest.placeOfSupply,
    placeOfSupplyCode: rest.placeOfSupplyCode || null,
    taxType: rest.taxType || "INTRA_STATE",
    reverseCharge: rest.reverseCharge ?? false,
    isExport: rest.isExport ?? false,
    isSEZ: rest.isSEZ ?? false,
    currency: "INR",
    exchangeRate: num(rest.exchangeRate) || 1,
    items: (lineItems || [])
      .filter((it) => {
        const name = (it.itemName || it.productName || "").trim();
        const pid = String(it.itemId || it.productId || "").trim();
        // Must have a name; product id preferred (backend "Product missing" without it)
        return !!name && (!!pid || isDraft);
      })
      .map((it, index) => {
        const qty = num(it.quantity);
        const rate = num(it.rate ?? it.price);
        const discVal = num(it.discountValue ?? it.discount);
        const discType = String(it.discountType || "PERCENTAGE").toUpperCase();
        const calc = calcLine(
          {
            quantity: qty,
            rate,
            price: rate,
            discountValue: discVal,
            discount: discVal,
            discountType: discType,
            taxRate: num(it.taxRate ?? it.gstRate),
            gstRate: num(it.gstRate ?? it.taxRate),
          },
          taxType,
        );
        const taxRate = num(it.taxRate ?? it.gstRate);
        return {
          itemId: it.itemId || it.productId || null,
          productId: it.productId || it.itemId || null,
          itemName: sanitizePlainText(it.itemName || it.productName || "", 200),
          product: sanitizePlainText(it.itemName || it.productName || "", 200),
          itemCode: sanitizePlainText(it.itemCode, 50) || "NA",
          classification:
            String(it.classification || "GOODS").toUpperCase() === "SERVICES"
              ? "SERVICES"
              : "GOODS",
          description: (() => {
            const d = sanitizePlainText(it.description, 500);
            return d || null;
          })(),
          hsnSacCode: (() => {
            const rawH =
              (it as { hsnSacCode?: string; hsnSac?: string }).hsnSacCode ||
              (it as { hsnSac?: string }).hsnSac ||
              "";
            const h = sanitizePlainText(rawH, 12).replace(/[^0-9A-Za-z]/g, "");
            return h || "NA";
          })(),
          unit: (() => {
            const u = sanitizePlainText(it.unit, 20);
            return u || "PCS";
          })(),
          quantity: qty,
          rate,
          price: rate,
          unitPrice: rate,
          sellingPrice: rate,
          discount: discVal,
          discountValue: discVal,
          discountType: discType === "FIXED" ? "FIXED" : "PERCENTAGE",
          discountAmount: calc.discountAmount,
          taxRate,
          gstRate: taxRate,
          taxAmount: calc.taxAmount,
          taxableAmount: calc.taxable,
          cgstAmount: calc.cgstAmount,
          sgstAmount: calc.sgstAmount,
          igstAmount: calc.igstAmount,
          cessAmount: 0,
          total: calc.total,
          lineTotal: calc.total,
          lineNumber: index + 1,
        };
      }),
    totalItems: (lineItems || []).filter((it) => {
      const name = (it.itemName || it.productName || "").trim();
      const pid = String(it.itemId || it.productId || "").trim();
      return !!name && (!!pid || isDraft);
    }).length,
    totalQuantity: num(recomputed.totalQuantity),
    subtotal: Math.round(
      (lineItems || []).reduce((s, it) => {
        if (!(it.itemName || it.productName || "").trim()) return s;
        return s + num(it.quantity) * num(it.rate ?? it.price);
      }, 0) * 100,
    ) / 100,
    taxableAmount: isDraft && num(recomputed.totalItems) === 0 ? 0 : rTaxable,
    discountAmount: isDraft && num(recomputed.totalItems) === 0 ? 0 : num(recomputed.discountAmount),
    cgstAmount: isDraft && num(recomputed.totalItems) === 0 ? 0 : rCgst,
    sgstAmount: isDraft && num(recomputed.totalItems) === 0 ? 0 : rSgst,
    igstAmount: isDraft && num(recomputed.totalItems) === 0 ? 0 : rIgst,
    cessAmount: isDraft && num(recomputed.totalItems) === 0 ? 0 : rCess,
    roundOffAmount: isDraft && num(recomputed.totalItems) === 0 ? 0 : rRound,
    grandTotal: isDraft && num(recomputed.totalItems) === 0 ? 0 : grand,
    // Seller / business snapshot from session (never hardcode)
    sellerTradeName: rest.sellerTradeName || null,
    sellerLegalName: rest.sellerLegalName || null,
    sellerGSTIN: rest.sellerGSTIN || null,
    sellerPAN: rest.sellerPAN || null,
    sellerPhone: rest.sellerPhone || null,
    sellerEmail: rest.sellerEmail || null,
    sellerAddressLine1: rest.sellerAddressLine1 || null,
    sellerAddressLine2: rest.sellerAddressLine2 || null,
    sellerCity: rest.sellerCity || null,
    sellerState: rest.sellerState || null,
    sellerStateCode: rest.sellerStateCode || null,
    sellerPincode: rest.sellerPincode || null,
    sellerCountry: rest.sellerCountry || "India",
    paymentStatus: rest.paymentStatus || "PENDING",
    paymentMethod: normalizePaymentMethod(rest.paymentMethod),
    paidAmount: paid,
    pendingAmount: pending,
    paymentDate: toIsoDateTime(rest.paymentDate as string | null) || null,
    transactionId: rest.transactionId || null,
    receivedAccount: rest.receivedAccount || null,
    businessLogo: sanitizeBusinessLogo(rest.businessLogo),
    notes: (() => {
      const n = sanitizePlainText(rest.notes, 500);
      return n || null;
    })(),
    termsAndConditions: (() => {
      const t = String(rest.termsAndConditions || "").trim();
      if (t) return t;
      return isDraft ? "—" : "";
    })(),
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
  const taxable = Math.max(0, Math.round((gross - discountAmount) * 100) / 100);
  const taxRate = toNum(item.taxRate ?? item.gstRate);
  // Round tax to 2 decimals first (backend typically does this)
  const taxAmount = Math.round(((taxable * taxRate) / 100) * 100) / 100;
  const isInter = taxType === "INTER_STATE";
  const halfRate = taxRate / 2;
  // Split CGST/SGST with residual so cgst+sgst === taxAmount exactly
  const cgstAmt = isInter ? 0 : Math.round((taxAmount / 2) * 100) / 100;
  const sgstAmt = isInter ? 0 : Math.round((taxAmount - cgstAmt) * 100) / 100;
  return {
    gross: Math.round(gross * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxable,
    taxAmount,
    cgstRate: isInter ? 0 : halfRate,
    cgstAmount: cgstAmt,
    sgstRate: isInter ? 0 : halfRate,
    sgstAmount: sgstAmt,
    igstRate: isInter ? taxRate : 0,
    igstAmount: isInter ? taxAmount : 0,
    total: Math.round((taxable + taxAmount) * 100) / 100,
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
