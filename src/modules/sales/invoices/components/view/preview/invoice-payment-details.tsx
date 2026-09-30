"use client";

/**
 * Payment section on invoice view — no bank / UPI details.
 * Shows payment status, method, paid amount, date, transaction id only.
 */
type InvoicePaymentDetailsProps = {
  paymentStatus?: string | null;
  paymentMethod?: string | null;
  paidAmount?: number | null;
  pendingAmount?: number | null;
  paymentDate?: string | null;
  transactionId?: string | null;
};

function fmt(n: number) {
  return `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function InvoicePaymentDetails({
  paymentStatus,
  paymentMethod,
  paidAmount,
  pendingAmount,
  paymentDate,
  transactionId,
}: InvoicePaymentDetailsProps) {
  const status = String(paymentStatus || "PENDING").toUpperCase();
  if (status === "PENDING" && !(Number(paidAmount) > 0) && !paymentMethod) {
    return null;
  }

  return (
    <div className="space-y-1 text-[11px] text-slate-700">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-800">
        Payment
      </p>
      <div className="grid gap-0.5 sm:grid-cols-2">
        {paymentStatus ? (
          <p>
            <span className="text-slate-500">Status: </span>
            {status}
          </p>
        ) : null}
        {paymentMethod ? (
          <p>
            <span className="text-slate-500">Method: </span>
            {String(paymentMethod).toUpperCase()}
          </p>
        ) : null}
        {paidAmount != null ? (
          <p>
            <span className="text-slate-500">Paid: </span>
            {fmt(Number(paidAmount))}
          </p>
        ) : null}
        {pendingAmount != null && Number(pendingAmount) > 0 ? (
          <p>
            <span className="text-slate-500">Pending: </span>
            {fmt(Number(pendingAmount))}
          </p>
        ) : null}
        {paymentDate ? (
          <p>
            <span className="text-slate-500">Date: </span>
            {String(paymentDate).slice(0, 10)}
          </p>
        ) : null}
        {transactionId ? (
          <p>
            <span className="text-slate-500">Txn ID: </span>
            {transactionId}
          </p>
        ) : null}
      </div>
    </div>
  );
}
