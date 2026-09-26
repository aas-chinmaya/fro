import { z } from "zod";

export const GST_TYPE_VALUES = [
  "REGISTERED",
  "UNREGISTERED",
  "COMPOSITION",
  "SEZ",
  "EXPORT",
] as const;

export const ACCOUNT_TYPE_VALUES = [
  "SAVING",
  "CURRENT",
  "OTHER",
] as const;

// =====================================================
// Common Helpers
// =====================================================

const optionalString = z.string().trim().optional().or(z.literal(""));

const requiredString = (message: string) =>
  z.string().trim().min(1, message);

const normalizeUpper = (value: unknown) =>
  typeof value === "string" ? value.trim().toUpperCase() : value;

const normalizeSpacesRemoved = (value: unknown) =>
  typeof value === "string" ? value.replace(/\s+/g, "") : value;

// =====================================================
// Regex
// =====================================================

const requiredPincode = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter a valid 6-digit pincode");

const optionalPincode = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter a valid 6-digit pincode")
  .optional()
  .or(z.literal(""));

const required10DigitString = (message: string) =>
  z.string().trim().regex(/^\d{10}$/, message);

const gstinRegex =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;

const udyamRegex = /^UDYAM-[A-Z0-9]{2,}-\d{2}-\d{7}$/i;

const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const upiRegex = /^[A-Za-z0-9._-]{2,}@[A-Za-z0-9.-]{2,}$/;

const accountHolderRegex = /^[A-Za-z][A-Za-z0-9 &.'/-]{1,99}$/;

const bankNameRegex = /^[A-Za-z][A-Za-z0-9 &./'-]{1,119}$/;

// =====================================================
// Uppercase Validation Helper
// =====================================================

const optionalUppercasePattern = (
  regex: RegExp,
  message: string
) =>
  z
    .preprocess(
      normalizeUpper,
      z.string().trim().optional().or(z.literal(""))
    )
    .refine(
      (value) =>
        !value || regex.test(value),
      {
        message,
      }
    );

// =====================================================
// Address Schema
// =====================================================

const addressSchema = z.object({
  addressLine1: requiredString("Address line 1 is required"),

  addressLine2: optionalString,

  landmark: optionalString,

  district: optionalString,

  countryId: requiredString("Country is required"),

  stateId: requiredString("State is required"),

  cityId: requiredString("City is required"),

  pincode: requiredPincode,

  isBilling: z.boolean().default(true),

  isShipping: z.boolean().default(true),

  status: requiredString("Address status is required"),
});

// =====================================================
// Shipping Address Schema
// =====================================================

const shippingAddressSchema = z.object({
  addressLine1: optionalString,

  addressLine2: optionalString,

  landmark: optionalString,

  district: optionalString,

  countryId: optionalString,

  stateId: optionalString,

  cityId: optionalString,

  pincode: optionalPincode,

  isBilling: z.boolean().default(false),

  isShipping: z.boolean().default(true),

  status: optionalString,
});

// =====================================================
// Contact Schema
// =====================================================

const contactSchema = z.object({
  name: requiredString("Contact name is required"),

  designation: optionalString,

  mobile: required10DigitString(
    "Enter a valid 10-digit mobile number"
  ),

  vendorPhone: optionalString,

  contactemail: requiredString(
    "Contact email is required"
  ).email("Enter a valid email"),

  email: optionalString,

  alternateMobile: optionalString,

  alternatevendorPhone: optionalString,

  website: optionalString,
});

// =====================================================
// Bank Schema
// =====================================================

export const bankSchema = z.object({
  accountHolder: requiredString(
    "Account holder is required"
  ).refine(
    (value) =>
      value.length >= 2 &&
      value.length <= 100 &&
      accountHolderRegex.test(value),
    "Enter a valid account holder name"
  ),

  bankName: requiredString(
    "Bank name is required"
  ).refine(
    (value) =>
      value.length >= 2 &&
      value.length <= 120 &&
      bankNameRegex.test(value),
    "Enter a valid bank name"
  ),

  accountNumber: requiredString(
    "Account number is required"
  ).refine(
    (value) => /^\d{9,18}$/.test(value),
    "Account number must be 9-18 digits only"
  ),

  ifscCode: z
    .preprocess(
      normalizeUpper,
      requiredString("IFSC code is required")
    )
    .refine(
      (value) => ifscRegex.test(value),
      "Enter a valid 11-character IFSC code"
    ),

  branch: z
    .preprocess(
      (value) =>
        typeof value === "string"
          ? value.trim()
          : value,
      z
        .string()
        .max(
          100,
          "Branch name must be 100 characters or less"
        )
        .optional()
        .or(z.literal(""))
    ),

  upiId: z
    .preprocess(
      (value) =>
        typeof value === "string"
          ? value.trim()
          : value,
      z
        .string()
        .regex(upiRegex, "Enter a valid UPI ID")
        .optional()
        .or(z.literal(""))
    ),

  accountType: z.enum(ACCOUNT_TYPE_VALUES, {
    message: "Account type is required",
  }),

  cancelledCheque: optionalString,
});

// =====================================================
// Document Schema
// =====================================================

const documentSchema = z
  .object({
    globalDocumentTypeID: requiredString(
      "Document type is required"
    ),

    fileUrl: optionalString,

    file: z.any().optional(),
  })
  .superRefine((document, ctx) => {
    if (!document.file && !document.fileUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["file"],
        message: "Please upload a document file",
      });
    }
  });

