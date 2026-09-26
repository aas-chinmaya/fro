import { z } from "zod";

export const invoiceStatusSchema = z.enum([
  "DRAFT",
  "FINALIZED",
  "SENT",
  "PAID",
  "PARTIALLY_PAID",
  "OVERDUE",
  "CANCELLED",
]);

export const taxTypeSchema = z.enum(["INTRA_STATE", "INTER_STATE"]);
export const discountTypeSchema = z.enum(["PERCENTAGE", "FIXED"]);
export const invoiceTypeSchema = z.enum(["B2B", "B2C", "EXPORT", "SEZ"]);

export const LIMITS = {
  NAME: 200,
  COMPANY: 200,
  DESCRIPTION: 1000,
  ADDRESS: 300,
  CITY: 100,
  PINCODE: 12,
  PHONE: 20,
  GSTIN: 15,
  PAN: 10,
  HSN: 12,
  UNIT: 20,
  NOTES_HTML: 500,
  TERMS_HTML: 2000,
  MAX_PRICE: 10_00_00_000,
  MAX_QTY: 1_00_000,
  MAX_DISC_PCT: 100,
  MAX_TAX: 40,
  MAX_TOTAL: 100_00_00_000,
} as const;

const SAFE_TEXT_RE =
  /<script|javascript\s*:|vbscript\s*:|on\w+\s*=|data\s*:\s*text\/html|<\s*iframe|<\s*object|<\s*embed|<\s*link\b/i;

