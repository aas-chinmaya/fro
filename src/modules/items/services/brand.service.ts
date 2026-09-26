import { brandApi } from "../api/brand.api";

export const brandservice = {
  getBrands({
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
    return brandApi.getAll({
      page,
      limit,
      search,
      status,
    });
  },

  getBrandById(id: string) {
    return brandApi.getById(id);
  },

  createBrand(data: Record<string, unknown>) {
    return brandApi.create(data);
  },

  updateBrand(id: string, data: Record<string, unknown>) {
    return brandApi.update(id, data);
  },

  deleteBrand(id: string) {
    return brandApi.delete(id);
  },

  // restoreBrand(id: string) {
  //   return brandApi.restore(id);
  // },
};
