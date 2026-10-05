/**
 * Credit Note API
 * ---------------
 * Uses baseApi when available. Until backend is ready, list/get/create
 * fall back to in-memory DUMMY data so the UI can be developed end-to-end.
 *
 * Endpoints (real):
 *   GET    /sales-credit-notes
 *   GET    /sales-credit-notes/:id
 *   POST   /sales-credit-notes
 *   PATCH  /sales-credit-notes/:id
 *   POST   /sales-credit-notes/:id/adjust   (settlement)
 *   POST   /sales-credit-notes/:id/cancel
 */

import type {
  CreditNote,
  CreditNoteAdjustmentPayload,
  CreditNoteListParams,
  CreditNoteListResponse,
  CreditNoteResponse,
  CreateCreditNotePayload,
  UpdateCreditNotePayload,
} from "../types/credit-note.types";

const ENDPOINT = "/sales-credit-notes";

// ---------------------------------------------------------------------------
// DUMMY DATA — remove when backend is live
// ---------------------------------------------------------------------------
const DUMMY_NOTES: CreditNote[] = [
  {
    id: "cn-001",
    creditNoteNumber: "CN-2026-0001",
    creditNoteDate: "2026-04-02T00:00:00.000Z",
    financialYear: "2026-2027",
    status: "ISSUED",
    reason: "SALES_RETURN",
    customerId: "cust-1",
    customerName: "Acme Traders",
    customerPhone: "+919876543210",
    customerGSTIN: "29AAAAA0000A1Z5",
    salesInvoiceId: "inv-101",
    salesInvoiceNumber: "INV-2026-0101",
    taxType: "INTRA_STATE",
    placeOfSupply: "Karnataka",
    totalItems: 1,
    totalQuantity: 2,
    taxableAmount: 10000,
    discountAmount: 0,
    cgstAmount: 900,
    sgstAmount: 900,
    igstAmount: 0,
    cessAmount: 0,
    roundOffAmount: 0,
    grandTotal: 11800,
    remarks: "Return of damaged goods",
    notes: null,
    items: [
      {
        id: "cni-1",
        productId: "prod-1",
        itemCode: "SKU-001",
        itemName: "Widget A",
        hsnSacCode: "8471",
        unit: "PCS",
        quantity: 2,
        unitPrice: 5000,
        discountAmount: 0,
        taxableAmount: 10000,
        gstRate: 18,
        cgstAmount: 900,
        sgstAmount: 900,
        igstAmount: 0,
        lineTotal: 11800,
      },
    ],
    creditNoteSettlement: null,
    createdAt: "2026-04-02T10:00:00.000Z",
    updatedAt: "2026-04-02T10:00:00.000Z",
  },
  {
    id: "cn-002",
    creditNoteNumber: "CN-2026-0002",
    creditNoteDate: "2026-04-05T00:00:00.000Z",
    financialYear: "2026-2027",
    status: "ADJUSTED",
    reason: "PRICE_ADJUSTMENT",
    customerId: "cust-2",
    customerName: "Beta Supplies",
    customerPhone: "+919811122233",
    customerGSTIN: null,
    salesInvoiceId: "inv-205",
    salesInvoiceNumber: "INV-2026-0205",
    taxType: "INTER_STATE",
    placeOfSupply: "Maharashtra",
    totalItems: 1,
    totalQuantity: 5,
    taxableAmount: 5000,
    discountAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 900,
    cessAmount: 0,
    roundOffAmount: 0,
    grandTotal: 5900,
    remarks: "Rate difference after negotiation",
    items: [
      {
        id: "cni-2",
        productId: "prod-2",
        itemCode: "SKU-002",
        itemName: "Gadget B",
        hsnSacCode: "8517",
        unit: "PCS",
        quantity: 5,
        unitPrice: 1000,
        discountAmount: 0,
        taxableAmount: 5000,
        gstRate: 18,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 900,
        lineTotal: 5900,
      },
    ],
    creditNoteSettlement: {
      id: "set-1",
      creditNoteId: "cn-002",
      type: "ADJUSTMENT",
      status: "COMPLETED",
      settlementDate: "2026-04-06T00:00:00.000Z",
      amount: 5900,
      remarks: "Adjusted against next invoice",
    },
    createdAt: "2026-04-05T11:00:00.000Z",
    updatedAt: "2026-04-06T09:00:00.000Z",
  },
];

let dummyStore = [...DUMMY_NOTES];

