import { z } from "zod";

export const LIMITS = {
  NAME: 120,
  PHONE: 15,
  GSTIN: 20,
  FY: 10,
  INVOICE_ID: 64,
  REF: 120,
  NOTES: 500,
} as const;

function stripUnsafe(raw: string): string {
  return String(raw || "")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
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
      .string({ required_error: "Receipt date is required" })
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
        .number({ invalid_type_error: "Amount is required" })
        .positive("Amount must be greater than 0")
        .max(10_00_00_000, "Amount exceeds limit"),
    ),
    notes: str(LIMITS.NOTES),
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
  return stripUnsafe(raw).slice(0, maxLen);
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
