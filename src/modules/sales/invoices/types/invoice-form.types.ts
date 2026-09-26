import type {
  DiscountType,
  Invoice,
  InvoiceStatus,
  InvoiceType,
  PaymentStatus,
  TaxType,
} from "./invoice.types";

export type InvoiceFormMode = "create" | "edit";

export interface InvoiceFormProps {
  mode: InvoiceFormMode;
  invoice?: Invoice | null;
  onSuccess?: (invoice: Invoice) => void;
  onCancel?: () => void;
}

export interface InvoiceItemFormValues {
  id?: string;
  itemId?: string | null;
  productId?: string;
  itemName?: string;
  productName?: string;
  itemCode?: string;
  unit?: string;
  hsnSac?: string;
  hsnSacCode?: string;
  classification?: "GOODS" | "SERVICES";
  quantity: number;
  rate: number;
  price?: number;
  gstRate?: number;
  taxRate?: number;
  discountType: DiscountType;
  discountValue: number;
  discount?: number;
  taxableAmount?: number;
  taxAmount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  cess?: number;
  cgstRate?: number;
  cgstAmount?: number;
  sgstRate?: number;
  sgstAmount?: number;
  igstRate?: number;
  igstAmount?: number;
  amount?: number;
  total?: number;
  grandTotal?: number;
  description?: string;
  stockAvailable?: number | null;
}

export interface InvoiceFormValues {
  invoiceType: InvoiceType;
  invoiceNumber?: string;
  invoiceDate: string;
  financialYear?: string | null;
  invoiceStatus?: InvoiceStatus;
  invoiceSource?: string;

  buyerName: string;
  buyerCompanyName?: string;
  buyerGSTIN?: string;
  buyerPAN?: string;
  buyerPhone: string;
  buyerEmail?: string | null;
  buyerType?: string;
  buyerContactPerson?: string;

  billingAddressLine1: string;
  billingAddressLine2?: string;
  billingCity: string;
  billingState: string;
  billingStateCode?: string;
  billingPincode: string;
  billingCountry: string;

  sameAsBilling?: boolean;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingStateCode?: string;
  shippingPincode?: string;
  shippingCountry?: string;

  placeOfSupply: string;
  placeOfSupplyCode?: string;
  taxType?: TaxType;
  reverseCharge?: boolean;
  isExport?: boolean;
  isSEZ?: boolean;
  currency: string;
  exchangeRate?: number | null;

  items: InvoiceItemFormValues[];

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

  paymentStatus?: PaymentStatus;
  paymentMethod?: string | null;
  paidAmount?: number;
  pendingAmount?: number;
  paymentDate?: string | null;
  transactionId?: string | null;
  receivedAccount?: string;

  notes?: string | null;
  termsAndConditions: string;
  signature?: string | null;

  // Seller snapshot (read-only from session, sent for document print)
  sellerLegalName?: string;
  sellerTradeName?: string;
  sellerGSTIN?: string;
  sellerPAN?: string;
  sellerPhone?: string;
  sellerEmail?: string | null;
  sellerAddressLine1?: string;
  sellerAddressLine2?: string;
  sellerCity?: string;
  sellerState?: string;
  sellerStateCode?: string;
  sellerPincode?: string;
  sellerCountry?: string;
  sellerBankName?: string;
  sellerBankAccountNumber?: string;
  sellerBankIFSC?: string;
  sellerBankBranch?: string;
  sellerUPIId?: string;
  showBankDetails?: boolean;
  showUPIDetails?: boolean;
  businessLogo?: string | null;

  status?: InvoiceStatus;
}
