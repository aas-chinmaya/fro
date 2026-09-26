import { z } from "zod";

export const quotationStatusSchema = z.enum([
  "DRAFT",
  "FINALIZED",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CANCELLED",
]);

export const taxTypeSchema = z.enum(["INTRA_STATE", "INTER_STATE"]);
export const discountTypeSchema = z.enum(["PERCENTAGE", "FIXED"]);

/** Production limits — Indian commercial sanity */
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
  /** Max unit price (₹) — 10 crore */
  MAX_PRICE: 10_00_00_000,
  /** Max quantity per line */
  MAX_QTY: 1_00_000,
  /** Max discount % */
  MAX_DISC_PCT: 100,
  /** Max tax rate % */
  MAX_TAX: 40,
  /** Max grand total sanity */
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
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid content",
    });
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

const pincodeSchema = z
  .union([
    z.literal(""),
    z.null(),
    z
      .string()
      .regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),
  ])
  .optional()
  .nullable();



const safeText = (max: number, requiredMsg?: string) => {
  let s = z.string().max(max, `Max ${max} characters`);
  if (requiredMsg) {
    s = s.min(1, requiredMsg) as typeof s;
  }
  return s
    .transform((v) => stripControl(v))
    .superRefine((v, ctx) => noHarmful(v, ctx));
};

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

const money = (label: string, max = LIMITS.MAX_PRICE) =>
  z.coerce
    .number()
    .nonnegative(`${label} cannot be negative`)
    .max(max, `${label} exceeds allowed limit`);

