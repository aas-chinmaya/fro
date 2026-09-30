"use client";

/**
 * Payment details on invoice view — intentionally empty.
 * Paid / Pending / Method / Date / Txn are not shown on view page or PDF.
 * Payment status is managed in the form / list only.
 */
type InvoicePaymentDetailsProps = {
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  paidAmount?: number | null;
  pendingAmount?: number | null;
  paymentDate?: string | null;
  transactionId?: string | null;
};

export function InvoicePaymentDetails(_props: InvoicePaymentDetailsProps) {
  return null;
}
