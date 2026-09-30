import jsPDF from "jspdf";
import type { Invoice, InvoiceItem } from "../types/invoice.types";

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

function num(v: unknown) {
  return Number(v) || 0;
}

function currencySymbol(code?: string | null) {
  const c = (code || "INR").toUpperCase();
  // Helvetica has no ₹ — use ASCII-safe "Rs." for INR
  if (c === "INR" || c === "RS" || c === "RUPEE" || c === "RUPEES") return "Rs. ";
  if (c === "USD") return "USD ";
  if (c === "EUR") return "EUR ";
  if (c === "GBP") return "GBP ";
  return `${c} `;
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

function stripHtml(html?: string | null) {
  return (html || "").replace(/<[^>]+>/g, "").trim();
}

function lineNums(item: InvoiceItem, isInter: boolean) {
  const qty = num(item.quantity);
  const price = num(item.price ?? item.rate);
  const discountAmt = num(
    item.discountAmount ??
      (item.discountType === "PERCENTAGE"
        ? (qty * price * num(item.discount ?? item.discountValue)) / 100
        : num(item.discount ?? item.discountValue)),
  );
  const taxable = num(item.taxableAmount ?? Math.max(0, qty * price - discountAmt));
  const taxRate = num(item.taxRate);
  const totalTax = num(item.totalTaxAmount ?? item.taxAmount ?? (taxable * taxRate) / 100);
  const cgst = num(item.cgstAmount ?? (isInter ? 0 : totalTax / 2));
  const sgst = num(item.sgstAmount ?? (isInter ? 0 : totalTax / 2));
  const igst = num(item.igstAmount ?? (isInter ? totalTax : 0));
  const total = num(item.lineTotal ?? item.total ?? item.amount ?? taxable + totalTax);
  return { qty, price, discountAmt, taxRate, cgst, sgst, igst, total };
}

/**
 * Clean structured PDF — outer border only, compact rows.
 * Internal notes are never printed.
 * Blank Authorized Signatory for manual signature.
 */
export function buildInvoicePdf(invoice: Invoice): jsPDF {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const m = 12;
  const contentW = pageW - m * 2;
  const BLACK = 30;
  const MUTED = 100;
  const LINE = 190;
  const bottomLimit = pageH - m - 10;
  const isInter = invoice.taxType === "INTER_STATE";
  const cur = currencySymbol(invoice.currency);

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
  let y = m + 7;

  // Title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(BLACK);
  pdf.text("INVOICE", pageW / 2, y, { align: "center" });
  y += 4.5;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  pdf.setTextColor(MUTED);
  pdf.text(
    `Date: ${formatDate(invoice.invoiceDate)}   ·   FY: ${invoice.financialYear || "—"}`,
    pageW / 2,
    y,
    { align: "center" },
  );
  y += 3.5;
  hLine(y, BLACK, 0.35);
  y += 0.5;

  // Business logo (optional data-URL or https)
  const logo = (invoice as { businessLogo?: string | null }).businessLogo?.trim();
  if (logo && (logo.startsWith("data:image/") || /^https?:\/\//i.test(logo))) {
    try {
      const fmt = logo.includes("png")
        ? "PNG"
        : logo.includes("webp")
          ? "WEBP"
          : "JPEG";
      // Place logo top-left inside border
      pdf.addImage(logo, fmt as "PNG" | "JPEG" | "WEBP", m + 2, y + 1, 18, 18);
    } catch {
      // ignore invalid logo
    }
  }

  // Meta — 3 equal columns
  const metaH = 9;
  const colW = contentW / 3;
  pdf.setDrawColor(LINE);
  pdf.setLineWidth(0.2);
  pdf.line(m + colW, y, m + colW, y + metaH);
  pdf.line(m + colW * 2, y, m + colW * 2, y + metaH);
  hLine(y + metaH, BLACK, 0.3);

  const meta = [
    { label: "Invoice No.", value: invoice.invoiceNumber || "—" },
    { label: "Status", value: formatLabel(invoice.invoiceStatus) },
    {
      label: "Place of Supply",
      value: invoice.placeOfSupply
        ? `${invoice.placeOfSupply}${invoice.placeOfSupplyCode ? ` (${invoice.placeOfSupplyCode})` : ""}`
        : "—",
    },
  ];
  meta.forEach((item, i) => {
    const x = m + 2.5 + i * colW;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6);
    pdf.setTextColor(MUTED);
    pdf.text(item.label, x, y + 3.2);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.5);
    pdf.setTextColor(BLACK);
    pdf.text(pdf.splitTextToSize(String(item.value), colW - 5)[0], x, y + 6.8);
  });
  y += metaH;

  // Party sections
  const section = (
    title: string,
    rows: { label: string; value?: string | null }[],
  ) => {
    const valid = rows.filter((r) => r.value);
    if (!valid.length) return;
    const rowH = 4;
    const headH = 5;
    y = ensureSpace(headH + valid.length * rowH + 2, y);
    hLine(y, BLACK, 0.25);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(BLACK);
    pdf.text(title.toUpperCase(), m + 2.5, y + 3.5);
    y += headH;
    hLine(y, LINE, 0.2);
    valid.forEach((row) => {
      y += rowH;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(MUTED);
      pdf.text(row.label, m + 2.5, y);
      pdf.setTextColor(BLACK);
      const lines = pdf.splitTextToSize(String(row.value), contentW - 46);
      pdf.text(lines[0], m + 38, y);
    });
    y += 1.5;
  };

  const fromAddr = [
    invoice.sellerAddressLine1,
    invoice.sellerAddressLine2,
    [invoice.sellerCity, invoice.sellerState, invoice.sellerPincode]
      .filter(Boolean)
      .join(", "),
    invoice.sellerCountry,
  ]
    .filter(Boolean)
    .join(", ");

  section("Invoice From", [
    { label: "Business", value: invoice.sellerLegalName || invoice.sellerTradeName },
    { label: "Address", value: fromAddr || null },
    { label: "GSTIN", value: invoice.sellerGSTIN },
    { label: "PAN", value: invoice.sellerPAN },
    { label: "Phone", value: invoice.sellerPhone },
    { label: "Email", value: invoice.sellerEmail },
  ]);

  const toAddr = [
    invoice.billingAddressLine1,
    invoice.billingAddressLine2,
    [invoice.billingCity, invoice.billingState, invoice.billingPincode]
      .filter(Boolean)
      .join(", "),
    invoice.billingCountry,
  ]
    .filter(Boolean)
    .join(", ");

  section("Invoice For", [
    { label: "Customer", value: invoice.buyerCompanyName || invoice.buyerName },
    {
      label: "Contact",
      value:
        invoice.buyerCompanyName && invoice.buyerName
          ? invoice.buyerName
          : null,
    },
    { label: "Address", value: toAddr || null },
    { label: "GSTIN", value: invoice.buyerGSTIN },
    { label: "PAN", value: invoice.buyerPAN },
    { label: "Phone", value: invoice.buyerPhone },
    { label: "Email", value: invoice.buyerEmail },
  ]);

  // Items table header
  const cols = isInter
    ? { h: 13, item: 18, hsn: 70, qty: 88, uom: 100, priceR: 120, discR: 138, t1R: 158, totalR: 196 }
    : { h: 13, item: 18, hsn: 66, qty: 82, uom: 93, priceR: 110, discR: 126, t1R: 146, t2R: 166, totalR: 196 };

  y = ensureSpace(11, y);
  hLine(y, BLACK, 0.3);
  y += 3.8;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.5);
  pdf.setTextColor(BLACK);
  pdf.text("#", cols.h, y);
  pdf.text("Item", cols.item, y);
  pdf.text("HSN/SAC", cols.hsn, y);
  pdf.text("Qty", cols.qty, y);
  pdf.text("UOM", cols.uom, y);
  pdf.text("Price", cols.priceR, y, { align: "right" });
  pdf.text("Discount", cols.discR, y, { align: "right" });
  if (isInter) {
    pdf.text("IGST", cols.t1R, y, { align: "right" });
  } else {
    pdf.text("CGST", cols.t1R, y, { align: "right" });
    pdf.text("SGST", (cols as { t2R: number }).t2R, y, { align: "right" });
  }
  pdf.text("Total", cols.totalR, y, { align: "right" });
  y += 1.5;
  hLine(y, BLACK, 0.25);

  const items = invoice.items || [];
  const nameW = cols.hsn - cols.item - 2;

  // Columns: # | Item (name+desc) | HSN/SAC | Qty | UOM | Price | Discount | CGST/SGST or IGST | Total
  items.forEach((item, idx) => {
    const { qty, price, discountAmt, taxRate, cgst, sgst, igst, total } =
      lineNums(item, isInter);
    const hsn = String(
      item.hsnSacCode || (item as { hsnSac?: string }).hsnSac || "—",
    ).slice(0, 12);
    const name = String(item.itemName || item.productName || "—");
    const desc = item.description
      ? String(item.description).replace(/<[^>]+>/g, "").trim()
      : "";

    pdf.setFontSize(7);
    const nameLines = pdf.splitTextToSize(name, nameW) as string[];
    const descLines = desc
      ? (pdf.splitTextToSize(desc, nameW) as string[]).slice(0, 2)
      : [];
    const blockH =
      3.4 + (nameLines.length - 1) * 2.9 + descLines.length * 2.5 + 2.2;

    y = ensureSpace(blockH + 1, y);
    y += 3.4;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(BLACK);
    pdf.text(String(idx + 1), cols.h, y);
    pdf.setFont("helvetica", "bold");
    pdf.text(nameLines[0], cols.item, y);
    pdf.setFont("helvetica", "normal");
    pdf.text(hsn, cols.hsn, y);
    pdf.text(String(qty), cols.qty, y);
    pdf.text(String(item.unit || "—").slice(0, 6), cols.uom, y);
    pdf.text(price.toFixed(2), cols.priceR, y, { align: "right" });
    pdf.text(discountAmt.toFixed(2), cols.discR, y, { align: "right" });
    if (isInter) {
      pdf.text(igst.toFixed(2), cols.t1R, y, { align: "right" });
    } else {
      pdf.text(cgst.toFixed(2), cols.t1R, y, { align: "right" });
      pdf.text(sgst.toFixed(2), (cols as { t2R: number }).t2R, y, {
        align: "right",
      });
    }
    pdf.setFont("helvetica", "bold");
    pdf.text(total.toFixed(2), cols.totalR, y, { align: "right" });
    pdf.setFont("helvetica", "normal");

    for (let i = 1; i < nameLines.length; i++) {
      y += 2.9;
      pdf.text(nameLines[i], cols.item, y);
    }
    if (descLines.length) {
      pdf.setFontSize(6.2);
      pdf.setTextColor(MUTED);
      for (const dl of descLines) {
        y += 2.5;
        pdf.text(dl, cols.item, y);
      }
      pdf.setTextColor(BLACK);
      pdf.setFontSize(7);
    }
    if (taxRate > 0) {
      pdf.setFontSize(5.5);
      pdf.setTextColor(MUTED);
      if (isInter) {
        pdf.text(`(${taxRate}%)`, cols.t1R, y + 2, { align: "right" });
      } else {
        pdf.text(`(${taxRate / 2}%)`, cols.t1R, y + 2, { align: "right" });
        pdf.text(`(${taxRate / 2}%)`, (cols as { t2R: number }).t2R, y + 2, {
          align: "right",
        });
      }
      pdf.setTextColor(BLACK);
      pdf.setFontSize(7);
      y += 1;
    }

    y += 1.5;
    hLine(y, LINE, 0.15);
  });

  y += 0.5;
  hLine(y, BLACK, 0.3);

  // Compact summary (plain text, currency here)
  const taxable = num(invoice.taxableAmount);
  const discount = num(invoice.discountAmount);
  const cgstAmt = num(invoice.cgstAmount);
  const sgstAmt = num(invoice.sgstAmount);
  const igstAmt = num(invoice.igstAmount);
  const grand = num(invoice.grandTotal);
  const currency = invoice.currency || "INR";

  const summaryRows: { label: string; value: string; bold?: boolean }[] = [
    { label: "Taxable Amount", value: cur + fmtAmt(taxable) },
  ];
  if (discount > 0)
    summaryRows.push({ label: "Discount", value: cur + fmtAmt(discount) });
  if (isInter) {
    summaryRows.push({ label: "IGST", value: cur + fmtAmt(igstAmt) });
  } else {
    summaryRows.push({ label: "CGST", value: cur + fmtAmt(cgstAmt) });
    summaryRows.push({ label: "SGST", value: cur + fmtAmt(sgstAmt) });
  }
  summaryRows.push({
    label: "Total (" + currency + ")",
    value: cur + fmtAmt(grand),
    bold: true,
  });

  // Compact right-aligned summary — same font size throughout
  y = ensureSpace(summaryRows.length * 4 + 4, y);
  const labelX = pageW - m - 48;
  const valueX = pageW - m - 4;
  summaryRows.forEach((row) => {
    y += 4;
    pdf.setFont("helvetica", row.bold ? "bold" : "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(BLACK);
    pdf.text(row.label, labelX, y, { align: "right" });
    pdf.text(row.value, valueX, y, { align: "right" });
  });
  y += 2.5;
  hLine(y, BLACK, 0.3);

  // Amount in words + blank signatory
  y = ensureSpace(22, y);
  y += 4;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(MUTED);
  pdf.text("Total (in words):", m + 2.5, y);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(BLACK);
  const words = numberToWords(grand);
  const wordLines = pdf.splitTextToSize(words, contentW * 0.55) as string[];
  pdf.text(wordLines, m + 2.5, y + 3.5);

  // Blank line for manual signature (no digital image)
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
  hLine(y, BLACK, 0.25);

  // Terms only — internal notes never printed
  const terms = stripHtml(invoice.termsAndConditions);
  if (terms) {
    y = ensureSpace(14, y);
    y += 4;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(BLACK);
    pdf.text("Terms & Conditions", m + 2.5, y);
    y += 3.2;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    pdf.setTextColor(MUTED);
    const tLines = (pdf.splitTextToSize(terms, contentW - 6) as string[]).slice(
      0,
      10,
    );
    pdf.text(tLines, m + 2.5, y);
  }

  // Footer
  const footerY = pageH - m - 3.5;
  hLine(footerY - 2, LINE, 0.2);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6);
  pdf.setTextColor(MUTED);
  pdf.text("This is a computer-generated invoice.", pageW / 2, footerY, {
    align: "center",
  });

  return pdf;
}

export function generateInvoicePdf(invoice: Invoice) {
  const pdf = buildInvoicePdf(invoice);
  pdf.save(`${invoice.invoiceNumber ?? "invoice"}.pdf`);
}

export function printInvoicePdf(invoice: Invoice) {
  const pdf = buildInvoicePdf(invoice);
  const blob = pdf.output("blob");
  const url = URL.createObjectURL(blob);
  const iframeId = "invoice-print-frame";
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
