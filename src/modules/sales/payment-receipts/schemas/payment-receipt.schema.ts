import { z } from "zod";

export const LIMITS = {
  NAME: 200,
  PHONE: 20,
  GSTIN: 15,
  NOTES: 500,
  REF: 100,
  INVOICE_ID: 64,
  FY: 20,
} as const;

/** Block scripts, handlers, URLs, HTML */
const HARMFUL_RE =
  /<script|javascript\s*:|vbscript\s*:|on\w+\s*=|data\s*:\s*text\/html|<\s*iframe|<\s*object|<\s*embed|https?:\/\/|www\.|ftp:\/\//i;

function stripUnsafe(s: string): string {
  return s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/https?:\/\/[^\s]+/gi, "")
    .replace(/www\.[^\s]+/gi, "")
    .replace(/ftp:\/\/[^\s]+/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/vbscript\s*:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function rejectHarmful(val: string, ctx: z.RefinementCtx) {
  if (HARMFUL_RE.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Links, scripts, or code are not allowed",
    });
  }
}

const requiredText = (max: number, msg: string) =>
  z
    .string()
    .min(1, msg)
    .max(max, `Max ${max} characters`)
    .transform((v) => stripUnsafe(v))
    .superRefine((v, ctx) => {
      if (!v) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: msg });
        return;
      }
      rejectHarmful(v, ctx);
    });

const optionalText = (max: number) =>
  z
    .union([z.string().max(max), z.literal(""), z.null()])
    .optional()
    .transform((v) => {
      if (v === "" || v === undefined || v === null) return null;
      return stripUnsafe(String(v)).slice(0, max) || null;
    })
    .superRefine((v, ctx) => {
      if (typeof v === "string" && v.length) rejectHarmful(v, ctx);
    });

const optionalPhone = z
  .union([z.string().max(LIMITS.PHONE), z.literal(""), z.null()])
  .optional()
  .transform((v) => {
    if (!v) return null;
    return stripUnsafe(v).replace(/[^\d+]/g, "").slice(0, LIMITS.PHONE) || null;
  })
  .refine(
    (v) => !v || /^\+?[0-9]{8,15}$/.test(v),
    "Enter phone with country code (e.g. +919876543210)",
  );

export const paymentReceiptFormSchema = z
  .object({
    receiptDate: z.string().min(1, "Receipt date is required"),
    financialYear: optionalText(LIMITS.FY),

    customerName: requiredText(LIMITS.NAME, "Customer name is required"),
    customerPhone: optionalPhone,
    customerGSTIN: optionalText(LIMITS.GSTIN),

    invoiceId: optionalText(LIMITS.INVOICE_ID),
    paymentMethod: z.enum(["CASH", "UPI", "CARD", "NET_BANKING"]),
    transactionReference: optionalText(LIMITS.REF),
    amount: z.coerce
      .number({ invalid_type_error: "Amount is required" })
      .positive("Amount must be greater than 0")
      .max(10_00_00_000, "Amount exceeds limit"),
    notes: optionalText(LIMITS.NOTES),
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

/** Sanitize free text on paste / change (UI helper) */
export function sanitizeFieldInput(raw: string, maxLen: number): string {
  return stripUnsafe(raw).slice(0, maxLen);
}
