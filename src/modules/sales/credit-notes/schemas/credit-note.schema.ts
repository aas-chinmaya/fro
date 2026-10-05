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
  productId: z.string().min(1, "Product is required"),
  itemName: z.string().optional().default(""),
  itemCode: z.string().optional(),
  hsnSacCode: z.string().optional(),
  unit: z.string().optional(),
  quantity: z.coerce.number().positive("Quantity must be > 0"),
  unitPrice: z.coerce.number().nonnegative("Price cannot be negative"),
  discountAmount: z.coerce.number().nonnegative().optional().default(0),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).optional().default("PERCENTAGE"),
  discountValue: z.coerce.number().nonnegative().optional().default(0),
  gstRate: z.coerce.number().min(0).max(40).optional().default(0),
  taxRate: z.coerce.number().min(0).max(40).optional(),
});

export const createCreditNoteSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  customerName: z.string().optional(),
  salesInvoiceId: z.string().nullable().optional(),
  salesInvoiceNumber: z.string().nullable().optional(),
  creditNoteDate: z.string().min(1, "Date is required"),
  financialYear: z.string().nullable().optional(),
  reason: creditNoteReasonSchema,
  taxType: z.enum(["INTRA_STATE", "INTER_STATE"]).optional().default("INTRA_STATE"),
  placeOfSupply: z.string().optional(),
  items: z.array(creditNoteItemSchema).min(1, "At least one item is required"),
  remarks: z.string().max(1000).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  termsAndConditions: z.string().max(2000).nullable().optional(),
  taxableAmount: z.coerce.number().nonnegative().optional(),
  discountAmount: z.coerce.number().nonnegative().optional(),
  cgstAmount: z.coerce.number().nonnegative().optional(),
  sgstAmount: z.coerce.number().nonnegative().optional(),
  igstAmount: z.coerce.number().nonnegative().optional(),
  roundOffAmount: z.coerce.number().optional(),
  grandTotal: z.coerce.number().nonnegative().optional(),
  status: creditNoteStatusSchema.optional().default("ISSUED"),
});

export const updateCreditNoteSchema = createCreditNoteSchema.partial().extend({
  reason: creditNoteReasonSchema.optional(),
});

export const adjustmentSchema = z.object({
  type: settlementTypeSchema,
  settlementDate: z.string().min(1, "Settlement date is required"),
  amount: z.coerce.number().positive("Amount must be > 0"),
  remarks: z.string().max(500).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export type CreateCreditNoteSchema = z.infer<typeof createCreditNoteSchema>;
export type AdjustmentSchema = z.infer<typeof adjustmentSchema>;
