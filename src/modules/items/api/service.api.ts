import api from "@/services/api";

export const serviceApi = {
  getAll(page = 1, limit = 10, search = "") {
    return api.get("/services/getall", {
      params: {
        page,
        limit,
        search,
      },
    });
  },

  getById(id: string) {
    return api.get(`/services/getby/${id}`);
  },

  create(data: any) {
    return api.post("/services/create", data);
  },

  update(id: string, data: any) {
    return api.put(`/services/update/${id}`, data);
  },

  updateStatus(id: string, status: boolean) {
    return api.put(`/services/update/${id}`, { status });
  },

  delete(id: string) {
    return api.delete(`/services/deletebyid/${id}`);
  },
};
