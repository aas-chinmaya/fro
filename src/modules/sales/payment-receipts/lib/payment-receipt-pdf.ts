import jsPDF from "jspdf";
import type { PaymentReceipt } from "../types/payment-receipt.types";

function formatDate(v?: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLabel(v?: string | null) {
  if (!v) return "—";
  return v
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

/**
 * Clean black-border PDF — white background, tight spacing, no gray fills.
 * Payment receipts only.
 */
export function buildPaymentReceiptPdf(receipt: PaymentReceipt): jsPDF {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageW = pdf.internal.pageSize.getWidth(); // 210
  const pageH = pdf.internal.pageSize.getHeight(); // 297
  const m = 12; // tighter margin
  const contentW = pageW - m * 2;
  const BLACK = 20;
  const MUTED = 90;

  const amount = Number(receipt.amount ?? 0);
  const customer = receipt.customer;
  const payment = receipt.payment;

  // Outer black border
  pdf.setDrawColor(BLACK);
  pdf.setLineWidth(0.6);
  pdf.rect(m, m, contentW, pageH - m * 2);

  let y = m + 8;

  // Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(BLACK);
  pdf.text("PAYMENT RECEIPT", pageW / 2, y, { align: "center" });

  y += 5;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(MUTED);
  pdf.text(`Date: ${formatDate(receipt.receiptDate)}`, pageW / 2, y, {
    align: "center",
  });

  // Divider under title
  y += 4;
  pdf.setDrawColor(BLACK);
  pdf.setLineWidth(0.4);
  pdf.line(m, y, pageW - m, y);

  // Meta row — 3 columns
  const colW = contentW / 3;
  const metaY = y;
  const metaH = 11;

  pdf.setLineWidth(0.35);
  pdf.line(m + colW, metaY, m + colW, metaY + metaH);
  pdf.line(m + colW * 2, metaY, m + colW * 2, metaY + metaH);
  pdf.line(m, metaY + metaH, pageW - m, metaY + metaH);

  const metaItems = [
    { label: "Receipt No.", value: receipt.receiptNumber || "—" },
    { label: "Financial Year", value: receipt.financialYear || "—" },
    { label: "Status", value: formatLabel(receipt.receiptStatus) },
  ];

  metaItems.forEach((item, i) => {
    const x = m + 3 + i * colW;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(MUTED);
    pdf.text(item.label, x, metaY + 4);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(BLACK);
    pdf.text(String(item.value), x, metaY + 8.5);
  });

  y = metaY + metaH;

  const drawSection = (
    title: string,
    rows: { label: string; value?: string | null }[],
  ) => {
    const validRows = rows.filter((r) => r.value);
    if (!validRows.length) return;

    // Section header line only (no gray fill)
    pdf.setDrawColor(BLACK);
    pdf.setLineWidth(0.3);
    pdf.line(m, y, pageW - m, y);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(BLACK);
    pdf.text(title.toUpperCase(), m + 3, y + 4.2);

    y += 6;
    pdf.line(m, y, pageW - m, y);

    const rowH = 5.2;
    validRows.forEach((row, idx) => {
      const ry = y + 4 + idx * rowH;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(MUTED);
      pdf.text(row.label, m + 3, ry);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(BLACK);
      // wrap long values
      const val = String(row.value || "—");
      const maxW = contentW - 48;
      const lines = pdf.splitTextToSize(val, maxW);
      pdf.text(lines[0], m + 42, ry);
    });

    y += validRows.length * rowH + 2;
    pdf.setDrawColor(BLACK);
    pdf.setLineWidth(0.3);
    pdf.line(m, y, pageW - m, y);
  };

  drawSection("Received From", [
    {
      label: "Customer Name",
      value: receipt.customerName || customer?.name,
    },
    { label: "Company", value: customer?.companyName },
    {
      label: "Phone",
      value: receipt.customerPhone || customer?.mobile,
    },
    { label: "Email", value: customer?.email },
    {
      label: "GSTIN",
      value: receipt.customerGSTIN || customer?.gstin,
    },
    { label: "PAN", value: customer?.pan },
  ]);

  drawSection("Payment Details", [
    { label: "Source", value: formatLabel(receipt.receiptSource) },
    {
      label: "Payment Method",
      value: formatLabel(payment?.paymentMethod || "CASH"),
    },
    {
      label: "Transaction Reference",
      value: payment?.transactionReference,
    },
    { label: "Payment No.", value: payment?.paymentNumber },
    {
      label: "Payment Status",
      value: formatLabel(payment?.paymentStatus),
    },
    { label: "Document No.", value: payment?.documentNumber },
  ]);

  // Amount block — black top/bottom lines, no gray fill
  const amtH = 12;
  pdf.setDrawColor(BLACK);
  pdf.setLineWidth(0.4);
  pdf.line(m, y, pageW - m, y);
  pdf.line(m, y + amtH, pageW - m, y + amtH);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(BLACK);
  pdf.text("AMOUNT RECEIVED (Rs.)", m + 3, y + 4.5);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(MUTED);
  pdf.text(`${numberToWords(amount)} Only`, m + 3, y + 9.5);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(BLACK);
  const amt = amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  pdf.text(`Rs. ${amt}`, pageW - m - 3, y + 7.5, { align: "right" });

  y += amtH + 10;

  // Signatures
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(MUTED);
  pdf.text("Received By", m + 3, y);
  pdf.text("Authorised Signatory", pageW - m - 3, y, { align: "right" });

  y += 10;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(BLACK);
  pdf.text(receipt.createdBy || "—", m + 3, y);

  pdf.setDrawColor(BLACK);
  pdf.setLineWidth(0.35);
  pdf.line(pageW - m - 42, y, pageW - m - 3, y);

  // Footer
  const footerY = pageH - m - 4;
  pdf.setDrawColor(BLACK);
  pdf.setLineWidth(0.3);
  pdf.line(m + 2, footerY - 3, pageW - m - 2, footerY - 3);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(MUTED);
  pdf.text(
    "This is a computer-generated money receipt.",
    pageW / 2,
    footerY,
    { align: "center" },
  );

  return pdf;
}

export function generatePaymentReceiptPdf(receipt: PaymentReceipt) {
  const pdf = buildPaymentReceiptPdf(receipt);
  pdf.save(`${receipt.receiptNumber ?? "payment-receipt"}.pdf`);
}

export function printPaymentReceiptPdf(receipt: PaymentReceipt) {
  const pdf = buildPaymentReceiptPdf(receipt);
  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);

  const iframeId = "payment-receipt-print-frame";
  let iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;

  if (!iframe) {
    iframe = document.createElement("iframe");
    iframe.id = iframeId;
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.opacity = "0";
    iframe.style.pointerEvents = "none";
    document.body.appendChild(iframe);
  }

  const cleanup = () => URL.revokeObjectURL(url);

  iframe.onload = () => {
    try {
      iframe?.contentWindow?.focus();
      iframe?.contentWindow?.print();
    } catch {
      // ignore
    }
    setTimeout(cleanup, 1500);
  };

  iframe.src = url;
  setTimeout(cleanup, 10000);
}
