import api from "@/services/api";
import { validateVendorBankPayload, validateVendorTaxPayload } from "@/modules/vendor/validation";
import { isSuperAdminRole } from "@/modules/roleAccess/utils/access";

const normalizeStatus = (value?: string) => {
  if (!value) return "ACTIVE";

  const normalized = String(value).trim().toUpperCase();

  if (normalized === "ACTIVE" || normalized === "INACTIVE") {
    return normalized;
  }

  return normalized;
};

const isFileLikeValue = (value: unknown): value is File | Blob => {
  if (typeof File !== "undefined" && value instanceof File) {
    return true;
  }

  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return true;
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.name === "string" &&
    (typeof candidate.size === "number" ||
      typeof candidate.path === "string" ||
      typeof candidate.relativePath === "string")
  );
};

const parseJsonValue = (value: unknown) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
};

const getGlobalDocumentTypeIDs = (documents: any[], value: unknown) => {
  const parsedValue = parseJsonValue(value);
  const payloadIDs = Array.isArray(parsedValue)
    ? parsedValue.filter(Boolean).map(String)
    : [];

  const documentIDs = documents
    .map((document) =>
      document?.globalDocumentTypeID ??
      document?.globalDocumentTypeId ??
      document?.documentType?.id
    )
    .filter(Boolean)
    .map(String);

  return documentIDs.length > 0 ? documentIDs : payloadIDs;
};

const appendFormValue = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null) return;

  if (isFileLikeValue(value)) {
    const file = value as File | Blob;
    const fileName = typeof (value as File).name === "string"
      ? (value as File).name
      : `${key}.bin`;

    formData.append(key, file, fileName);
    return;
  }

  if (typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
    formData.append(key, JSON.stringify(value));
    return;
  }

  formData.append(key, String(value));
};

