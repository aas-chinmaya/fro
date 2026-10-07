import api from "@/services/api";
import type { BinInput } from "../types";

export const binApi = {
  getAll(userId: string) {
    void userId;
    return api.get(`/warehouse/getbins`);
  },
  
  create(data: BinInput) {
    return api.post("/warehouse/createbin", data);
  },

  update(id: string, data: BinInput) {
    return api.put(`/warehouse/updatebin/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/warehouse/deletebin/${id}`);
  },
};