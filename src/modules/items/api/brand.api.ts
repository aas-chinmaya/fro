import api from "@/services/api";

export interface GetBrandsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const brandApi = {
  getAll({
    page = 1,
    limit = 10,
    search = "",
    status = "all",
  }: GetBrandsParams = {}) {
    return api.get("/brands/getall", {
      params: {
        page,
        limit,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(status !== "all" ? { status } : {}),
      },
    });
  },

  getById(id: string) {
    return api.get(`/brands/getbyid/${id}`);
  },

  create(data: Record<string, unknown>) {
    return api.post("/brands/create", data);
  },

  update(id: string, data: Record<string, unknown>) {
    return api.put(`/brands/update/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/brands/delete/${id}`);
  },

//   restore(id: string) {
//     return api.patch(`/brands/${id}/restore`);
//   },
};
