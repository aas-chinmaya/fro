import api from "@/services/api";

export const productApi = {
  getAll(page = 1, limit = 10, search = "") {
    return api.get("/products/getall", {
      params: {
        page,
        limit,
        search,
      },
    });
  },

  getById(id: string) {
    return api.get(`/products/getbyid/${id}`);
  },

  /**
   * Create product with multipart/form-data.
   * The image is sent as a real binary File inside FormData.
   */
  create(data: FormData) {
    return api.post("/products/create", data, {
      headers: {
        "Content-Type": undefined,
      },
    });
  },

  /**
   * Update product with multipart/form-data.
   * The image is sent as a real binary File inside FormData.
   */
  update(id: string, data: FormData) {
    return api.put(`/products/updatebyid/${id}`, data, {
      headers: {
        "Content-Type": undefined,
      },
    });
  },

  /**
   * Update only product status.
   * This remains a normal JSON request.
   */
  updateStatus(id: string, status: boolean) {
    return api.put(`/products/updatebyid/${id}`, {
      status,
    });
  },

  /**
   * Delete product.
   */
  delete(id: string) {
    return api.delete(`/products/deletebyid/${id}`);
  },
};








// import api from "@/services/api";

// export const productApi = {
//   getAll(page = 1, limit = 10) {
//     return api.get("/products/getall", {
//       params: {
//         page,
//         limit,
//       },
//     });
//   },

//   getById(id: string) {
//     return api.get(`/products/getbyid/${id}`);
//   },

//   create(data: any) {
//     return api.post("/products/create", data);
//   },

//   update(id: string, data: any) {
//     return api.put(`/products/updatebyid/${id}`, data);
//   },

//   updateStatus(id: string, status: boolean) {
//     return api.put(`/products/updatebyid/${id}`, { status });
//   },

//   delete(id: string) {
//     return api.delete(`/products/deletebyid/${id}`);
//   },
// };
