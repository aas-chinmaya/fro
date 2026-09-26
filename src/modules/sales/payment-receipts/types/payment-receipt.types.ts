
// ==========================================================
// PAYMENT RECEIPT CORE ENUMS
// ==========================================================

export type ReceiptVoucherStatus =
  | "CANCELLED"
  | "RECEIVED";

export type ReceiptSource =
  | "MANUAL"
  | "ONLINE"
  | "OTHER"
  | "POS";

export type PaymentReceiptStatus = ReceiptVoucherStatus;

export type PaymentMethod =
  | "CASH"
  | "UPI"
  | "CARD"
  | "NET_BANKING";

// ==========================================================
// PAYMENT RECEIPT MODEL
// ==========================================================

export interface PaymentReceipt {
  id: string;
  businessId?: string | null;
  branchId?: string | null;

  receiptNumber?: string | null;
  receiptDate: string;
  financialYear: string;

  receiptStatus: ReceiptVoucherStatus;
  receiptSource: ReceiptSource;

  customerName: string;
  customerPhone?: string | null;
  customerGSTIN?: string | null;

  paymentId?: string | null;
  invoiceId?: string | null;

  payment?: {
    id: string;
    businessId?: string | null;
    branchId?: string | null;
    paymentNumber?: string | null;
    customerId: string;
    invoiceId?: string | null;
    amount: string | number;
    paymentMethod: PaymentMethod;
    paymentStatus: string;
    paymentDate: string;
    documentType?: string | null;
    documentNumber?: string | null;
    paymentGateway?: string | null;
    gatewayOrderId?: string | null;
    gatewayPaymentId?: string | null;
    gatewaySignature?: string | null;
    transactionReference?: string | null;
    gatewayResponse?: unknown;
    createdBy: string;
    updatedBy?: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
  };

  amount: number | string;

  notes?: string | null;

  createdBy: string;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}
// ==========================================================
// PAYMENT RECEIPT FORM VALUES
// ==========================================================

export interface PaymentReceiptFormValues {
  receiptNumber?: string;
  receiptDate: string;
  financialYear?: string;

  /** UI only — never sent in payload */
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerGSTIN?: string;
  invoiceId?: string;
  paymentMethod: PaymentMethod;
  // Required for every payment method except CASH (enforced in the form
  // validation schema); optional/empty when paymentMethod is CASH.
  transactionReference?: string;
  amount: number;

  notes?: string;
}

export const PAYMENT_RECEIPT_FORM_DEFAULTS: PaymentReceiptFormValues = {
  receiptNumber: "",
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
// CREATE PAYMENT RECEIPT
// ==========================================================

/** No businessId / branchId / createdBy / customerId — backend uses auth */
export interface CreatePaymentReceiptPayload {
  receiptNumber?: string;
  receiptDate: string;
  financialYear?: string;

  customerName: string;
  customerPhone?: string;
  customerGSTIN?: string;
  invoiceId?: string;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  amount: number;

  notes?: string;
}

// ==========================================================
// UPDATE PAYMENT RECEIPT
// ==========================================================

export type UpdatePaymentReceiptPayload =
  Partial<CreatePaymentReceiptPayload>;

// ==========================================================
// QUERY PARAMS
// ==========================================================

export interface PaymentReceiptQueryParams {
  page?: number;
  limit?: number;
  search?: string;

  customerId?: string;
  status?: PaymentReceiptStatus;

  fromDate?: string;
  toDate?: string;
}

export interface PaymentReceiptResponse {
  success: boolean;
  message: string;
  data: PaymentReceipt;
}

// ==========================================================
// LIST RESPONSE
// ==========================================================

export interface PaymentReceiptListResponse {
  data: PaymentReceipt[];

  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}







export interface PaymentAdjustmentPayload {
  businessId: string;
  branchId?: string;
  customerId: string;
  paymentId: string;

  documentType: "SALES_INVOICE";
  documentId: string;
  documentNumber: string;

  amount: number;
  adjustmentType: "ADVANCE" | "INSTALLMENT";

  adjustmentDate?: string;
  remarks?: string;
  createdBy: string;
}

export interface PaymentAdjustment {
  id: string;
  paymentReceiptId: string;
  adjustmentAmount: number;
  adjustmentType: string;
  reason?: string;
  createdAt?: string;
  updatedAt?: string;
}