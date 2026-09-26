import { subCategoryApi } from "../api/sub-category.api";
import { CreateSubCategoryPayload, UpdateSubCategoryPayload } from "../types";

export const subCategoryservice = {
  getSubCategories({
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
    return subCategoryApi.getAll({
      page,
      limit,
      search,
      status,
    });
  },

  getSubCategoryById(id: string) {
    return subCategoryApi.getById(id);
  },

  createSubCategory(data: CreateSubCategoryPayload) {
    return subCategoryApi.create(data);
  },

  updateSubCategory(id: string, data: UpdateSubCategoryPayload) {
    return subCategoryApi.update(id, data);
  },

  deleteSubCategory(id: string) {
    return subCategoryApi.delete(id);
  },
};
