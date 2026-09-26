"use client";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Loader2,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { customersService } from "../services/customers.service";
import { CustomerTransactionItem } from "../types";

const formatCurrency = (value: number | string | null | undefined) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (value?: string | null) => {
  if (!value) return "N/A";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  SALES_INVOICE: "Sales Invoice",
  PURCHASE_INVOICE: "Purchase Invoice",
  SALES_RETURN: "Sales Return",
  PURCHASE_RETURN: "Purchase Return",
  PAYMENT: "Payment",
  RECEIPT: "Receipt",
  CREDIT_NOTE: "Credit Note",
  DEBIT_NOTE: "Debit Note",
  OPENING_BALANCE: "Opening Balance",
};

const getDocumentTypeLabel = (type?: string | null) => {
  if (!type) return "Transaction";

  if (DOCUMENT_TYPE_LABELS[type]) {
    return DOCUMENT_TYPE_LABELS[type];
  }

  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function CustomerLedger() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;

  const [ledger, setLedger] = useState<CustomerTransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLedger = async () => {
      if (!customerId) return;

      try {
        setLoading(true);
        setError(false);

        const response =
          await customersService.getCustomerLedger(customerId);

        const payload = response as
          | CustomerTransactionItem[]
          | {
              data?: CustomerTransactionItem[];
              ledger?: CustomerTransactionItem[];
              transactions?: CustomerTransactionItem[];
            };

        if (Array.isArray(payload)) {
          setLedger(payload);
        } else {
          setLedger(
            payload.data ||
              payload.ledger ||
              payload.transactions ||
              []
          );
        }
      } catch (fetchError) {
        console.error(
          "Failed to fetch customer ledger",
          fetchError
        );
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [customerId]);

  const summary = useMemo(() => {
    const totalDebit = ledger.reduce(
      (sum, transaction) =>
        sum + (Number(transaction.debit) || 0),
      0
    );

    const totalCredit = ledger.reduce(
      (sum, transaction) =>
        sum + (Number(transaction.credit) || 0),
      0
    );

    const latestBalance =
      ledger.length > 0
        ? Number(ledger[ledger.length - 1].balance) || 0
        : 0;

    return {
      totalDebit,
      totalCredit,
      latestBalance,
    };
  }, [ledger]);

  return (
    <div className="min-h-screen bg-background p-3 md:p-5 lg:p-6">
      <div className="mx-auto max-w-[1600px]">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-muted transition hover:text-primary"
            >
              <ArrowLeft size={14} />
              Back to customer dashboard
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                <BookOpen size={20} />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Account Activity
                </p>

                <h1 className="mt-0.5 text-2xl font-bold text-text">
                  Customer Ledger
                </h1>

                <p className="mt-1 text-xs text-muted">
                  Complete transaction history and account movement
                </p>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#eee] bg-surface px-3 py-1.5 text-xs font-medium text-muted sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {ledger.length}{" "}
            {ledger.length === 1
              ? "transaction"
              : "transactions"}
          </div>
        </div>

        {/* Summary */}
        {!loading && !error && ledger.length > 0 && (
          <div className="mb-5 grid gap-3 sm:grid-cols-3">

            {/* Total Debit */}
            <div className="flex items-center justify-between rounded-2xl border border-[#eee] bg-surface px-5 py-4 shadow-sm">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Total Debit
                </p>

                <p className="mt-1 text-lg font-bold text-red-600">
                  {formatCurrency(summary.totalDebit)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <ArrowUpRight size={18} />
              </div>
            </div>

            {/* Total Credit */}
            <div className="flex items-center justify-between rounded-2xl border border-[#eee] bg-surface px-5 py-4 shadow-sm">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Total Credit
                </p>

                <p className="mt-1 text-lg font-bold text-green-600">
                  {formatCurrency(summary.totalCredit)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <ArrowDownLeft size={18} />
              </div>
            </div>

            {/* Current Balance */}
            <div className="flex items-center justify-between rounded-2xl border border-[#eee] bg-surface px-5 py-4 shadow-sm">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Current Balance
                </p>

                <p className="mt-1 text-lg font-bold text-text">
                  {formatCurrency(summary.latestBalance)}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <Wallet size={18} />
              </div>
            </div>

          </div>
        )}

        {/* Ledger */}
        <section className="overflow-hidden rounded-[26px] border border-[#eee] bg-surface shadow-sm">

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center">
              <Loader2
                size={25}
                className="animate-spin text-primary"
              />

              <p className="mt-3 text-sm font-medium text-muted">
                Loading ledger...
              </p>
            </div>

          /* Error */
          ) : error ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">
              <BookOpen
                size={25}
                className="text-primary"
              />

              <h2 className="mt-3 text-sm font-semibold text-text">
                Unable to load ledger
              </h2>

              <p className="mt-1 text-xs text-muted">
                Something went wrong while loading this customer's transactions.
              </p>
            </div>

          /* Ledger Data */
          ) : ledger.length ? (
            <>
              {/* Ledger Header */}
              <div className="flex flex-col gap-2 border-b border-[#eee] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />

                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                      Transaction History
                    </p>
                  </div>

                  <h2 className="mt-1 text-lg font-bold text-text">
                    Account Transactions
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Latest account activity
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1150px] table-fixed text-left text-sm">

                  {/* Fixed Equal Column Structure */}
                  <colgroup>
                    <col className="w-[18%]" />
                    <col className="w-[18%]" />
                    <col className="w-[13%]" />
                    <col className="w-[13%]" />
                    <col className="w-[13%]" />
                    <col className="w-[13%]" />
                    <col className="w-[12%]" />
                  </colgroup>

                  {/* Table Head */}
                  <thead className="border-b border-[#eee] bg-background">
                    <tr className="text-[9px] uppercase tracking-[0.14em] text-muted">
                      <th className="px-2 py-4 text-left font-semibold"> Date </th>
                      <th className="px-2 py-4 text-left font-semibold">Transaction No.</th>
                      <th className="px-2 py-4 text-left font-semibold"> Document Type </th>
                      <th className="px-2 py-4 text-left font-semibold"> Debit  </th>
                      <th className="px-2 py-4 text-left font-semibold"> Credit  </th>
                      <th className="px-2 py-4 text-left font-semibold"> Balance  </th>
                      <th className="px-2 py-4 text-left font-semibold"> Remarks  </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody className="divide-y divide-[#eee]">

                    {ledger.map((transaction, index) => (
                      <tr
                        key={transaction.id || index}
                        className="group transition-colors duration-200 hover:bg-background"
                      >

                        {/* Date */}
                        <td className="px-2 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-[10px] font-bold text-primary">
                              {String(index + 1).padStart(2, "0")}
                            </div>

                            <div className="min-w-0">
                              <p className="whitespace-nowrap font-semibold text-text">
                                {formatDate(transaction.transactionDate)}
                              </p>

                            </div>
                          </div>
                        </td>

                        {/* Transaction */}
                        <td className="px-2 py-4 align-middle">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#eee] bg-surface text-muted transition-colors group-hover:border-primary/20 group-hover:text-primary">
                              <ReceiptText size={15} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-text">
                                {transaction.documentNumber || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-2 py-4 align-middle">
                          <span className="inline-flex items-center whitespace-nowrap rounded-full bg-secondary px-3 py-1.5 text-[10px] font-semibold text-muted">
                            {getDocumentTypeLabel(transaction.documentType)}
                          </span>
                        </td>

                        {/* Debit */}
                        <td className="px-2 py-4 align-middle">
                          {Number(transaction.debit) ? (
                            <div>
                              <p className="whitespace-nowrap font-bold text-red-600">
                                {formatCurrency(transaction.debit)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>

                        {/* Credit */}
                        <td className="px-2 py-4 align-middle">
                          {Number(transaction.credit) ? (
                            <div>
                              <p className="whitespace-nowrap font-bold text-green-600">
                                {formatCurrency(transaction.credit)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>

                        {/* Balance */}
                        <td className="px-2 py-4 align-middle">
                          <span className="inline-flex whitespace-nowrap rounded-xl bg-secondary px-3 py-2 font-bold text-text">
                            {formatCurrency(transaction.balance)}
                          </span>
                        </td>

                        {/* Remarks */}
                        <td className="px-2 py-4 align-middle">
                          <p
                            className="truncate text-xs text-muted"
                            title={transaction.remarks || undefined}
                          >
                            {transaction.remarks || "No remarks"}
                          </p>
                        </td>

                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>
            </>

          /* Empty State */
          ) : (
            <div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                <BookOpen size={21} />
              </div>

              <h2 className="mt-4 text-sm font-semibold text-text">
                No ledger transactions
              </h2>

              <p className="mt-1 max-w-sm text-xs text-muted">
                Transactions will appear here once account activity is recorded.
              </p>
            </div>
          )}

        </section>
      </div>
    </div>
  );
}