/**
 * Credit note PDF — same layout/margins/columns as invoice-pdf.
 */
import jsPDF from "jspdf";
import type { CreditNote } from "@/modules/sales/credit-notes/types/credit-note.types";
import { reasonLabel } from "@/modules/sales/credit-notes/utils/credit-note.utils";
import { RUPEE_PNG_DATA_URL } from "./rupee-icon";

type Note = CreditNote & { businessLogo?: string | null };

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
  return String(v)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function num(v: unknown) {
  return Number(v) || 0;
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
      return (
        ones[Math.floor(x / 100)] +
        " Hundred" +
        (x % 100 ? " " + convert(x % 100) : "")
      );
    if (x < 100000)
      return (
        convert(Math.floor(x / 1000)) +
        " Thousand" +
        (x % 1000 ? " " + convert(x % 1000) : "")
      );
    if (x < 10000000)
      return (
        convert(Math.floor(x / 100000)) +
        " Lakh" +
        (x % 100000 ? " " + convert(x % 100000) : "")
      );
    return (
      convert(Math.floor(x / 10000000)) +
      " Crore" +
      (x % 10000000 ? " " + convert(x % 10000000) : "")
    );
  };
  const whole = Math.floor(n);
  const paise = Math.round((n - whole) * 100);
  let out = convert(whole) + " Rupees";
  if (paise > 0) out += " and " + convert(paise) + " Paise";
  return out + " Only";
}

type CnItem = NonNullable<CreditNote["items"]>[number];

function lineNums(item: CnItem, isInter: boolean) {
  const qty = num(item.quantity);
  const price = num(
    (item as { unitPrice?: number }).unitPrice ??
      (item as { price?: number }).price ??
      (item as { rate?: number }).rate,
  );
  const discountAmt = num(item.discountAmount);
  const taxable = num(
    item.taxableAmount ?? Math.max(0, qty * price - discountAmt),
  );
  let taxRate = num(item.gstRate ?? item.taxRate);
  const totalTax = num(
    isInter
      ? item.igstAmount
      : num(item.cgstAmount) + num(item.sgstAmount),
  );
  if (!taxRate && taxable > 0 && totalTax > 0) {
    taxRate = Math.round((totalTax / taxable) * 10000) / 100;
  }
  const cgst = num(item.cgstAmount ?? (isInter ? 0 : totalTax / 2));
  const sgst = num(item.sgstAmount ?? (isInter ? 0 : totalTax / 2));
  const igst = num(item.igstAmount ?? (isInter ? totalTax : 0));
  const total = num(item.lineTotal ?? taxable + totalTax);
  const unit = String(
    (item as { unit?: string }).unit ||
      (item as { unitName?: string }).unitName ||
      (item as { unitCode?: string }).unitCode ||
      "—",
  ).slice(0, 6);
  return { qty, price, discountAmt, taxRate, cgst, sgst, igst, total, unit };
}

