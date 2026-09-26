import api from "@/services/api";
import type {
  DocumentTypePagination,
  VendorCategory,
  VendorCategoryListResponse,
  VendorCategoryPayload,
} from "../types";

const endpoints = {
  create: "/vendor-categories/createvendorcategory",
  list: "/vendor-categories/getallvendorcategory",
  byId: (id: string) => `/vendor-categories/getvendorcategorybyid/${id}`,
  update: (id: string) => `/vendor-categories/updatevendorcategory/${id}`,
  delete: (id: string) => `/vendor-categories/deletevendorcategory/${id}`,
};

function unwrap<T>(value: unknown): T {
  let result = value as { data?: unknown; result?: unknown };

  for (let index = 0; index < 2; index += 1) {
    if (result && typeof result === "object" && "data" in result) {
      result = result.data as { data?: unknown; result?: unknown };
    } else if (result && typeof result === "object" && "result" in result) {
      result = result.result as { data?: unknown; result?: unknown };
    } else {
      break;
    }
  }

  return result as T;
}

export const vendorCategoryApi = {
  async create(payload: VendorCategoryPayload) {
    const response = await api.post(endpoints.create, payload);
    return unwrap<VendorCategory>(response.data);
  },

  async getAll(page = 1, limit = 10): Promise<VendorCategoryListResponse> {
    const response = await api.get<{
      data?: VendorCategory[];
      pagination?: DocumentTypePagination;
    }>(endpoints.list, { params: { page, limit } });

    return {
      items: response.data.data ?? [],
      pagination: response.data.pagination ?? { page, limit },
    };
  },

  async getById(id: string) {
    const response = await api.get(endpoints.byId(id));
    return unwrap<VendorCategory>(response.data);
  },

  async update(id: string, payload: VendorCategoryPayload) {
    const response = await api.put(endpoints.update(id), payload);
    return unwrap<VendorCategory>(response.data);
  },

  async delete(id: string) {
    await api.delete(endpoints.delete(id));
  },
};