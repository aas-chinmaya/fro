import { unitApi } from "../api/unit.api";

export const unitservice = {
  getUnits({
    page = 1,
    limit = 10,
    search = "",
    status = "all",
  }: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}) {
    return unitApi.getAll({
      page,
      limit,
      search,
      status,
    });
  },

  getUnitById(id: string) {
    return unitApi.getById(id);
  },

  createUnit(data: Record<string, unknown>) {
    return unitApi.create(data);
  },

  updateUnit(id: string, data: Record<string, unknown>) {
    return unitApi.update(id, data);
  },

  deleteUnit(id: string) {
    return unitApi.delete(id);
  },

  // restoreUnit(id: string) {
  //   return unitApi.restore(id);
  // },
};
