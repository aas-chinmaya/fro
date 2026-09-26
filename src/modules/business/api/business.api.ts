import api from "@/services/api";

import {
  BusinessAddressData,
  BusinessBankData,
  BusinessBranchData,
  BusinessDocumentData,
} from "../setup/validation";

type BackendBusinessResponse<T = unknown> = {
  status: number;
  message: string;
  data: T;
};

const toAddressPayload = (data: BusinessAddressData) => ({
  addressLine1: data.addressLine1,
  addressLine2: data.addressLine2,
  pincode: data.pincode,
  country: data.countryId,
  state: data.stateId,
  city: data.cityId,
  isPrimary: data.isPrimary,
});

const isSuperAdminRole = (role?: string | null) =>
  role?.trim().toUpperCase() === "SUPER ADMIN";

export const businessApi = {
  createBusiness(data: Record<string, unknown> & { logo?: File | null }) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'logo' || value === null || value === undefined || value === '') return;
      formData.append(key, String(value));
    });

    if (data.logo instanceof File) {
      formData.append('logo', data.logo);
    }

    return api.post<BackendBusinessResponse>(
      "/business/createBusiness",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );
  },

  getBusinesses(role?: string | null) {
    const endpoint = isSuperAdminRole(role)
      ? '/business/getAllBusinesses'
      : '/business/getBusinessesByUser';

    return api.get<BackendBusinessResponse>(endpoint, {
      withCredentials: true,
    });
  },

  getBusinessById(id: string) {
    return api.get<BackendBusinessResponse>(`/business/getBusinessById/${id}`);
  },

  updateBusiness(id: string, data: Record<string, unknown> & { logo?: File | null }) {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === 'logo' || value === null || value === undefined || value === '') return;
      formData.append(key, String(value));
    });

    if (data.logo instanceof File) {
      formData.append('logo', data.logo);
    }

    return api.put<BackendBusinessResponse>(`/business/updateBusiness/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteBusiness(id: string) {
    return api.delete<BackendBusinessResponse>(`/business/deleteBusiness/${id}`);
  },

  createAddress(tenantId: number | string, data: BusinessAddressData) {
    return api.post('/business/business-addresses', {
      tenantId,
      ...toAddressPayload(data),
    });
  },

  createBank(tenantId: number | string, data: BusinessBankData) {
    return api.post('/business/business-banks', {
      tenantId,
      ...data,
    });
  },

  createBranch(tenantId: number | string, data: BusinessBranchData) {
    const payload: Record<string, unknown> = {
      tenantId,
      branchName: data.branchName ?? null,
      addressLine1: (data as any).addressLine1 ?? null,
      phone: data.phone,
      email: data.email,
      pincode: data.pincode,
      country: (data as any).country ?? data.countryId,
      state: (data as any).state ?? data.stateId,
      city: (data as any).city ?? data.cityId,
      branchManager: (data as any).branchManager,
      GSTIN: (data as any).GSTIN,
      PAN: (data as any).PAN,
      note: (data as any).note,
      status: (data as any).status ? String((data as any).status).toUpperCase() : undefined,
      isActive: (data as any).isActive,
      licenseNumber: (data as any).licenseNumber,
      openingDate: (data as any).openingDate
        ? new Date((data as any).openingDate).toISOString()
        : undefined,
      users: (data as any).users,
    };

    if (data.managerId && data.managerId.trim()) {
      payload.userId = data.managerId;
    }

    return api.post('/business/business-branches/createBranch', payload);
  },

  getBranchById(branchId: string) {
    return api.get<BackendBusinessResponse>(`/business/business-branches/getBranchById/${branchId}`);
  },

  getBranchDetailsByUser() {
    return api.get<BackendBusinessResponse>("/business/business-branches/getBranchByUser", {
      withCredentials: true,
    });
  },

  updateBranch(branchId: string, data: BusinessBranchData) {
    const payload: Record<string, unknown> = {
      branchName: data.branchName ?? null,
      addressLine1: (data as any).addressLine1 ?? null,
      phone: data.phone,
      email: data.email,
      pincode: data.pincode,
      country: (data as any).country ?? data.countryId,
      state: (data as any).state ?? data.stateId,
      city: (data as any).city ?? data.cityId,
      branchManager: (data as any).branchManager,
      GSTIN: (data as any).GSTIN,
      PAN: (data as any).PAN,
      note: (data as any).note,
      status: (data as any).status ? String((data as any).status).toUpperCase() : undefined,
      isActive: (data as any).isActive,
      licenseNumber: (data as any).licenseNumber,
      openingDate: (data as any).openingDate
        ? new Date((data as any).openingDate).toISOString()
        : undefined,
    };

    if (data.branchCode) {
      payload.branchCode = data.branchCode;
    }

    if (data.managerId && data.managerId.trim()) {
      payload.userId = data.managerId;
    }

    return api.put(`/business/business-branches/updateBranch/${branchId}`, payload);
  },

  deleteBranch(branchId: string) {
    return api.delete(`/business/business-branches/deleteBranch/${branchId}`);
  },

  uploadDocument(tenantId: number | string, doc: BusinessDocumentData) {
    const form = new FormData();

    form.append('tenantId', String(tenantId));
    form.append('globalDocumentTypeId', doc.globalDocumentTypeId);

    if (doc.file instanceof File) {
      form.append('file', doc.file);
    }

    if (doc.fileName) {
      form.append('fileName', doc.fileName);
    }

    if (doc.fileUrl) {
      form.append('fileUrl', doc.fileUrl);
    }

    return api.post('/business/business-documents/createDocument', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
