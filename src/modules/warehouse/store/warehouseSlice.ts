import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { binService } from "../services/bin.service";
import { rackService } from "../services/rack.service";
import { shelfService } from "../services/shelf.service";
import type { WarehouseRecord, WarehouseResource } from "../types";

export interface FetchWarehouseRecordsArgs {
  queryId: string;
  resource: WarehouseResource;
  userId: string;
  page: number;
  pageSize: number;
  search: string;
}

interface WarehouseRecordsResult {
  records: WarehouseRecord[];
  page: number;
  totalPages: number;
  totalRecords: number;
}

type WarehouseQueryStatus = "idle" | "loading" | "succeeded" | "failed";

interface WarehouseQueryState extends WarehouseRecordsResult {
  resource: WarehouseResource;
  userId: string;
  search: string;
  status: WarehouseQueryStatus;
  error: string | null;
  requestId?: string;
}

interface WarehouseState {
  queries: Record<string, WarehouseQueryState>;
}

const initialState: WarehouseState = {
  queries: {},
};

function getList(response: unknown): Record<string, unknown>[] {
  const outer = response as { data?: { data?: unknown } };
  const payload = outer?.data?.data;
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    for (const key of ["data", "items", "results", "racks", "shelves", "bins"]) {
      if (Array.isArray(record[key])) return record[key] as Record<string, unknown>[];
    }
  }

  return [];
}

function getPage(
  response: unknown,
  requestedPage: number,
  pageSize: number,
  resource: WarehouseResource,
): WarehouseRecordsResult {
  const responseRoot = (response as { data?: unknown })?.data ?? response;
  const root = responseRoot as {
    data?: unknown;
    pagination?: unknown;
    page?: unknown;
    totalPages?: unknown;
    total?: unknown;
    totalRecords?: unknown;
  };
  const payload = root?.data ?? responseRoot;
  const payloadObject = payload && typeof payload === "object" && !Array.isArray(payload)
    ? payload as Record<string, unknown>
    : null;
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payloadObject?.data)
      ? payloadObject.data
      : Array.isArray(payloadObject?.items)
        ? payloadObject.items
        : Array.isArray(payloadObject?.results)
          ? payloadObject.results
          : Array.isArray(payloadObject?.[resource])
            ? payloadObject[resource]
            : [];
  const metadata = (payloadObject?.pagination as Record<string, unknown> | undefined)
    ?? (root.pagination as Record<string, unknown> | undefined)
    ?? payloadObject
    ?? root;
  const parsedTotal = Number(metadata.total ?? metadata.totalRecords ?? list.length);
  const parsedTotalPages = Number(metadata.totalPages ?? Math.max(1, Math.ceil(parsedTotal / pageSize)));
  const parsedPage = Number(metadata.page ?? requestedPage);

  return {
    records: list as WarehouseRecord[],
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : requestedPage,
    totalPages: Number.isFinite(parsedTotalPages) && parsedTotalPages > 0 ? parsedTotalPages : 1,
    totalRecords: Number.isFinite(parsedTotal) && parsedTotal >= 0 ? parsedTotal : list.length,
  };
}

function withNormalizedIds(records: unknown[]): WarehouseRecord[] {
  return records.map((record) => {
    const item = (record ?? {}) as Record<string, unknown>;
    return {
      ...item,
      id: String(item.id ?? item._id ?? ""),
    } as WarehouseRecord;
  });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load warehouse records.";
}

export const fetchWarehouseRecords = createAsyncThunk<
  WarehouseRecordsResult,
  FetchWarehouseRecordsArgs,
  { rejectValue: string }
>(
  "warehouse/fetchRecords",
  async ({ resource, userId, page, pageSize, search }, { rejectWithValue }) => {
    try {
      if (resource === "bins") {
        const response = await binService.getBins(userId);
        const records = withNormalizedIds(getList(response));
        return {
          records,
          page: 1,
          totalPages: 1,
          totalRecords: records.length,
        };
      }

      const response = resource === "racks"
        ? await rackService.getRacks(userId, page, pageSize, search)
        : await shelfService.getShelves(userId );
      const result = getPage(response, page, pageSize, resource);
      return {
        ...result,
        records: withNormalizedIds(result.records),
      };
    } catch (error) {
      return rejectWithValue(errorMessage(error));
    }
  },
);

const warehouseSlice = createSlice({
  name: "warehouse",
  initialState,
  reducers: {
    clearWarehouseQuery(state, action: { payload: string }) {
      delete state.queries[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouseRecords.pending, (state, action) => {
        const { queryId, resource, userId, search, page } = action.meta.arg;
        const previous = state.queries[queryId];
        state.queries[queryId] = {
          resource,
          userId,
          search,
          page,
          records: previous?.records ?? [],
          totalPages: previous?.totalPages ?? 1,
          totalRecords: previous?.totalRecords ?? 0,
          status: "loading",
          error: null,
          requestId: action.meta.requestId,
        };
      })
      .addCase(fetchWarehouseRecords.fulfilled, (state, action) => {
        const query = state.queries[action.meta.arg.queryId];
        if (!query || query.requestId !== action.meta.requestId) return;

        query.records = action.payload.records;
        query.page = action.payload.page;
        query.totalPages = action.payload.totalPages;
        query.totalRecords = action.payload.totalRecords;
        query.status = "succeeded";
        query.error = null;
        query.requestId = undefined;
      })
      .addCase(fetchWarehouseRecords.rejected, (state, action) => {
        const query = state.queries[action.meta.arg.queryId];
        if (!query || query.requestId !== action.meta.requestId) return;

        query.records = [];
        query.totalPages = 1;
        query.totalRecords = 0;
        query.status = action.meta.aborted ? "idle" : "failed";
        query.error = action.meta.aborted ? null : action.payload ?? action.error.message ?? "Unable to load warehouse records.";
        query.requestId = undefined;
      });
  },
});

export const { clearWarehouseQuery } = warehouseSlice.actions;
export default warehouseSlice.reducer;
