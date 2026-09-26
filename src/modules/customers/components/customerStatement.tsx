"use client";

import { useState } from "react";
// import { ArrowLeft, Download, FileText, Loader2, Search } from "lucide-react";
import {
	ArrowDownLeft,
	ArrowLeft,
	ArrowUpRight,
	Download,
	FileText,
	Loader2,
	Search,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { customersService } from "../services/customers.service";

type StatementRow = Record<string, unknown>;

const formatValue = (value: unknown) =>
	value === null || value === undefined || value === "" ? "-" : String(value);

const formatCurrency = (value: unknown) =>
	new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 2,
	}).format(Number(value) || 0);

const formatTransactionDate = (value: unknown) => {
	if (!value) return { date: "-", timezone: "" };

	const date = new Date(String(value));
	if (Number.isNaN(date.getTime())) return { date: formatValue(value), timezone: "" };

	return {
		date: date.toLocaleDateString("en-IN", {
			timeZone: "Asia/Kolkata",
			day: "2-digit",
			month: "short",
			year: "numeric",
		}),
		timezone: new Intl.DateTimeFormat("en-IN", {
			timeZone: "Asia/Kolkata",
			timeZoneName: "short",
		}).formatToParts(date).find((part) => part.type === "timeZoneName")?.value || "IST",
	};
};

const getRows = (payload: unknown): StatementRow[] => {
	if (Array.isArray(payload)) return payload as StatementRow[];
	if (!payload || typeof payload !== "object") return [];

	const data = payload as Record<string, unknown>;
	return getRows(data.data ?? data.statement ?? data.transactions ?? data.entries ?? []);
};

const escapeCsv = (value: unknown) => `"${formatValue(value).replace(/"/g, '""')}"`;

const getRowValue = (row: StatementRow, ...keys: string[]) =>
	keys.map((key) => row[key]).find((value) => value !== undefined && value !== null) ?? null;