// =====================================================
// Vendor Tax Schema
// =====================================================

const vendorTaxSchema = z
  .object({
    gstType: z.enum(GST_TYPE_VALUES, {
      message: "GST type is required",
    }),

    gstin: optionalUppercasePattern(
      gstinRegex,
      "Enter a valid GSTIN"
    ),

    pan: optionalUppercasePattern(
      panRegex,
      "Enter a valid PAN number"
    ),

    tan: optionalUppercasePattern(
      tanRegex,
      "Enter a valid TAN number"
    ),

    msme: optionalUppercasePattern(
      udyamRegex,
      "Enter a valid Udyam / MSME number"
    ),

    cin: z.preprocess(
      (value) =>
        typeof value === "string"
          ? value.trim().toUpperCase()
          : value,
      z.string().trim().optional().or(z.literal(""))
    ),

    aadhaar: z
      .preprocess(
        normalizeSpacesRemoved,
        z.string().trim().optional().or(z.literal(""))
      )
      .refine(
        (value) =>
          !value || /^\d{12}$/.test(value),
        "Aadhaar must be exactly 12 digits"
      ),

    tdsApplicable: z.boolean().default(false),

    tdsSection: z.preprocess(
      (value) =>
        typeof value === "string"
          ? value.trim()
          : value,
      z
        .string()
        .max(
          50,
          "TDS section must be 50 characters or less"
        )
        .optional()
        .or(z.literal(""))
    ),

    tcsApplicable: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    // GSTIN is required for registered vendors
    if (data.gstType === "REGISTERED") {
      if (
        !data.gstin ||
        !gstinRegex.test(data.gstin ?? "")
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["gstin"],
          message:
            "GSTIN is required for registered vendors",
        });
      }
    }

    // TDS section is required when TDS is applicable
    if (
      data.tdsApplicable &&
      (!data.tdsSection || !data.tdsSection.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tdsSection"],
        message:
          "TDS section is required when TDS is applicable",
      });
    }
  });

// =====================================================
// Validate Vendor Bank Payload
// =====================================================

