import { baseApi } from "@/services/baseApi";

import type {
  PaymentReceiptListResponse,
  PaymentReceiptQueryParams,
  PaymentReceiptResponse,
  CreatePaymentReceiptPayload,
  UpdatePaymentReceiptPayload,
} from "../types/payment-receipt.types";

const PAYMENT_RECEIPT_ENDPOINT = "/payment-receipts";

export const paymentReceiptApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentReceipts: builder.query<
      PaymentReceiptListResponse,
      PaymentReceiptQueryParams | undefined
    >({
      query: (params) => ({
        url: `${PAYMENT_RECEIPT_ENDPOINT}/list`,
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map(({ id }) => ({
                type: "PaymentReceipts" as const,
                id,
              })),
              { type: "PaymentReceipts" as const, id: "LIST" },
            ]
          : [{ type: "PaymentReceipts" as const, id: "LIST" }],
    }),

    getPaymentReceiptById: builder.query<PaymentReceiptResponse, string>({
      query: (id) => ({
        url: `${PAYMENT_RECEIPT_ENDPOINT}/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "PaymentReceipts" as const, id },
      ],
      // RTK Query returns the full response body; unwrap data in the view
      transformResponse: (response: PaymentReceiptResponse) => response,
    }),

    createPaymentReceipt: builder.mutation<
      PaymentReceiptResponse,
      CreatePaymentReceiptPayload
    >({
      query: (data) => ({
        url: `${PAYMENT_RECEIPT_ENDPOINT}/create`,
        method: "POST",
        data,
      }),
      invalidatesTags: [{ type: "PaymentReceipts", id: "LIST" }],
    }),

    updatePaymentReceipt: builder.mutation<
      PaymentReceiptResponse,
      { id: string; data: UpdatePaymentReceiptPayload }
    >({
      query: ({ id, data }) => ({
        url: `${PAYMENT_RECEIPT_ENDPOINT}/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "PaymentReceipts", id },
        { type: "PaymentReceipts", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetPaymentReceiptsQuery,
  useGetPaymentReceiptByIdQuery,
  useCreatePaymentReceiptMutation,
  useUpdatePaymentReceiptMutation,
} = paymentReceiptApi;
