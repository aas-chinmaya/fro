import { rackApi } from "../api/rack.api";
import type { RackInput } from "../types";

export const rackService = {
  getRacks(userId: string, page = 1, limit = 10, search = "") {
    void userId;
    return rackApi.getAll(page, limit, search);
  },

  getRackById(id: string) {
    return rackApi.getById(id);
  },

  createRack(data: RackInput) {
    return rackApi.create(data);
  },

  updateRack(id: string, data: RackInput) {
    return rackApi.update(id, data);
  },

  deleteRack(id: string) {
    return rackApi.delete(id);
  },
};