export const vendorApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string | null;
    tenantId?: string | number | null;
  }) {
    const { role, tenantId: _tenantId, ...queryParams } = params ?? {};

    // if (!isSuperAdminRole(role) && !tenantId) {
    //   throw new Error("Tenant ID is required to load vendors");
    // }

    const endpoint = isSuperAdminRole(role)
      ? "/vendor/getall"
      : `/vendor/tenant`;

    return api.get(endpoint, {
      params: queryParams,
    });
  },

  async getById(id: string) {
    return api.get(`/vendor/getbyid/${id}`);
  },

  async search(keyword: string) {
    return api.get("/vendor/search", {
      params: { keyword },
    });
  },

  async create(data: Record<string, any>) {
    const formData = new FormData();

    const basePayload = {
      // tenantId: data.tenantId ?? "",
      branchId: data.branchId ?? undefined,
      vendorScope: data.vendorScope ?? "BUSINESS",
      createdBy: data.createdBy ?? "user001",
      vendorName: data.vendorName ?? "",
      legalName: data.legalName ?? data.vendorName ?? "",
      displayName: data.displayName ?? data.vendorName ?? "",
      vendorType: data.vendorType ?? "SUPPLIER",
      businessCategory: data.businessCategory ?? "",
      status: normalizeStatus(data.status),
      logo: data.logo ?? null,
      remarks: data.remarks ?? null,
      vendorEmail: data.vendorEmail ?? data.email ?? "",
      vendorPhone: data.vendorPhone ?? data.phone ?? "",
      websiteLink: data.websiteLink ?? "",
      alternatevendorPhone: data.alternatevendorPhone ?? data.contact?.alternatevendorPhone ?? null,
      currencyId: data.currencyId ?? "INR",
      paymentTerm: data.paymentTerm ?? "",
      paymentMode: data.paymentMode ?? "BANK",
      creditLimit: Number(data.creditLimit ?? 0),
      openingBalance: Number(data.openingBalance ?? 0),
      address: parseJsonValue(data.address),
      contact: parseJsonValue(data.contact),
      tax: parseJsonValue(data.tax),
      bank: parseJsonValue(data.bank),
      purchase: parseJsonValue(data.purchase),
    };

    Object.entries(basePayload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === "logo") {
        if (isFileLikeValue(value)) {
          const file = value as File | Blob;
          const fileName = typeof (value as File).name === "string"
            ? (value as File).name
            : "logo.bin";
          formData.append("logo", file, fileName);
          return;
        }

        if (typeof value === "string" && value.trim()) {
          formData.append("logo", value);
          return;
        }

        return;
      }

      if (["address", "contact", "tax", "bank", "purchase"].includes(key)) {
        formData.append(key, typeof value === "string" ? value : JSON.stringify(value));
        return;
      }

      appendFormValue(formData, key, value);
    });

    const documentsInput = Array.isArray(data.documents)
      ? data.documents
      : data.documents
        ? [data.documents]
        : [];

    documentsInput.forEach((document: any, index: number) => {
      const fileValue = document?.file ?? document;

      if (isFileLikeValue(fileValue)) {
        const file = fileValue as File | Blob;
        const fileName = typeof (fileValue as File).name === "string"
          ? (fileValue as File).name
          : `document_${index + 1}.bin`;
        formData.append("documents", file, fileName);
      }
    });

    const globalDocumentTypeIDs = getGlobalDocumentTypeIDs(
      documentsInput,
      data.globalDocumentTypeIDs ?? data.documentTypes
    );

    if (globalDocumentTypeIDs.length > 0) {
      formData.append("documentTypes", JSON.stringify(globalDocumentTypeIDs));
      formData.append("globalDocumentTypeIDs", JSON.stringify(globalDocumentTypeIDs));
    }

    return api.post("/vendor/createvendor", formData, {
      headers: {
        Accept: "application/json",
      },
    });
  },

  // Step-wise endpoints (backend router)
  async createBasicInformation(data: Record<string, any>) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "tenantId" || key === "createdBy") return;
      if (value === undefined || value === null) return;
      if (isFileLikeValue(value)) {
        const file = value as File | Blob;
        const fileName = typeof (value as File).name === "string" ? (value as File).name : `${key}.bin`;
        formData.append(key, file, fileName);
        return;
      }

      if (typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
        formData.append(key, JSON.stringify(value));
        return;
      }

      formData.append(key, String(value));
    });

    return api.post("/vendor/basic-information", formData, {
      headers: { Accept: "application/json" },
    });
  },

  async update(id: string, data: Record<string, any>) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === "documents") return;

      if (["address", "contact", "tax", "bank", "purchase"].includes(key)) {
        formData.append(key, typeof value === "string" ? value : JSON.stringify(value));
        return;
      }

      if (key === "logo") {
        if (isFileLikeValue(value)) {
          const file = value as File | Blob;
          const fileName = typeof (value as File).name === "string"
            ? (value as File).name
            : "logo.bin";
          formData.append("logo", file, fileName);
          return;
        }

        if (typeof value === "string" && value.trim()) {
          formData.append("logo", value);
        }
        return;
      }

      appendFormValue(formData, key, value);
    });

    const documentsInput = Array.isArray(data.documents)
      ? data.documents
      : data.documents
        ? [data.documents]
        : [];

    documentsInput.forEach((document: any, index: number) => {
      const fileValue = document?.file ?? document;

      if (isFileLikeValue(fileValue)) {
        const file = fileValue as File | Blob;
        const fileName = typeof (fileValue as File).name === "string"
          ? (fileValue as File).name
          : `document_${index + 1}.bin`;
        formData.append("documents", file, fileName);
      }
    });

    const globalDocumentTypeIDs = getGlobalDocumentTypeIDs(
      documentsInput,
      data.globalDocumentTypeIDs ?? data.documentTypes
    );

    if (globalDocumentTypeIDs.length > 0) {
      formData.append("documentTypes", JSON.stringify(globalDocumentTypeIDs));
      formData.append("globalDocumentTypeIDs", JSON.stringify(globalDocumentTypeIDs));
    }

    return api.put(`/vendor/updatevendor/${id}`, formData, {
      headers: {
        Accept: "application/json",
      },
    });
  },

  async saveContact(id: string, data: Record<string, any>) {
    // backend expects JSON in req.body for contact
    const payload = data.contact ?? data;
    return api.post(`/vendor/contact/${id}`, payload, { headers: { Accept: "application/json" } });
  },

  async saveAddress(id: string, data: Record<string, any>) {
    // backend expects JSON in req.body for address (not multipart)
    const payload: Record<string, any> = {};
    if (data.address) Object.assign(payload, data.address);
    if (typeof data.sameAsBilling !== "undefined") payload.isShippingSameAsBilling = data.sameAsBilling;
    if (data.shippingAddress) Object.assign(payload, { shippingAddress: data.shippingAddress });
    return api.post(`/vendor/adress/${id}`, payload, { headers: { Accept: "application/json" } });
  },

  async saveBanking(id: string, data: Record<string, any>) {
    const payload = data.bank ?? data;
    const ifsc = payload.ifsc ?? payload.ifscCode ?? "";
    const normalizedPayload = {
      ...payload,
      ifsc,
    };
    const validated = validateVendorBankPayload({
      ...normalizedPayload,
      ifscCode: ifsc,
    });

    const { ifscCode: _ignoredIfscCode, isPrimary: _ignoredIsPrimary, ...validatedBank } = validated as Record<string, any>;

    return api.post(
      `/vendor/savebank/${id}`,
      { ...validatedBank, ifsc: ifsc || validatedBank.ifsc || "" },
      { headers: { Accept: "application/json" } }
    );
  },

  async saveGSTTax(id: string, data: Record<string, any>) {
    const payload = data.tax ?? data;
    const validated = validateVendorTaxPayload(payload);

    return api.post(`/vendor/savegst/${id}`, validated, { headers: { Accept: "application/json" } });
  },

  async savePurchase(id: string, data: Record<string, any>) {
    // backend expects JSON in req.body for purchase
    const payload = data.purchase ?? data;
    return api.post(`/vendor/${id}/purchase`, payload, { headers: { Accept: "application/json" } });
  },

  async uploadDocuments(id: string, formData: FormData) {
    return api.post(`/vendor/documents/${id}`, formData, { headers: { Accept: "application/json" } });
  },

  async updateDocument(vendorId: string, documentId: string, formData: FormData) {
    return api.put(`/vendor/${vendorId}/documents/${documentId}`, formData, {
      headers: { Accept: "application/json" },
    });
  },

  async viewDocument(vendorId: string, documentId: string) {
    return api.get(`/vendor/${vendorId}/documents/${documentId}/view`, {
      responseType: "blob",
    });
  },

  async downloadDocument(vendorId: string, documentId: string) {
    return api.get(`/vendor/${vendorId}/documents/${documentId}/download`, {
      responseType: "blob",
    });
  },

  async deleteDocument(documentId: string) {
    return api.delete(`/vendor/documents/${documentId}`);
  },

  async changeStatus(id: string, status: string) {
    return api.patch(`/vendor/${id}/status`, { status });
  },

  async exportVendors(params?: { page?: number; limit?: number; tenantId?: string }) {
    return api.get("/vendor/export", {
      params,
      responseType: "blob",
    });
  },

  async downloadVendorTemplate() {
    return api.get("/vendor/download-template", {
      responseType: "blob",
    });
  },

  async importVendors(file: File, params?: Record<string, unknown>) {
    const formData = new FormData();
    formData.append("file", file, file.name);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        formData.append(key, String(value));
      });
    }

    return api.post("/vendor/import", formData, {
      headers: {
        Accept: "application/json",
      },
    });
  },

  async delete(id: string) {
    return api.delete(`/vendor/deletevendor/${id}`);
  },
};

export const changeVendorStatus = async (id: string, status: string) => {
  return vendorApi.changeStatus(id, status);
};
