import api from "@/services/api";
import { CUSTOMER_ENDPOINTS } from "../endpoint/customers.endpoint";
import { CustomerRewardConfig } from "../types";

export const customerApi = {
  // Create new customer
  create(data: any) {
    return api.post(CUSTOMER_ENDPOINTS.CREATE, data);
  },

  // Fetch all customers
  getAll() {
    return api.get(CUSTOMER_ENDPOINTS.FETCH_ALL);
  },

  // Fetch paginated customers (optional, if backend supports pagination via query params)
  getAllPaginated(page: number = 1, pageSize: number = 10) {
    return api.get(CUSTOMER_ENDPOINTS.FETCH_ALL, {
      params: { page, pageSize },
    });
  },

  // Fetch customer by ID
  getById(id: string) {
    return api.get(CUSTOMER_ENDPOINTS.FETCH_BY_ID(id));
  },

  // Fetch dashboard data for a customer
  getDashboard(id: string) {
    return api.get(CUSTOMER_ENDPOINTS.DASHBOARD(id));
  },

  // Fetch complete ledger data for a customer
  getLedger(id: string) {
    return api.get(CUSTOMER_ENDPOINTS.LEDGER(id));
  },

  // Fetch customer statement for a date range
  getStatement(id: string, fromDate?: string, toDate?: string) {
    return api.get(CUSTOMER_ENDPOINTS.STATEMENT(id), {
      params: { fromDate, toDate },
    });
  },

  // Fetch complete purchase history for a customer
  getPurchaseHistory(id: string) {
    return api.get(CUSTOMER_ENDPOINTS.PURCHASES(id));
  },

  // Update customer
  update(id: string, data: any) {
    return api.patch(CUSTOMER_ENDPOINTS.UPDATE(id), data);
  },

  // Delete customer
  delete(id: string) {
    return api.delete(CUSTOMER_ENDPOINTS.DELETE(id));
  },

  // Loyalty rewards config: fetch by businessId and branchId
  getRewardConfig(businessId: string, branchId: string) {
    return api.get(CUSTOMER_ENDPOINTS.REWARD_CONFIG_FETCH(businessId, branchId));
  },

  // Loyalty rewards config: create
  createRewardConfig(data: CustomerRewardConfig) {
    return api.post(CUSTOMER_ENDPOINTS.REWARD_CONFIG_CREATE, data);
  },

  // Loyalty rewards config: update
  updateRewardConfig(businessId: string, data: Partial<CustomerRewardConfig>, branchId?: string | null) {
    const safeBranchId = branchId || "all";
    return api.patch(CUSTOMER_ENDPOINTS.REWARD_CONFIG_UPDATE(businessId, safeBranchId), data);
  },

  // Loyalty rewards config: delete
  deleteRewardConfig(businessId: string, branchId?: string | null) {
    const safeBranchId = branchId || "all";
    return api.delete(CUSTOMER_ENDPOINTS.REWARD_CONFIG_DELETE(businessId, safeBranchId));
  },
};
