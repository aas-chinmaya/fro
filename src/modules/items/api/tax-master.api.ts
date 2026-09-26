import api from "@/services/api";

export interface GetTaxMastersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const taxMasterApi = {
  getAll({ page = 1, limit = 10, search = "", status = "all" }: GetTaxMastersParams = {}) {
    return api.get("/taxes/getall", {
      params: {
        page,
        limit,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(status !== "all" ? { status } : {}),
      },
    });
  },

  getById(id: string) {
    return api.get(`/taxes/getbyid/${id}`);
  },

  create(data: Record<string, unknown>) {
    return api.post("/taxes/create", data);
  },

  update(id: string, data: Record<string, unknown>) {
    return api.put(`/taxes/update/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/taxes/delete/${id}`);
  },
};
