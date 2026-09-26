import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import { businessService } from "../services/business.service";
import {
  BranchPayload,
  Business,
  BusinessApiRecord,
} from "../types";

/* =========================================================
   BUSINESS CARD MODEL
========================================================= */

export const toBusinessCardModel = (
  item: BusinessApiRecord
): Business => ({
  id: String(item.id ?? ""),
  name:
    item.displayName ||
    item.legalName ||
    item.tradeName ||
    "Business",

  legalName: item.legalName || "",
  gstin: item.gstin || "",
  pan: item.pan || "",
  businessType: item.businessType || "",

  industry: item.industry?.name || "",

  city: item.addresses?.[0]?.city || "",
  state: item.addresses?.[0]?.state || "",
  country: item.addresses?.[0]?.country || "",

  phone: item.phone || "",
  email: item.email || "",
  website: item.websiteLink || undefined,
  logo: item.logo || undefined,

  financialYear: item.financialYear || "",

  status:
    item.status === "ACTIVE"
      ? "Active"
      : "Inactive",

  vendors: 0,
  employees: 0,

  branches: (item.branches ?? []).map((branch) => ({
    id: String(branch.id ?? ""),
    name: branch.branchName || "Branch",
    code: branch.branchCode || "",
    address: branch.addressLine1 || "",
    city: branch.city || "",
    state: branch.state || "",
    country: branch.country || "",
    phone: branch.phone || "",
    email: branch.email || "",
    branchManager:
      branch.branchManager ||
      branch.user?.name ||
      "",
    status:
      branch.status === "ACTIVE"
        ? "Active"
        : "Inactive",
  })),
});

/* =========================================================
   ERROR
========================================================= */

const errorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";

/* =========================================================
   FETCH BUSINESSES
========================================================= */

export const fetchBusinesses = createAsyncThunk<
  BusinessApiRecord[],
  void,
  {
    rejectValue: string;
    state: {
      auth: {
        user: {
          role?: string | null;
        } | null;
      };
    };
  }
>(
  "business/fetchBusinesses",
  async (_, { rejectWithValue, getState }) => {
    try {
      const role = getState().auth?.user?.role;

      return (await businessService.getBusinesses(
        role
      )) as BusinessApiRecord[];
    } catch (error) {
      return rejectWithValue(
        errorMessage(error)
      );
    }
  }
);

/* =========================================================
   DELETE BUSINESS
========================================================= */

export const deleteBusiness = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "business/deleteBusiness",
  async (id, { rejectWithValue }) => {
    try {
      await businessService.deleteBusiness(id);

      return id;
    } catch (error) {
      return rejectWithValue(
        errorMessage(error)
      );
    }
  }
);

/* =========================================================
   UPDATE BRANCH
========================================================= */

export const updateBranch = createAsyncThunk<
  void,
  {
    branchId: string;
    payload: BranchPayload;
  },
  { rejectValue: string }
>(
  "business/updateBranch",
  async (
    { branchId, payload },
    { rejectWithValue }
  ) => {
    try {
      await businessService.updateBranch(
        branchId,
        payload
      );
    } catch (error) {
      return rejectWithValue(
        errorMessage(error)
      );
    }
  }
);

/* =========================================================
   DELETE BRANCH
========================================================= */

export const deleteBranch = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "business/deleteBranch",
  async (branchId, { rejectWithValue }) => {
    try {
      await businessService.deleteBranch(
        branchId
      );

      return branchId;
    } catch (error) {
      return rejectWithValue(
        errorMessage(error)
      );
    }
  }
);

/* =========================================================
   CREATE BRANCH
========================================================= */

export const createBranch = createAsyncThunk<
  void,
  {
    tenantId: string | number;
    payload: BranchPayload;
  },
  { rejectValue: string }
>(
  "business/createBranch",
  async (
    { tenantId, payload },
    { rejectWithValue }
  ) => {
    try {
      await businessService.createBranch(
        tenantId,
        payload
      );
    } catch (error) {
      return rejectWithValue(
        errorMessage(error)
      );
    }
  }
);

/* =========================================================
   FETCH BRANCH
========================================================= */