/** Toggle: true = use dummy; false = call real API via baseApi */
const USE_DUMMY = true;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function unwrapList(response: unknown): CreditNoteListResponse {
  if (response && typeof response === "object" && "data" in response) {
    const r = response as CreditNoteListResponse;
    if (Array.isArray(r.data)) return r;
  }
  if (Array.isArray(response)) {
    return {
      data: response as CreditNote[],
      total: (response as CreditNote[]).length,
      page: 1,
      limit: 20,
      totalPages: 1,
    };
  }
  return { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
}

function unwrapOne(response: unknown): CreditNoteResponse {
  if (response && typeof response === "object" && "data" in response) {
    return response as CreditNoteResponse;
  }
  if (response && typeof response === "object" && "id" in response) {
    return { success: true, message: "OK", data: response as CreditNote };
  }
  throw new Error("Invalid credit note response");
}

async function apiCall<T>(
  method: "GET" | "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  // Prefer shared baseApi when wired in the app
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { baseApi } = require("@/services/baseApi");
    if (method === "GET") {
      const res = await baseApi.get(path);
      return res?.data ?? res;
    }
    if (method === "POST") {
      const res = await baseApi.post(path, body);
      return res?.data ?? res;
    }
    if (method === "PATCH") {
      const res = await baseApi.patch(path, body);
      return res?.data ?? res;
    }
    const res = await baseApi.delete(path);
    return res?.data ?? res;
  } catch {
    // baseApi not available — caller should use dummy path
    throw new Error("baseApi unavailable");
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** List credit notes (paginated + filters) */
export async function fetchCreditNotes(
  params: CreditNoteListParams = {},
): Promise<CreditNoteListResponse> {
  if (USE_DUMMY) {
    let rows = [...dummyStore];
    const q = String(params.search || "")
      .trim()
      .toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          (r.creditNoteNumber || "").toLowerCase().includes(q) ||
          (r.customerName || "").toLowerCase().includes(q) ||
          (r.salesInvoiceNumber || "").toLowerCase().includes(q),
      );
    }
    if (params.status) rows = rows.filter((r) => r.status === params.status);
    if (params.reason) rows = rows.filter((r) => r.reason === params.reason);
    if (params.customerId)
      rows = rows.filter((r) => r.customerId === params.customerId);

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 20);
    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    return {
      success: true,
      message: "OK (dummy)",
      data: rows.slice(start, start + limit),
      total,
      page,
      limit,
      totalPages,
    };
  }

  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") qs.set(k, String(v));
  });
  const path = qs.toString() ? `${ENDPOINT}?${qs}` : ENDPOINT;
  const raw = await apiCall<unknown>("GET", path);
  return unwrapList(raw);
}

/** Get single credit note */
export async function fetchCreditNoteById(
  id: string,
): Promise<CreditNoteResponse> {
  if (USE_DUMMY) {
    const found = dummyStore.find((r) => r.id === id);
    if (!found) throw new Error("Credit note not found");
    return { success: true, message: "OK (dummy)", data: found };
  }
  const raw = await apiCall<unknown>("GET", `${ENDPOINT}/${id}`);
  return unwrapOne(raw);
}

/** Create credit note */
export async function createCreditNote(
  payload: CreateCreditNotePayload,
): Promise<CreditNoteResponse> {
  if (USE_DUMMY) {
    const id = `cn-${Date.now()}`;
    const items = (payload.items || []).map((it, i) => {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.unitPrice) || 0;
      const disc = Number(it.discountAmount) || 0;
      const taxable = Math.max(0, qty * price - disc);
      const rate = Number(it.gstRate ?? it.taxRate) || 0;
      const tax = (taxable * rate) / 100;
      const isInter = payload.taxType === "INTER_STATE";
      return {
        id: `cni-${id}-${i}`,
        productId: it.productId,
        itemName: it.itemName || "Item",
        itemCode: it.itemCode || "NA",
        hsnSacCode: it.hsnSacCode || "NA",
        unit: it.unit || "PCS",
        quantity: qty,
        unitPrice: price,
        discountAmount: disc,
        taxableAmount: taxable,
        gstRate: rate,
        cgstAmount: isInter ? 0 : tax / 2,
        sgstAmount: isInter ? 0 : tax / 2,
        igstAmount: isInter ? tax : 0,
        lineTotal: taxable + tax,
      };
    });
    const taxableAmount = items.reduce((s, x) => s + (x.taxableAmount || 0), 0);
    const cgstAmount = items.reduce((s, x) => s + (x.cgstAmount || 0), 0);
    const sgstAmount = items.reduce((s, x) => s + (x.sgstAmount || 0), 0);
    const igstAmount = items.reduce((s, x) => s + (x.igstAmount || 0), 0);
    const grandTotal = taxableAmount + cgstAmount + sgstAmount + igstAmount;

    const note: CreditNote = {
      id,
      creditNoteNumber: `CN-2026-${String(dummyStore.length + 1).padStart(4, "0")}`,
      creditNoteDate: payload.creditNoteDate,
      financialYear: payload.financialYear || null,
      status: payload.status || "ISSUED",
      reason: payload.reason,
      customerId: payload.customerId,
      customerName: payload.customerName || "Customer",
      customerPhone: payload.customerPhone || null,
      customerGSTIN: payload.customerGSTIN || null,
      salesInvoiceId: payload.salesInvoiceId || null,
      salesInvoiceNumber: payload.salesInvoiceNumber || null,
      taxType: payload.taxType || "INTRA_STATE",
      placeOfSupply: payload.placeOfSupply || null,
      totalItems: items.length,
      totalQuantity: items.reduce((s, x) => s + x.quantity, 0),
      taxableAmount: payload.taxableAmount ?? taxableAmount,
      discountAmount: payload.discountAmount ?? 0,
      cgstAmount: payload.cgstAmount ?? cgstAmount,
      sgstAmount: payload.sgstAmount ?? sgstAmount,
      igstAmount: payload.igstAmount ?? igstAmount,
      cessAmount: 0,
      roundOffAmount: payload.roundOffAmount ?? 0,
      grandTotal: payload.grandTotal ?? grandTotal,
      remarks: payload.remarks || null,
      notes: payload.notes || null,
      items,
      creditNoteSettlement: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dummyStore = [note, ...dummyStore];
    return { success: true, message: "Created (dummy)", data: note };
  }

  const raw = await apiCall<unknown>("POST", ENDPOINT, payload);
  return unwrapOne(raw);
}

