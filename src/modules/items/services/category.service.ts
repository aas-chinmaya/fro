import { categoryApi } from "../api/category.api";

export interface GetCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const categoryservice = {
  getCategories({
    page = 1,
    limit = 10,
    search = "",
    status = "all",
  }: GetCategoriesParams = {}) {
    return categoryApi.getAll({
      page,
      limit,
      search,
      status,
    });
  },

  getCategoryById(id: string) {
    return categoryApi.getById(id);
  },

  createCategory(data: any) {
    return categoryApi.create(data);
  },

  updateCategory(id: string, data: any) {
    return categoryApi.update(id, data);
  },

  deleteCategory(id: string) {
    return categoryApi.delete(id);
  },
};
