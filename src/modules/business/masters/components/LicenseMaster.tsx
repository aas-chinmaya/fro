"use client";

import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { BadgeCheck, Pencil, Plus, Trash2 } from "lucide-react";

import {
	Alert,
	AlertDescription,
	Badge,
	Button,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	Switch,
	Textarea,
} from "@/components/ui";
import { FormField } from "@/components/form";
import {
	DataTable,
	NoData,
	Pagination,
	Search,
	TableToolbar,
} from "@/components/data-table";
import { licenseTypeMasterService } from "@/modules/business/masters/services/master.service";

export interface LicenseType {
	id: string | number;
	licenseTypeName: string;
	description: string | null;
	icon: string | null;
	status: boolean;
	updatedAt: string;
}

interface LicenseTypePayload {
	licenseTypeName: string;
	description: string | null;
	icon: string | null;
	status: boolean;
}

type BannerState = { type: "success" | "error"; text: string } | null;
type ModalState = { mode: "add" } | { mode: "edit"; row: LicenseType } | null;

const PAGE_SIZE = 8;

export default function LicenseMaster() {
	const [rows, setRows] = useState<LicenseType[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | "true" | "false">("all");
	const [page, setPage] = useState(1);
	const [banner, setBanner] = useState<BannerState>(null);
	const [modal, setModal] = useState<ModalState>(null);
	const [confirmDelete, setConfirmDelete] = useState<LicenseType | null>(null);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const bannerTimer = React.useRef<number | undefined>(undefined);
	const showBanner = (type: "success" | "error", text: string) => {
		setBanner({ type, text });
		window.clearTimeout(bannerTimer.current);
		bannerTimer.current = window.setTimeout(() => setBanner(null), 3500);
	};

	const fetchRows = useCallback(async () => {
		setLoading(true);
		try {
			const data = await licenseTypeMasterService.list();
			const query = search.trim().toLowerCase();
			const rowsFromApi: LicenseType[] = Array.isArray(data)
				? data.map((row) => ({
						id: row.id,
						licenseTypeName: typeof row.licenseTypeName === "string" ? row.licenseTypeName : "",
						description: typeof row.description === "string" ? row.description : null,
						icon: typeof row.icon === "string" ? row.icon : null,
						status: typeof row.status === "boolean" ? row.status : Boolean(row.status),
						updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : "",
					}))
				: [];
			const filtered = rowsFromApi.filter((row) => {
				const matchesSearch =
					!query ||
					row.licenseTypeName.toLowerCase().includes(query) ||
					row.description?.toLowerCase().includes(query);
				const matchesStatus =
					statusFilter === "all" || row.status === (statusFilter === "true");
				return matchesSearch && matchesStatus;
			});
			setRows(filtered);
		} catch (error) {
			setRows([]);
			showBanner("error", licenseTypeMasterService.getErrorMessage(error, "Unable to load license types."));
		} finally {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search, statusFilter]);

	useEffect(() => {
		fetchRows();
	}, [fetchRows]);

	useEffect(() => setPage(1), [search, statusFilter]);

	const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
	const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	const handleCreate = async (payload: LicenseTypePayload) => {
		setSaving(true);
		try {
			await licenseTypeMasterService.create({
				licenseTypeName: payload.licenseTypeName,
				description: payload.description,
				icon: payload.icon,
			});
			showBanner("success", `"${payload.licenseTypeName}" added.`);
			setModal(null);
			await fetchRows();
		} catch (error) {
			showBanner("error", licenseTypeMasterService.getErrorMessage(error, "Failed to create license type."));
		} finally {
			setSaving(false);
		}
	};

	const handleUpdate = async (id: string | number, payload: LicenseTypePayload) => {
		setSaving(true);
		try {
			await licenseTypeMasterService.update(id, { ...payload });
			showBanner("success", "License type updated.");
			setModal(null);
			await fetchRows();
		} catch (error) {
			showBanner("error", licenseTypeMasterService.getErrorMessage(error, "Failed to update license type."));
		} finally {
			setSaving(false);
		}
	};

	const handleToggleStatus = async (row: LicenseType) => {
		try {
			await licenseTypeMasterService.update(row.id, { status: !row.status });
			showBanner("success", `Marked ${!row.status ? "active" : "inactive"}.`);
			await fetchRows();
		} catch (error) {
			showBanner("error", licenseTypeMasterService.getErrorMessage(error, "Failed to update status."));
		}
	};

	const handleDelete = async (row: LicenseType) => {
		setDeleting(true);
		try {
			await licenseTypeMasterService.remove(row.id);
			showBanner("success", `"${row.licenseTypeName}" deleted.`);
			setConfirmDelete(null);
			await fetchRows();
		} catch (error) {
			showBanner("error", licenseTypeMasterService.getErrorMessage(error, "Failed to delete license type."));
		} finally {
			setDeleting(false);
		}
	};

	const columns: ColumnDef<LicenseType>[] = [
		{
			accessorKey: "licenseTypeName",
			header: "License type",
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<BadgeCheck className="h-4 w-4 text-primary" />
					<span className="font-medium text-gray-900">{row.original.licenseTypeName}</span>
				</div>
			),
		},
		{
			accessorKey: "description",
			header: "Description",
			cell: ({ row }) => (
				<span className="block max-w-xs truncate text-gray-500">{row.original.description || "—"}</span>
			),
		},
		{
			accessorKey: "icon",
			header: "Icon",
			cell: ({ row }) => <span className="text-gray-500">{row.original.icon || "—"}</span>,
		},
		{
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<Switch
						checked={row.original.status}
						onCheckedChange={() => handleToggleStatus(row.original)}
						aria-label={`Mark ${row.original.licenseTypeName} ${row.original.status ? "inactive" : "active"}`}
					/>
					<Badge variant={row.original.status ? "success" : "danger"}>
						{row.original.status ? "Active" : "Inactive"}
					</Badge>
				</div>
			),
			size: 160,
		},
		{
			id: "actions",
			header: () => <span className="sr-only">Actions</span>,
			cell: ({ row }) => (
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						aria-label={`Edit ${row.original.licenseTypeName}`}
						onClick={() => setModal({ mode: "edit", row: row.original })}
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						aria-label={`Delete ${row.original.licenseTypeName}`}
						className="text-red-600 hover:bg-red-50 hover:text-red-700"
						onClick={() => setConfirmDelete(row.original)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
			enableSorting: false,
			enableHiding: false,
			size: 60,
		},
	];

	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
						<BadgeCheck className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h1 className="text-xl font-semibold text-gray-900">License Types</h1>
						<p className="text-sm text-muted">
							Master table &middot; {rows.length} record{rows.length !== 1 ? "s" : ""}
						</p>
					</div>
				</div>
				<Button onClick={() => setModal({ mode: "add" })}>
					<Plus className="mr-2 h-4 w-4" />
					Add license type
				</Button>
			</div>

			{banner && (
				<Alert variant={banner.type === "success" ? "success" : "error"}>
					<AlertDescription>{banner.text}</AlertDescription>
				</Alert>
			)}

			<TableToolbar>
				<div className="flex flex-1 flex-wrap items-center gap-3">
					<Search value={search} onChange={setSearch} placeholder="Search license types..." />
					<select
						aria-label="Filter license types by status"
						value={statusFilter}
						onChange={(event) => setStatusFilter(event.target.value as "all" | "true" | "false")}
						className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-primary"
					>
						<option value="all">All status</option>
						<option value="true">Active</option>
						<option value="false">Inactive</option>
					</select>
				</div>
			</TableToolbar>

			{!loading && rows.length === 0 ? (
				<NoData
					title="No license types found"
					description="Try a different search or filter, or add a new license type."
					buttonText="Clear filters"
					onReset={() => {
						setSearch("");
						setStatusFilter("all");
					}}
				/>
			) : (
				<>
					<DataTable columns={columns} data={pageRows} loading={loading} emptyMessage="No license types found." />
					{totalPages > 1 && (
						<Pagination
							page={page}
							totalPages={totalPages}
							totalRecords={rows.length}
							pageSize={PAGE_SIZE}
							onPageChange={setPage}
						/>
					)}
				</>
			)}

			<LicenseTypeFormModal
				open={modal !== null}
				mode={modal?.mode ?? "add"}
				row={modal?.mode === "edit" ? modal.row : undefined}
				saving={saving}
				onOpenChange={(open) => !open && setModal(null)}
				onSubmit={(payload) =>
					modal?.mode === "edit" ? handleUpdate(modal.row.id, payload) : handleCreate(payload)
				}
			/>

			<Modal open={confirmDelete !== null} onOpenChange={(open) => !open && setConfirmDelete(null)}>
				<ModalContent>
					<ModalHeader>
						<ModalTitle>Delete license type?</ModalTitle>
						<ModalDescription>
							This will remove <span className="font-medium text-gray-700">"{confirmDelete?.licenseTypeName}"</span>.
							Businesses linked to it may keep referencing this id, but it will no longer appear in active lists.
						</ModalDescription>
					</ModalHeader>
					<ModalFooter>
						<Button variant="outline" onClick={() => setConfirmDelete(null)} disabled={deleting}>
							Cancel
						</Button>
						<Button variant="danger" onClick={() => confirmDelete && handleDelete(confirmDelete)} disabled={deleting}>
							{deleting ? "Deleting..." : "Delete"}
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</div>
	);
}

interface LicenseTypeFormModalProps {
	open: boolean;
	mode: "add" | "edit";
	row?: LicenseType;
	saving: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (payload: LicenseTypePayload) => void;
}

function LicenseTypeFormModal({ open, mode, row, saving, onOpenChange, onSubmit }: LicenseTypeFormModalProps) {
	const [name, setName] = useState(row?.licenseTypeName || "");
	const [description, setDescription] = useState(row?.description || "");
	const [icon, setIcon] = useState(row?.icon || "");
	const [status, setStatus] = useState(row?.status ?? true);
	const [error, setError] = useState("");

	useEffect(() => {
		if (open) {
			setName(row?.licenseTypeName || "");
			setDescription(row?.description || "");
			setIcon(row?.icon || "");
			setStatus(row?.status ?? true);
			setError("");
		}
	}, [open, row]);

	const submit = (event: React.FormEvent) => {
		event.preventDefault();
		if (!name.trim()) {
			setError("License type name is required.");
			return;
		}
		setError("");
		onSubmit({
			licenseTypeName: name.trim(),
			description: description.trim() || null,
			icon: icon.trim() || null,
			status,
		});
	};

	return (
		<Modal open={open} onOpenChange={onOpenChange}>
			<ModalContent>
				<form onSubmit={submit}>
					<ModalHeader>
						<ModalTitle>{mode === "add" ? "Add license type" : "Edit license type"}</ModalTitle>
						<ModalDescription>
							{mode === "add" ? "Create a new entry in the license types master table." : "Update this license type's details."}
						</ModalDescription>
					</ModalHeader>
					<ModalBody className="space-y-4">
						<FormField label="License type name" required error={error || undefined}>
							<Input
								autoFocus
								value={name}
								onChange={(event) => setName(event.target.value)}
								placeholder="e.g. Trade license"
							/>
						</FormField>
						<FormField label="Description">
							<Textarea
								value={description}
								onChange={(event) => setDescription(event.target.value)}
								rows={3}
								placeholder="Short description..."
							/>
						</FormField>
						<FormField label="Icon">
							<Input
								value={icon}
								onChange={(event) => setIcon(event.target.value)}
								placeholder="e.g. BadgeCheck"
							/>
						</FormField>
						<FormField label="Status">
							<div className="flex items-center gap-2">
								<Switch checked={status} onCheckedChange={setStatus} />
								<span className="text-sm text-gray-600">{status ? "Active" : "Inactive"}</span>
							</div>
						</FormField>
					</ModalBody>
					<ModalFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={saving}>
							{saving ? "Saving..." : mode === "add" ? "Add license type" : "Save changes"}
						</Button>
					</ModalFooter>
				</form>
			</ModalContent>
		</Modal>
	);
}
