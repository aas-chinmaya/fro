// modules/sales/analytics/api/sales-billing-analytics.ts

import { baseApi } from "@/services/baseApi";

import type {
  AnalyticsFilterParams,
  SalesBillingAnalytics,
  SalesBillingAnalyticsResponse,
} from "../types/sales-billing-analytics.types";

const ANALYTICS_ENDPOINT = "/analytics";

function unwrapAnalytics(response: unknown): SalesBillingAnalytics {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    (response as SalesBillingAnalyticsResponse).data &&
    typeof (response as SalesBillingAnalyticsResponse).data === "object" &&
    "overview" in ((response as SalesBillingAnalyticsResponse).data as object)
  ) {
    return (response as SalesBillingAnalyticsResponse).data;
  }

  if (response && typeof response === "object" && "overview" in response) {
    return response as SalesBillingAnalytics;
  }

  const outer = (response as { data?: unknown })?.data;

  if (
    outer &&
    typeof outer === "object" &&
    "data" in (outer as object) &&
    (outer as SalesBillingAnalyticsResponse).data &&
    typeof (outer as SalesBillingAnalyticsResponse).data === "object" &&
    "overview" in ((outer as SalesBillingAnalyticsResponse).data as object)
  ) {
    return (outer as SalesBillingAnalyticsResponse).data;
  }

  if (outer && typeof outer === "object" && "overview" in (outer as object)) {
    return outer as SalesBillingAnalytics;
  }

  throw new Error("Invalid sales billing analytics response");
}

export const salesBillingAnalyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesBillingAnalytics: builder.query<
      SalesBillingAnalytics,
      AnalyticsFilterParams | undefined
    >({
      query: (params) => ({
        url: ANALYTICS_ENDPOINT,
        method: "GET",
        params,
      }),
      transformResponse: (response: unknown) => unwrapAnalytics(response),
      providesTags: [
        {
          type: "SalesBillingAnalytics" as const,
          id: "DASHBOARD",
        },
      ],
    }),
  }),
});

export const { useGetSalesBillingAnalyticsQuery } = salesBillingAnalyticsApi;