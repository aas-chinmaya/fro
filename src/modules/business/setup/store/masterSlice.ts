import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { masterService } from "../services/master.service";
import { BusinessSetupMasterState, MasterOption } from "../types";

// ============================================================
// Business setup — master data slice
//
// The wizard steps (BusinessInfoStep, AddressStep, BranchStep,
// DocumentsStep, ReviewStep, ...) each used to call useMasterData(),
// which independently re-fetched every master list on every mount.
// That meant the same ~11 requests fired repeatedly as the user moved
// between steps. This slice fetches everything once and caches it in
// the store; useMasterData/useLocationOptions now read from here.
// ============================================================

const initialState: BusinessSetupMasterState = {
  businessTypes: [],
  businessCategories: [],
  businessSubCategories: [],
  industries: [],
  registrationTypes: [],
  licenseTypes: [],
  currencies: [],
  timezones: [],
  financialYears: [],
  documentTypes: [],
  countries: [],
  statesByCountry: {},
  citiesByState: {},
  status: "idle",
  error: null,
};

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unable to load master data.";

export const fetchMasterData = createAsyncThunk<
  Omit<BusinessSetupMasterState, "statesByCountry" | "citiesByState" | "status" | "error">,
  void,
  { state: { businessSetupMasters: BusinessSetupMasterState }; rejectValue: string }
>(
  "businessSetupMasters/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const [
        typesRes,
        categoriesRes,
        subCategoriesRes,
        industriesRes,
        registrationRes,
        licenseTypesRes,
        currenciesRes,
        timezonesRes,
        financialYearsRes,
        documentTypesRes,
        countriesRes,
      ] = await Promise.all([
        masterService.getBusinessTypes(),
        masterService.getBusinessCategories(),
        masterService.getBusinessSubCategories(),
        masterService.getIndustries(),
        masterService.getRegistrationTypes(),
        masterService.getLicenseTypes(),
        masterService.getCurrencies(),
        masterService.getTimezones(),
        masterService.getFinancialYears(),
        masterService.getDocumentTypes(),
        masterService.getCountries(),
      ]);

      return {
        businessTypes: typesRes.data,
        businessCategories: categoriesRes.data,
        businessSubCategories: subCategoriesRes.data,
        industries: industriesRes.data,
        registrationTypes: registrationRes.data,
        licenseTypes: licenseTypesRes.data,
        currencies: currenciesRes.data,
        timezones: timezonesRes.data,
        financialYears: financialYearsRes.data,
        documentTypes: documentTypesRes.data,
        countries: countriesRes.data,
      };
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  },
  {
    // Skip re-fetching if a load already succeeded or is in flight.
    condition: (_, { getState }) => {
      const status = getState().businessSetupMasters.status;
      return status !== "loading" && status !== "succeeded";
    },
  }
);

export const fetchStatesForCountry = createAsyncThunk<
  { countryId: string; states: MasterOption[] },
  string,
  { state: { businessSetupMasters: BusinessSetupMasterState } }
>(
  "businessSetupMasters/fetchStates",
  async (countryId) => {
    const res = await masterService.getStates(countryId);
    return { countryId, states: res.data };
  },
  {
    condition: (countryId, { getState }) =>
      !getState().businessSetupMasters.statesByCountry[countryId],
  }
);

export const fetchCitiesForState = createAsyncThunk<
  { stateId: string; cities: MasterOption[] },
  string,
  { state: { businessSetupMasters: BusinessSetupMasterState } }
>(
  "businessSetupMasters/fetchCities",
  async (stateId) => {
    const res = await masterService.getCities(stateId);
    return { stateId, cities: res.data };
  },
  {
    condition: (stateId, { getState }) =>
      !getState().businessSetupMasters.citiesByState[stateId],
  }
);

const masterSlice = createSlice({
  name: "businessSetupMasters",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMasterData.fulfilled, (state, action) => {
        state.status = "succeeded";
        Object.assign(state, action.payload);
      })
      .addCase(fetchMasterData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unable to load master data.";
      })
      .addCase(fetchStatesForCountry.fulfilled, (state, action) => {
        state.statesByCountry[action.payload.countryId] = action.payload.states;
      })
      .addCase(fetchCitiesForState.fulfilled, (state, action) => {
        state.citiesByState[action.payload.stateId] = action.payload.cities;
      });
  },
});

export const selectMasterData = (state?: { businessSetupMasters?: BusinessSetupMasterState }) =>
  state?.businessSetupMasters ?? initialState;
export const selectMasterStatus = (state?: { businessSetupMasters?: BusinessSetupMasterState }) =>
  state?.businessSetupMasters?.status ?? initialState.status;
export const selectStatesForCountry =
  (countryId?: string) => (state?: { businessSetupMasters?: BusinessSetupMasterState }) =>
    (countryId && state?.businessSetupMasters?.statesByCountry?.[countryId]) || [];
export const selectCitiesForState =
  (stateId?: string) => (state?: { businessSetupMasters?: BusinessSetupMasterState }) =>
    (stateId && state?.businessSetupMasters?.citiesByState?.[stateId]) || [];

export default masterSlice.reducer;
