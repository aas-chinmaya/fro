"use client";

import type { PaymentReceipt } from "../../types/payment-receipt.types";
import { IndianRupee } from "lucide-react";

interface ReceiptPreviewProps {
  paymentReceipt: PaymentReceipt;
}

export default function ReceiptPreview({
  paymentReceipt,
}: ReceiptPreviewProps) {
  const amount = Number(paymentReceipt.amount ?? 0);
  const formattedAmount = amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const customer = paymentReceipt.customer;
  const payment = paymentReceipt.payment;
  const notes = paymentReceipt.notes;

  return (
    <div className="h-full w-full bg-gray-100">
      <div className="h-full w-full bg-white shadow-sm print:shadow-none">
        <div className="border-b border-gray-200 px-6 py-5 text-center">
          <h1 className="text-lg font-bold tracking-wide text-gray-900">
            PAYMENT RECEIPT
          </h1>
          <p className="mt-1.5 text-xs text-gray-500">
            Date: {formatDate(paymentReceipt.receiptDate)}
          </p>
        </div>

        <div className="grid grid-cols-3 border-b border-gray-200 text-sm">
          <div className="border-r border-gray-200 px-5 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              Receipt No.
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              {paymentReceipt.receiptNumber || "—"}
            </p>
          </div>
          <div className="border-r border-gray-200 px-5 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              Financial Year
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              {paymentReceipt.financialYear || "—"}
            </p>
          </div>
          <div className="px-5 py-3.5">
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
              Status
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              {formatLabel(paymentReceipt.receiptStatus)}
            </p>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <div className="px-5 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Received From
            </p>
          </div>
          <div className="px-5 py-4">
            <table className="w-full text-sm">
              <tbody>
                <Row
                  label="Customer Name"
                  value={paymentReceipt.customerName || customer?.name}
                />
                {customer?.companyName ? (
                  <Row label="Company" value={customer.companyName} />
                ) : null}
                <Row
                  label="Phone"
                  value={paymentReceipt.customerPhone || customer?.mobile}
                />
                {customer?.email ? (
                  <Row label="Email" value={customer.email} />
                ) : null}
                <Row
                  label="GSTIN"
                  value={paymentReceipt.customerGSTIN || customer?.gstin}
                />
                {customer?.pan ? <Row label="PAN" value={customer.pan} /> : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <div className="px-5 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Payment Details
            </p>
          </div>
          <div className="px-5 py-4">
            <table className="w-full text-sm">
              <tbody>
                <Row
                  label="Source"
                  value={formatLabel(paymentReceipt.receiptSource)}
                />
                <Row
                  label="Payment Method"
                  value={formatLabel(payment?.paymentMethod || "CASH")}
                />
                <Row
                  label="Transaction Reference"
                  value={payment?.transactionReference}
                />
                {payment?.paymentNumber ? (
                  <Row label="Payment No." value={payment.paymentNumber} />
                ) : null}
                {payment?.paymentStatus ? (
                  <Row
                    label="Payment Status"
                    value={formatLabel(payment.paymentStatus)}
                  />
                ) : null}
                {payment?.documentNumber ? (
                  <Row label="Document No." value={payment.documentNumber} />
                ) : null}
                {paymentReceipt.adjustmentStatus ? (
                  <Row
                    label="Adjustment"
                    value={formatLabel(paymentReceipt.adjustmentStatus)}
                  />
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-5 py-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Amount Received (Rs.)
              </p>
              <p className="mt-1.5 text-xs text-gray-500">
                {numberToWords(amount)} Only
              </p>
            </div>
            <p className="flex items-center gap-1 text-xl font-semibold text-gray-900">
              <IndianRupee className="h-5 w-5" strokeWidth={2.5} />
              {formattedAmount}
            </p>
          </div>
        </div>

        {notes ? (
          <div className="border-b border-gray-200">
            <div className="px-5 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Additional Info
              </p>
            </div>
            <div className="space-y-3 px-5 py-4 text-sm">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                  Notes
                </p>
                <p className="mt-1 whitespace-pre-wrap text-gray-800">{notes}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <tr>
      <td className="w-[140px] py-1.5 pr-4 align-top text-gray-500">{label}</td>
      <td className="py-1.5 font-medium text-gray-900">{value}</td>
    </tr>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLabel(value?: string | null) {
  if (!value) return "—";
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];
  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000)
      return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + convert(n % 100) : "");
    if (n < 100000)
      return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000)
      return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  };
  return convert(Math.floor(num));
}
