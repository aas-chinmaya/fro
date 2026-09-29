import { baseApi } from "@/services/baseApi";

import type {
  Invoice,
  InvoiceCreatePayload,
  InvoiceListParams,
  InvoiceListResponse,
  InvoiceResponse,
  InvoiceStatusChangePayload,
  InvoiceUpdatePayload,
} from "../types/invoice.types";

const INVOICE_ENDPOINT = "/sales-invoices";

function unwrapList(response: unknown): InvoiceListResponse {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray((response as InvoiceListResponse).data)
  ) {
    return response as InvoiceListResponse;
  }

  if (Array.isArray(response)) {
    return {
      success: true,
      message: "OK",
      data: response as Invoice[],
    };
  }

  const inner = (response as { data?: unknown })?.data;

  if (
    inner &&
    typeof inner === "object" &&
    "data" in (inner as object)
  ) {
    return inner as InvoiceListResponse;
  }

  return {
    success: true,
    message: "OK",
    data: [],
  };
}

function unwrapOne(response: unknown): InvoiceResponse {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    (response as InvoiceResponse).data &&
    typeof (response as InvoiceResponse).data === "object" &&
    "id" in ((response as InvoiceResponse).data as object)
  ) {
    return response as InvoiceResponse;
  }

  if (
    response &&
    typeof response === "object" &&
    "id" in response
  ) {
    return {
      success: true,
      message: "OK",
      data: response as Invoice,
    };
  }

  const inner = (response as { data?: unknown })?.data;

  if (
    inner &&
    typeof inner === "object" &&
    "data" in (inner as object)
  ) {
    return inner as InvoiceResponse;
  }

  if (
    inner &&
    typeof inner === "object" &&
    "id" in (inner as object)
  ) {
    return {
      success: true,
      message: "OK",
      data: inner as Invoice,
    };
  }

  return {
    success: false,
    message: "Invalid invoice response",
    data: null as unknown as Invoice,
  };
}

export const invoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvoices: builder.query<
      InvoiceListResponse,
      InvoiceListParams | undefined
    >({
   
      query: (params) => ({
        url: `${INVOICE_ENDPOINT}/invoices`,
        method: "GET",
        params,
      }),
      transformResponse: (response: unknown) => unwrapList(response),
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map(({ id }) => ({
                type: "Invoices" as const,
                id,
              })),
              {
                type: "Invoices" as const,
                id: "LIST",
              },
            ]
          : [
              {
                type: "Invoices" as const,
                id: "LIST",
              },
            ],
    }),

    getInvoiceById: builder.query<InvoiceResponse, string>({
      query: (id) => ({
        url: `${INVOICE_ENDPOINT}/invoices/${id}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => unwrapOne(response),
      providesTags: (_result, _error, id) => [
        {
          type: "Invoices" as const,
          id,
        },
      ],
    }),

    createInvoice: builder.mutation<
      InvoiceResponse,
      InvoiceCreatePayload
    >({
      query: (data) => ({
         url: `${INVOICE_ENDPOINT}/`,
        method: "POST",
        data,
      }),
      transformResponse: (response: unknown) => unwrapOne(response),
      invalidatesTags: [
        {
          type: "Invoices",
          id: "LIST",
        },
      ],
    }),

    updateInvoice: builder.mutation<
      InvoiceResponse,
      {
        id: string;
        data: InvoiceUpdatePayload;
      }
    >({
      query: ({ id, data }) => ({
        url: `${INVOICE_ENDPOINT}/${id}`,
        method: "PUT",
        data,
      }),
      transformResponse: (response: unknown) => unwrapOne(response),
      invalidatesTags: (_result, _error, { id }) => [
        {
          type: "Invoices",
          id,
        },
        {
          type: "Invoices",
          id: "LIST",
        },
      ],
    }),

    updateInvoiceStatus: builder.mutation<
      InvoiceResponse,
      {
        id: string;
        data: InvoiceStatusChangePayload;
      }
    >({
      query: ({ id, data }) => ({
        url: `${INVOICE_ENDPOINT}/${id}/status`,
        method: "PATCH",
        data,
      }),
      transformResponse: (response: unknown) => unwrapOne(response),
      invalidatesTags: (_result, _error, { id }) => [
        {
          type: "Invoices",
          id,
        },
        {
          type: "Invoices",
          id: "LIST",
        },
      ],
    }),

    deleteInvoice: builder.mutation<InvoiceResponse, string>({
      query: (id) => ({
        url: `${INVOICE_ENDPOINT}/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: unknown) => unwrapOne(response),
      invalidatesTags: (_result, _error, id) => [
        {
          type: "Invoices",
          id,
        },
        {
          type: "Invoices",
          id: "LIST",
        },
      ],
    }),

    /** Backend PDF: GET /invoices/:id/pdf → blob download */
    downloadInvoicePdf: builder.mutation<Blob, string>({
      query: (id) => ({
        url: `${INVOICE_ENDPOINT}/${id}/pdf`,
        method: "GET",
        responseHandler: async (response: Response) => response.blob(),
      }),
    }),
  }),
});


export const {
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useUpdateInvoiceStatusMutation,
  useDeleteInvoiceMutation,
  useDownloadInvoicePdfMutation,
} = invoiceApi;