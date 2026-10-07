import { configureStore } from "@reduxjs/toolkit";
import mastersReducer from "@/modules/masters/store/masterSlice";
import roleAccessReducer from "@/modules/roleAccess/store/roleAccessSlice";
import userReducer from "@/modules/users/store/userSlice";
import authReducer from "@/modules/auth/store/authSlice";
import vendorReducer from "@/modules/vendor/store/vendorSlice";
import businessReducer from "@/modules/business/store/businessSlice";
import { masterReducer as businessSetupMasterReducer } from "@/modules/business/setup";
import globalDocumentTypeReducer from "@/modules/vendor/masters/store/globalDocumentTypeSlice";
import vendorCategoryReducer from "@/modules/vendor/masters/store/vendorCategorySlice";
import customersReducer from "@/modules/customers/store/customers.slice";
import warehouseReducer from "@/modules/warehouse/store/warehouseSlice";

// RTK Query
import { baseApi } from "@/services/baseApi";

const store = configureStore({
  reducer: {
    masters: mastersReducer,
    roleAccess: roleAccessReducer,
    users: userReducer,
    auth: authReducer,
    vendors: vendorReducer,
    business: businessReducer,
    customers: customersReducer,
    businessSetupMasters: businessSetupMasterReducer,
    vendorDocumentTypes: globalDocumentTypeReducer,
    vendorCategories: vendorCategoryReducer,
    warehouse: warehouseReducer,

    // RTK Query
    [baseApi.reducerPath]: baseApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export default store;