export const fetchBranchById = createAsyncThunk<
  BusinessApiRecord,
  string,
  { rejectValue: string }
>(
  "business/fetchBranchById",
  async (branchId, { rejectWithValue }) => {
    try {
      return (await businessService.getBranchById(
        branchId
      )) as BusinessApiRecord;
    } catch (error) {
      return rejectWithValue(
        errorMessage(error)
      );
    }
  }
);

/* =========================================================
   STATE
========================================================= */

interface BusinessState {
  records: BusinessApiRecord[];

  /**
   * Currently selected business.
   *
   * This is the business selected from the
   * All Business page and used throughout
   * the dashboard.
   */
  selectedBusiness: Business | null;

  status:
    | "idle"
    | "loading"
    | "succeeded"
    | "failed";

  mutationStatus:
    | "idle"
    | "loading"
    | "succeeded"
    | "failed";

  error: string | null;
}

/* =========================================================
   INITIAL STATE
========================================================= */

const initialState: BusinessState = {
  records: [],
  selectedBusiness: null,
  status: "idle",
  mutationStatus: "idle",
  error: null,
};

/* =========================================================
   SLICE
========================================================= */

const businessSlice = createSlice({
  name: "business",

  initialState,

  reducers: {
    /* -----------------------------------------------------
       CLEAR ERROR
    ----------------------------------------------------- */

    clearBusinessError(state) {
      state.error = null;
    },

    /* -----------------------------------------------------
       RESET BUSINESS STATE
    ----------------------------------------------------- */

    resetBusinessState: () => initialState,

    /* -----------------------------------------------------
       SET BUSINESS RECORDS
    ----------------------------------------------------- */

    setBusinessRecords(
      state,
      action: PayloadAction<BusinessApiRecord[]>
    ) {
      state.records = action.payload;
      state.status = "succeeded";
    },

    /* -----------------------------------------------------
       SET SELECTED BUSINESS
    ----------------------------------------------------- */

    setSelectedBusiness(
      state,
      action: PayloadAction<Business | null>
    ) {
      state.selectedBusiness =
        action.payload;
    },

    /* -----------------------------------------------------
       CLEAR SELECTED BUSINESS
    ----------------------------------------------------- */

    clearSelectedBusiness(state) {
      state.selectedBusiness = null;
    },
  },

  /* =======================================================
     ASYNC ACTIONS
  ======================================================= */

  extraReducers: (builder) => {
    builder

      /* ---------------------------------------------------
         FETCH BUSINESSES
      --------------------------------------------------- */

      .addCase(
        fetchBusinesses.pending,
        (state) => {
          state.status = "loading";
          state.error = null;
        }
      )

      .addCase(
        fetchBusinesses.fulfilled,
        (state, action) => {
          state.status = "succeeded";
          state.records = action.payload;
        }
      )

      .addCase(
        fetchBusinesses.rejected,
        (state, action) => {
          state.status = "failed";

          state.error =
            action.payload ??
            "Unable to load businesses.";
        }
      )

      /* ---------------------------------------------------
         DELETE BUSINESS
      --------------------------------------------------- */

      .addCase(
        deleteBusiness.fulfilled,
        (state, action) => {
          state.records =
            state.records.filter(
              (record) =>
                String(record.id) !==
                action.payload
            );

          /*
           * If the deleted business was selected,
           * clear the selected business.
           */
          if (
            state.selectedBusiness?.id ===
            action.payload
          ) {
            state.selectedBusiness = null;
          }
        }
      )

      /* ---------------------------------------------------
         OTHER BUSINESS MUTATIONS
      --------------------------------------------------- */

      .addMatcher(
        (action) =>
          action.type.startsWith(
            "business/"
          ) &&
          action.type.endsWith(
            "/pending"
          ) &&
          action.type !==
            fetchBusinesses.pending.type,

        (state) => {
          state.mutationStatus = "loading";
          state.error = null;
        }
      )

      .addMatcher(
        (action) =>
          action.type.startsWith(
            "business/"
          ) &&
          action.type.endsWith(
            "/fulfilled"
          ) &&
          action.type !==
            fetchBusinesses.fulfilled.type,

        (state) => {
          state.mutationStatus =
            "succeeded";
        }
      )

      .addMatcher(
        (action) =>
          action.type.startsWith(
            "business/"
          ) &&
          action.type.endsWith(
            "/rejected"
          ) &&
          action.type !==
            fetchBusinesses.rejected.type,

        (
          state,
          action: { payload?: string }
        ) => {
          state.mutationStatus =
            "failed";

          state.error =
            action.payload ??
            "Unable to save changes.";
        }
      );
  },
});

