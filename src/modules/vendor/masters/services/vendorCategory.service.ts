import { vendorCategoryApi } from "../api/vendorCategory.api";
import type { VendorCategoryPayload } from "../types";

export const vendorCategoryService = {
  getAll: (page?: number, limit?: number) => vendorCategoryApi.getAll(page, limit),
  getById: (id: string) => vendorCategoryApi.getById(id),
  create: (payload: VendorCategoryPayload) => vendorCategoryApi.create(payload),
  update: (id: string, payload: VendorCategoryPayload) => vendorCategoryApi.update(id, payload),
  delete: (id: string) => vendorCategoryApi.delete(id),
};