function stripControl(s: string) {
  return s
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/https?:\/\/[^\s]+/gi, "")
    .replace(/www\.[^\s]+/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function noHarmful(val: string, ctx: z.RefinementCtx) {
  if (SAFE_TEXT_RE.test(val)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid content" });
  }
}

const optionalEmail = z
  .union([z.string().email("Invalid email"), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v === "" || v === undefined ? null : v));

const phoneRequired = z
  .string()
  .min(1, "Phone is required")
  .max(LIMITS.PHONE)
  .transform((v) => stripControl(v))
  .refine(
    (v) => /^\+?[0-9]{8,15}$/.test(v.replace(/[\s-]/g, "")),
    "Enter phone with country code (e.g. +919876543210)",
  );

const pincodeRequired = z
  .string()
  .min(1, "Pincode is required")
  .regex(/^[0-9]{6}$/, "Pincode must be 6 digits");

const optionalSafeText = (max: number) =>
  z
    .union([z.string().max(max), z.literal(""), z.null()])
    .optional()
    .transform((v) => {
      if (v === "" || v === undefined || v === null) return null;
      return stripControl(String(v)).slice(0, max);
    })
    .superRefine((v, ctx) => {
      if (typeof v === "string") noHarmful(v, ctx);
    });

const safeText = (max: number, requiredMsg?: string) => {
  let s = z.string().max(max, `Max ${max} characters`);
  if (requiredMsg) s = s.min(1, requiredMsg) as typeof s;
  return s
    .transform((v) => stripControl(v))
    .superRefine((v, ctx) => noHarmful(v, ctx));
};

const money = (label: string, max = LIMITS.MAX_PRICE) =>
  z.coerce
    .number()
    .nonnegative(`${label} cannot be negative`)
    .max(max, `${label} exceeds allowed limit`);

export const invoiceItemSchema = z.object({
  id: z.string().optional(),
  itemId: z.string().nullable().optional(),
  productId: z.string().optional(),
  itemName: z.string().max(LIMITS.NAME).optional().default(""),
  productName: z.string().max(LIMITS.NAME).optional(),
  itemCode: z.string().optional(),
  description: optionalSafeText(LIMITS.DESCRIPTION),
  hsnSac: optionalSafeText(LIMITS.HSN),
  hsnSacCode: optionalSafeText(LIMITS.HSN),
  unit: optionalSafeText(LIMITS.UNIT),
  classification: z.enum(["GOODS", "SERVICES"]).optional(),
  quantity: z.coerce.number().min(0).max(LIMITS.MAX_QTY),
  rate: money("Rate").optional().default(0),
  price: money("Price").optional().default(0),
  discount: z.coerce.number().nonnegative().optional().default(0),
  discountValue: z.coerce.number().nonnegative().optional().default(0),
  discountType: discountTypeSchema.optional().default("PERCENTAGE"),
  taxRate: z.coerce.number().min(0).max(LIMITS.MAX_TAX).optional().default(0),
  gstRate: z.coerce.number().min(0).max(LIMITS.MAX_TAX).optional(),
  taxAmount: z.coerce.number().nonnegative().optional().default(0),
  cgstRate: z.coerce.number().nonnegative().optional().default(0),
  cgstAmount: z.coerce.number().nonnegative().optional().default(0),
  sgstRate: z.coerce.number().nonnegative().optional().default(0),
  sgstAmount: z.coerce.number().nonnegative().optional().default(0),
  igstRate: z.coerce.number().nonnegative().optional().default(0),
  igstAmount: z.coerce.number().nonnegative().optional().default(0),
  amount: z.coerce.number().nonnegative().optional().default(0),
  total: z.coerce.number().nonnegative().optional().default(0),
  taxableAmount: z.coerce.number().nonnegative().optional().default(0),
  stockAvailable: z.number().nullable().optional(),
});

export const invoiceBaseSchema = z.object({
  invoiceType: invoiceTypeSchema.optional().default("B2B"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  financialYear: optionalSafeText(20),

  buyerName: safeText(LIMITS.NAME, "Customer name is required"),
  buyerCompanyName: optionalSafeText(LIMITS.COMPANY),
  buyerGSTIN: optionalSafeText(LIMITS.GSTIN),
  buyerPAN: optionalSafeText(LIMITS.PAN),
  buyerPhone: phoneRequired,
  buyerEmail: optionalEmail,
  buyerType: optionalSafeText(50),
  buyerContactPerson: optionalSafeText(LIMITS.NAME),

  billingAddressLine1: safeText(LIMITS.ADDRESS, "Address is required"),
  billingAddressLine2: optionalSafeText(LIMITS.ADDRESS),
  billingCity: safeText(LIMITS.CITY, "City is required"),
  billingState: safeText(LIMITS.CITY, "State is required"),
  billingStateCode: optionalSafeText(10),
  billingPincode: pincodeRequired,
  billingCountry: safeText(LIMITS.CITY, "Country is required"),

  sameAsBilling: z.boolean().optional().default(true),
  shippingAddressLine1: optionalSafeText(LIMITS.ADDRESS),
  shippingAddressLine2: optionalSafeText(LIMITS.ADDRESS),
  shippingCity: optionalSafeText(LIMITS.CITY),
  shippingState: optionalSafeText(LIMITS.CITY),
  shippingStateCode: optionalSafeText(10),
  shippingPincode: optionalSafeText(12),
  shippingCountry: optionalSafeText(LIMITS.CITY),

  placeOfSupply: safeText(LIMITS.CITY, "Place of supply is required"),
  placeOfSupplyCode: optionalSafeText(10),
  taxType: taxTypeSchema.optional().default("INTRA_STATE"),
  reverseCharge: z.boolean().optional().default(false),
  isExport: z.boolean().optional().default(false),
  isSEZ: z.boolean().optional().default(false),
  currency: z.string().optional().default("INR"),
  exchangeRate: z.coerce.number().positive().nullable().optional(),

  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),

  totalItems: z.coerce.number().int().nonnegative().default(0),
  totalQuantity: z.coerce.number().nonnegative().default(0),
  taxableAmount: z.coerce.number().nonnegative().default(0),
  discountAmount: z.coerce.number().nonnegative().default(0),
  cgstAmount: z.coerce.number().nonnegative().default(0),
  sgstAmount: z.coerce.number().nonnegative().default(0),
  igstAmount: z.coerce.number().nonnegative().default(0),
  cessAmount: z.coerce.number().nonnegative().default(0),
  roundOffAmount: z.coerce.number().default(0),
  grandTotal: z.coerce
    .number()
    .nonnegative()
    .max(LIMITS.MAX_TOTAL)
    .default(0),

  paymentStatus: z
    .enum(["PENDING", "PARTIAL", "PAID", "OVERDUE"])
    .optional()
    .default("PENDING"),
  paymentMethod: z.string().max(50).optional().nullable().default("Cash"),
  paidAmount: z.coerce.number().nonnegative().optional().default(0),
  pendingAmount: z.coerce.number().nonnegative().optional().default(0),
  paymentDate: z.string().optional().nullable(),
  transactionId: z.string().max(100).optional().nullable(),
  receivedAccount: z.string().max(100).optional().nullable(),

  notes: optionalSafeText(LIMITS.NOTES_HTML),
  termsAndConditions: safeText(
    LIMITS.TERMS_HTML,
    "Terms & conditions are required",
  ),
  signature: z.string().nullable().optional(),

  sellerLegalName: optionalSafeText(LIMITS.COMPANY),
  sellerTradeName: optionalSafeText(LIMITS.COMPANY),
  sellerGSTIN: optionalSafeText(LIMITS.GSTIN),
  sellerPAN: optionalSafeText(LIMITS.PAN),
  sellerPhone: optionalSafeText(LIMITS.PHONE),
  sellerEmail: optionalEmail,
  sellerAddressLine1: optionalSafeText(LIMITS.ADDRESS),
  sellerAddressLine2: optionalSafeText(LIMITS.ADDRESS),
  sellerCity: optionalSafeText(LIMITS.CITY),
  sellerState: optionalSafeText(LIMITS.CITY),
  sellerStateCode: optionalSafeText(10),
  sellerPincode: optionalSafeText(12),
  sellerCountry: optionalSafeText(LIMITS.CITY),
  sellerBankName: optionalSafeText(LIMITS.COMPANY),
  sellerBankAccountNumber: optionalSafeText(40),
  sellerBankIFSC: optionalSafeText(20),
  sellerBankBranch: optionalSafeText(LIMITS.CITY),
  sellerUPIId: optionalSafeText(100),
  showBankDetails: z.boolean().optional().default(false),
  showUPIDetails: z.boolean().optional().default(false),
  businessLogo: z.string().max(500_000).nullable().optional(),

  status: invoiceStatusSchema.optional().default("DRAFT"),
});

export const invoiceCreateSchema = invoiceBaseSchema.superRefine(
  (data, ctx) => {
    const strip = (html: string) => (html || "").replace(/<[^>]+>/g, "").trim();
    if (!strip(data.termsAndConditions || "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Terms & conditions are required",
        path: ["termsAndConditions"],
      });
    }
    const filled = (data.items || []).filter(
      (it) => (it.itemName || it.productName || "").trim().length > 0,
    );
    if (filled.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one item",
        path: ["items"],
      });
    }
    for (const it of filled) {
      if (!it.quantity || Number(it.quantity) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Quantity must be greater than 0",
          path: ["items"],
        });
        break;
      }
    }
    // Payment: PENDING → optional. PAID/PARTIAL/OVERDUE → method, paid amount, date required.
    // Cash → transactionId optional; non-cash → transactionId required.
    const status = String(data.paymentStatus || "PENDING").toUpperCase();
    const needsPayment = status === "PAID" || status === "PARTIAL" || status === "OVERDUE";
    if (needsPayment) {
      const method = String(data.paymentMethod || "").trim();
      if (!method) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Payment method is required",
          path: ["paymentMethod"],
        });
      }
      const paid = Number(data.paidAmount);
      if (!Number.isFinite(paid) || paid < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Paid amount is required",
          path: ["paidAmount"],
        });
      }
      if (!String(data.paymentDate || "").trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Payment date is required",
          path: ["paymentDate"],
        });
      }
      const isCash = method.toLowerCase() === "cash";
      const tx = String(data.transactionId || "").trim();
      if (!isCash && !tx) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Transaction / reference ID is required for non-cash payments",
          path: ["transactionId"],
        });
      }
    } else {
      // PENDING: only enforce tx if user chose non-cash method
      const method = String(data.paymentMethod || "Cash").trim();
      const isCash = method.toLowerCase() === "cash";
      const tx = String(data.transactionId || "").trim();
      if (!isCash && method && !tx) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Transaction / reference ID is required for non-cash payments",
          path: ["transactionId"],
        });
      }
    }
  },
);

export const invoiceUpdateSchema = invoiceBaseSchema.partial();

export type InvoiceCreateSchema = z.infer<typeof invoiceCreateSchema>;
export type InvoiceUpdateSchema = z.infer<typeof invoiceUpdateSchema>;
