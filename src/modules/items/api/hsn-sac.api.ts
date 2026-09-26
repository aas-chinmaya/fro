import api from "@/services/api";

export type HsnSacQueryType = "HSN" | "SAC";

export const hsnSacApi = {
  getAll(page = 1, limit = 10, type?: HsnSacQueryType, search = "") {
    return api.get("/hsn-sac/getall", { params: { page, limit, type, search } });
  },
 
  getAllForDropdown(
    type: HsnSacQueryType,
    page = 1,
    limit = 10,
    search = ""
  ) {
    return api.get("/hsn-sac/getall", {
      params: { type, page, limit, search },
    });
  },

  importExcel(file: File) {
    const formData = new FormData();
    formData.append("file", file, file.name);
    return api.post("/hsn-sac/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  exportExcel() {
    return api.get("/hsn-sac/export", { responseType: "blob" });
  },
};
