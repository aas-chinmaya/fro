import { globalDocumentTypeApi } from "../api/globalDocumentType.api";
import type {
  GlobalDocumentTypePayload,
} from "../types";

export const globalDocumentTypeService = {
  getAll: (page?: number, limit?: number) =>
    globalDocumentTypeApi.getAll(page, limit),
  getById: globalDocumentTypeApi.getById,
  create: (payload: GlobalDocumentTypePayload) =>
    globalDocumentTypeApi.create(payload),
  update: (id: string, payload: GlobalDocumentTypePayload) =>
    globalDocumentTypeApi.update(id, payload),
  delete: (id: string) => globalDocumentTypeApi.delete(id),
};