export default function CustomerStatement() {
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const customerId = params?.id;
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");
	const [rows, setRows] = useState<StatementRow[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [generated, setGenerated] = useState(false);

	const generateStatement = async () => {
		if (!customerId) return;
		if (fromDate && toDate && fromDate > toDate) {
			setError("From date cannot be later than the to date.");
			return;
		}

		try {
			setLoading(true);
			setError("");
			const response = await customersService.getCustomerStatement(customerId, fromDate, toDate);
			setRows(getRows(response));
			setGenerated(true);
		} catch (fetchError) {
			console.error("Failed to fetch customer statement", fetchError);
			setError("Unable to load the customer statement.");
		} finally {
			setLoading(false);
		}
	};

	const exportCsv = () => {
		if (!rows.length) return;

		const columns = [
			"Sl. No.",
			"Transaction Date",
			"Document Type",
			"Document Number",
			"Entry Type",
			"Credit",
			"Debit",
			"Balance",
		];
		const csv = [
			columns.map(escapeCsv).join(","),
			...rows.map((row, index) => [
				index + 1,
				formatValue(getRowValue(row, "transactionDate", "date")),
				formatValue(getRowValue(row, "documentType", "type")),
				formatValue(getRowValue(row, "documentNumber", "documentNo", "referenceNumber")),
				formatValue(getRowValue(row, "entryType", "transactionType", "entry")),
				formatValue(getRowValue(row, "credit")),
				formatValue(getRowValue(row, "debit")),
				formatValue(getRowValue(row, "balance", "closingBalance")),
			].map(escapeCsv).join(",")),
		].join("\r\n");
		const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" }));
		const link = document.createElement("a");
		link.href = url;
		link.download = `customer-statement-${customerId}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	};

	const columns = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
	return (
		<div className="min-h-screen bg-background p-3 md:p-5 lg:p-6">
			<div className="mx-auto max-w-[1600px]">
				<button type="button" onClick={() => router.back()} className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-muted transition hover:text-primary">
					<ArrowLeft size={14} /> Back to customer dashboard
				</button>

				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary"><FileText size={20} /></div>
						<div>
							<p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">Customer Statement</p>
							<h1 className="mt-0.5 text-2xl font-bold text-text">Account statement</h1>
							<p className="mt-1 text-xs text-muted">Choose a date range to generate the customer ledger.</p>
						</div>
					</div>
					{/* <span className="rounded-full border border-[#eee] bg-surface px-3 py-1.5 text-xs font-medium text-muted">{rows.length} records</span> */}
				</div>

				<section className="rounded-[26px] border border-[#eee] bg-surface p-5 shadow-sm md:p-6">
					<div className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
						<label className="text-xs font-semibold text-text">From date
                            <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="mt-2 block h-10 w-full rounded-lg border border-[#eee] bg-background px-3 text-sm font-normal text-text outline-none focus:border-primary" />
                        </label>
						<label className="text-xs font-semibold text-text">To date
                            <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="mt-2 block h-10 w-full rounded-lg border border-[#eee] bg-background px-3 text-sm font-normal text-text outline-none focus:border-primary" />
                        </label>
						<button type="button" onClick={generateStatement} disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
							{loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />} Generate statement
						</button>
						<button type="button" onClick={exportCsv} disabled={!rows.length} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#eee] bg-surface px-4 text-xs font-semibold text-text transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50">
							<Download size={14} /> Export CSV
						</button>
					</div>
					{error && <p className="mt-3 text-xs font-medium text-red-600">{error}</p>}
				</section>

				<section className="mt-5 overflow-hidden rounded-[26px] border border-[#eee] bg-surface shadow-sm">
					{!generated ? (
						<div className="flex min-h-[280px] items-center justify-center p-6 text-sm text-muted">Select a date range and generate the statement.</div>
					) : rows.length === 0 ? (
						<div className="flex min-h-[280px] items-center justify-center p-6 text-sm text-muted">No statement records found for this date range.</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full min-w-[1050px] text-left text-sm">
								<thead className="border-b border-[#eee] bg-background">
									<tr>
										<th className="w-16 px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Sl. No.</th>
										<th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Transaction Date</th>
										<th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Document Type</th>
										<th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Document Number</th>
										<th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Entry Type</th>
										<th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Credit</th>
										<th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Debit</th>
										<th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Balance</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-[#eee]">
									{rows.map((row, index) => {
										const transactionDate = formatTransactionDate(getRowValue(row, "transactionDate", "date"));
										const documentType = getRowValue(row, "documentType", "type");
										const documentNumber = getRowValue(row, "documentNumber", "documentNo", "referenceNumber");
										const entryType = getRowValue(row, "entryType", "transactionType", "entry");
										const credit = getRowValue(row, "credit");
										const debit = getRowValue(row, "debit");
										const balance = getRowValue(row, "balance", "closingBalance");

										return (
											<tr key={String(row.id ?? index)} className="hover:bg-background">
												<td className="px-5 py-4 font-semibold text-muted">{index + 1}</td>
												<td className="whitespace-nowrap px-5 py-4 text-text"><p className="font-semibold">{transactionDate.date}</p><p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">{transactionDate.timezone}</p></td>
												<td className="whitespace-nowrap px-5 py-4"><span className="inline-flex rounded-full bg-secondary px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-primary">{formatValue(documentType)}</span></td>
												<td className="whitespace-nowrap px-5 py-4 font-semibold text-text">{formatValue(documentNumber)}</td>
												<td className="whitespace-nowrap px-5 py-4 text-muted">{formatValue(entryType)}</td>
												<td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-green-600"><span className="inline-flex items-center gap-1.5"><ArrowDownLeft size={14} />{formatCurrency(credit)}</span></td>
												<td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-red-600"><span className="inline-flex items-center gap-1.5"><ArrowUpRight size={14} />{formatCurrency(debit)}</span></td>
												<td className="whitespace-nowrap px-5 py-4 text-right font-bold text-text">{formatCurrency(balance)}</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
