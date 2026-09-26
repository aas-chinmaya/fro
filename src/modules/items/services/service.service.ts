import { serviceApi } from "../api/service.api";

export const serviceservice = {
  getServices(page = 1, limit = 10, search = "") {
    return serviceApi.getAll(page, limit, search);
  },

  getServiceById(id: string) {
    return serviceApi.getById(id);
  },

  createService(data: any) {
    return serviceApi.create(data);
  },

  updateService(id: string, data: any) {
    return serviceApi.update(id, data);
  },

  updateServiceStatus(id: string, status: boolean) {
    return serviceApi.updateStatus(id, status);
  },

  deleteService(id: string) {
    return serviceApi.delete(id);
  },
};
