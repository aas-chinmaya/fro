import api from "@/services/api";
import type { RackShelfUpdateInput, ShelfInput, ShelfUpdateInput } from "../types";

export const shelfApi = {
  getAll(userId: string) {
    return api.get(`/warehouse/getshelfs/${userId}`);
  },

  create(data: ShelfInput) {
    return api.post("/warehouse/createshelf", data);
  },

  update(id: string, data: ShelfUpdateInput | RackShelfUpdateInput) {
    return api.put(`/warehouse/updatebin/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/warehouse/deleteshelf/${id}`);
  },
};