export const validateVendorBankPayload = (
  payload: Record<string, any>
) => {
  const normalized = {
    ...payload,

    accountHolder:
      typeof payload.accountHolder === "string"
        ? payload.accountHolder.trim()
        : payload.accountHolder,

    bankName:
      typeof payload.bankName === "string"
        ? payload.bankName.trim()
        : payload.bankName,

    ifscCode:
      typeof payload.ifscCode === "string"
        ? payload.ifscCode.trim().toUpperCase()
        : payload.ifscCode,

    accountType:
      typeof payload.accountType === "string"
        ? payload.accountType.trim().toUpperCase()
        : payload.accountType,

    branch:
      typeof payload.branch === "string"
        ? payload.branch.trim()
        : payload.branch,

    upiId:
      typeof payload.upiId === "string"
        ? payload.upiId.trim()
        : payload.upiId,
  };

  const parsed = bankSchema.parse(normalized);

  const {
    isPrimary: _ignoredIsPrimary,
    ...sanitized
  } = parsed as Record<string, any>;

  return sanitized;
};

// =====================================================
// Validate Vendor Tax Payload
// =====================================================

export const validateVendorTaxPayload = (
  payload: Record<string, any>
) => {
  const normalized = {
    ...payload,

    gstType:
      typeof payload.gstType === "string"
        ? payload.gstType.trim().toUpperCase()
        : payload.gstType,

    gstin:
      typeof payload.gstin === "string"
        ? payload.gstin.trim().toUpperCase()
        : payload.gstin,

    pan:
      typeof payload.pan === "string"
        ? payload.pan.trim().toUpperCase()
        : payload.pan,

    tan:
      typeof payload.tan === "string"
        ? payload.tan.trim().toUpperCase()
        : payload.tan,

    msme:
      typeof payload.msme === "string"
        ? payload.msme.trim().toUpperCase()
        : payload.msme,

    cin:
      typeof payload.cin === "string"
        ? payload.cin.trim().toUpperCase()
        : payload.cin,

    aadhaar:
      typeof payload.aadhaar === "string"
        ? payload.aadhaar.replace(/\s+/g, "")
        : payload.aadhaar,

    tdsSection:
      typeof payload.tdsSection === "string"
        ? payload.tdsSection.trim()
        : payload.tdsSection,
  };

  return vendorTaxSchema.parse(normalized);
};

// =====================================================
// Vendor Form Schema
// =====================================================

