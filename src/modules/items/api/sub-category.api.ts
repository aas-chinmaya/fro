import api from "@/services/api";

import type {
  CreateSubCategoryPayload,
  UpdateSubCategoryPayload,
} from "../types";

export interface GetSubCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const subCategoryApi = {
  getAll({
    page = 1,
    limit = 10,
    search = "",
    status = "all",
  }: GetSubCategoriesParams = {}) {
    return api.get("/product-subcategories/getall", {
      params: {
        page,
        limit,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(status !== "all" ? { status } : {}),
      },
    });
  },

  getById(id: string) {
    return api.get(`/product-subcategories/getbyid/${id}`);
  },

  create(data: CreateSubCategoryPayload) {
    return api.post("/product-subcategories/create", data);
  },

  update(id: string, data: UpdateSubCategoryPayload) {
    return api.put(`/product-subcategories/update/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/product-subcategories/delete/${id}`);
  },
};








// import api from "@/services/api";

// export interface GetSubCategoriesParams {
//   page?: number;
//   limit?: number;
//   search?: string;
//   status?: string;
// }

// export const subCategoryApi = {
//   getAll({
//     page = 1,
//     limit = 10,
//     search = "",
//     status = "all",
//   }: GetSubCategoriesParams = {}) {
//     return api.get("/product-subcategories/getall", {
//       params: {
//         page,
//         limit,
//         ...(search.trim() ? { search: search.trim() } : {}),
//         ...(status !== "all" ? { status } : {}),
//       },
//     });
//   },

//   getById(id: string) {
//     return api.get(`/product-subcategories/getbyid/${id}`);
//   },

//   create(data: Record<string, unknown>) {
//     return api.post("/product-subcategories/create", data);
//   },

//   update(id: string, data: Record<string, unknown>) {
//     return api.put(`/product-subcategories/update/${id}`, data);
//   },

//   delete(id: string) {
//     return api.delete(`/product-subcategories/delete/${id}`);
//   },
// };
