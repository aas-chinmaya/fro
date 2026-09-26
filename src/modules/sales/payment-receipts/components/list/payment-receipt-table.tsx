
"use client";

import { useEffect, useMemo, useState } from "react";

import {
  DataTable,
  Pagination,
  Search,
  TableToolbar,
} from "@/components/data-table";

import { useGetPaymentReceiptsQuery } from "../../api/payment-receipt.api";
import type {
  PaymentReceiptQueryParams,
  PaymentReceiptStatus,
} from "../../types/payment-receipt.types";

import PaymentReceiptFilters from "./payment-receipt-filters";
import { PaymentReceiptColumns } from "./payment-receipt-columns";

type PeriodFilter = "all" | "today" | "7d" | "30d" | "month" | "year";

type DateRange = Pick<PaymentReceiptQueryParams, "fromDate" | "toDate">;

const DEFAULT_LIMIT = 10;

function getDateRange(period: PeriodFilter): DateRange {
  if (period === "all") return {};

  const now = new Date();
  const toDate = now.toISOString();
  const startDate = new Date(now);

  switch (period) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "7d":
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "30d":
      startDate.setDate(now.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "month":
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case "year":
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      return {};
  }

  return {
    fromDate: startDate.toISOString(),
    toDate,
  };
}

export default function PaymentReceiptTable() {
  const [page, setPage] = useState(1);

  // `searchInput` is the controlled input value (updates on every keystroke).
  // `debouncedSearch` is the value actually sent to RTK Query, and only
  // updates ~400ms after the user stops typing.
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [status, setStatus] = useState<PaymentReceiptStatus | "">("");
  const [period, setPeriod] = useState<PeriodFilter>("all");

  // Debounce: wait 400ms after the user stops typing before updating
  // debouncedSearch. Every keystroke resets the timer via the cleanup
  // function, so no request fires while the user is still typing.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const params = useMemo<PaymentReceiptQueryParams>(
    () => ({
      page,
      limit: DEFAULT_LIMIT,
      search: debouncedSearch || undefined,
      status: status || undefined,
      ...getDateRange(period),
    }),
    [page, debouncedSearch, status, period],
  );

  const { data, isLoading, isFetching } = useGetPaymentReceiptsQuery(params);

  const paymentReceipts = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;
  const loading = isLoading || isFetching;

  // Reset to first page whenever a filter changes (only fires once the
  // debounced search value actually changes, not on every keystroke).
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, period]);

  return (
    <div className="space-y-4">
      <TableToolbar>
        <Search
          placeholder="Search money receipt..."
          value={searchInput}
          onChange={setSearchInput}
        />

        <PaymentReceiptFilters
          value={status}
          onChange={(value) => setStatus(value as PaymentReceiptStatus | "")}
          period={period}
          onPeriodChange={(value) => setPeriod(value as PeriodFilter)}
        />
      </TableToolbar>

      <DataTable
        columns={PaymentReceiptColumns}
        data={paymentReceipts}
        loading={loading}
        emptyMessage="No payment receipts found."
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}