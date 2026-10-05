/**
 * Lightweight credit-note PDF helper.
 * Uses jsPDF when available (same pattern as invoices); otherwise opens a
 * print-friendly HTML window so the UI never hard-fails.
 */
import type { CreditNote } from "../types/credit-note.types";
import { formatINR, reasonLabel } from "../utils/credit-note.utils";

function num(v: unknown) {
  return Number(v) || 0;
}

export async function downloadCreditNotePdf(note: CreditNote) {
  try {
    // Prefer jsPDF if the app already ships it (invoice module does)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { jsPDF } = require("jspdf");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const m = 14;
    let y = 18;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("CREDIT NOTE", m, y);
    y += 8;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(note.creditNoteNumber || "", m, y);
    y += 5;
    pdf.text(
      `Date: ${note.creditNoteDate ? new Date(note.creditNoteDate).toLocaleDateString("en-IN") : ""}`,
      m,
      y,
    );
    y += 5;
    pdf.text(`Reason: ${reasonLabel(note.reason)}`, m, y);
    y += 8;

    pdf.setFont("helvetica", "bold");
    pdf.text("Customer", m, y);
    y += 5;
    pdf.setFont("helvetica", "normal");
    pdf.text(note.customerName || "", m, y);
    y += 5;
    if (note.customerGSTIN) {
      pdf.text(`GSTIN: ${note.customerGSTIN}`, m, y);
      y += 5;
    }
    if (note.salesInvoiceNumber) {
      pdf.text(`Against invoice: ${note.salesInvoiceNumber}`, m, y);
      y += 8;
    } else {
      y += 3;
    }

    pdf.setFont("helvetica", "bold");
    pdf.text("Items", m, y);
    y += 6;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);

    (note.items || []).forEach((it, i) => {
      const line = `${i + 1}. ${it.itemName}  Qty ${it.quantity} × ${formatINR(it.unitPrice)}  =  ${formatINR(it.lineTotal || 0)}`;
      pdf.text(line, m, y);
      y += 5;
      if (y > 270) {
        pdf.addPage();
        y = 18;
      }
    });

    y += 4;
    pdf.setFontSize(10);
    pdf.text(`Taxable:  ${formatINR(note.taxableAmount)}`, m, y);
    y += 5;
    if (note.taxType === "INTER_STATE") {
      pdf.text(`IGST:     ${formatINR(note.igstAmount)}`, m, y);
    } else {
      pdf.text(`CGST:     ${formatINR(note.cgstAmount)}`, m, y);
      y += 5;
      pdf.text(`SGST:     ${formatINR(note.sgstAmount)}`, m, y);
    }
    y += 6;
    pdf.setFont("helvetica", "bold");
    pdf.text(`Grand total:  INR ${formatINR(note.grandTotal)}`, m, y);

    if (note.remarks) {
      y += 10;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(`Remarks: ${note.remarks}`, m, y);
    }

    pdf.save(`${note.creditNoteNumber || "credit-note"}.pdf`);
    return;
  } catch {
    // Fallback: print window
    const w = window.open("", "_blank");
    if (!w) return;
    const rows = (note.items || [])
      .map(
        (it) =>
          `<tr><td>${it.itemName}</td><td>${it.quantity}</td><td>${formatINR(it.unitPrice)}</td><td>${formatINR(it.lineTotal || 0)}</td></tr>`,
      )
      .join("");
    w.document.write(`<!doctype html><html><head><title>${note.creditNoteNumber}</title>
      <style>body{font-family:system-ui;padding:24px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:6px;text-align:left}</style>
      </head><body>
      <h1>Credit note ${note.creditNoteNumber || ""}</h1>
      <p>${note.customerName} · ${reasonLabel(note.reason)}</p>
      <table><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>
      <p><strong>Grand total: ₹${formatINR(note.grandTotal)}</strong></p>
      </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }
}

// silence unused in some bundlers
void num;