export const vendorFormSchema = z
  .object({
    // ---------------------------------------------------
    // Basic Vendor Information
    // ---------------------------------------------------

    vendorCode: optionalString,

    businessId: optionalString,

    vendorType: requiredString(
      "Vendor type is required"
    ),

    vendorName: requiredString(
      "Vendor name is required"
    ),

    legalName: optionalString,

    displayName: optionalString,

    businessCategory: optionalString,

    remarks: optionalString,

    logo: z.any().optional(),

    createdBy: optionalString,

    // ---------------------------------------------------
    // Basic Tax Information
    // ---------------------------------------------------

    gstin: optionalUppercasePattern(
      gstinRegex,
      "Enter a valid GSTIN"
    ),

    pan: optionalUppercasePattern(
      panRegex,
      "Enter a valid PAN number"
    ),

    tan: optionalUppercasePattern(
      tanRegex,
      "Enter a valid TAN number"
    ),

    msme: optionalUppercasePattern(
      udyamRegex,
      "Enter a valid Udyam / MSME number"
    ),

    cin: z.preprocess(
      (value) =>
        typeof value === "string"
          ? value.trim().toUpperCase()
          : value,
      z.string().trim().optional().or(z.literal(""))
    ),

    aadhaar: z
      .preprocess(
        normalizeSpacesRemoved,
        z.string().trim().optional().or(z.literal(""))
      )
      .refine(
        (value) =>
          !value || /^\d{12}$/.test(value),
        "Aadhaar must be exactly 12 digits"
      ),

    // ---------------------------------------------------
    // Contact Information
    // ---------------------------------------------------

    email: requiredString(
      "Vendor email is required"
    ).email("Enter a valid email"),

    phone: required10DigitString(
      "Enter a valid 10-digit phone number"
    ),

    alternatevendorPhone: optionalString,

    websiteLink: z
      .string()
      .trim()
      .url("Enter a valid website URL")
      .optional()
      .or(z.literal("")),

    // ---------------------------------------------------
    // Financial Information
    // ---------------------------------------------------

    currencyId: requiredString(
      "Currency is required"
    ),

    paymentTerm: requiredString(
      "Payment term is required"
    ),

    paymentMode: requiredString(
      "Payment mode is required"
    ),

    creditLimit: z
      .number()
      .min(0, "Credit limit cannot be negative")
      .default(0),

    openingBalance: z
      .number()
      .min(0, "Opening balance cannot be negative")
      .default(0),

    gstSlab: optionalString,

    purchaseLedger: optionalString,

    status: requiredString(
      "Status is required"
    ),

    balanceType: requiredString(
      "Balance type is required"
    ),

    creditDays: z
      .number()
      .int()
      .min(0, "Credit days cannot be negative")
      .default(30),

    // ---------------------------------------------------
    // GST / Tax
    // ---------------------------------------------------

    gstType: z.enum(GST_TYPE_VALUES, {
      message: "GST type is required",
    }),

    tdsApplicable: z.boolean().default(false),

    tdsSection: z.preprocess(
      (value) =>
        typeof value === "string"
          ? value.trim()
          : value,
      z
        .string()
        .max(
          50,
          "TDS section must be 50 characters or less"
        )
        .optional()
        .or(z.literal(""))
    ),

    tcsApplicable: z.boolean().default(false),

    // ---------------------------------------------------
    // Address
    // ---------------------------------------------------

    sameAsBilling: z.boolean().default(true),

    addresses: z
      .array(addressSchema)
      .min(1, "Billing address is required"),

    shippingAddress:
      shippingAddressSchema.optional(),

    // ---------------------------------------------------
    // Contacts
    // ---------------------------------------------------

    contacts: z
      .array(contactSchema)
      .min(1, "Primary contact is required"),

    // ---------------------------------------------------
    // Banks
    // ---------------------------------------------------

    banks: z
      .array(bankSchema)
      .min(1, "Bank details are required"),

    // ---------------------------------------------------
    // Documents
    // ---------------------------------------------------

    documents: z
      .array(documentSchema)
      .optional()
      .default([]),
  })
  .superRefine((data, ctx) => {
    // ===================================================
    // GSTIN Validation
    // ===================================================

    if (
      data.gstType === "REGISTERED" &&
      (!data.gstin ||
        !gstinRegex.test(data.gstin ?? ""))
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gstin"],
        message:
          "GSTIN is required for registered vendors",
      });
    }

    // ===================================================
    // TDS Validation
    // ===================================================

    if (
      data.tdsApplicable &&
      (!data.tdsSection ||
        !data.tdsSection.trim())
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tdsSection"],
        message:
          "TDS section is required when TDS is applicable",
      });
    }

    // ===================================================
    // Shipping Address Validation
    // ===================================================

    if (!data.sameAsBilling) {
      const shipping = data.shippingAddress;

      if (!shipping?.addressLine1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [
            "shippingAddress",
            "addressLine1",
          ],
          message:
            "Shipping address line 1 is required",
        });
      }

      if (!shipping?.countryId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [
            "shippingAddress",
            "countryId",
          ],
          message:
            "Shipping country is required",
        });
      }

      if (!shipping?.stateId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [
            "shippingAddress",
            "stateId",
          ],
          message:
            "Shipping state is required",
        });
      }

      if (!shipping?.cityId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [
            "shippingAddress",
            "cityId",
          ],
          message:
            "Shipping city is required",
        });
      }

      if (!shipping?.pincode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [
            "shippingAddress",
            "pincode",
          ],
          message:
            "Shipping pincode is required",
        });
      }
    }
  });

// =====================================================
// Vendor Form Type
// =====================================================

export type { VendorFormValues } from "./types/vendor-form.types";
