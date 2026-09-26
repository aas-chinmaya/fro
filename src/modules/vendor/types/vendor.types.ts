import type { z } from "zod";
import type { vendorFormSchema } from "../validation";

export type VendorStatus =
  | "Active"
  | "Inactive"
  | "Blocked";

export type VendorType =
  | "Supplier"
  | "Manufacturer"
  | "Wholesaler"
  | "Service Provider"
  | "Contractor";

export type VendorFormValues = z.infer<typeof vendorFormSchema>;
export type VendorFormMode = "add" | "edit";

/** Payload shapes used by vendor API calls */
export interface CreateVendorBasicPayload {
  tenantId: string;
  createdBy?: string;
  vendorType?: string | null;
  vendorName: string;
  legalName?: string;
  displayName?: string;
  businessCategory?: string;
  status?: string;
  remarks?: string;
  vendorEmail?: string;
  vendorPhone?: string;
  websiteLink?: string;
  currencyId?: string;
  logo?: File | Blob | string | null;
  [key: string]: unknown;
}

export interface UpdateVendorPayload {
  [key: string]: unknown;
}

export interface VendorContact {
  id?: string;
  vendorId?: string;
  name: string;
  designation?: string;
  mobile: string;
  email?: string;
  isPrimary?: boolean;
}

export interface VendorAddress {
  id?: string;
  vendorId?: string;

  addressLine1?: string;
  addressLine2?: string;

  countryId?: string;
  stateId?: string;
  cityId?: string;
  pincode?: string;

  isBilling?: boolean;
  isShipping?: boolean;

  status?: string;
}

export interface VendorBank {
  id?: string;
  vendorId?: string;

  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  upiId?: string;

  isPrimary?: boolean;
}

export interface VendorDocument {
  id?: string;
  vendorId?: string;

  name?: string;
  fileName?: string;
  fileUrl?: string;
  documentType?: string;
  globalDocumentTypeID?: string;
  globalDocumentTypeId?: string;

  file?: File | Blob;
  status?: string;
}

export interface Vendor {
  id: string;

  // Basic
  vendorCode: string;
  businessId: string;
  tenantId?: string;
  branchId?: string;

  vendorScope?: string;

  vendorType: VendorType | string;
  vendorName: string;
  legalName?: string;
  displayName?: string;
  businessCategory?: string;

  gstin?: string;
  pan?: string;

  email: string;
  phone: string;

  websiteLink?: string;
  alternatevendorPhone?: string;

  currencyId: string;
  currency?: string;

  paymentTerm: string;
  paymentTerms?: string;
  paymentMode: string;

  creditLimit: number;
  openingBalance: number;

  status: VendorStatus | string;

  remarks?: string;

  logo?: string | File | Blob | null;
  logoUrl?: string | { view?: string; download?: string; [key: string]: unknown } | null;

  // Nested data
  addresses: VendorAddress[];
  contacts: VendorContact[];
  banks: VendorBank[];
  documents: VendorDocument[];

  // Convenience / primary contact fields
  vendorId?: string;
  name?: string;
  designation?: string;
  mobile?: string;

  // Convenience / primary address fields
  addressLine1?: string;
  addressLine2?: string;
  countryId?: string;
  stateId?: string;
  cityId?: string;
  pincode?: string;
  isBilling?: boolean;
  isShipping?: boolean;

  // Convenience / primary bank fields
  accountHolder?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  upiId?: string;
  isPrimary?: boolean;

  // Statistics
  totalPurchase: number;
  totalOrders: number;
  outstanding: number;
  lastPurchaseDate?: string;

  createdBy?: string;
  updatedBy?: string;

  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface VendorStats {
  totalVendors: number;
  activeVendors: number;
  totalPurchase: number;
  outstanding: number;
}

export interface VendorListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string | null;
  tenantId?: string | number | null;
}

export interface VendorExportParams {
  page?: number;
  limit?: number;
  tenantId?: string;
}