/* =========================================================
   ACTIONS
========================================================= */

export const {
  clearBusinessError,
  resetBusinessState,
  setBusinessRecords,
  setSelectedBusiness,
  clearSelectedBusiness,
} = businessSlice.actions;

/* =========================================================
   SELECTORS
========================================================= */

export const selectBusinessRecords = (
  state: { business: BusinessState }
) => state.business.records;

export const selectBusinesses = (
  state: { business: BusinessState }
) =>
  state.business.records.map(
    toBusinessCardModel
  );

export const selectSelectedBusiness = (
  state: { business: BusinessState }
) =>
  state.business.selectedBusiness;

export const selectBusinessStatus = (
  state: { business: BusinessState }
) =>
  state.business.status;

export const selectBusinessMutationStatus = (
  state: { business: BusinessState }
) =>
  state.business.mutationStatus;

export const selectBusinessError = (
  state: { business: BusinessState }
) =>
  state.business.error;

/* =========================================================
   REDUCER
========================================================= */

export default businessSlice.reducer;












// import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { businessService } from "../services/business.service";
// import { BranchPayload, Business, BusinessApiRecord } from "../types";

// export const toBusinessCardModel = (item: BusinessApiRecord): Business => ({
//   id: String(item.id ?? ""),
//   name: item.displayName || item.legalName || item.tradeName || "Business",
//   legalName: item.legalName || "",
//   gstin: item.gstin || "",
//   pan: item.pan || "",
//   businessType: item.businessType || "",
//   industry: item.industry?.name || "",
//   city: item.addresses?.[0]?.city || "",
//   state: item.addresses?.[0]?.state || "",
//   country: item.addresses?.[0]?.country || "",
//   phone: item.phone || "",
//   email: item.email || "",
//   website: item.websiteLink || undefined,
//   logo: item.logo || undefined,
//   financialYear: item.financialYear || "",
//   status: item.status === "ACTIVE" ? "Active" : "Inactive",
//   vendors: 0,
//   employees: 0,
//   branches: (item.branches ?? []).map((branch) => ({
//     id: String(branch.id ?? ""),
//     name: branch.branchName || "Branch",
//     code: branch.branchCode || "",
//     address: branch.addressLine1 || "",
//     city: branch.city || "",
//     state: branch.state || "",
//     country: branch.country || "",
//     phone: branch.phone || "",
//     email: branch.email || "",
//     branchManager: branch.branchManager || branch.user?.name || "",
//     status: branch.status === "ACTIVE" ? "Active" : "Inactive",
//   })),
// });

// const errorMessage = (error: unknown) =>
//   error instanceof Error ? error.message : "Something went wrong. Please try again.";

// export const fetchBusinesses = createAsyncThunk<
//   BusinessApiRecord[],
//   void,
//   { rejectValue: string; state: { auth: { user: { role?: string | null } | null } } }
// >(
//   "business/fetchBusinesses",
//   async (_, { rejectWithValue, getState }) => {
//     try {
//       const role = getState().auth?.user?.role;
//       return (await businessService.getBusinesses(role)) as BusinessApiRecord[];
//     } catch (error) {
//       return rejectWithValue(errorMessage(error));
//     }
//   }
// );

// export const deleteBusiness = createAsyncThunk<string, string, { rejectValue: string }>(
//   "business/deleteBusiness",
//   async (id, { rejectWithValue }) => {
//     try {
//       await businessService.deleteBusiness(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(errorMessage(error));
//     }
//   }
// );

