// ============================================================
// CREDIT NOTE TYPES — aligned with backend
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

export type GSTClassification = "GOODS" | "SERVICES";

export type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD"
  | "BANK_TRANSFER"
  | "CHEQUE"
  | "OTHER";

export interface CreditNoteItem {
  id?: string;
  creditNoteId?: string;
  lineNumber?: number;
  productId: string;
  itemCode?: string;
  itemName: string;
  description?: string | null;
  hsnSacCode?: string;
  itemType?: GSTClassification | string;
  classification?: GSTClassification;
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
  type?: CreditNoteSettlementType;
  settlementType?: CreditNoteSettlementType;
  status?: CreditNoteSettlementStatus;
  settlementStatus?: CreditNoteSettlementStatus;
  settlementDate?: string;
  amount?: number;
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

/** Item shape required by backend CreateCreditNoteRequest */
export interface CreateCreditNoteItem {
  productId: string;
  itemCode: string;
  itemName: string;
  description?: string;
  hsnSacCode: string;
  itemType: GSTClassification;
  unitCode: string;
  unitName: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxableAmount: number;
  gstRate: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  cessAmount?: number;
  lineTotal: number;
  lineNumber?: number;
}

/** Create body — matches backend CreateCreditNoteRequest */
export interface CreateCreditNotePayload {
  creditNoteDate?: string;
  reason: CreditNoteReason;
  customerId: string;
  salesInvoiceId?: string;
  totalItems?: number;
  totalQuantity?: number;
  taxableAmount?: number;
  discountAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  cessAmount?: number;
  roundOffAmount?: number;
  grandTotal?: number;
  remarks?: string;
  notes?: string;
  items: CreateCreditNoteItem[];
}

/** Refund body — POST /:id/refund */
export interface CreditNoteRefundPayload {
  paymentMethod: PaymentMethod;
  paymentDate?: string;
  transactionReference?: string;
  remarks?: string;
}

/** Exchange body — POST /:id/exchange */
export interface CreditNoteExchangePayload {
  remarks?: string;
}

/** Cancel body — POST /:id/cancel */
export interface CreditNoteCancelPayload {
  reason: string;
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
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface CreditNoteResponse {
  success?: boolean;
  message?: string;
  data: CreditNote;
}
