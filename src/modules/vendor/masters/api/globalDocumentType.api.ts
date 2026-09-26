import api from "@/services/api";
import type {
  DocumentTypePagination,
  GlobalDocumentType,
  GlobalDocumentTypeListResponse,
  GlobalDocumentTypePayload,
} from "../types";

const endpoints = {
  create: "/global-document/createglobaldocumenttype",
  list: "/global-document/getallglobaldocumenttypes",
  byId: "/global-document/getglobaldocumenttypebyid",
  update: (id: string) => `/global-document/updateglobaldocumenttype/${id}`,
  delete: (id: string) => `/global-document/deleteglobaldocumenttype/${id}`,
};

function unwrap<T>(value: unknown): T {
  let result = value as { data?: unknown; result?: unknown };

  for (let index = 0; index < 2; index += 1) {
    if (Array.isArray(result)) return result as T;
    if (result && typeof result === "object" && "data" in result) {
      result = result.data as { data?: unknown; result?: unknown };
    } else if (result && typeof result === "object" && "result" in result) {
      result = result.result as { data?: unknown; result?: unknown };
    } else {
      break;
    }
  }

  return result as T;
}

export const globalDocumentTypeApi = {
  async create(payload: GlobalDocumentTypePayload) {
    const response = await api.post(endpoints.create, payload);
    return unwrap<GlobalDocumentType>(response.data);
  },

  async getAll(page = 1, limit = 10): Promise<GlobalDocumentTypeListResponse> {
    const response = await api.get<{
      data?: GlobalDocumentType[];
      pagination?: DocumentTypePagination;
    }>(endpoints.list, { params: { page, limit } });
    const payload = response.data;

    return {
      items: payload.data ?? [],
      pagination: payload.pagination ?? { page, limit },
    };
  },

  async getById(id: string) {
    const response = await api.get(endpoints.byId, { params: { id } });
    return unwrap<GlobalDocumentType>(response.data);
  },

  async update(id: string, payload: GlobalDocumentTypePayload) {
    const response = await api.put(endpoints.update(id), payload);
    return unwrap<GlobalDocumentType>(response.data);
  },

  async delete(id: string) {
    await api.delete(endpoints.delete(id));
  },
};