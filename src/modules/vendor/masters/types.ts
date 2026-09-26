export interface GlobalDocumentType {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GlobalDocumentTypePayload {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface DocumentTypePagination {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  [key: string]: unknown;
}

export interface GlobalDocumentTypeListResponse {
  items: GlobalDocumentType[];
  pagination: DocumentTypePagination;
}

export type VendorDocumentType = GlobalDocumentType;
export type VendorDocumentTypePayload = GlobalDocumentTypePayload;

export interface VendorCategory {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  status: "ACTIVE" | "INACTIVE" | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorCategoryPayload {
  code: string;
  name: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE" | string;
}

export interface VendorCategoryListResponse {
  items: VendorCategory[];
  pagination: DocumentTypePagination;
}