// export const updateBranch = createAsyncThunk<void, { branchId: string; payload: BranchPayload }, { rejectValue: string }>(
//   "business/updateBranch",
//   async ({ branchId, payload }, { rejectWithValue }) => {
//     try {
//       await businessService.updateBranch(branchId, payload);
//     } catch (error) {
//       return rejectWithValue(errorMessage(error));
//     }
//   }
// );

// export const deleteBranch = createAsyncThunk<string, string, { rejectValue: string }>(
//   "business/deleteBranch",
//   async (branchId, { rejectWithValue }) => {
//     try {
//       await businessService.deleteBranch(branchId);
//       return branchId;
//     } catch (error) {
//       return rejectWithValue(errorMessage(error));
//     }
//   }
// );

// export const createBranch = createAsyncThunk<void, { tenantId: string | number; payload: BranchPayload }, { rejectValue: string }>(
//   "business/createBranch",
//   async ({ tenantId, payload }, { rejectWithValue }) => {
//     try {
//       await businessService.createBranch(tenantId, payload);
//     } catch (error) {
//       return rejectWithValue(errorMessage(error));
//     }
//   }
// );

// export const fetchBranchById = createAsyncThunk<BusinessApiRecord, string, { rejectValue: string }>(
//   "business/fetchBranchById",
//   async (branchId, { rejectWithValue }) => {
//     try {
//       return (await businessService.getBranchById(branchId)) as BusinessApiRecord;
//     } catch (error) {
//       return rejectWithValue(errorMessage(error));
//     }
//   }
// );

// interface BusinessState {
//   records: BusinessApiRecord[];
//   status: "idle" | "loading" | "succeeded" | "failed";
//   mutationStatus: "idle" | "loading" | "succeeded" | "failed";
//   error: string | null;
// }

// const initialState: BusinessState = { records: [], status: "idle", mutationStatus: "idle", error: null };

// const businessSlice = createSlice({
//   name: "business",
//   initialState,
//   reducers: {
//     clearBusinessError(state) { state.error = null; },
//     resetBusinessState: () => initialState,
//     setBusinessRecords(state, action: PayloadAction<BusinessApiRecord[]>) {
//       state.records = action.payload;
//       state.status = "succeeded";
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchBusinesses.pending, (state) => { state.status = "loading"; state.error = null; })
//       .addCase(fetchBusinesses.fulfilled, (state, action) => { state.status = "succeeded"; state.records = action.payload; })
//       .addCase(fetchBusinesses.rejected, (state, action) => { state.status = "failed"; state.error = action.payload ?? "Unable to load businesses."; })
//       .addCase(deleteBusiness.fulfilled, (state, action) => {
//         state.records = state.records.filter((record) => String(record.id) !== action.payload);
//       })
//       .addMatcher(
//         (action) => action.type.startsWith("business/") && action.type.endsWith("/pending") && action.type !== fetchBusinesses.pending.type,
//         (state) => { state.mutationStatus = "loading"; state.error = null; }
//       )
//       .addMatcher(
//         (action) => action.type.startsWith("business/") && action.type.endsWith("/fulfilled") && action.type !== fetchBusinesses.fulfilled.type,
//         (state) => { state.mutationStatus = "succeeded"; }
//       )
//       .addMatcher(
//         (action) => action.type.startsWith("business/") && action.type.endsWith("/rejected") && action.type !== fetchBusinesses.rejected.type,
//         (state, action: { payload?: string }) => { state.mutationStatus = "failed"; state.error = action.payload ?? "Unable to save changes."; }
//       );
//   },
// });

// export const { clearBusinessError, resetBusinessState, setBusinessRecords } = businessSlice.actions;
// export const selectBusinessRecords = (state: { business: BusinessState }) => state.business.records;
// export const selectBusinesses = (state: { business: BusinessState }) => state.business.records.map(toBusinessCardModel);
// export const selectBusinessStatus = (state: { business: BusinessState }) => state.business.status;
// export const selectBusinessMutationStatus = (state: { business: BusinessState }) => state.business.mutationStatus;
// export const selectBusinessError = (state: { business: BusinessState }) => state.business.error;
// export default businessSlice.reducer;
