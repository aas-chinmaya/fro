// ============================================================
// QUOTATION TYPES
// ============================================================

export type QuotationStatus =
  | "DRAFT"
  | "FINALIZED"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

export type DiscountType = "PERCENTAGE" | "FIXED";

/** INTRA_STATE → CGST+SGST | INTER_STATE → IGST */
export type TaxType = "INTRA_STATE" | "INTER_STATE";

export interface QuotationCustomer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  gstin?: string | null;
}

export interface QuotationItem {
  id?: string;
  itemId?: string | null;
  productId?: string | null;
  variantId?: string | null;
  itemName?: string | null;
  itemCode?: string | null;
  description?: string | null;
  /** Prefer hsnSacCode (API) */
  hsnSacCode?: string | null;
  /** @deprecated legacy alias */
  hsnSac?: string | null;
  unit?: string | null;
  quantity: number | string;
  price?: number | string;
  rate?: number | string;
  discount?: number | string;
  discountValue?: number | string;
  discountType?: DiscountType;
  discountAmount?: number | string;
  taxableAmount?: number | string;
  taxRate?: number | string;
  taxAmount?: number | string;
  totalTaxAmount?: number | string;
  cgstRate?: number | string;
  cgstAmount?: number | string;
  sgstRate?: number | string;
  sgstAmount?: number | string;
  igstRate?: number | string;
  igstAmount?: number | string;
  cessRate?: number | string;
  cessAmount?: number | string;
  total?: number | string;
  amount?: number | string;
  lineTotal?: number | string;
  stockAvailable?: number | null;
  sortOrder?: number;
}

export interface Quotation {
  id: string;
  tenantId: string;
  branchId?: string | null;
  quotationNumber?: string | null;
  quotationDate: string;
  validUntil: string;
  financialYear?: string | null;
  quotationStatus: QuotationStatus;

  businessName: string;
  businessLegalName?: string | null;
  businessGSTIN?: string | null;
  businessPAN?: string | null;
  businessPhone?: string | null;
  businessEmail?: string | null;
  businessAddressLine1?: string | null;
  businessAddressLine2?: string | null;
  businessCity?: string | null;
  businessState?: string | null;
  businessStateCode?: string | null;
  businessPincode?: string | null;
  businessCountry: string;
  businessLogo?: string | null;
  prospectName: string;
  prospectCompanyName?: string | null;
  prospectGSTIN?: string | null;
  prospectPAN?: string | null;
  prospectPhone?: string | null;
  prospectEmail?: string | null;
  prospectAddressLine1?: string | null;
  prospectAddressLine2?: string | null;
  prospectCity?: string | null;
  prospectState?: string | null;
  prospectStateCode?: string | null;
  prospectPincode?: string | null;
  prospectCountry: string;

  customerId?: string | null;
  customer?: QuotationCustomer | null;

  placeOfSupply?: string | null;
  placeOfSupplyCode?: string | null;
  taxType?: TaxType | null;
  reverseCharge: boolean;
  isExport: boolean;
  isSEZ: boolean;
  currency: string;
  exchangeRate?: number | null;

  totalItems: number;
  totalQuantity: number | string;
  taxableAmount: number | string;
  discountAmount: number | string;
  cgstAmount: number | string;
  sgstAmount: number | string;
  igstAmount: number | string;
  cessAmount: number | string;
  roundOffAmount: number | string;
  grandTotal: number | string;

  acceptedAt?: string | null;
  acceptedBy?: string | null;
  rejectedAt?: string | null;
  rejectedBy?: string | null;
  rejectionReason?: string | null;
  finalizedAt?: string | null;
  finalizedBy?: string | null;
  statusChangedAt?: string | null;
  statusChangedBy?: string | null;
  statusNote?: string | null;

  notes?: string | null;
  termsAndConditions?: string | null;
  printCount: number;
  items: QuotationItem[];

  createdBy: string;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface QuotationListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuotationStatus;
  fromDate?: string;
  toDate?: string;
  branchId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface QuotationListResponse {
  data: Quotation[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  message?: string;
}

export interface QuotationResponse {
  data: Quotation;
  message?: string;
}

export interface UpdateQuotationStatusPayload {
  status: "ACCEPTED" | "REJECTED" | "FINALIZED";
  statusNote?: string | null;
}


export interface QuotationStatusChangePayload {
  status: "ACCEPTED" | "REJECTED" | "FINALIZED";
  statusNote?: string | null;
}

export type QuotationCreatePayload = Record<string, unknown>;
export type QuotationUpdatePayload = Record<string, unknown>;
