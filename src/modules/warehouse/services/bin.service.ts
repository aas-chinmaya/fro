import { binApi } from "../api/bin.api";
import type { BinInput } from "../types";

export const binService = {
  getBins(userId: string) {
    return binApi.getAll(userId);
  },

  createBin(data: BinInput) {
    return binApi.create(data);
  },

  updateBin(id: string, data: BinInput) {
    return binApi.update(id, data);
  },

  deleteBin(id: string) {
    return binApi.delete(id);
  },
};