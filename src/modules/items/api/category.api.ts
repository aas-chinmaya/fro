import api from "@/services/api";

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const categoryApi = {
  getAll({
    page = 1,
    limit = 10,
    search = "",
    status = "all",
  }: GetCategoriesParams = {}) {
    return api.get("/product-categories/getall", {
      params: {
        page,
        limit,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(status !== "all" ? { status } : {}),
      },
    });
  },

  getById(id: string) {
    return api.get(`/product-categories/getby/${id}`);
  },

  create(data: any) {
    return api.post("/product-categories/create", data);
  },

  update(id: string, data: any) {
    return api.put(`/product-categories/update/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/product-categories/delete/${id}`);
  },
};
