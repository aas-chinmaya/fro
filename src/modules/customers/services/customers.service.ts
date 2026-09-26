import { customerApi } from "../api/sustomers.api";
import { CustomerFormData } from "../validation";

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
