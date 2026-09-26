"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Eye, FileText, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { customersService } from "../services/customers.service";
import { invoiceApi } from "../../sales/invoice/api/invoice.api";
import InvoiceView from "../../sales/invoice/components/view/invoice-view";

const formatCurrency = (value) =>
	new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 2,
	}).format(Number(value) || 0);

const formatDate = (value) => {
	if (!value) return "N/A";
	return new Date(value).toLocaleDateString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
};

export default function PurchaseHistory() {
	const router = useRouter();
	const params = useParams();
	const customerId = params?.id;
	const [purchases, setPurchases] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [selectedInvoice, setSelectedInvoice] = useState(null);
	const [invoiceLoading, setInvoiceLoading] = useState(false);
	const [invoiceError, setInvoiceError] = useState(false);

	const handleViewInvoice = async (purchase) => {
		const invoiceId = purchase.invoiceId || purchase.id;
		if (!invoiceId) return;

		try {
			setInvoiceLoading(true);
			setInvoiceError(false);
			const response = await invoiceApi.getInvoiceById(invoiceId);
			setSelectedInvoice(response?.data || response);
		} catch (fetchError) {
			console.error("Failed to fetch invoice", fetchError);
			setInvoiceError(true);
		} finally {
			setInvoiceLoading(false);
		}
	};

	useEffect(() => {
		const fetchPurchases = async () => {
			if (!customerId) return;

			try {
				setLoading(true);
				setError(false);
				const response = await customersService.getCustomerPurchaseHistory(customerId);
				const payload = response?.data || response;
				setPurchases(Array.isArray(payload) ? payload : payload?.purchases || payload?.purchaseHistory || []);
			} catch (fetchError) {
				console.error("Failed to fetch customer purchase history", fetchError);
				setError(true);
			} finally {
				setLoading(false);
			}
		};

		fetchPurchases();
	}, [customerId]);

	if (selectedInvoice) {
		return (
			<div className="min-h-screen bg-background">
				<div className="px-6 pt-6 lg:px-8">
					<button
						type="button"
						onClick={() => setSelectedInvoice(null)}
						className="inline-flex items-center gap-2 text-xs font-semibold text-muted transition hover:text-primary"
					>
						<ArrowLeft size={14} />
						Back to purchase history
					</button>
				</div>
				<InvoiceView invoice={selectedInvoice} />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background p-3 md:p-5 lg:p-6">
			<div className="mx-auto max-w-[1600px]">

				{/* Header */}
				<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<button type="button" onClick={() => router.back()} className="mb-4 inline-flex items-center gap-2 text-xs font-semibold text-muted transition hover:text-primary">
							<ArrowLeft size={14} />
							Back to customer dashboard
						</button>

						<div className="flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
								<FileText size={20} />
							</div>

							<div>
								<p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
									Purchase History
								</p>

								<h1 className="mt-0.5 text-2xl font-bold text-text">
									All purchases
								</h1>

								<p className="mt-1 text-xs text-muted">
									Complete invoice and payment history
								</p>
							</div>
						</div>
					</div>

					<span className="self-start rounded-full border border-[#eee] bg-surface px-3 py-1.5 text-xs font-medium text-muted sm:self-auto">
						{purchases.length} {purchases.length === 1 ? "record" : "records"}
					</span>
				</div>

				{/* Purchase History */}
				<section className="overflow-hidden rounded-[26px] border border-[#eee] bg-surface shadow-sm">

					{/* Section Heading */}
					<div className="border-b border-[#eee] px-6 py-5">
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<div className="flex items-center gap-2">
									<span className="h-2 w-2 rounded-full bg-primary" />
									<p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
										Invoice Activity
									</p>
								</div>

								<h2 className="mt-1 text-lg font-bold text-text">
									Recent purchases
								</h2>
							</div>

							<span className="rounded-full bg-secondary px-3 py-1.5 text-[10px] font-semibold text-muted">
								Invoice & payment details
							</span>
						</div>
					</div>

					{loading ? (
						<div className="flex min-h-[350px] flex-col items-center justify-center">
							<Loader2 size={25} className="animate-spin text-primary" />
							<p className="mt-3 text-sm font-medium text-muted">
								Loading purchase history...
							</p>
						</div>
					) : error ? (
						<div className="flex min-h-[350px] items-center justify-center p-6 text-center text-sm text-muted">
							Unable to load this customer&apos;s purchase history.
						</div>
					) : purchases.length ? (

						<div className="divide-y divide-[#eee]">

							{purchases.map((purchase) => (
								<div
									key={purchase.id}
									className="group px-6 py-5 transition-colors duration-200 hover:bg-background"
								>

									<div className="grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-center">

										{/* LEFT — Invoice Information */}
										<div className="flex min-w-0 items-center gap-4">

											<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
												<FileText size={18} />
											</div>

											<div className="min-w-0">
												<div className="flex flex-wrap items-center gap-2">
													<h3 className="truncate text-sm font-bold text-text">
														{purchase.invoiceNumber || "Draft invoice"}
													</h3>

													<span className="rounded-full bg-secondary px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-muted">
														{purchase.invoiceType || "N/A"}
													</span>
												</div>

												<div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
													<p className="text-[11px] text-muted">
														Invoice date:{" "}
														<span className="font-medium text-text">
															{formatDate(purchase.invoiceDate)}
														</span>
													</p>

													<span className="hidden h-1 w-1 rounded-full bg-[#ccc] sm:block" />

													<p className="text-[11px] text-muted">
														Invoice record
													</p>
												</div>
											</div>

										</div>

										{/* RIGHT — Financial Information */}
										<div className="grid grid-cols-3 divide-x divide-[#eee] rounded-2xl bg-background">

											<div className="px-4 py-3">
												<p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
													Total
												</p>

												<p className="mt-1 text-sm font-bold text-text">
													{formatCurrency(purchase.grandTotal)}
												</p>
											</div>

											<div className="px-4 py-3">
												<p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
													Paid
												</p>

												<p className="mt-1 text-sm font-bold text-green-600">
													{formatCurrency(purchase.paidAmount)}
												</p>
											</div>

											<div className="px-4 py-3">
												<p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
													Due
												</p>

												<p className="mt-1 text-sm font-bold text-primary">
													{formatCurrency(purchase.pendingAmount)}
												</p>
											</div>

										</div>

									</div>

									{/* Bottom Status Line */}
									<div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#eee] pt-3">

										<div className="flex items-center gap-2">
											<span className="text-[10px] uppercase tracking-[0.12em] text-muted">
												Payment status
											</span>

											<span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-muted">
												<span className="h-1.5 w-1.5 rounded-full bg-primary" />
												{purchase.invoiceStatus || "N/A"}
											</span>
										</div>

										<div className="flex flex-wrap items-center gap-4">
											<button
												type="button"
												disabled={!purchase.invoiceId && !purchase.id}
												onClick={() => handleViewInvoice(purchase)}
												className="inline-flex items-center gap-1.5 rounded-full bg-text px-3 py-1.5 text-[10px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
												>
												<Eye size={13} />
												View invoice
											</button>

											<div className="text-[10px] text-muted">
											Outstanding:{" "}
											<span className="font-semibold text-primary">
												{formatCurrency(purchase.pendingAmount)}
											</span>
										</div>

										{invoiceLoading && (
											<span className="text-[10px] text-muted">Loading invoice...</span>
										)}
										{invoiceError && (
											<span className="text-[10px] text-red-600">Unable to load invoice.</span>
										)}
										</div>

									</div>

								</div>
							))}

						</div>

					) : (
						<div className="flex min-h-[350px] flex-col items-center justify-center p-6 text-center">

							<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
								<FileText size={22} />
							</div>

							<h2 className="mt-4 text-sm font-semibold text-text">
								No purchase history
							</h2>

							<p className="mt-1 max-w-sm text-xs text-muted">
								Purchases will appear here once invoices are recorded.
							</p>

						</div>
					)}

				</section>
			</div>
		</div>
	);
}
