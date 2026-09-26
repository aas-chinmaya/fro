import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notify } from "@/lib/toast";
import { globalDocumentTypeService } from "../services/globalDocumentType.service";
import type {
  DocumentTypePagination,
  GlobalDocumentType,
  GlobalDocumentTypePayload,
} from "../types";

interface GlobalDocumentTypeState {
  items: GlobalDocumentType[];
  pagination: DocumentTypePagination;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: GlobalDocumentTypeState = {
  items: [],
  pagination: { page: 1, limit: 10 },
  loading: false,
  saving: false,
  error: null,
};

const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export const fetchGlobalDocumentTypes = createAsyncThunk<
  { items: GlobalDocumentType[]; pagination: DocumentTypePagination },
  { page?: number; limit?: number },
  { rejectValue: string }
>("vendorDocumentTypes/fetchAll", async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
  try {
    return await globalDocumentTypeService.getAll(page, limit);
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to load document types"));
  }
});

export const createGlobalDocumentType = createAsyncThunk<
  GlobalDocumentType,
  GlobalDocumentTypePayload,
  { rejectValue: string }
>("vendorDocumentTypes/create", async (payload, { rejectWithValue }) => {
  try {
    const item = await globalDocumentTypeService.create(payload);
    notify.success("Document type created");
    return item;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to create document type"));
  }
});

export const updateGlobalDocumentType = createAsyncThunk<
  GlobalDocumentType,
  { id: string; payload: GlobalDocumentTypePayload },
  { rejectValue: string }
>("vendorDocumentTypes/update", async ({ id, payload }, { rejectWithValue }) => {
  try {
    const item = await globalDocumentTypeService.update(id, payload);
    notify.success("Document type updated");
    return item;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to update document type"));
  }
});

export const deleteGlobalDocumentType = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("vendorDocumentTypes/delete", async (id, { rejectWithValue }) => {
  try {
    await globalDocumentTypeService.delete(id);
    notify.success("Document type deleted");
    return id;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to delete document type"));
  }
});

const slice = createSlice({
  name: "vendorDocumentTypes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGlobalDocumentTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGlobalDocumentTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchGlobalDocumentTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Unable to load document types";
      })
      .addCase(createGlobalDocumentType.fulfilled, (state, action) => {
        state.saving = false;
        state.items.unshift(action.payload);
      })
      .addCase(updateGlobalDocumentType.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteGlobalDocumentType.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addMatcher(
        (action) =>
          action.type.endsWith("/pending") &&
          [createGlobalDocumentType.typePrefix, updateGlobalDocumentType.typePrefix, deleteGlobalDocumentType.typePrefix].some(
            (prefix) => action.type.startsWith(prefix)
          ),
        (state) => {
          state.saving = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) =>
          action.type.endsWith("/rejected") &&
          [createGlobalDocumentType.typePrefix, updateGlobalDocumentType.typePrefix, deleteGlobalDocumentType.typePrefix].some(
            (prefix) => action.type.startsWith(prefix)
          ),
        (state, action: { payload?: string }) => {
          state.saving = false;
          state.error = action.payload ?? "The request failed";
        }
      );
  },
});

export default slice.reducer;