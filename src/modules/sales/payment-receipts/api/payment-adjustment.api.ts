import { baseApi } from "@/services/baseApi";

import type {
  PaymentAdjustment,
  PaymentAdjustmentPayload,
} from "../types/payment-receipt.types";

const PAYMENT_ADJUSTMENT_ENDPOINT = "/payment-adjustments";

export const paymentAdjustmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentAdjustment: builder.mutation<
      PaymentAdjustment,
      PaymentAdjustmentPayload
    >({
      query: (data) => ({
        url: `${PAYMENT_ADJUSTMENT_ENDPOINT}/adjust`,
        method: "POST",
        data,
      }),
      invalidatesTags: (_result, _error, payload) => [
        { type: "PaymentReceipts" as const, id: payload.paymentId },
        { type: "PaymentAdjustments" as const, id: "LIST" },
      ],
    }),

    getPaymentAdjustmentById: builder.query<
      PaymentAdjustment,
      string
    >({
      query: (id) => ({
        url: `${PAYMENT_ADJUSTMENT_ENDPOINT}/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "PaymentAdjustments" as const, id },
      ],
    }),
  }),
});

export const {
  useCreatePaymentAdjustmentMutation,
  useGetPaymentAdjustmentByIdQuery,
  useLazyGetPaymentAdjustmentByIdQuery,
} = paymentAdjustmentApi;
