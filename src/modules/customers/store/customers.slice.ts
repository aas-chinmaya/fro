import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Customer, CustomerRewardConfig } from "../types";

interface CustomerState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  selectedCustomer: Customer | null;
  totalRecords: number;
  currentPage: number;
  pageSize: number;

  rewardConfigs: CustomerRewardConfig[];
  rewardLoading: boolean;
  rewardError: string | null;
}

const initialState: CustomerState = {
  customers: [],
  loading: false,
  error: null,
  selectedCustomer: null,
  totalRecords: 0,
  currentPage: 1,
  pageSize: 10,

  rewardConfigs: [],
  rewardLoading: false,
  rewardError: null,
};

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    // Set all customers
    setCustomers(state, action: PayloadAction<Customer[]>) {
      state.customers = action.payload;
      state.totalRecords = action.payload.length;
    },

    // Add new customer
    addCustomer(state, action: PayloadAction<Customer>) {
      state.customers.push(action.payload);
      state.totalRecords += 1;
    },

    // Update customer
    updateCustomer(state, action: PayloadAction<Customer>) {
      const index = state.customers.findIndex(
        (customer) => customer.id === action.payload.id
      );
      if (index >= 0) {
        state.customers[index] = action.payload;
      }
    },

    // Remove customer
    removeCustomer(state, action: PayloadAction<string>) {
      state.customers = state.customers.filter(
        (customer) => customer.id !== action.payload
      );
      state.totalRecords -= 1;
    },

    // Set selected customer
    setSelectedCustomer(state, action: PayloadAction<Customer | null>) {
      state.selectedCustomer = action.payload;
    },

    // Set loading state
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    // Set error
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },

    // Set pagination
    setPagination(state, action: PayloadAction<{ page: number; pageSize: number }>) {
      state.currentPage = action.payload.page;
      state.pageSize = action.payload.pageSize;
    },

    // Clear customers
    clearCustomers(state) {
      state.customers = [];
      state.selectedCustomer = null;
      state.error = null;
    },

    // Reward config reducers
    setRewardConfigs(state, action: PayloadAction<CustomerRewardConfig[]>) {
      state.rewardConfigs = action.payload;
    },

    addRewardConfig(state, action: PayloadAction<CustomerRewardConfig>) {
      state.rewardConfigs = [action.payload, ...state.rewardConfigs];
    },

    updateRewardConfig(state, action: PayloadAction<CustomerRewardConfig>) {
      const reward = action.payload;
      state.rewardConfigs = state.rewardConfigs.map((item) =>
        item.businessId === reward.businessId && (item.branchId || "all") === (reward.branchId || "all")
          ? reward
          : item
      );
    },

    removeRewardConfig(state, action: PayloadAction<{ businessId: string; branchId?: string | null }>) {
      const { businessId, branchId } = action.payload;
      state.rewardConfigs = state.rewardConfigs.filter(
        (item) => !(item.businessId === businessId && (item.branchId || "all") === (branchId || "all"))
      );
    },

    setRewardConfigLoading(state, action: PayloadAction<boolean>) {
      state.rewardLoading = action.payload;
    },

    setRewardConfigError(state, action: PayloadAction<string | null>) {
      state.rewardError = action.payload;
    },
  },
});

export const {
  setCustomers,
  addCustomer,
  updateCustomer,
  removeCustomer,
  setSelectedCustomer,
  setLoading,
  setError,
  setPagination,
  clearCustomers,
  setRewardConfigs,
  addRewardConfig,
  updateRewardConfig,
  removeRewardConfig,
  setRewardConfigLoading,
  setRewardConfigError,
} = customersSlice.actions;

export default customersSlice.reducer;
