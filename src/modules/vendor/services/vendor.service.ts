import { vendorApi } from "../api/vendor.api";
import type { VendorExportParams, VendorListParams } from "../types";

export const vendorService = {
  getVendors(params?: VendorListParams) {
    return vendorApi.getAll(params);
  },

  getVendorById(id: string) {
    return vendorApi.getById(id);
  },

  searchVendors(keyword: string) {
    return vendorApi.search(keyword);
  },

  createVendor(data: Record<string, any>) {
    return vendorApi.create(data);
  },

  updateVendor(id: string, data: Record<string, any>) {
    return vendorApi.update(id, data);
  },

  changeVendorStatus(id: string, status: string) {
    return vendorApi.changeStatus(id, status);
  },

  deleteDocument(documentId: string) {
    return vendorApi.deleteDocument(documentId);
  },

  deleteVendor(id: string) {
    return vendorApi.delete(id);
  },

  exportVendors(params?: VendorExportParams) {
    return vendorApi.exportVendors(params);
  },

  downloadVendorTemplate() {
    return vendorApi.downloadVendorTemplate();
  },

  importVendors(file: File, params?: Record<string, unknown>) {
    return vendorApi.importVendors(file, params);
  },
};

export const vendorservice = vendorService;









// import { vendorApi } from "../api/vendor.api";

// export const vendorService = {
//   getVendors(params?: { page?: number; limit?: number }) {
//     return vendorApi.getAll(params);
//   },

//   getVendorById(id: string) {
//     return vendorApi.getById(id);
//   },

//   searchVendors(keyword: string) {
//     return vendorApi.search(keyword);
//   },

//   createVendor(data: Record<string, any>) {
//     return vendorApi.create(data);
//   },

//   updateVendor(id: string, data: Record<string, any>) {
//     return vendorApi.update(id, data);
//   },

//   changeVendorStatus(id: string, status: string) {
//     return vendorApi.changeStatus(id, status);
//   },

//   deleteDocument(documentId: string) {
//     return vendorApi.deleteDocument(documentId);
//   },

//   deleteVendor(id: string) {
//     return vendorApi.delete(id);
//   },

//   exportVendors(params?: { page?: number; limit?: number; tenantId?: string }) {
//     return vendorApi.exportVendors(params);
//   },

//   downloadVendorTemplate(params?: { page?: number; limit?: number }) {
//     return vendorApi.downloadVendorTemplate(params);
//   },

//   importVendors(file: File, params?: Record<string, unknown>) {
//     return vendorApi.importVendors(file, params);
//   },
// };

// export const vendorservice = vendorService;
