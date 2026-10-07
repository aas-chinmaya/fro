import { customerApi } from "../api/customers.api";
import { CustomerRewardConfig } from "../types";
import { CustomerFormData } from "../validation";
import { businessService } from "../../business/services/business.service";

export const customersService = {
  /**
   * Fetch all customers
   */
  async getCustomers() {
    try {
      const response = await customerApi.getAll();
      return response.data || response;
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  /**
   * Fetch paginated customers
   */
  async getCustomersPaginated(page: number = 1, pageSize: number = 10) {
    try {
      const response = await customerApi.getAllPaginated(page, pageSize);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching paginated customers:", error);
      throw error;
    }
  },

  /**
   * Fetch customer by ID
   */
  async getCustomer(id: string) {
    try {
      const response = await customerApi.getById(id);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching customer:", error);
      throw error;
    }
  },

  /**
   * Fetch customer dashboard stats
   */
  async getCustomerDashboard(id: string) {
    try {
      const response = await customerApi.getDashboard(id);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching customer dashboard:", error);
      throw error;
    }
  },

  /**
   * Fetch complete customer ledger
   */
  async getCustomerLedger(id: string) {
    try {
      const response = await customerApi.getLedger(id);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching customer ledger:", error);
      throw error;
    }
  },

  /**
   * Fetch customer statement for a date range
   */
  async getCustomerStatement(id: string, fromDate?: string, toDate?: string) {
    try {
      const response = await customerApi.getStatement(id, fromDate, toDate);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching customer statement:", error);
      throw error;
    }
  },

  /**
   * Fetch complete customer purchase history
   */
  async getCustomerPurchaseHistory(id: string) {
    try {
      const response = await customerApi.getPurchaseHistory(id);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching customer purchase history:", error);
      throw error;
    }
  },

  /**
   * Fetch all reward configs by reading the business-user API payload,
   * then walking each business and nested branch to call the exact route
   * GET /rewards/config/:businessId/:branchId.
   */
  async getRewardConfigs() {
    try {
      const data = await businessService.getBusinesses();
      const businesses = Array.isArray(data)
        ? data
        : Array.isArray((data as Record<string, unknown>)?.data)
          ? ((data as Record<string, unknown>)?.data as Array<Record<string, unknown>>)
          : [];
      const configs: CustomerRewardConfig[] = [];

      for (const business of businesses) {
        const businessId = String((business as Record<string, unknown>)?.id ?? (business as Record<string, unknown>)?.businessId ?? "");
        const branches = Array.isArray((business as Record<string, unknown>)?.branches)
          ? ((business as Record<string, unknown>)?.branches as Array<Record<string, unknown>>)
          : [];

        if (!businessId) {
          continue;
        }

        if (branches.length === 0) {
          try {
            const response = await customerApi.getRewardConfig(businessId, "branch-1");
            const payload = response?.data?.data ?? response?.data ?? response;
            if (payload) {
              configs.push(payload);
            }
          } catch (error) {
            console.warn(`Reward config missing for ${businessId}/branch-1`, error);
          }
          continue;
        }

        for (const branch of branches) {
          const branchId = String((branch as Record<string, unknown>)?.id ?? (branch as Record<string, unknown>)?.branchId ?? "");
          if (!branchId) {
            continue;
          }

          try {
            const response = await customerApi.getRewardConfig(businessId, branchId);
            const payload = response?.data?.data ?? response?.data ?? response;
            if (payload) {
              configs.push(payload);
            }
          } catch (error) {
            console.warn(`Reward config missing for ${businessId}/${branchId}`, error);
          }
        }
      }

      return configs;
    } catch (error) {
      console.error("Error fetching reward configs:", error);
      return [];
    }
  },

  /**
   * Reward config fetch by business and branch
   */
  async getRewardConfig(businessId: string, branchId: string) {
    try {
      const response = await customerApi.getRewardConfig(businessId, branchId);
      return response.data || response;
    } catch (error) {
      console.error("Error fetching reward config:", error);
      throw error;
    }
  },

  /**
   * Create reward config
   */
  async createRewardConfig(data: CustomerRewardConfig) {
    try {
      const response = await customerApi.createRewardConfig(data);
      return response.data || response;
    } catch (error) {
      console.error("Error creating reward config:", error);
      throw error;
    }
  },

  /**
   * Update reward config
   */
  async updateRewardConfig(businessId: string, data: Partial<CustomerRewardConfig>, branchId?: string | null) {
    try {
      const response = await customerApi.updateRewardConfig(businessId, data, branchId);
      return response.data || response;
    } catch (error) {
      console.error("Error updating reward config:", error);
      throw error;
    }
  },

  /**
   * Delete reward config
   */
  async deleteRewardConfig(businessId: string, branchId?: string | null) {
    try {
      const response = await customerApi.deleteRewardConfig(businessId, branchId);
      return response.data || response;
    } catch (error) {
      console.error("Error deleting reward config:", error);
      throw error;
    }
  },

  /**
   * Create new customer
   */
  async createCustomer(data: CustomerFormData) {
    try {
      const response = await customerApi.create(data);
      return response.data || response;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  },

  /**
   * Update existing customer
   */
  async updateCustomer(id: string, data: Partial<CustomerFormData>) {
    try {
      const response = await customerApi.update(id, data);
      return response.data || response;
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  },

  /**
   * Delete customer
   */
  async deleteCustomer(id: string) {
    try {
      const response = await customerApi.delete(id);
      return response.data || response;
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  },
};
