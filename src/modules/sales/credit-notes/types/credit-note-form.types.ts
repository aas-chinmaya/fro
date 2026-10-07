import type {
  CreditNote,
  CreditNoteReason,
  CreditNoteStatus,
  TaxType,
} from "./credit-note.types";

export type CreditNoteFormMode = "create";

export interface CreditNoteFormProps {
  mode: CreditNoteFormMode;
  creditNote?: CreditNote | null;
  /** Prefill from linked sales invoice */
  fromInvoiceId?: string | null;
  onSuccess?: (cn?: CreditNote | null) => void;
  onCancel?: () => void;
}

export interface CreditNoteItemFormValues {
  id?: string;
  productId: string;
  itemName: string;
  itemCode?: string;
  description?: string | null;
  hsnSacCode?: string;
  unit?: string;
  classification?: "GOODS" | "SERVICES";
  quantity: number;
  unitPrice: number;
  rate?: number;
  /** Alias used by shared invoice-style row UI */
  price?: number;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  /** Alias used by shared invoice-style row UI */
  discount?: number;
  stockAvailable?: number | null;
  discountAmount?: number;
  gstRate: number;
  taxRate?: number;
  taxableAmount?: number;
  cgstRate?: number;
  sgstRate?: number;
  igstRate?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  lineTotal?: number;
}

export interface CreditNoteFormValues {
  creditNoteDate: string;
  financialYear?: string | null;
  reason: CreditNoteReason;
  status?: CreditNoteStatus;

  customerId: string;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerGSTIN?: string | null;

  /** Always required — every credit note is invoice-linked */
  salesInvoiceId: string;
  salesInvoiceNumber?: string | null;

  placeOfSupply?: string;
  placeOfSupplyCode?: string;
  taxType?: TaxType;

  items: CreditNoteItemFormValues[];

  taxableAmount?: number;
  discountAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  cessAmount?: number;
  roundOffAmount?: number;
  grandTotal?: number;

  remarks?: string | null;
  notes?: string | null;
  termsAndConditions?: string | null;
}
