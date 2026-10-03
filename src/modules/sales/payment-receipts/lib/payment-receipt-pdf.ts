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

function fmtAmt(n: number) {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function numberToWords(n: number): string {
  if (n === 0) return "Zero";
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];
  const convert = (x: number): string => {
    if (x < 20) return ones[x];
    if (x < 100)
      return tens[Math.floor(x / 10)] + (x % 10 ? " " + ones[x % 10] : "");
    if (x < 1000)
      return ones[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " + convert(x % 100) : "");
    if (x < 100000)
      return convert(Math.floor(x / 1000)) + " Thousand" + (x % 1000 ? " " + convert(x % 1000) : "");
    if (x < 10000000)
      return convert(Math.floor(x / 100000)) + " Lakh" + (x % 100000 ? " " + convert(x % 100000) : "");
    return convert(Math.floor(x / 10000000)) + " Crore" + (x % 10000000 ? " " + convert(x % 10000000) : "");
  };
  const whole = Math.floor(n);
  const paise = Math.round((n - whole) * 100);
  let out = convert(whole) + " Rupees";
  if (paise > 0) out += " and " + convert(paise) + " Paise";
  return out + " Only";
}

/**
 * Payment receipt PDF — same margin/padding as invoice (m = 4).
 * Sections are full-width stacked rows (not 2-column). Minimal lines.
 */
export function buildPaymentReceiptPdf(receipt: PaymentReceipt): jsPDF {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const m = 4; // same as invoice
  const contentW = pageW - m * 2;
  const BLACK = 30;
  const MUTED = 100;
  const LINE = 190;
  const bottomLimit = pageH - m - 10;

  const amount = Number(receipt.amount ?? 0);
  const customer = receipt.customer;
  const payment = receipt.payment;

  const drawOuter = () => {
    pdf.setDrawColor(BLACK);
    pdf.setLineWidth(0.4);
    pdf.rect(m, m, contentW, pageH - m * 2);
  };

  const hLine = (yy: number, color = LINE, width = 0.25) => {
    pdf.setDrawColor(color);
    pdf.setLineWidth(width);
    pdf.line(m, yy, pageW - m, yy);
  };

  const ensureSpace = (needed: number, yy: number): number => {
    if (yy + needed <= bottomLimit) return yy;
    pdf.addPage();
    drawOuter();
    return m + 6;
  };

  drawOuter();
  let y = m + 5;

  // ── Logo left | meta right ──
  const logo = (receipt.businessLogo || "").trim() || null;
  const hasLogo =
    !!logo &&
    (logo.startsWith("data:image/") || /^https?:\/\//i.test(logo));
  const logoSize = 27;

  if (hasLogo) {
    try {
      const fmt = logo!.includes("png")
        ? "PNG"
        : logo!.includes("webp")
          ? "WEBP"
          : "JPEG";
      pdf.addImage(
        logo!,
        fmt as "PNG" | "JPEG" | "WEBP",
        m + 3,
        y,
        logoSize,
        logoSize,
      );
    } catch {
      /* ignore */
    }
  } else {
    const bizName = (receipt.businessName || "").trim();
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(BLACK);
    pdf.text((bizName || "PAYMENT RECEIPT").slice(0, 28), m + 3, y + 8);
  }

  const metaRows = [
    { label: "Receipt No", value: receipt.receiptNumber || "—" },
    { label: "Receipt Date", value: formatDate(receipt.receiptDate) },
    { label: "Financial Year", value: receipt.financialYear || "—" },
    { label: "Status", value: formatLabel(receipt.receiptStatus) },
  ];
  let metaY = y + 2.5;
  const rightX = pageW - m - 3;
  metaRows.forEach((row) => {
    const labelPart = `${row.label}: `;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    const valW = pdf.getTextWidth(row.value);
    pdf.setTextColor(BLACK);
    pdf.text(row.value, rightX, metaY, { align: "right" });
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.text(labelPart, rightX - valW - 0.5, metaY, { align: "right" });
    metaY += 3.8;
  });

  y += Math.max(hasLogo ? logoSize + 2 : 14, metaRows.length * 3.8 + 2);
  hLine(y, BLACK, 0.35);

  // ── Full-width stacked sections (one row per field) ──
  const labelX = m + 3;
  const valueX = m + 48;
  const valueMaxW = contentW - 52;
  const rowH = 4.2;

  const drawSection = (
    title: string,
    rows: { label: string; value?: string | null }[],
  ) => {
    const valid = rows.filter((r) => r.value != null && String(r.value).trim());
    if (!valid.length) return;

    y = ensureSpace(6 + valid.length * rowH + 2, y);
    y += 3.5;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(BLACK);
    pdf.text(title, labelX, y);
    y += 1.5;
    hLine(y, BLACK, 0.25);
    y += 3.2;

    valid.forEach((row) => {
      y = ensureSpace(rowH + 1, y);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      pdf.setTextColor(BLACK);
      pdf.text(`${row.label}:`, labelX, y);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      const lines = pdf.splitTextToSize(String(row.value), valueMaxW) as string[];
      pdf.text(lines[0] || "", valueX, y);
      for (let i = 1; i < lines.length; i++) {
        y += 3.2;
        pdf.text(lines[i], valueX, y);
      }
      y += rowH;
    });
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
      label: "Txn Ref",
      value: payment?.transactionReference,
    },
    { label: "Payment No", value: payment?.paymentNumber },
    {
      label: "Payment Status",
      value: formatLabel(payment?.paymentStatus),
    },
    { label: "Document No", value: payment?.documentNumber },
    {
      label: "Payment Date",
      value: payment?.paymentDate ? formatDate(payment.paymentDate) : null,
    },
  ]);

  // ── Amount ──
  y = ensureSpace(10, y);
  hLine(y, BLACK, 0.3);
  y += 4.5;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(BLACK);
  pdf.text("Amount Received", labelX, y);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(`Rs. ${fmtAmt(amount)}`, pageW - m - 3, y, { align: "right" });
  y += 3;
  hLine(y, BLACK, 0.25);

  // ── Words + signatory ──
  y = ensureSpace(20, y);
  y += 4;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(MUTED);
  pdf.text("Total (in words):", labelX, y);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(BLACK);
  const words = numberToWords(amount);
  const wordLines = pdf.splitTextToSize(words, contentW * 0.55) as string[];
  pdf.text(wordLines, labelX, y + 3.5);

  pdf.setDrawColor(LINE);
  pdf.setLineWidth(0.25);
  pdf.line(pageW - m - 42, y + 12, pageW - m - 3, y + 12);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(MUTED);
  pdf.text("Authorized Signatory", pageW - m - 3, y + 15.5, {
    align: "right",
  });

  y = Math.max(y + wordLines.length * 3.2 + 6, y + 20);

  // Notes
  const notes = (receipt.notes || receipt.remarks || "").trim();
  if (notes) {
    y = ensureSpace(10, y);
    y += 3;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(BLACK);
    pdf.text("Notes", labelX, y);
    y += 3;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.2);
    pdf.setTextColor(MUTED);
    const noteLines = pdf.splitTextToSize(notes, contentW - 8) as string[];
    noteLines.forEach((ln) => {
      y = ensureSpace(3.5, y);
      pdf.text(ln, labelX, y);
      y += 3;
    });
  }

  // Footer
  const footerY = pageH - m - 3.5;
  hLine(footerY - 2, LINE, 0.2);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6);
  pdf.setTextColor(MUTED);
  pdf.text("This is a computer-generated payment receipt.", pageW / 2, footerY, {
    align: "center",
  });

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
    iframe.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:none;opacity:0;pointer-events:none";
    document.body.appendChild(iframe);
  }

  const cleanup = () => URL.revokeObjectURL(url);

  iframe.onload = () => {
    try {
      iframe?.contentWindow?.focus();
      iframe?.contentWindow?.print();
    } catch {
      /* ignore */
    }
    setTimeout(cleanup, 1500);
  };

  iframe.src = url;
  setTimeout(cleanup, 10000);
}
