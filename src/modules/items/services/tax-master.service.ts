import { taxMasterApi } from "../api/tax-master.api";

export const taxMasterservice = {
  getTaxMasters(
    optionsOrPage: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
    } | number = {},
    legacyLimit = 10
  ) {
    const options = typeof optionsOrPage === "number"
      ? { page: optionsOrPage, limit: legacyLimit }
      : optionsOrPage;
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
    } = options;

    return taxMasterApi.getAll({ page, limit, search, status });
  },

  getTaxMasterById(id: string) {
    return taxMasterApi.getById(id);
  },

  createTaxMaster(data: Record<string, unknown>) {
    return taxMasterApi.create(data);
  },

  updateTaxMaster(id: string, data: Record<string, unknown>) {
    return taxMasterApi.update(id, data);
  },

  deleteTaxMaster(id: string) {
    return taxMasterApi.delete(id);
  },
};
