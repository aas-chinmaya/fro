/**
 * Credit Note API — RTK Query
 * ---------------------------
 * Backend routes (mounted at /api/v1/credit-notes):
 *   POST   /create
 *   GET    /list
 *   GET    /:creditNoteId
 *   POST   /:creditNoteId/refund
 *   POST   /:creditNoteId/exchange
 *   POST   /:creditNoteId/cancel
 */

import { baseApi } from "@/services/baseApi";

import type {
  CreditNote,
  CreditNoteCancelPayload,
  CreditNoteExchangePayload,
  CreditNoteListParams,
  CreditNoteListResponse,
  CreditNoteRefundPayload,
  CreditNoteResponse,
  CreateCreditNotePayload,
} from "../types/credit-note.types";

const ENDPOINT = "/credit-notes";

function unwrapList(response: unknown): CreditNoteListResponse {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray((response as CreditNoteListResponse).data)
  ) {
    const r = response as CreditNoteListResponse;
    const total =
      r.total ??
      r.pagination?.total ??
      (Array.isArray(r.data) ? r.data.length : 0);
    const page = r.page ?? r.pagination?.page ?? 1;
    const limit = r.limit ?? r.pagination?.limit ?? 20;
    const totalPages =
      r.totalPages ??
      r.pagination?.totalPages ??
      Math.max(1, Math.ceil(total / limit));
    return {
      success: r.success ?? true,
      message: r.message,
      data: r.data,
      total,
      page,
      limit,
      totalPages,
    };
  }

  if (Array.isArray(response)) {
    return {
      success: true,
      message: "OK",
      data: response as CreditNote[],
      total: response.length,
      page: 1,
      limit: response.length || 20,
      totalPages: 1,
    };
  }

  return {
    success: true,
    message: "OK",
    data: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  };
}

function unwrapOne(response: unknown): CreditNoteResponse {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    (response as CreditNoteResponse).data &&
    typeof (response as CreditNoteResponse).data === "object" &&
    "id" in ((response as CreditNoteResponse).data as object)
  ) {
    return response as CreditNoteResponse;
  }

  if (response && typeof response === "object" && "id" in response) {
    return {
      success: true,
      message: "OK",
      data: response as CreditNote,
    };
  }

  const inner = (response as { data?: unknown })?.data;
  if (inner && typeof inner === "object" && "id" in (inner as object)) {
    return {
      success: true,
      message: "OK",
      data: inner as CreditNote,
    };
  }

  return {
    success: false,
    message: "Invalid credit note response",
    data: null as unknown as CreditNote,
  };
}

export const creditNoteApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCreditNotes: builder.query<
      CreditNoteListResponse,
      CreditNoteListParams | undefined
    >({
      query: (params) => ({
        url: `${ENDPOINT}/list`,
        method: "GET",
        params,
      }),
      transformResponse: (response: unknown) => unwrapList(response),
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map(({ id }) => ({
                type: "CreditNotes" as const,
                id,
              })),
              { type: "CreditNotes" as const, id: "LIST" },
            ]
          : [{ type: "CreditNotes" as const, id: "LIST" }],
    }),

    getCreditNoteById: builder.query<CreditNoteResponse, string>({
      query: (id) => ({
        url: `${ENDPOINT}/${id}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapOne(response),
      providesTags: (_result, _error, id) => [
        { type: "CreditNotes" as const, id },
      ],
    }),

    createCreditNote: builder.mutation<
      CreditNoteResponse,
      CreateCreditNotePayload
    >({
      query: (data) => ({
        url: `${ENDPOINT}/create`,
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) => unwrapOne(response),
      invalidatesTags: [{ type: "CreditNotes", id: "LIST" }],
    }),

    refundCreditNote: builder.mutation<
      CreditNoteResponse,
      { id: string; data: CreditNoteRefundPayload }
    >({
      query: ({ id, data }) => ({
        url: `${ENDPOINT}/${id}/refund`,
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) => unwrapOne(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CreditNotes", id },
        { type: "CreditNotes", id: "LIST" },
      ],
    }),

    exchangeCreditNote: builder.mutation<
      CreditNoteResponse,
      { id: string; data?: CreditNoteExchangePayload }
    >({
      query: ({ id, data }) => ({
        url: `${ENDPOINT}/${id}/exchange`,
        method: "POST",
        data: data ?? {},
      }),
      transformResponse: (response: unknown) => unwrapOne(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CreditNotes", id },
        { type: "CreditNotes", id: "LIST" },
      ],
    }),

    cancelCreditNote: builder.mutation<
      CreditNoteResponse,
      { id: string; data: CreditNoteCancelPayload }
    >({
      query: ({ id, data }) => ({
        url: `${ENDPOINT}/${id}/cancel`,
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) => unwrapOne(response),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "CreditNotes", id },
        { type: "CreditNotes", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCreditNotesQuery,
  useGetCreditNoteByIdQuery,
  useCreateCreditNoteMutation,
  useRefundCreditNoteMutation,
  useExchangeCreditNoteMutation,
  useCancelCreditNoteMutation,
} = creditNoteApi;
