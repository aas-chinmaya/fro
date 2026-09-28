import { z } from "zod";

export const LIMITS = {
  NAME: 120,
  PHONE: 15,
  GSTIN: 20,
  FY: 10,
  INVOICE_ID: 64,
  REF: 120,
  NOTES: 500,
  REMARKS: 500,
} as const;

/**
 * Plain-text only: strips HTML/script/event handlers, control chars.
 * Single-line fields collapse whitespace.
 */
function stripUnsafe(raw: string): string {
  return sanitizePlainText(raw, { multiline: false });
}

/**
 * Deep plain-text sanitizer for notes / remarks / free text.
 * - Removes <script>, <style>, all HTML tags
 * - Strips javascript: / data: URLs and on* handlers leftover text
 * - Removes control characters (keeps \n / \t when multiline)
 * - Enforces max length
 */
export function sanitizePlainText(
  raw: unknown,
  opts?: { maxLen?: number; multiline?: boolean },
): string {
  const maxLen = opts?.maxLen ?? 10_000;
  const multiline = opts?.multiline ?? false;

  let s = String(raw ?? "");

  // Normalize line endings
  s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Remove script / style blocks entirely (content too)
  s = s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
  s = s.replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "");
  s = s.replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, "");
  s = s.replace(/<embed[\s\S]*?>/gi, "");

  // Strip all remaining HTML tags
  s = s.replace(/<[^>]*>/g, "");

  // Decode a few common entities so they don't reintroduce markup later
  s = s
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/gi, "&");
  // Second pass after entity decode
  s = s.replace(/<[^>]*>/g, "");

  // Strip dangerous URL schemes if pasted as plain text
  s = s.replace(/javascript\s*:/gi, "");
  s = s.replace(/vbscript\s*:/gi, "");
  s = s.replace(/data\s*:\s*text\/html/gi, "");

  // Control chars: keep \n and \t only when multiline
  if (multiline) {
    s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
    // Cap consecutive newlines
    s = s.replace(/\n{3,}/g, "\n\n");
    // Trim spaces on each line but keep structure
    s = s
      .split("\n")
      .map((line) => line.replace(/[ \t]+/g, " ").trim())
      .join("\n")
      .trim();
  } else {
    s = s.replace(/[\u0000-\u001F\u007F]/g, "");
    s = s.replace(/\s+/g, " ").trim();
  }

  if (s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}

/** Always outputs string (never null/undefined) so RHF Resolver matches FormValues */
const str = (max: number) =>
  z.preprocess(
    (v) => stripUnsafe(String(v ?? "")).slice(0, max),
    z.string(),
  );

const requiredStr = (max: number, msg: string) =>
  z.preprocess(
    (v) => stripUnsafe(String(v ?? "")).slice(0, max),
    z.string().min(1, msg).max(max),
  );

export const paymentReceiptFormSchema = z
  .object({
    receiptDate: z
      .string()
      .min(1, "Receipt date is required"),
    financialYear: str(LIMITS.FY),

    customerId: requiredStr(LIMITS.INVOICE_ID, "Please select a customer"),
    customerName: requiredStr(LIMITS.NAME, "Customer name is required"),
    customerPhone: str(LIMITS.PHONE),
    customerGSTIN: str(LIMITS.GSTIN),

    invoiceId: str(LIMITS.INVOICE_ID),
    paymentMethod: z.enum(["CASH", "UPI", "CARD", "NET_BANKING"]),
    transactionReference: str(LIMITS.REF),
    amount: z.preprocess(
      (v) => {
        if (typeof v === "number") return v;
        if (v === "" || v === null || v === undefined) return 0;
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
      },
      z
        .number()
        .positive("Amount must be greater than 0")
        .max(10_00_00_000, "Amount exceeds limit"),
    ),
    notes: z.preprocess(
      (v) => sanitizePlainText(v, { maxLen: LIMITS.NOTES, multiline: true }),
      z.string().max(LIMITS.NOTES),
    ),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod !== "CASH") {
      const ref = String(data.transactionReference || "").trim();
      if (!ref) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Transaction reference is required for non-cash payments",
          path: ["transactionReference"],
        });
      }
    }
  });

export type PaymentReceiptFormSchema = z.infer<typeof paymentReceiptFormSchema>;

export function sanitizeFieldInput(raw: string, maxLen: number): string {
  return sanitizePlainText(raw, { maxLen, multiline: false });
}

/** Notes / remarks — multiline plain text, length-capped */
export function sanitizeNotesInput(raw: string, maxLen = LIMITS.NOTES): string {
  return sanitizePlainText(raw, { maxLen, multiline: true });
}

/**
 * Live input helper — keeps typing/paste smooth.
 * Only strips tags + control chars; does NOT collapse spaces mid-typing.
 * Full sanitizePlainText still runs on submit / schema.
 */
export function sanitizeLiveText(
  raw: string,
  maxLen: number,
  multiline = false,
): string {
  let s = String(raw ?? "");
  s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  s = s.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  s = s.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
  s = s.replace(/<[^>]*>/g, "");
  s = s.replace(/javascript\s*:/gi, "");
  if (multiline) {
    s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
  } else {
    s = s.replace(/[\u0000-\u001F\u007F]/g, "");
  }
  if (s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}


/** YYYY-MM-DD (or any parseable) → full ISO datetime */
export function toIsoReceiptDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();
  if (dateStr.includes("T")) {
    const d = new Date(dateStr);
    return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  }
  const d = new Date(`${dateStr}T12:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/** Indian FY Apr–Mar → "2026-27" */
export function computeFinancialYear(dateStr: string): string {
  try {
    const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`);
    if (Number.isNaN(d.getTime())) {
      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth() + 1;
      return m >= 4
        ? `${y}-${String(y + 1).slice(-2)}`
        : `${y - 1}-${String(y).slice(-2)}`;
    }
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    if (m >= 4) return `${y}-${String(y + 1).slice(-2)}`;
    return `${y - 1}-${String(y).slice(-2)}`;
  } catch {
    return String(new Date().getFullYear());
  }
}
