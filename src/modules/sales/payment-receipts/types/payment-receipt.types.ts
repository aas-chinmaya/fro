// ==========================================================
// PAYMENT RECEIPT CORE ENUMS
// ==========================================================

export type ReceiptVoucherStatus = "CANCELLED" | "RECEIVED";
export type ReceiptSource = "MANUAL" | "ONLINE" | "OTHER" | "POS";
export type PaymentReceiptStatus = ReceiptVoucherStatus;
export type PaymentMethod = "CASH" | "UPI" | "CARD" | "NET_BANKING";
export type AdjustmentStatus = "UNADJUSTED" | "PARTIALLY_ADJUSTED" | "ADJUSTED";
export type AdjustmentType = "ADVANCE" | "INSTALLMENT";

// ==========================================================
// NESTED CUSTOMER (from API response)
// ==========================================================

export interface PaymentReceiptCustomer {
  id: string;
  tenantId?: string | null;
  branchId?: string | null;
  customerCode?: string | null;
  customerType?: string | null;
  name: string;
  mobile?: string | null;
  alternateMobile?: string | null;
  email?: string | null;
  gstin?: string | null;
  pan?: string | null;
  companyName?: string | null;
  creditLimit?: string | number | null;
  creditDays?: number | null;
  openingBalance?: string | number | null;
  outstandingBalance?: string | number | null;
  rewardPoints?: number | null;
  isActive?: boolean;
  notes?: string | null;
}

// ==========================================================
// NESTED PAYMENT (from API response)
// ==========================================================

export interface PaymentReceiptPayment {
  id: string;
  tenantId?: string | null;
  branchId?: string | null;
  paymentNumber?: string | null;
  customerId?: string | null;
  invoiceId?: string | null;
  amount: string | number;
  paymentMethod: PaymentMethod | string;
  paymentStatus: string;
  paymentDate: string;
  remarks?: string | null;
  documentType?: string | null;
  documentNumber?: string | null;
  paymentGateway?: string | null;
  gatewayOrderId?: string | null;
  gatewayPaymentId?: string | null;
  gatewaySignature?: string | null;
  transactionReference?: string | null;
  gatewayResponse?: unknown;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;
}

// ==========================================================
// PAYMENT RECEIPT MODEL (matches API)
// ==========================================================

export interface PaymentReceipt {
  id: string;
  tenantId?: string | null;
  branchId?: string | null;

  receiptNumber?: string | null;
  /** Full ISO datetime from API e.g. 2026-09-18T12:59:00.000Z */
  receiptDate: string;
  financialYear: string;

  receiptStatus: ReceiptVoucherStatus | string;
  receiptSource: ReceiptSource | string;
  adjustmentStatus?: AdjustmentStatus | string | null;

  customerId?: string | null;
  customerName: string;
  customerPhone?: string | null;
  customerGSTIN?: string | null;

  paymentId?: string | null;
  amount: number | string;
  remarks?: string | null;
  notes?: string | null;

  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  deletedAt?: string | null;

  customer?: PaymentReceiptCustomer | null;
  payment?: PaymentReceiptPayment | null;
}

// ==========================================================
// FORM VALUES
// ==========================================================

export interface PaymentReceiptFormValues {
  receiptDate: string; // date input YYYY-MM-DD (converted to ISO on submit)
  financialYear: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerGSTIN: string;
  invoiceId: string;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  amount: number;
  notes: string;
}

export const PAYMENT_RECEIPT_FORM_DEFAULTS: PaymentReceiptFormValues = {
  receiptDate: new Date().toISOString().slice(0, 10),
  financialYear: "",
  customerId: "",
  customerName: "",
  customerPhone: "",
  customerGSTIN: "",
  invoiceId: "",
  paymentMethod: "CASH",
  transactionReference: "",
  amount: 0,
  notes: "",
};

// ==========================================================
// CREATE / UPDATE PAYLOAD
// ==========================================================

export interface CreatePaymentReceiptPayload {
  receiptDate: string; // full ISO
  financialYear: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerGSTIN?: string;
  invoiceId?: string;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  amount: number;
  notes?: string;
}

export type UpdatePaymentReceiptPayload = Partial<CreatePaymentReceiptPayload>;

// ==========================================================
// ADJUSTMENT
// ==========================================================

export interface PaymentAdjustmentPayload {
  tenantId?: string;
  branchId?: string;
  customerId?: string;
  paymentId?: string;
  documentType: "SALES_INVOICE";
  documentId: string;
  documentNumber: string;
  amount: number;
  adjustmentType: AdjustmentType;
  adjustmentDate: string;
  remarks?: string;
  createdBy?: string | null;
}

export interface PaymentAdjustment {
  id: string;
  [key: string]: unknown;
}

// ==========================================================
// QUERY / RESPONSE
// ==========================================================

export interface PaymentReceiptQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  status?: PaymentReceiptStatus | string;
  fromDate?: string;
  toDate?: string;
}

export interface PaymentReceiptResponse {
  success: boolean;
  message: string;
  data: PaymentReceipt;
}

export interface PaymentReceiptListResponse {
  success: boolean;
  message?: string;
  data: PaymentReceipt[];
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}
