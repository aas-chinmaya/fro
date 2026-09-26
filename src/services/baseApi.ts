import {
  createApi,
  type BaseQueryFn,
} from "@reduxjs/toolkit/query/react";

import type {
  AxiosError,
  AxiosRequestConfig,
} from "axios";

import api from "./api";

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: unknown;
  params?: unknown;
};

type AxiosBaseQueryError = {
  status?: number;
  data?: unknown;
};

const axiosBaseQuery =
  (): BaseQueryFn<
    AxiosBaseQueryArgs,
    unknown,
    AxiosBaseQueryError
  > =>
  async ({ url, method = "GET", data, params }) => {
    try {
      const response = await api({
        url,
        method,
        data,
        params,
      });

      return {
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as AxiosError;

      return {
        error: {
          status: axiosError.response?.status,
          data:
            axiosError.response?.data ??
            axiosError.message,
        },
      };
    }
  };

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: axiosBaseQuery(),

tagTypes: [
    // Sales & Billing
    "Quotations",
    "DeliveryChallans",

    "Invoices",
    "PaymentReceipts",
    
    "PaymentAdjustments",
    "CreditNotes",
    "DebitNotes",
  ],

  endpoints: () => ({}),
});