export const quotationItemSchema = z
  .object({
    id: z.string().optional(),
    itemId: z.string().nullable().optional(),
    itemName: z
      .string()
      .max(LIMITS.NAME)
      .optional()
      .default("")
      .transform((v) => stripControl(String(v || "")).slice(0, LIMITS.NAME))
      .superRefine((v, ctx) => noHarmful(v, ctx)),
    description: optionalSafeText(LIMITS.DESCRIPTION),
    hsnSac: optionalSafeText(LIMITS.HSN),
    quantity: z.coerce
      .number()
      .min(0, "Quantity cannot be negative")
      .max(LIMITS.MAX_QTY, `Quantity max ${LIMITS.MAX_QTY}`),
    unit: optionalSafeText(LIMITS.UNIT),
    rate: money("Rate").optional().default(0),
    price: money("Price").optional().default(0),
    discount: z.coerce
      .number()
      .nonnegative("Discount cannot be negative")
      .max(LIMITS.MAX_PRICE, "Discount too large")
      .optional()
      .default(0),
    discountType: discountTypeSchema.optional().default("PERCENTAGE"),
    taxRate: z.coerce
      .number()
      .min(0)
      .max(LIMITS.MAX_TAX, `Tax rate max ${LIMITS.MAX_TAX}%`)
      .optional()
      .default(0),
    taxAmount: z.coerce.number().nonnegative().optional().default(0),
    cgstRate: z.coerce.number().nonnegative().optional().default(0),
    cgstAmount: z.coerce.number().nonnegative().optional().default(0),
    sgstRate: z.coerce.number().nonnegative().optional().default(0),
    sgstAmount: z.coerce.number().nonnegative().optional().default(0),
    igstRate: z.coerce.number().nonnegative().optional().default(0),
    igstAmount: z.coerce.number().nonnegative().optional().default(0),
    amount: z.coerce.number().nonnegative().optional().default(0),
    total: z.coerce.number().nonnegative().optional().default(0),
    /** Optional display-only; quotation never validates against stock */
    stockAvailable: z.number().nullable().optional(),
  })
  .superRefine((item, ctx) => {
    const qty = Number(item.quantity) || 0;
    const price = (Number(item.price ?? item.rate) || 0);
    const disc = Number(item.discount) || 0;
    const dtype = item.discountType || "PERCENTAGE";

    if (dtype === "PERCENTAGE" && disc > LIMITS.MAX_DISC_PCT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Discount cannot exceed ${LIMITS.MAX_DISC_PCT}%`,
        path: ["discount"],
      });
    }

    if (dtype === "FIXED") {
      const gross = qty * price;
      if (disc > gross + 0.001) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Discount cannot exceed line amount",
          path: ["discount"],
        });
      }
    }

    // Quotation: no stock availability validation

    if (item.itemName && qty <= 0 && item.itemId) {
      // allow 0 qty only for empty draft lines without selection
    }
  });

export const quotationBaseSchema = z.object({
  

  quotationDate: z.string().min(1, "Quotation date is required"),
  validUntil: z.string().min(1, "Valid until is required"),
  financialYear: optionalSafeText(20),

  businessName: safeText(LIMITS.COMPANY, "Business name is required"),
  businessLegalName: optionalSafeText(LIMITS.COMPANY),
  businessGSTIN: optionalSafeText(LIMITS.GSTIN),
  businessPAN: optionalSafeText(LIMITS.PAN),
  businessPhone: optionalSafeText(LIMITS.PHONE),
  businessEmail: optionalEmail,
  businessAddressLine1: optionalSafeText(LIMITS.ADDRESS),
  businessAddressLine2: optionalSafeText(LIMITS.ADDRESS),
  businessCity: optionalSafeText(LIMITS.CITY),
  businessState: optionalSafeText(LIMITS.CITY),
  businessStateCode: optionalSafeText(10),
  businessPincode: pincodeSchema,
  businessCountry: optionalSafeText(LIMITS.CITY),

  businessBankName: optionalSafeText(LIMITS.COMPANY),
  businessBankAccountNumber: optionalSafeText(40),
  businessBankIFSC: optionalSafeText(20),
  businessBankBranch: optionalSafeText(LIMITS.CITY),
  businessUPIId: optionalSafeText(100),
  showBankDetails: z.boolean().optional().default(false),
  showUPIDetails: z.boolean().optional().default(false),
  businessLogo: z.string().max(500_000).nullable().optional(),

  prospectName: safeText(LIMITS.NAME, "Customer name is required"),
  prospectCompanyName: optionalSafeText(LIMITS.COMPANY),
  prospectGSTIN: optionalSafeText(LIMITS.GSTIN),
  prospectPAN: optionalSafeText(LIMITS.PAN),
  prospectPhone: phoneRequired,
  prospectEmail: optionalEmail,
  prospectAddressLine1: safeText(LIMITS.ADDRESS, "Address is required"),
  prospectAddressLine2: optionalSafeText(LIMITS.ADDRESS),
  prospectCity: safeText(LIMITS.CITY, "City is required"),
  prospectState: safeText(LIMITS.CITY, "State is required"),
  prospectStateCode: optionalSafeText(10),
  prospectPincode: pincodeRequired,
  prospectCountry: safeText(LIMITS.CITY, "Country is required"),

  placeOfSupply: safeText(LIMITS.CITY, "Place of supply is required"),
  placeOfSupplyCode: optionalSafeText(10),
  taxType: taxTypeSchema.optional().default("INTRA_STATE"),
  reverseCharge: z.boolean().optional().default(false),
  isExport: z.boolean().optional().default(false),
  isSEZ: z.boolean().optional().default(false),
  currency: z.string().optional().default("INR"),
  exchangeRate: z.coerce.number().positive().nullable().optional(),

  items: z.array(quotationItemSchema).min(1, "At least one item is required"),

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
    .max(LIMITS.MAX_TOTAL, "Grand total exceeds limit")
    .default(0),

  notes: optionalSafeText(LIMITS.NOTES_HTML),
  termsAndConditions: safeText(LIMITS.NOTES_HTML, "Terms & conditions are required"),
  signature: z.string().nullable().optional(),
  status: quotationStatusSchema.optional().default("DRAFT"),
});

export const quotationCreateSchema = quotationBaseSchema.superRefine(
  (data, ctx) => {
    const strip = (html: string) => (html || "").replace(/<[^>]+>/g, "").trim();
    if (!strip(data.termsAndConditions || "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Terms & conditions are required",
        path: ["termsAndConditions"],
      });
    }
    const filledItems = (data.items || []).filter(
      (it) => (it.itemName || "").trim().length > 0,
    );
    if (filledItems.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one item",
        path: ["items"],
      });
    }
    for (const it of filledItems) {
      if (!it.quantity || Number(it.quantity) <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Quantity must be greater than 0",
          path: ["items"],
        });
        break;
      }
    }

    if (data.validUntil && data.quotationDate) {
      const a = new Date(data.quotationDate);
      const b = new Date(data.validUntil);
      if (!Number.isNaN(a.getTime()) && !Number.isNaN(b.getTime()) && b < a) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Due date must be on or after quotation date",
          path: ["validUntil"],
        });
      }
    }
  },
);

export const quotationUpdateSchema = quotationBaseSchema.partial().extend({
  updatedBy: z.string().optional(),
});

export type QuotationCreateSchema = z.infer<typeof quotationCreateSchema>;
export type QuotationUpdateSchema = z.infer<typeof quotationUpdateSchema>;
