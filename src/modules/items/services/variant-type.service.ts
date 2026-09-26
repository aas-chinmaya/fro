import { variantTypeApi } from "../api/variant-type.api";
import { CreateVariantTypePayload, UpdateVariantTypePayload } from "../types";

export const variantTypeservice = {
  getVariantTypes({
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
    return variantTypeApi.getAll({
      page,
      limit,
      search,
      status,
    });
  },

  getVariantTypeById(id: string) {
    return variantTypeApi.getById(id);
  },

  createVariantType(data: CreateVariantTypePayload) {
    return variantTypeApi.create(data);
  },

  updateVariantType(id: string, data: UpdateVariantTypePayload) {
    return variantTypeApi.update(id, data);
  },

  deleteVariantType(id: string) {
    return variantTypeApi.delete(id);
  },
};
