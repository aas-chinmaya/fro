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
