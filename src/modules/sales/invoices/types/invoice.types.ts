// ============================================================
// INVOICE TYPES — invoice module naming (buyer / seller)
// ============================================================

export type InvoiceType = "B2B" | "B2C" | "EXPORT" | "SEZ";

export type InvoiceStatus =
  | "DRAFT"
  | "FINALIZED"
  | "SENT"
  | "PAID"
  | "PARTIALLY_PAID"
  | "OVERDUE"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";

export type DiscountType = "PERCENTAGE" | "FIXED";

/** INTRA_STATE → CGST+SGST | INTER_STATE → IGST */
export type TaxType = "INTRA_STATE" | "INTER_STATE";

export interface InvoiceCustomer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  gstin?: string | null;
}

export interface InvoiceItem {
  id?: string;
  itemId?: string | null;
  productId?: string | null;
  itemName?: string | null;
  productName?: string | null;
  itemCode?: string | null;
  description?: string | null;
  hsnSac?: string | null;
  hsnSacCode?: string | null;
  unit?: string | null;
  classification?: "GOODS" | "SERVICES" | null;
  quantity: number;
  price?: number;
  rate?: number;
  discount?: number;
  discountValue?: number;
  discountType?: DiscountType;
  taxRate?: number;
  gstRate?: number;
  taxAmount?: number;
  cgstRate?: number;
  cgstAmount?: number;
  sgstRate?: number;
  sgstAmount?: number;
  igstRate?: number;
  igstAmount?: number;
  total?: number;
  amount?: number;
  taxableAmount?: number;
  stockAvailable?: number | null;
}

export interface Invoice {
  id: string;
  invoiceNumber?: string | null;
  invoiceDate: string;
  financialYear?: string | null;
  invoiceStatus: InvoiceStatus;
  invoiceType?: InvoiceType | null;

  // Seller (issuer)
  sellerTradeName?: string | null;
  sellerLegalName?: string | null;
  sellerGSTIN?: string | null;
  sellerPAN?: string | null;
  sellerPhone?: string | null;
  sellerEmail?: string | null;
  sellerAddressLine1?: string | null;
  sellerAddressLine2?: string | null;
  sellerCity?: string | null;
  sellerState?: string | null;
  sellerStateCode?: string | null;
  sellerPincode?: string | null;
  sellerCountry?: string | null;

  sellerBankName?: string | null;
  sellerBankAccountNumber?: string | null;
  sellerBankIFSC?: string | null;
  sellerBankBranch?: string | null;
  sellerUPIId?: string | null;

  showBankDetails?: boolean;
  showUPIDetails?: boolean;

  // Buyer (customer)
  customer?: InvoiceCustomer | null;
  buyerName: string;
  buyerCompanyName?: string | null;
  buyerGSTIN?: string | null;
  buyerPAN?: string | null;
  buyerPhone?: string | null;
  buyerEmail?: string | null;
  buyerType?: string | null;
  buyerContactPerson?: string | null;

  // Billing
  billingAddressLine1?: string | null;
  billingAddressLine2?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingStateCode?: string | null;
  billingPincode?: string | null;
  billingCountry?: string | null;

  // Shipping
  sameAsBilling?: boolean;
  shippingAddressLine1?: string | null;
  shippingAddressLine2?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingStateCode?: string | null;
  shippingPincode?: string | null;
  shippingCountry?: string | null;

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

  paymentStatus?: PaymentStatus | null;
  paymentMethod?: string | null;
  paidAmount?: number | null;
  pendingAmount?: number | null;
  paymentDate?: string | null;
  transactionId?: string | null;
  receivedAccount?: string | null;

  notes?: string | null;
  termsAndConditions?: string | null;
  signature?: string | null;
  printCount?: number;

  items: InvoiceItem[];

  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
  branchId?: string;
  financialYear?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface InvoicePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InvoiceListResponse {
  success: boolean;
  message: string;
  data: Invoice[];
  pagination?: InvoicePagination;
}

export interface InvoiceResponse {
  success: boolean;
  message: string;
  data: Invoice;
}

/** Create payload — never include tenantId / createdBy / businessId (backend auth) */
export interface InvoiceCreatePayload {
  invoiceType?: InvoiceType;
  invoiceDate: string;
  financialYear?: string | null;
  invoiceStatus?: InvoiceStatus;
  status?: InvoiceStatus;

  buyerName: string;
  buyerCompanyName?: string | null;
  buyerGSTIN?: string | null;
  buyerPAN?: string | null;
  buyerPhone?: string | null;
  buyerEmail?: string | null;

  billingAddressLine1?: string | null;
  billingAddressLine2?: string | null;
  billingCity?: string | null;
  billingState?: string | null;
  billingStateCode?: string | null;
  billingPincode?: string | null;
  billingCountry?: string | null;

  sameAsBilling?: boolean;
  shippingAddressLine1?: string | null;
  shippingAddressLine2?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingStateCode?: string | null;
  shippingPincode?: string | null;
  shippingCountry?: string | null;

  placeOfSupply?: string | null;
  placeOfSupplyCode?: string | null;
  taxType?: TaxType | null;
  reverseCharge?: boolean;
  isExport?: boolean;
  isSEZ?: boolean;
  currency?: string;

  items: InvoiceItem[];

  taxableAmount?: number;
  discountAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  cessAmount?: number;
  roundOffAmount?: number;
  grandTotal?: number;

  paymentStatus?: PaymentStatus | null;
  paymentMethod?: string | null;
  paidAmount?: number | null;
  paymentDate?: string | null;
  transactionId?: string | null;

  showBankDetails?: boolean;
  showUPIDetails?: boolean;

  notes?: string | null;
  termsAndConditions?: string | null;
  signature?: string | null;
}

export type InvoiceUpdatePayload = Partial<InvoiceCreatePayload>;

export interface InvoiceStatusChangePayload {
  status: string;
  remarks?: string;
}
