import { variantValueApi } from "../api/variant-value.api";
import type {
  CreateVariantValuePayload,
  UpdateVariantValuePayload,
} from "../types";

export const variantValueservice = {
  getVariantValues({
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
    return variantValueApi.getAll({
      page,
      limit,
      search,
      status,
    });
  },

  getVariantValueById(id: string) {
    return variantValueApi.getById(id);
  },

  createVariantValue(data: CreateVariantValuePayload) {
    return variantValueApi.create(data);
  },

  updateVariantValue(id: string, data: UpdateVariantValuePayload) {
    return variantValueApi.update(id, data);
  },

  deleteVariantValue(id: string) {
    return variantValueApi.delete(id);
  },
};