/** Update credit note (limited fields while ISSUED) */
export async function updateCreditNote(
  id: string,
  payload: UpdateCreditNotePayload,
): Promise<CreditNoteResponse> {
  if (USE_DUMMY) {
    const idx = dummyStore.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error("Credit note not found");
    const prev = dummyStore[idx];
    const next: CreditNote = {
      ...prev,
      ...payload,
      items: prev.items,
      updatedAt: new Date().toISOString(),
    };
    dummyStore = [...dummyStore.slice(0, idx), next, ...dummyStore.slice(idx + 1)];
    return { success: true, message: "Updated (dummy)", data: next };
  }
  const raw = await apiCall<unknown>("PATCH", `${ENDPOINT}/${id}`, payload);
  return unwrapOne(raw);
}

/** Settlement / adjustment (refund | exchange | adjustment) */
export async function adjustCreditNote(
  id: string,
  payload: CreditNoteAdjustmentPayload,
): Promise<CreditNoteResponse> {
  if (USE_DUMMY) {
    const idx = dummyStore.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error("Credit note not found");
    const prev = dummyStore[idx];
    if (prev.status === "CANCELLED") {
      throw new Error("Cannot adjust a cancelled credit note");
    }
    const statusMap = {
      REFUND: "REFUNDED",
      EXCHANGE: "EXCHANGED",
      ADJUSTMENT: "ADJUSTED",
    } as const;
    const next: CreditNote = {
      ...prev,
      status: statusMap[payload.type],
      creditNoteSettlement: {
        id: `set-${Date.now()}`,
        creditNoteId: id,
        type: payload.type,
        status: "COMPLETED",
        settlementDate: payload.settlementDate,
        amount: payload.amount,
        remarks: payload.remarks || null,
        notes: payload.notes || null,
      },
      updatedAt: new Date().toISOString(),
    };
    dummyStore = [...dummyStore.slice(0, idx), next, ...dummyStore.slice(idx + 1)];
    return { success: true, message: "Adjusted (dummy)", data: next };
  }
  const raw = await apiCall<unknown>(
    "POST",
    `${ENDPOINT}/${id}/adjust`,
    payload,
  );
  return unwrapOne(raw);
}

/** Cancel credit note */
export async function cancelCreditNote(
  id: string,
  remarks?: string,
): Promise<CreditNoteResponse> {
  if (USE_DUMMY) {
    const idx = dummyStore.findIndex((r) => r.id === id);
    if (idx < 0) throw new Error("Credit note not found");
    const prev = dummyStore[idx];
    const next: CreditNote = {
      ...prev,
      status: "CANCELLED",
      remarks: remarks || prev.remarks,
      updatedAt: new Date().toISOString(),
    };
    dummyStore = [...dummyStore.slice(0, idx), next, ...dummyStore.slice(idx + 1)];
    return { success: true, message: "Cancelled (dummy)", data: next };
  }
  const raw = await apiCall<unknown>("POST", `${ENDPOINT}/${id}/cancel`, {
    remarks,
  });
  return unwrapOne(raw);
}
