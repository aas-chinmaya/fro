// ============================================================
// QUOTATION TYPES
// ============================================================

export type QuotationStatus =
  | "DRAFT"
  | "FINALIZED"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED";

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
  itemName?: string | null;
  description?: string | null;
  hsnSac?: string | null;
  unit?: string | null;
  quantity: number;
  /** Unit price */
  price?: number;
  /** Alias of price (API / legacy) */
  rate?: number;
  discount?: number;
  discountType?: DiscountType;
  /** Combined GST rate % — split into CGST/SGST or IGST by taxType */
  taxRate?: number;
  taxAmount?: number;
  cgstRate?: number;
  cgstAmount?: number;
  sgstRate?: number;
  sgstAmount?: number;
  igstRate?: number;
  igstAmount?: number;
  /** Line total after discount + tax */
  total?: number;
  /** Alias of total (API / legacy) */
  amount?: number;
  stockAvailable?: number | null;
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


businessBankName?: string | null;
businessBankAccountNumber?: string | null;
businessBankIFSC?: string | null;
businessBankBranch?: string | null;
businessUPIId?: string | null;

showBankDetails: boolean;
showUPIDetails: boolean;

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
  totalQuantity: number;
  taxableAmount: number;
  discountAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  cessAmount: number;
  roundOffAmount: number;
  grandTotal: number;

  acceptedAt?: string | null;
  acceptedBy?: string | null;
  rejectedAt?: string | null;
  rejectedBy?: string | null;
  rejectionReason?: string | null;

  notes?: string | null;
  termsAndConditions?: string | null;
  signature?: string | null;
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
  branchId?: string;
  financialYear?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface QuotationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface QuotationListResponse {
  success: boolean;
  message: string;
  data: Quotation[];
  pagination?: QuotationPagination;
}

export interface QuotationResponse {
  success: boolean;
  message: string;
  data: Quotation;
}

export interface QuotationCreatePayload {

  quotationDate: string;
  validUntil: string;
  financialYear?: string | null;

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
  businessCountry?: string;


businessBankName?: string | null;
businessBankAccountNumber?: string | null;
businessBankIFSC?: string | null;
businessBankBranch?: string | null;
businessUPIId?: string | null;

showBankDetails?: boolean;
showUPIDetails?: boolean;

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
  prospectCountry?: string;

  placeOfSupply?: string | null;
  placeOfSupplyCode?: string | null;
  taxType?: TaxType | null;
  reverseCharge?: boolean;
  isExport?: boolean;
  isSEZ?: boolean;
  currency?: string;
  exchangeRate?: number | null;

  items: QuotationItem[];

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

  notes?: string | null;
  termsAndConditions?: string | null;
  signature?: string | null;
  status?: QuotationStatus;
  
}

export interface QuotationUpdatePayload
  extends Partial<Omit<QuotationCreatePayload, "tenantId" | "createdBy">> {
  updatedBy?: string;
}

/** PATCH /quotations/:id/status */
export interface QuotationStatusChangePayload {
  status: QuotationStatus;
  remarks?: string;
}