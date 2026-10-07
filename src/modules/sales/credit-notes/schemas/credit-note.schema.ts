import { z } from "zod";

export const creditNoteStatusSchema = z.enum([
  "ISSUED",
  "REFUNDED",
  "EXCHANGED",
  "ADJUSTED",
  "CANCELLED",
]);

export const creditNoteReasonSchema = z.enum([
  "SALES_RETURN",
  "PRICE_ADJUSTMENT",
  "POST_SALE_DISCOUNT",
  "TAX_ADJUSTMENT",
  "RATE_DIFFERENCE",
  "BILLING_CORRECTION",
  "OTHER",
]);

export const settlementTypeSchema = z.enum(["REFUND", "EXCHANGE", "ADJUSTMENT"]);

export const creditNoteItemSchema = z.object({
  productId: z.string().min(1, "Select an item"),
  itemName: z.string().min(1, "Enter item name"),
  itemCode: z.string().optional(),
  hsnSacCode: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  classification: z.enum(["GOODS", "SERVICES"]).optional(),
  quantity: z.coerce.number().positive("Quantity must be > 0"),
  unitPrice: z.coerce.number().nonnegative("Price cannot be negative"),
  rate: z.coerce.number().nonnegative().optional(),
  discountAmount: z.coerce.number().nonnegative().optional().default(0),
  discountType: z
    .enum(["PERCENTAGE", "FIXED"])
    .optional()
    .default("PERCENTAGE"),
  discountValue: z.coerce.number().nonnegative().optional().default(0),
  gstRate: z.coerce.number().min(0).max(40).optional().default(0),
  taxRate: z.coerce.number().min(0).max(40).optional(),
  taxableAmount: z.coerce.number().nonnegative().optional(),
  cgstAmount: z.coerce.number().nonnegative().optional(),
  sgstAmount: z.coerce.number().nonnegative().optional(),
  igstAmount: z.coerce.number().nonnegative().optional(),
  lineTotal: z.coerce.number().nonnegative().optional(),
  description: z.string().optional().nullable(),
});

export const createCreditNoteFormSchema = z
  .object({
    customerId: z.string().min(1, "Select a customer"),
    customerName: z.string().optional(),
    customerPhone: z.string().nullable().optional(),
    customerGSTIN: z.string().nullable().optional(),
    salesInvoiceId: z.string().min(1, "Select an invoice"),
    salesInvoiceNumber: z.string().nullable().optional(),
    creditNoteDate: z.string().min(1, "Select a date"),
    financialYear: z.string().nullable().optional(),
    reason: creditNoteReasonSchema,
    taxType: z
      .enum(["INTRA_STATE", "INTER_STATE"])
      .optional()
      .default("INTRA_STATE"),
    placeOfSupply: z.string().optional(),
    placeOfSupplyCode: z.string().optional(),
    items: z.array(z.any()).default([]),
    remarks: z.string().max(1000).nullable().optional(),
    notes: z.string().max(2000).nullable().optional(),
    termsAndConditions: z.string().max(2000).nullable().optional(),
    taxableAmount: z.coerce.number().nonnegative().optional(),
    discountAmount: z.coerce.number().nonnegative().optional(),
    cgstAmount: z.coerce.number().nonnegative().optional(),
    sgstAmount: z.coerce.number().nonnegative().optional(),
    igstAmount: z.coerce.number().nonnegative().optional(),
    cessAmount: z.coerce.number().nonnegative().optional(),
    roundOffAmount: z.coerce.number().optional(),
    grandTotal: z.coerce.number().nonnegative().optional(),
    status: creditNoteStatusSchema.optional().default("ISSUED"),
  })
  .superRefine((data, ctx) => {
    if (!data.customerId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a customer",
        path: ["customerId"],
      });
    }
    if (!data.salesInvoiceId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select an invoice",
        path: ["salesInvoiceId"],
      });
    }
    if (data.reason === "OTHER" && !(data.remarks || "").trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Remarks are required for Other reason",
        path: ["remarks"],
      });
    }

    const filled = (data.items || []).filter(
      (it: { itemName?: string; productId?: string }) =>
        Boolean((it?.itemName || "").trim() || (it?.productId || "").trim()),
    );

    if (!filled.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one item",
        path: ["items"],
      });
      return;
    }

    filled.forEach((it: Record<string, unknown>, i: number) => {
      const parsed = creditNoteItemSchema.safeParse(it);
      if (!parsed.success) {
        parsed.error.issues.forEach((issue) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: issue.message,
            path: ["items", i, ...(issue.path || [])],
          });
        });
      }
    });
  });

export const createCreditNoteSchema = createCreditNoteFormSchema;

export const adjustmentSchema = z.object({
  type: settlementTypeSchema,
  settlementDate: z.string().min(1, "Settlement date is required"),
  amount: z.coerce.number().positive("Amount must be > 0"),
  remarks: z.string().max(500).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type CreateCreditNoteSchema = z.infer<typeof createCreditNoteFormSchema>;
export type AdjustmentSchema = z.infer<typeof adjustmentSchema>;
