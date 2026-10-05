
import jsPDF from "jspdf";
import type { Invoice, InvoiceItem } from "../types/invoice.types";
import { RUPEE_PNG_DATA_URL } from "./rupee-icon";

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
  // Prefer ₹ (drawn slightly smaller next to amount in summary)
  if (c === "INR" || c === "RS" || c === "RUPEE" || c === "RUPEES") return "₹";
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

/** Convert HTML terms (ul/li/p) into clean numbered lines for PDF. */
function htmlToTermLines(html?: string | null): string[] {
  if (!html) return [];
  let s = String(html).trim();
  if (!s) return [];
  s = s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  const liMatches = s.match(/<li\b[^>]*>([\s\S]*?)<\/li>/gi);
  if (liMatches && liMatches.length > 0) {
    return liMatches
      .map((li) =>
        li
          .replace(/<li\b[^>]*>/i, "")
          .replace(/<\/li>/i, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
      )
      .filter(Boolean);
  }

  const plain = s
    .replace(/<\/(p|div|br|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return [];
  const lines = plain
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.length ? lines : [plain];
}

function lineNums(item: InvoiceItem, isInter: boolean) {
  const qty = num(item.quantity);
  // Prefer unitPrice (form key), then price, then rate
  const price = num(
    (item as { unitPrice?: number }).unitPrice ?? item.price ?? item.rate,
  );
  const discountAmt = num(
    // item.discountAmount ??
      (item.discountType === "PERCENTAGE"
        ? (qty * price * num(item.discount ?? item.discountValue)) / 100
        : num(item.discount ?? item.discountValue)),
  );
  const taxable = num(item.taxableAmount ?? Math.max(0, qty * price - discountAmt));
  let taxRate = num(item.taxRate);
  const totalTax = num(item.taxAmount ?? (taxable * taxRate) / 100);
  // Derive rate when API omits taxRate but amounts exist (so % always shows)
  if (!taxRate && taxable > 0 && totalTax > 0) {
    taxRate = Math.round((totalTax / taxable) * 10000) / 100;
  }
  if (!taxRate) {
    taxRate =
      num((item as { cgstRate?: number }).cgstRate) * 2 ||
      num((item as { sgstRate?: number }).sgstRate) * 2 ||
      num((item as { igstRate?: number }).igstRate) ||
      0;
  }
  const cgst = num(item.cgstAmount ?? (isInter ? 0 : totalTax / 2));
  const sgst = num(item.sgstAmount ?? (isInter ? 0 : totalTax / 2));
  const igst = num(item.igstAmount ?? (isInter ? totalTax : 0));
  const total = num(item.total ?? item.amount ?? taxable + totalTax);
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
  const m = 4;
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
  let y = m + 5;

  // ═══════════════════════════════════════════════════════════
  // ROW 1: Logo (left) | 5 meta fields as normal text (right)
  // ROW 2: Invoice From | Invoice For  (2 columns only)
  // Matches invoice-document.tsx exactly
  // ═══════════════════════════════════════════════════════════
  const logo = (invoice as { businessLogo?: string | null }).businessLogo?.trim();
  const hasLogo =
    !!logo &&
    (logo.startsWith("data:image/") || /^https?:\/\//i.test(logo));
  const logoSize = 27;

  const placeOfSupply = invoice.placeOfSupply
    ? `${invoice.placeOfSupply}${invoice.placeOfSupplyCode ? ` (${invoice.placeOfSupplyCode})` : ""}`
    : "—";

  // Logo (left)
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
    const bizName =
      invoice.sellerTradeName || invoice.sellerLegalName || "";
    if (bizName) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(BLACK);
      pdf.text(bizName.slice(0, 24), m + 3, y + 8);
    }
  }

  // Meta details — RIGHT side: bold label + normal value
  const metaRows = [
    { label: "Invoice No", value: invoice.invoiceNumber || "—" },
    { label: "Invoice Date", value: formatDate(invoice.invoiceDate) },
    { label: "Country of Supply", value: invoice.billingCountry || "India" },
    { label: "Place of Supply", value: placeOfSupply },
    { label: "Status", value: formatLabel(invoice.invoiceStatus) },
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

  // ── ROW 2: Invoice From | Invoice For (2 columns only) — compact height ──
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

  type ColLine = { label?: string; text: string; bold?: boolean };

  const fromLines: ColLine[] = [];
  const fromName = invoice.sellerLegalName || invoice.sellerTradeName;
  if (fromName) fromLines.push({ text: fromName, bold: true });
  if (fromAddr) fromLines.push({ text: fromAddr });
  if (invoice.sellerGSTIN)
    fromLines.push({ label: "GSTIN", text: invoice.sellerGSTIN });
  if (invoice.sellerPAN)
    fromLines.push({ label: "PAN", text: invoice.sellerPAN });
  if (invoice.sellerEmail)
    fromLines.push({ label: "Email", text: invoice.sellerEmail });
  if (invoice.sellerPhone)
    fromLines.push({ label: "Phone", text: invoice.sellerPhone });

  const toLines: ColLine[] = [];
  const toName = invoice.buyerCompanyName || invoice.buyerName;
  if (toName) toLines.push({ text: toName, bold: true });
  if (
    invoice.buyerName &&
    invoice.buyerCompanyName &&
    invoice.buyerName !== invoice.buyerCompanyName
  ) {
    toLines.push({ text: invoice.buyerName });
  }
  if (toAddr) toLines.push({ text: toAddr });
  if (invoice.buyerGSTIN)
    toLines.push({ label: "GSTIN", text: invoice.buyerGSTIN });
  if (invoice.buyerPAN)
    toLines.push({ label: "PAN", text: invoice.buyerPAN });
  if (invoice.buyerEmail)
    toLines.push({ label: "Email", text: invoice.buyerEmail });
  if (invoice.buyerPhone)
    toLines.push({ label: "Phone", text: invoice.buyerPhone });

  const halfW = contentW / 2;
  const midX = m + halfW;
  const pad = 3;
  const lineH = 3.6;

  const measureParty = (lines: ColLine[]) => {
    let h = 6; // title + top pad
    pdf.setFontSize(6.5);
    lines.forEach((ln) => {
      const full = ln.label ? `${ln.label}: ${ln.text}` : ln.text;
      const w = pdf.splitTextToSize(full, halfW - pad * 2) as string[];
      h += w.length * lineH;
    });
    return h + 4; // bottom pad so text does not touch border
  };

  // No large min height — box fits content only
  const boxH = Math.max(measureParty(fromLines), measureParty(toLines), 18);
  y = ensureSpace(boxH + 1, y);
  const boxTop = y;

  // Vertical divider between From | For
  pdf.setDrawColor(BLACK);
  pdf.setLineWidth(0.25);
  pdf.line(midX, boxTop, midX, boxTop + boxH);
  hLine(boxTop + boxH, BLACK, 0.3);

  const drawPartyCol = (
    title: string,
    lines: ColLine[],
    x0: number,
  ) => {
    let cy = boxTop + 5;
    // Section title — bigger + bold
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(BLACK);
    pdf.text(title, x0 + pad, cy);
    cy += 5;
    lines.forEach((ln) => {
      if (ln.label) {
        // Label bold, value normal
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
        // Name bold; address normal
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

  drawPartyCol("Invoice From", fromLines, m);
  drawPartyCol("Invoice For", toLines, midX);

  y = boxTop + boxH;





  // Items table — balanced columns; GST % under tax amounts
  // Content width ~202mm (m=4). Number cols right-aligned.
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
        v: [m + 8, m + 52, m + 68, m + 80, m + 92, m + 110, m + 126, m + 148, m + 168],
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

  const items = invoice.items || [];

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
    pdf.text(String(item.unit || "—").slice(0, 6), cols.uom, baseY);
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

    // GST % under tax amount — invoice + quotation same
    if (showPct) {
      const pctY = baseY + 2.5;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(5.5);
      pdf.setTextColor(MUTED);
      if (isInter) {
        pdf.text(`(${taxRate}%)`, cols.t1R, pctY, { align: "right" });
      } else {
        // CGST/SGST each is half of total GST rate
        const half =
          Math.round((taxRate / 2) * 100) / 100;
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

  // Compact summary (plain text, currency here)
  const taxable = num(invoice.taxableAmount);
  const discount = num(invoice.discountAmount);
  const cgstAmt = num(invoice.cgstAmount);
  const sgstAmt = num(invoice.sgstAmount);
  const igstAmt = num(invoice.igstAmount);
  const grand = num(invoice.grandTotal);
  const tdsAmount = num((invoice as { tdsAmount?: number | null }).tdsAmount);
  const tdsEntries =
    (
      invoice as {
        tdsEntries?: { section?: string; rate?: number }[] | null;
      }
    ).tdsEntries || [];
  const netPayable = Math.max(0, grand - tdsAmount);
  const tdsLabel =
    tdsEntries.length > 0
      ? `TDS (${tdsEntries
          .map(
            (e) =>
              `${String(e.section || "").toUpperCase()} @ ${Number(e.rate) || 0}%`,
          )
          .join(", ")})`
      : "TDS";

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
    label: "Total",
    value: cur + fmtAmt(grand),
    bold: false,
  });
  if (tdsAmount > 0) {
    summaryRows.push({
      label: tdsLabel,
      value: "− " + cur + fmtAmt(tdsAmount),
    });
    summaryRows.push({
      label: "Net Payable",
      value: cur + fmtAmt(netPayable),
      bold: true,
    });
  }

  // Compact right-aligned summary — normal text (Total slightly emphasized)
  y = ensureSpace(summaryRows.length * 4 + 4, y);
  const labelX = pageW - m - 55;
  const valueX = pageW - m - 4;
  const isInr =
    !invoice.currency ||
    ["INR", "RS", "RUPEE", "RUPEES"].includes(
      String(invoice.currency).toUpperCase(),
    );
  // Small ₹ icon size (mm) — appropriate next to 7.5pt amounts
  const rupeeW = 1.7;
  const rupeeH = 2.2;

  summaryRows.forEach((row) => {
    y += 4;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(BLACK);
    pdf.text(row.label, labelX, y, { align: "right" });
    if (isInr && row.value.startsWith("₹")) {
      const numPart = row.value.slice(1).trim();
      const numW = pdf.getTextWidth(numPart);
      // number right-aligned; tiny ₹ icon just left of it
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
        // fallback text if image fails
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

  // Amount in words + blank signatory
  y = ensureSpace(22, y);
  y += 4;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  pdf.setTextColor(MUTED);
  pdf.text(
    tdsAmount > 0 ? "Net payable (in words):" : "Total (in words):",
    m + 2.5,
    y,
  );
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(BLACK);
  const words = numberToWords(tdsAmount > 0 ? netPayable : grand);
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

  // Payment details intentionally omitted on PDF

  // Terms — parse HTML list into numbered lines (same as view page)
  const termLines = htmlToTermLines(invoice.termsAndConditions);
  if (termLines.length) {
    y = ensureSpace(10 + termLines.length * 4, y);
    y += 3.5;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(BLACK);
    pdf.text("Terms & Conditions", m + 2.5, y);
    y += 3;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.2);
    pdf.setTextColor(MUTED);
    const maxW = contentW - 10;
    termLines.forEach((line, idx) => {
      const prefix = `${idx + 1}. `;
      const wrapped = pdf.splitTextToSize(line, maxW - 6) as string[];
      y = ensureSpace(wrapped.length * 3 + 1, y);
      pdf.text(prefix + (wrapped[0] || ""), m + 2.5, y);
      for (let i = 1; i < wrapped.length; i++) {
        y += 2.8;
        pdf.text(wrapped[i], m + 7, y);
      }
      y += 3.2;
    });
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
