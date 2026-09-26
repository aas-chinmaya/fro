import api from "@/services/api";

export interface GetUnitsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const unitApi = {
  getAll({
    page = 1,
    limit = 10,
    search = "",
    status = "all",
  }: GetUnitsParams = {}) {
    return api.get("/units/getall", {
      params: {
        page,
        limit,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(status !== "all" ? { status } : {}),
      },
    });
  },

  getById(id: string) {
    return api.get(`/units/getby/${id}`);
  },

  create(data: Record<string, unknown>) {
    return api.post("/units/create", data);
  },

  update(id: string, data: Record<string, unknown>) {
    return api.put(`/units/update/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/units/delete/${id}`);
  },

  restore(id: string) {
    return api.patch(`/units/${id}/restore`);
  },
};
