"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Container from "@/components/common/Container";
import BranchForm, { BranchFormData } from "@/modules/business/components/BranchForm";
import {
	createBranch,
	fetchBranchById,
	fetchBusinesses,
	selectBusinessRecords,
	selectBusinessStatus,
	updateBranch,
} from "@/modules/business/store/businessSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function AddBranchPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const dispatch = useAppDispatch();
	const businessId = searchParams.get("businessId") ?? searchParams.get("id");
	const branchId = searchParams.get("branchId");
	const businesses = useAppSelector(selectBusinessRecords);
	const businessStatus = useAppSelector(selectBusinessStatus);
	const [branch, setBranch] = useState<Record<string, unknown> | null>(null);
	const [branchLoading, setBranchLoading] = useState(Boolean(branchId));
	const [branchError, setBranchError] = useState<string | null>(null);

	useEffect(() => {
		if (businessStatus === "idle") {
			void dispatch(fetchBusinesses());
		}
	}, [businessStatus, dispatch]);

	useEffect(() => {
		if (!branchId) return;

		setBranchLoading(true);
		void dispatch(fetchBranchById(branchId))
			.unwrap()
			.then((result) => setBranch(result))
			.catch((error: unknown) => {
				setBranchError(error instanceof Error ? error.message : "Unable to load branch.");
			})
			.finally(() => setBranchLoading(false));
	}, [branchId, dispatch]);

	const business = businesses.find((record) => String(record.id) === businessId);

	const handleSubmit = async (data: BranchFormData) => {
		if (!branchId && (!data.users || data.users.length === 0)) {
			throw new Error("At least one branch user is required.");
		}

		const payload = {
			branchName: data.branchName,
			branchCode: data.branchCode,
			addressLine1: data.address1,
			phone: data.phone,
			email: data.email,
			pincode: data.pincode,
			country: data.country,
			state: data.state,
			city: data.city,
			status: data.status.toUpperCase(),
			licenseNumber: data.licenseNumber,
			GSTIN: data.GSTIN,
			PAN: data.PAN,
			note: data.note,
			openingDate: data.openingDate || undefined,
			isActive: data.status.toUpperCase() === "ACTIVE",
			users: !branchId ? data.users.map((user) => ({
				fullName: user.fullName,
				email: user.email,
				password: user.password,
				contact: user.contact,
				roleId: user.roleId,
			})) : undefined,
		};

		if (branchId) {
			await dispatch(updateBranch({ branchId, payload })).unwrap();
		} else if (business?.tenantId !== undefined) {
			await dispatch(createBranch({ tenantId: business.tenantId, payload })).unwrap();
		} else {
			throw new Error("Business tenant is missing.");
		}

		const redirectTo = `/business-setup/manage-business/view?id=${businessId ?? business?.id ?? ""}`;
		router.push(redirectTo);
	};

	if (!businessId) {
		return (
			<Container className="py-8">
				<p className="text-center text-muted">Business id is missing in the URL.</p>
			</Container>
		);
	}

	if (businessStatus === "loading" || !business || branchLoading) {
		return (
			<Container className="py-8">
				<p className="text-center text-muted">
					{branchError ?? (branchLoading || businessStatus === "loading" ? "Loading branch..." : "Business not found.")}
				</p>
			</Container>
		);
	}

	return (
		<Container className="py-8">
			<div className="mb-6">
				<h1 className="text-3xl font-bold text-text">{branchId ? "Edit Branch" : "Add Branch"}</h1>
				<p className="mt-1 text-muted">{branchId ? "Update branch details." : `Create a new branch for ${business.displayName ?? business.legalName ?? "this business"}.`}</p>
			</div>

			<BranchForm
				initialValues={branch ? {
					branchName: String(branch.branchName ?? ""),
					branchCode: String(branch.branchCode ?? ""),
					status: String(branch.status ?? "ACTIVE").toUpperCase() === "INACTIVE" ? "Inactive" : "Active",
					address1: String(branch.addressLine1 ?? ""),
					country: String(branch.country ?? "India"),
					state: String(branch.state ?? ""),
					city: String(branch.city ?? ""),
					pincode: String(branch.pincode ?? ""),
					phone: String(branch.phone ?? ""),
					email: String(branch.email ?? ""),
					licenseNumber: String(branch.licenseNumber ?? ""),
					GSTIN: String(branch.GSTIN ?? ""),
					PAN: String(branch.PAN ?? ""),
					openingDate: branch.openingDate ? String(branch.openingDate).slice(0, 10) : "",
					note: String(branch.note ?? ""),
					users: (() => {
						const branchUsers = Array.isArray(branch.users) ? branch.users : [];
						return branchUsers.length > 0
							? branchUsers.map((user: Record<string, unknown>) => ({
								fullName: String(user.fullName ?? user.name ?? ""),
								email: String(user.email ?? ""),
								password: "",
								contact: String(user.contact ?? ""),
								roleId: String(user.roleId ?? ""),
							}))
							: [{
								fullName: "",
								email: "",
								password: "",
								contact: "",
								roleId: "",
							}];
					})(),
				} : undefined}
				onCancel={() => router.push("/business-setup/manage-business")}
				onSubmit={handleSubmit}
			/>
		</Container>
	);
}
