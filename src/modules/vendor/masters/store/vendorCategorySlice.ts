import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notify } from "@/lib/toast";
import { vendorCategoryService } from "../services/vendorCategory.service";
import type { DocumentTypePagination, VendorCategory, VendorCategoryPayload } from "../types";

interface VendorCategoryState {
  items: VendorCategory[];
  pagination: DocumentTypePagination;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: VendorCategoryState = {
  items: [],
  pagination: { page: 1, limit: 10 },
  loading: false,
  saving: false,
  error: null,
};

const message = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const fetchVendorCategories = createAsyncThunk<
  { items: VendorCategory[]; pagination: DocumentTypePagination },
  { page?: number; limit?: number },
  { rejectValue: string }
>("vendorCategories/fetchAll", async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
  try {
    return await vendorCategoryService.getAll(page, limit);
  } catch (error) {
    return rejectWithValue(message(error, "Unable to load vendor categories"));
  }
});

export const createVendorCategory = createAsyncThunk<VendorCategory, VendorCategoryPayload, { rejectValue: string }>(
  "vendorCategories/create",
  async (payload, { rejectWithValue }) => {
    try {
      const item = await vendorCategoryService.create(payload);
      notify.success("Vendor category created");
      return item;
    } catch (error) {
      return rejectWithValue(message(error, "Unable to create vendor category"));
    }
  }
);

export const updateVendorCategory = createAsyncThunk<
  VendorCategory,
  { id: string; payload: VendorCategoryPayload },
  { rejectValue: string }
>("vendorCategories/update", async ({ id, payload }, { rejectWithValue }) => {
  try {
    const item = await vendorCategoryService.update(id, payload);
    notify.success("Vendor category updated");
    return item;
  } catch (error) {
    return rejectWithValue(message(error, "Unable to update vendor category"));
  }
});

export const deleteVendorCategory = createAsyncThunk<string, string, { rejectValue: string }>(
  "vendorCategories/delete",
  async (id, { rejectWithValue }) => {
    try {
      await vendorCategoryService.delete(id);
      notify.success("Vendor category deleted");
      return id;
    } catch (error) {
      return rejectWithValue(message(error, "Unable to delete vendor category"));
    }
  }
);

const slice = createSlice({
  name: "vendorCategories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorCategories.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchVendorCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchVendorCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unable to load vendor categories";
      })
      .addCase(createVendorCategory.fulfilled, (state, action) => { state.saving = false; state.items.unshift(action.payload); })
      .addCase(updateVendorCategory.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteVendorCategory.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addMatcher(
        (action) => [createVendorCategory, updateVendorCategory, deleteVendorCategory].some((thunk) => action.type === `${thunk.typePrefix}/pending`),
        (state) => { state.saving = true; state.error = null; }
      )
      .addMatcher(
        (action) => [createVendorCategory, updateVendorCategory, deleteVendorCategory].some((thunk) => action.type === `${thunk.typePrefix}/rejected`),
        (state, action: { payload?: string }) => { state.saving = false; state.error = action.payload ?? "The request failed"; }
      );
  },
});

export default slice.reducer;