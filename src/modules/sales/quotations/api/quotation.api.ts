import { baseApi } from "@/services/baseApi";

import type {
  Quotation,
  QuotationCreatePayload,
  QuotationListParams,
  QuotationListResponse,
  QuotationResponse,
  QuotationStatusChangePayload,
  QuotationUpdatePayload,
} from "../types/quotation.types";

const QUOTATION_ENDPOINT = "/quotations";

function unwrapList(response: unknown): QuotationListResponse {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray((response as QuotationListResponse).data)
  ) {
    return response as QuotationListResponse;
  }

  if (Array.isArray(response)) {
    return {
      success: true,
      message: "OK",
      data: response as Quotation[],
    };
  }

  const inner = (response as { data?: unknown })?.data;

  if (
    inner &&
    typeof inner === "object" &&
    "data" in (inner as object)
  ) {
    return inner as QuotationListResponse;
  }

  return {
    success: true,
    message: "OK",
    data: [],
  };
}

function unwrapOne(response: unknown): QuotationResponse {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    (response as QuotationResponse).data &&
    typeof (response as QuotationResponse).data === "object" &&
    "id" in ((response as QuotationResponse).data as object)
  ) {
    return response as QuotationResponse;
  }

  if (
    response &&
    typeof response === "object" &&
    "id" in response
  ) {
    return {
      success: true,
      message: "OK",
      data: response as Quotation,
    };
  }

  const inner = (response as { data?: unknown })?.data;

  if (
    inner &&
    typeof inner === "object" &&
    "data" in (inner as object)
  ) {
    return inner as QuotationResponse;
  }

  if (
    inner &&
    typeof inner === "object" &&
    "id" in (inner as object)
  ) {
    return {
      success: true,
      message: "OK",
      data: inner as Quotation,
    };
  }

  return {
    success: false,
    message: "Invalid quotation response",
    data: null as unknown as Quotation,
  };
}

export const quotationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuotations: builder.query<
      QuotationListResponse,
      QuotationListParams | undefined
    >({
      // query: (params) => ({
      //    url: `${QUOTATION_ENDPOINT}/list/`,
      //   method: "GET",
      //   params,
      // }),
      query: (params) => ({
        url: `${QUOTATION_ENDPOINT}/list/`,
        method: "GET",
        params,
      }),
      transformResponse: (response: unknown) => unwrapList(response),
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map(({ id }) => ({
                type: "Quotations" as const,
                id,
              })),
              {
                type: "Quotations" as const,
                id: "LIST",
              },
            ]
          : [
              {
                type: "Quotations" as const,
                id: "LIST",
              },
            ],
    }),

    getQuotationById: builder.query<QuotationResponse, string>({
      query: (id) => ({
        url: `${QUOTATION_ENDPOINT}/${id}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapOne(response),
      providesTags: (_result, _error, id) => [
        {
          type: "Quotations" as const,
          id,
        },
      ],
    }),

    createQuotation: builder.mutation<
      QuotationResponse,
      QuotationCreatePayload
    >({
      query: (data) => ({
         url: `${QUOTATION_ENDPOINT}/create`,
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) => unwrapOne(response),
      invalidatesTags: [
        {
          type: "Quotations",
          id: "LIST",
        },
      ],
    }),

    updateQuotation: builder.mutation<
      QuotationResponse,
      {
        id: string;
        data: QuotationUpdatePayload;
      }
    >({
      query: ({ id, data }) => ({
        url: `${QUOTATION_ENDPOINT}/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) => unwrapOne(response),
      invalidatesTags: (_result, _error, { id }) => [
        {
          type: "Quotations",
          id,
        },
        {
          type: "Quotations",
          id: "LIST",
        },
      ],
    }),

    updateQuotationStatus: builder.mutation<
      QuotationResponse,
      {
        id: string;
        data: QuotationStatusChangePayload;
      }
    >({
      query: ({ id, data }) => ({
        url: `${QUOTATION_ENDPOINT}/${id}/status`,
        method: "PATCH",
        data,
      }),
      transformResponse: (response: unknown) => unwrapOne(response),
      invalidatesTags: (_result, _error, { id }) => [
        {
          type: "Quotations",
          id,
        },
        {
          type: "Quotations",
          id: "LIST",
        },
      ],
    }),

    deleteQuotation: builder.mutation<QuotationResponse, string>({
      query: (id) => ({
        url: `${QUOTATION_ENDPOINT}/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) => unwrapOne(response),
      invalidatesTags: (_result, _error, id) => [
        {
          type: "Quotations",
          id,
        },
        {
          type: "Quotations",
          id: "LIST",
        },
      ],
    }),

    /** Backend PDF: GET /quotations/:id/pdf → blob download */
    downloadQuotationPdf: builder.mutation<Blob, string>({
      query: (id) => ({
        url: `${QUOTATION_ENDPOINT}/${id}/pdf`,
        method: "GET",
        responseHandler: async (response: Response) => response.blob(),      }),
    }),
  }),
});

export const {
  useGetQuotationsQuery,
  useGetQuotationByIdQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useUpdateQuotationStatusMutation,
  useDeleteQuotationMutation,
  useDownloadQuotationPdfMutation,
} = quotationApi;