export function buildCreditNotePdf(note: Note): jsPDF {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const m = 4;
  const contentW = pageW - m * 2;
  const BLACK = 30;
  const MUTED = 100;
  const LINE = 190;
  const bottomLimit = pageH - m - 10;
  const isInter = note.taxType === "INTER_STATE";
  const cur = "₹";

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

  const logo = note.businessLogo?.trim();
  const hasLogo =
    !!logo &&
    (logo.startsWith("data:image/") || /^https?:\/\//i.test(logo));
  const logoSize = 27;

  const placeOfSupply = note.placeOfSupply
    ? `${note.placeOfSupply}${note.placeOfSupplyCode ? ` (${note.placeOfSupplyCode})` : ""}`
    : "—";

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
    const bizName = note.sellerTradeName || note.sellerLegalName || "";
    if (bizName) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(BLACK);
      pdf.text(bizName.slice(0, 24), m + 3, y + 8);
    }
  }

  const metaRows = [
    { label: "Credit Note No", value: note.creditNoteNumber || "—" },
    { label: "Date", value: formatDate(note.creditNoteDate) },
    { label: "Place of Supply", value: placeOfSupply },
    { label: "Status", value: formatLabel(note.status) },
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

  y += Math.max(logoSize + 2, metaRows.length * 3.8 + 2);
  hLine(y, BLACK, 0.35);

  // From | For
  const fromAddr = [
    note.sellerAddressLine1,
    [note.sellerCity, note.sellerState, note.sellerPincode]
      .filter(Boolean)
      .join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  const toAddr = [
    note.billingAddressLine1,
    [note.billingCity, note.billingState, note.billingPincode]
      .filter(Boolean)
      .join(", "),
  ]
    .filter(Boolean)
    .join(", ");

  type ColLine = { label?: string; text: string; bold?: boolean };

  const fromLines: ColLine[] = [];
  const fromName = note.sellerLegalName || note.sellerTradeName;
  if (fromName) fromLines.push({ text: fromName, bold: true });
  if (fromAddr) fromLines.push({ text: fromAddr });
  if (note.sellerGSTIN)
    fromLines.push({ label: "GSTIN", text: note.sellerGSTIN });
  if (note.sellerPAN) fromLines.push({ label: "PAN", text: note.sellerPAN });
  if (note.sellerPhone)
    fromLines.push({ label: "Phone", text: note.sellerPhone });

  const toLines: ColLine[] = [];
  if (note.customerName) toLines.push({ text: note.customerName, bold: true });
  if (toAddr) toLines.push({ text: toAddr });
  if (note.customerGSTIN)
    toLines.push({ label: "GSTIN", text: note.customerGSTIN });
  if (note.customerEmail)
    toLines.push({ label: "Email", text: note.customerEmail });
  if (note.customerPhone)
    toLines.push({ label: "Phone", text: note.customerPhone });

  const halfW = contentW / 2;
  const midX = m + halfW;
  const pad = 3;
  const lineH = 3.6;

  const measureParty = (lines: ColLine[]) => {
    let h = 6;
    pdf.setFontSize(6.5);
    lines.forEach((ln) => {
      const full = ln.label ? `${ln.label}: ${ln.text}` : ln.text;
      const w = pdf.splitTextToSize(full, halfW - pad * 2) as string[];
      h += w.length * lineH;
    });
    return h + 4;
  };

  const boxH = Math.max(measureParty(fromLines), measureParty(toLines), 18);
  y = ensureSpace(boxH + 1, y);
  const boxTop = y;

  pdf.setDrawColor(BLACK);
  pdf.setLineWidth(0.25);
  pdf.line(midX, boxTop, midX, boxTop + boxH);
  hLine(boxTop + boxH, BLACK, 0.3);

  const drawPartyCol = (title: string, lines: ColLine[], x0: number) => {
    let cy = boxTop + 5;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(BLACK);
    pdf.text(title, x0 + pad, cy);
    cy += 5;
    lines.forEach((ln) => {
      if (ln.label) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.5);
        pdf.setTextColor(BLACK);
        const prefix = `${ln.label}: `;
        pdf.text(prefix, x0 + pad, cy);
        const lw = pdf.getTextWidth(prefix);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        const rest = pdf.splitTextToSize(
          ln.text,
          halfW - pad * 2 - lw,
        ) as string[];
        pdf.text(rest[0] || "", x0 + pad + lw, cy);
        for (let i = 1; i < rest.length; i++) {
          cy += lineH;
          pdf.text(rest[i], x0 + pad, cy);
        }
      } else {
        pdf.setFont("helvetica", ln.bold ? "bold" : "normal");
        pdf.setFontSize(ln.bold ? 8.5 : 7);
        pdf.setTextColor(ln.bold ? BLACK : MUTED);
        const wrapped = pdf.splitTextToSize(
          ln.text,
          halfW - pad * 2,
        ) as string[];
        pdf.text(wrapped[0] || "", x0 + pad, cy);
        for (let i = 1; i < wrapped.length; i++) {
          cy += lineH;
          pdf.text(wrapped[i], x0 + pad, cy);
        }
      }
      cy += lineH + 0.3;
    });
  };

  drawPartyCol("Credit Note From", fromLines, m);
  drawPartyCol("Credit Note For", toLines, midX);

  y = boxTop + boxH;

  // Against invoice + reason (content strip)
  y = ensureSpace(8, y);
  hLine(y, BLACK, 0.25);
  y += 4;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  pdf.setTextColor(BLACK);
  const against = `Against Invoice: ${note.salesInvoiceNumber || "—"}`;
  const reason = `Reason: ${reasonLabel(note.reason)}`;
  pdf.text(against, m + 3, y);
  pdf.text(reason, midX + 3, y);
  y += 3;
  hLine(y, BLACK, 0.3);

  // Items table — same columns as invoice
  const cols = isInter
    ? {
        h: m + 3,
        item: m + 10,
        hsn: m + 58,
        qty: m + 76,
        uom: m + 88,
        priceR: m + 112,
        discR: m + 130,
        t1R: m + 152,
        totalR: pageW - m - 3,
        v: [m + 8, m + 56, m + 74, m + 86, m + 98, m + 118, m + 136, m + 158],
      }
    : {
        h: m + 3,
        item: m + 10,
        hsn: m + 54,
        qty: m + 70,
        uom: m + 82,
        priceR: m + 104,
        discR: m + 120,
        t1R: m + 140,
        t2R: m + 160,
        totalR: pageW - m - 3,
        v: [
          m + 8,
          m + 52,
          m + 68,
          m + 80,
          m + 92,
          m + 110,
          m + 126,
          m + 148,
          m + 168,
        ],
      };

  const nameW = cols.hsn - cols.item - 2;

  const drawVLines = (y0: number, y1: number) => {
    pdf.setDrawColor(LINE);
    pdf.setLineWidth(0.12);
    for (const vx of (cols as { v: number[] }).v) {
      pdf.line(vx, y0, vx, y1);
    }
  };

  const drawItemsHeader = () => {
    const headTop = y;
    hLine(y, BLACK, 0.3);
    y += 3.4;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.5);
    pdf.setTextColor(BLACK);
    pdf.text("#", cols.h, y);
    pdf.text("Item", cols.item, y);
    pdf.text("HSN/SAC", cols.hsn, y);
    pdf.text("Qty", cols.qty, y);
    pdf.text("UOM", cols.uom, y);
    pdf.text("Unit Price", cols.priceR, y, { align: "right" });
    pdf.text("Discount", cols.discR, y, { align: "right" });
    if (isInter) {
      pdf.text("IGST", cols.t1R, y, { align: "right" });
    } else {
      pdf.text("CGST", cols.t1R, y, { align: "right" });
      pdf.text("SGST", (cols as { t2R: number }).t2R, y, { align: "right" });
    }
    pdf.text("Total", cols.totalR, y, { align: "right" });
    y += 1.6;
    hLine(y, BLACK, 0.3);
    drawVLines(headTop, y);
  };

  y = ensureSpace(11, y);
  drawItemsHeader();

  const items = note.items || [];

  items.forEach((item, idx) => {
    const { qty, price, discountAmt, taxRate, cgst, sgst, igst, total, unit } =
      lineNums(item, isInter);
    const hsn = String(item.hsnSacCode || "—").slice(0, 12);
    const name = String(item.itemName || "—");
    const desc = item.description
      ? String(item.description).replace(/<[^>]+>/g, "").trim()
      : "";

    pdf.setFontSize(7);
    const nameLines = pdf.splitTextToSize(name, nameW) as string[];
    const descLines = desc
      ? (pdf.splitTextToSize(desc, nameW) as string[]).slice(0, 2)
      : [];
    const showPct = taxRate > 0;

    const leftH = 2.8 + nameLines.length * 2.9 + descLines.length * 2.4;
    const rightH = 2.8 + (showPct ? 2.5 : 0);
    const rowH = Math.max(leftH, rightH) + 1.6;

    if (y + rowH > bottomLimit) {
      pdf.addPage();
      drawOuter();
      y = m + 6;
      drawItemsHeader();
    }

    const rowTop = y;
    const baseY = rowTop + 2.8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.setTextColor(BLACK);
    pdf.text(String(idx + 1), cols.h, baseY);

    pdf.setFont("helvetica", "bold");
    pdf.text(nameLines[0] || "—", cols.item, baseY);

    pdf.setFont("helvetica", "normal");
    pdf.text(hsn, cols.hsn, baseY);
    pdf.text(String(qty), cols.qty, baseY);
    pdf.text(unit, cols.uom, baseY);
    pdf.text(price.toFixed(2), cols.priceR, baseY, { align: "right" });
    pdf.text(discountAmt.toFixed(2), cols.discR, baseY, { align: "right" });

    if (isInter) {
      pdf.text(igst.toFixed(2), cols.t1R, baseY, { align: "right" });
    } else {
      pdf.text(cgst.toFixed(2), cols.t1R, baseY, { align: "right" });
      pdf.text(sgst.toFixed(2), (cols as { t2R: number }).t2R, baseY, {
        align: "right",
      });
    }
    pdf.setFont("helvetica", "bold");
    pdf.text(total.toFixed(2), cols.totalR, baseY, { align: "right" });
    pdf.setFont("helvetica", "normal");

    if (showPct) {
      const pctY = baseY + 2.5;
      pdf.setFontSize(5.5);
      pdf.setTextColor(MUTED);
      if (isInter) {
        pdf.text(`(${taxRate}%)`, cols.t1R, pctY, { align: "right" });
      } else {
        const half = Math.round((taxRate / 2) * 100) / 100;
        pdf.text(`(${half}%)`, cols.t1R, pctY, { align: "right" });
        pdf.text(`(${half}%)`, (cols as { t2R: number }).t2R, pctY, {
          align: "right",
        });
      }
      pdf.setTextColor(BLACK);
      pdf.setFontSize(7);
    }

    let leftY = baseY;
    for (let i = 1; i < nameLines.length; i++) {
      leftY += 2.9;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.setTextColor(BLACK);
      pdf.text(nameLines[i], cols.item, leftY);
    }
    if (descLines.length) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6);
      pdf.setTextColor(MUTED);
      for (const dl of descLines) {
        leftY += 2.4;
        pdf.text(dl, cols.item, leftY);
      }
      pdf.setTextColor(BLACK);
      pdf.setFontSize(7);
    }

    y = rowTop + rowH;
    hLine(y, LINE, 0.15);
    drawVLines(rowTop, y);
  });

  y += 0.3;
  hLine(y, BLACK, 0.3);

  // Summary
  const taxable = num(note.taxableAmount);
  const discount = num(note.discountAmount);
  const cgstAmt = num(note.cgstAmount);
  const sgstAmt = num(note.sgstAmount);
  const igstAmt = num(note.igstAmount);
  const grand = num(note.grandTotal);

  const summaryRows: { label: string; value: string }[] = [
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
  if (num(note.roundOffAmount))
    summaryRows.push({
      label: "Round off",
      value: cur + fmtAmt(num(note.roundOffAmount)),
    });
  summaryRows.push({ label: "Total", value: cur + fmtAmt(grand) });

  y = ensureSpace(summaryRows.length * 4 + 4, y);
  const labelX = pageW - m - 55;
  const valueX = pageW - m - 4;
  const rupeeW = 1.7;
  const rupeeH = 2.2;

  summaryRows.forEach((row) => {
    y += 4;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(BLACK);
    pdf.text(row.label, labelX, y, { align: "right" });
    if (row.value.startsWith("₹")) {
      const numPart = row.value.slice(1).trim();
      const numW = pdf.getTextWidth(numPart);
      pdf.text(numPart, valueX, y, { align: "right" });
      try {
        pdf.addImage(
          RUPEE_PNG_DATA_URL,
          "PNG",
          valueX - numW - rupeeW - 0.6,
          y - rupeeH + 0.35,
          rupeeW,
          rupeeH,
        );
      } catch {
        pdf.setFontSize(6.5);
        pdf.text("Rs.", valueX - numW - 0.5, y, { align: "right" });
        pdf.setFontSize(7.5);
      }
    } else {
      pdf.text(row.value, valueX, y, { align: "right" });
    }
  });
  y += 2.5;
  hLine(y, BLACK, 0.3);

  // Amount in words + signatory
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

  // Remarks / notes
  if (note.remarks) {
    y = ensureSpace(12, y);
    y += 3.5;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(BLACK);
    pdf.text("Remarks", m + 2.5, y);
    y += 3;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.2);
    pdf.setTextColor(MUTED);
    const rLines = pdf.splitTextToSize(String(note.remarks), contentW - 8) as string[];
    pdf.text(rLines, m + 2.5, y);
    y += rLines.length * 3;
  }
  if (note.notes) {
    y = ensureSpace(12, y);
    y += 3.5;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(BLACK);
    pdf.text("Notes", m + 2.5, y);
    y += 3;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.2);
    pdf.setTextColor(MUTED);
    const nLines = pdf.splitTextToSize(String(note.notes), contentW - 8) as string[];
    pdf.text(nLines, m + 2.5, y);
  }

  const footerY = pageH - m - 3.5;
  hLine(footerY - 2, LINE, 0.2);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6);
  pdf.setTextColor(MUTED);
  pdf.text("This is a computer-generated credit note.", pageW / 2, footerY, {
    align: "center",
  });

  return pdf;
}

export function generateCreditNotePdf(note: Note) {
  const pdf = buildCreditNotePdf(note);
  pdf.save(`${note.creditNoteNumber ?? "credit-note"}.pdf`);
}

export const downloadCreditNotePdf = generateCreditNotePdf;

export default generateCreditNotePdf;
