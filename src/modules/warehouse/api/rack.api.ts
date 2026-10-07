import api from "@/services/api";
import type { RackInput } from "../types";

export const rackApi = {
  getAll(page = 1, limit = 10, search = "") {
    return api.get("/warehouse/tenant", {
      params: { page, limit, search },
    });
  },

  getById(id: string) {
    return api.get(`/warehouse/getallrack/${id}`);
  },

  create(data: RackInput) {
    return api.post("/warehouse/createrack", data);
  },

  update(id: string, data: RackInput) {
    return api.put(`/warehouse/updaterack/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/warehouse/deleterack/${id}`);
  },
};