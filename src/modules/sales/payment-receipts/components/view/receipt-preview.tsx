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

  const logo = paymentReceipt.businessLogo?.trim() || null;

  return (
    <div className="w-full border border-slate-800 bg-white">
      {/* Logo left | meta right — same as invoice/quotation */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex h-[52px] min-w-[72px] shrink-0 items-center justify-center sm:h-[64px] sm:min-w-[96px]">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt={paymentReceipt.businessName || "Logo"}
              className="max-h-full max-w-[110px] object-contain sm:max-w-[130px]"
            />
          ) : (
            <div className="text-center text-sm font-semibold text-slate-700">
              {paymentReceipt.businessName || "PAYMENT RECEIPT"}
            </div>
          )}
        </div>
        <div className="ml-auto min-w-0 space-y-0.5 text-right text-[11px] leading-[1.5] sm:text-[12px]">
          <div>
            <span className="font-semibold text-slate-800">Receipt No:</span>{" "}
            <span className="font-normal text-slate-700">
              {paymentReceipt.receiptNumber || "—"}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-800">Receipt Date:</span>{" "}
            <span className="font-normal text-slate-700">
              {formatDate(paymentReceipt.receiptDate)}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-800">Financial Year:</span>{" "}
            <span className="font-normal text-slate-700">
              {paymentReceipt.financialYear || "—"}
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-800">Status:</span>{" "}
            <span className="font-normal text-slate-700">
              {formatLabel(paymentReceipt.receiptStatus)}
            </span>
          </div>
        </div>
      </div>

      {/* Received From */}
      <div className="border-b border-gray-900">
        <div className="border-b border-gray-200 px-3 py-1.5 sm:px-5 sm:py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-800">
            Received From
          </p>
        </div>
        <div className="px-3 py-2.5 sm:px-5 sm:py-3">
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

      {/* Payment Details */}
      <div className="border-b border-gray-900">
        <div className="border-b border-gray-200 px-3 py-1.5 sm:px-5 sm:py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-800">
            Payment Details
          </p>
        </div>
        <div className="px-3 py-2.5 sm:px-5 sm:py-3">
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

      {/* Amount */}
      <div className="border-b border-gray-900">
        <div className="flex flex-col gap-1.5 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-800">
              Amount Received (Rs.)
            </p>
            <p className="mt-0.5 text-[11px] text-gray-500">
              {numberToWords(amount)} Only
            </p>
          </div>
          <p className="flex items-center gap-1 text-lg font-semibold text-gray-900 sm:text-xl">
            <IndianRupee className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
            {formattedAmount}
          </p>
        </div>
      </div>

      {notes ? (
        <div>
          <div className="border-b border-gray-200 px-3 py-1.5 sm:px-5 sm:py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-800">
              Additional Info
            </p>
          </div>
          <div className="px-3 py-2.5 text-sm sm:px-5 sm:py-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
              Notes
            </p>
            <p className="mt-1 whitespace-pre-wrap text-gray-800">{notes}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <tr className="align-top">
      <td className="w-[100px] py-1 pr-2 text-gray-500 sm:w-[130px] sm:pr-3">
        {label}
      </td>
      <td className="py-1 font-medium text-gray-900">{value}</td>
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
