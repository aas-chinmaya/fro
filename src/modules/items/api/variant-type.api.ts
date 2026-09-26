import api from "@/services/api";

import type {
  CreateVariantTypePayload,
  UpdateVariantTypePayload,
} from "../types";

export interface GetVariantTypesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const variantTypeApi = {
  getAll({
    page = 1,
    limit = 10,
    search = "",
    status = "all",
  }: GetVariantTypesParams = {}) {
    return api.get("/variant-types/getall", {
      params: {
        page,
        limit,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(status !== "all" ? { status } : {}),
      },
    });
  },

  getById(id: string) {
    return api.get(`/variant-types/getby/${id}`);
  },

  create(data: CreateVariantTypePayload) {
    return api.post("/variant-types/create", data);
  },

  update(id: string, data: UpdateVariantTypePayload) {
    return api.put(`/variant-types/update/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/variant-types/delete/${id}`);
  },
};