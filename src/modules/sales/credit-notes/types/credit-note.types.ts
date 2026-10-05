// ============================================================
// CREDIT NOTE TYPES
// ============================================================

export type CreditNoteStatus =
  | "ISSUED"
  | "REFUNDED"
  | "EXCHANGED"
  | "ADJUSTED"
  | "CANCELLED";

export type CreditNoteReason =
  | "SALES_RETURN"
  | "PRICE_ADJUSTMENT"
  | "POST_SALE_DISCOUNT"
  | "TAX_ADJUSTMENT"
  | "RATE_DIFFERENCE"
  | "BILLING_CORRECTION"
  | "OTHER";

export type CreditNoteSettlementType = "REFUND" | "EXCHANGE" | "ADJUSTMENT";

export type CreditNoteSettlementStatus = "COMPLETED" | "CANCELLED";

export type TaxType = "INTRA_STATE" | "INTER_STATE";

export interface CreditNoteItem {
  id?: string;
  creditNoteId?: string;
  lineNumber?: number;
  productId: string;
  itemCode?: string;
  itemName: string;
  description?: string | null;
  hsnSacCode?: string;
  itemType?: string;
  classification?: "GOODS" | "SERVICES";
  unitCode?: string;
  unitName?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  rate?: number;
  discountAmount?: number;
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue?: number;
  taxableAmount?: number;
  gstRate?: number;
  taxRate?: number;
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  cessAmount?: number;
  lineTotal?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreditNoteSettlement {
  id?: string;
  creditNoteId?: string;
  type: CreditNoteSettlementType;
  status: CreditNoteSettlementStatus;
  settlementDate: string;
  amount: number;
  remarks?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreditNote {
  id: string;
  tenantId?: string;
  branchId?: string | null;
  creditNoteNumber?: string | null;
  creditNoteDate: string;
  financialYear?: string | null;
  status: CreditNoteStatus;
  reason: CreditNoteReason;

  customerId: string;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerGSTIN?: string | null;
  customerPAN?: string | null;

  // Billing snapshot (optional, for print)
  billingAddressLine1?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingStateCode?: string | null;
  billingPincode?: string | null;
  placeOfSupply?: string | null;
  placeOfSupplyCode?: string | null;
  taxType?: TaxType | null;

  salesInvoiceId?: string | null;
  salesInvoiceNumber?: string | null;

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

  remarks?: string | null;
  notes?: string | null;
  termsAndConditions?: string | null;

  // Seller snapshot (print)
  sellerLegalName?: string | null;
  sellerTradeName?: string | null;
  sellerGSTIN?: string | null;
  sellerPAN?: string | null;
  sellerPhone?: string | null;
  sellerAddressLine1?: string | null;
  sellerCity?: string | null;
  sellerState?: string | null;
  sellerPincode?: string | null;

  items: CreditNoteItem[];
  creditNoteSettlement?: CreditNoteSettlement | null;

  createdBy?: string;
  updatedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/** Create body — items are minimal; totals computed server/client */
export interface CreateCreditNoteItem {
  productId: string;
  itemName?: string;
  itemCode?: string;
  hsnSacCode?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue?: number;
  gstRate?: number;
  taxRate?: number;
}

export interface CreateCreditNotePayload {
  customerId: string;
  customerName?: string;
  customerPhone?: string | null;
  customerGSTIN?: string | null;
  salesInvoiceId?: string | null;
  salesInvoiceNumber?: string | null;
  creditNoteDate: string;
  financialYear?: string | null;
  reason: CreditNoteReason;
  taxType?: TaxType;
  placeOfSupply?: string | null;
  placeOfSupplyCode?: string | null;
  items: CreateCreditNoteItem[];
  remarks?: string | null;
  notes?: string | null;
  termsAndConditions?: string | null;
  // Optional precomputed totals (client may send; backend can recompute)
  taxableAmount?: number;
  discountAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  cessAmount?: number;
  roundOffAmount?: number;
  grandTotal?: number;
  status?: CreditNoteStatus;
}

export interface UpdateCreditNotePayload {
  reason?: CreditNoteReason;
  remarks?: string | null;
  notes?: string | null;
  termsAndConditions?: string | null;
  items?: CreateCreditNoteItem[];
  taxableAmount?: number;
  discountAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  roundOffAmount?: number;
  grandTotal?: number;
}

/** Settlement / adjustment action */
export interface CreditNoteAdjustmentPayload {
  type: CreditNoteSettlementType;
  settlementDate: string;
  amount: number;
  remarks?: string | null;
  notes?: string | null;
}

export interface CreditNoteListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CreditNoteStatus;
  reason?: CreditNoteReason;
  customerId?: string;
  salesInvoiceId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreditNoteListResponse {
  success?: boolean;
  message?: string;
  data: CreditNote[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreditNoteResponse {
  success?: boolean;
  message?: string;
  data: CreditNote;
}
