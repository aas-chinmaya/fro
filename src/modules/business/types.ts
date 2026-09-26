export interface BusinessCategory {
  id: string;
  categoryName: string;
  description?: string | null;
  icon?: string | null;
  status?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface BusinessSubCategory {
  id: string;
  subCategoryName: string;
  description?: string | null;
  icon?: string | null;
  status?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface BusinessIndustry {
  id: string;
  industryName: string;
  description?: string | null;
  icon?: string | null;
  status?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface RegistrationType {
  id: string;
  registrationName: string;
  description?: string | null;
  icon?: string | null;
  status?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Currency {
  id: string;
  currencyName: string;
  currencyCode: string;
  currencySymbol: string;
  icon?: string | null;
  status?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Branch {
  id: string;
  name: string;
  code: string;

  address?: string;
  city?: string;
  state?: string;
  country?: string;

  phone?: string;
  email?: string;

  branchManager?: string;

  status?: "Active" | "Inactive";

  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessAddress {
  id?: string;

  addressLine1?: string | null;
  addressLine2?: string | null;
  landmark?: string | null;
  district?: string | null;

  countryId?: string | null;
  stateId?: string | null;
  cityId?: string | null;

  country?: string | null;
  state?: string | null;
  city?: string | null;

  pincode?: string | null;

  status?: string | null;

  isBilling?: boolean;
  isShipping?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessBank {
  id?: string;

  accountHolder?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;

  ifscCode?: string | null;
  ifsc?: string | null;

  branch?: string | null;

  upiId?: string | null;

  accountType?: string | null;

  isPrimary?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessDocument {
  id?: string;

  globalDocumentTypeID?: string | null;
  globalDocumentTypeId?: string | null;

  fileUrl?: string | null;
  originalName?: string | null;
  fileName?: string | null;

  type?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

/* =========================================================
   BUSINESS CARD / BUSINESS RECORD
========================================================= */

export interface BusinessBranchApiRecord {
  id?: string | number;
  branchName?: string | null;
  branchCode?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  phone?: string | null;
  email?: string | null;
  branchManager?: string | null;
  user?: { name?: string | null } | null;
  status?: string | null;
}

export interface BusinessAddressApiRecord {
  addressLine1?: string | null;
  addressLine2?: string | null;
  pincode?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  countryId?: string | null;
  stateId?: string | null;
  cityId?: string | null;
  isPrimary?: boolean;
  line1?: string | null;
  line2?: string | null;
}

export interface BusinessApiRecord extends Record<string, unknown> {
  id?: string | number;
  tenantId?: string | number;
  displayName?: string | null;
  legalName?: string | null;
  tradeName?: string | null;
  gstin?: string | null;
  pan?: string | null;
  businessType?: string | null;
  status?: string | null;
  phone?: string | null;
  email?: string | null;
  websiteLink?: string | null;
  website?: string | null;
  logo?: string | null;
  industry?: { name?: string | null } | null;
  industryId?: string | null;
  businessCategoryId?: string | null;
  businessSubCategoryId?: string | null;
  registrationTypeId?: string | null;
  registrationType?: string | null;
  registrationNumber?: string | null;
  licenseTypeId?: string | null;
  currencyId?: string | null;
  timezone?: string | null;
  financialYear?: string | null;
  description?: string | null;
  tan?: string | null;
  msme?: string | null;
  pincode?: string | null;
  countryId?: string | null;
  stateId?: string | null;
  cityId?: string | null;
  addresses?: BusinessAddressApiRecord[];
  banks?: Array<Record<string, unknown>>;
  documents?: Array<Record<string, unknown>>;
  branches?: BusinessBranchApiRecord[];
}

export type BranchPayload = Record<string, unknown>;

export interface Business {
  /* Basic information */
  id: string;

  tenantId?: string;

  /*
   * Your BusinessCard uses `name`.
   * The backend API uses `displayName`.
   */
  name: string;

  legalName: string;

  displayName?: string | null;

  tradeName?: string | null;

  businessType: string;

  /* Contact */
  email: string;

  phone: string;

  website?: string | null;

  /*
   * Actual API field
   */
  websiteLink?: string | null;

  /* Tax */
  gstin?: string | null;

  pan?: string | null;

  tan?: string | null;

  msme?: string | null;

  /* Classification */
  industry?: string | BusinessIndustry | null;

  category?: BusinessCategory | null;

  businessCategory?: BusinessCategory | string | null;

  businessCategoryName?: string | null;

  businessSubCategory?: BusinessSubCategory | null;

  businessSubCategoryName?: string | null;

  industryName?: string | null;

  /* IDs */
  businessCategoryId?: string;

  businessSubCategoryId?: string;

  industryId?: string;

  /* Registration */
  registrationTypeId?: string | null;

  registrationType?: RegistrationType | null;

  licenseTypeId?: string | null;

  registrationNumber?: string | null;

  /* Currency */
  currencyId?: string;

  currency?: Currency | null;

  timezone?: string | null;

  financialYear?: string | null;

  /* Location */
  city?: string | null;

  state?: string | null;

  country?: string | null;

  /* Branding */
  logo?: string | null;

  description?: string | null;

  /* Status */
  status:
    | "Active"
    | "Inactive"
    | "Suspended"
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED";

  /* Audit */
  createdBy?: string;

  createdAt?: string;

  updatedAt?: string;

  deletedAt?: string | null;

  /* Related data */
  addresses?: BusinessAddress[];

  banks?: BusinessBank[];

  branches: Branch[];

  documents?: BusinessDocument[];

  /* Statistics */
  vendors: number;

  employees: number;
}