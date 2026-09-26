import api from "@/services/api";

import type {
  CreateVariantValuePayload,
  UpdateVariantValuePayload,
} from "../types";

export interface GetVariantValuesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const variantValueApi = {
  getAll({
    page = 1,
    limit = 10,
    search = "",
    status = "all",
  }: GetVariantValuesParams = {}) {
    return api.get("/variant-values/getall", {
      params: {
        page,
        limit,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(status !== "all" ? { status } : {}),
      },
    });
  },

  getById(id: string) {
    return api.get(`/variant-values/getbyid/${id}`);
  },

  create(data: CreateVariantValuePayload) {
    return api.post("/variant-values/create", data);
  },

  update(id: string, data: UpdateVariantValuePayload) {
    return api.put(`/variant-values/update/${id}`, data);
  },

  delete(id: string) {
    return api.delete(`/variant-values/delete/${id}`);
  },
};








// import api from "@/services/api";

// export interface GetVariantValuesParams {
//   page?: number;
//   limit?: number;
//   search?: string;
//   status?: string;
// }

// export const variantValueApi = {
//   getAll({
//     page = 1,
//     limit = 10,
//     search = "",
//     status = "all",
//   }: GetVariantValuesParams = {}) {
//     return api.get("/variant-values/getall", {
//       params: {
//         page,
//         limit,
//         ...(search.trim() ? { search: search.trim() } : {}),
//         ...(status !== "all" ? { status } : {}),
//       },
//     });
//   },

//   getById(id: string) {
//     return api.get(`/variant-values/getbyid/${id}`);
//   },

//   create(data: Record<string, unknown>) {
//     return api.post("/variant-values/create", data);
//   },

//   update(id: string, data: Record<string, unknown>) {
//     return api.put(`/variant-values/update/${id}`, data);
//   },

//   delete(id: string) {
//     return api.delete(`/variant-values/delete/${id}`);
//   },
// };
