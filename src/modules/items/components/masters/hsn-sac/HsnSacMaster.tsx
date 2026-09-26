"use client";

import { useRef, useState } from "react";
import { FileSpreadsheet, RefreshCw, Upload } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, Pagination, Search, TableToolbar } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { hsnSacService } from "../../../services/hsn-sac.service";
import { useHsnSac } from "../../../hooks/useHsnSac";
import type { HsnSac, HsnSacImportSummary } from "../../../types/hsn-sac";
import { validateHsnSacWorkbook } from "../../../utils/hsn-sac-validation";

const columns: ColumnDef<HsnSac>[] = [
  {
    id: "code",
    header: "Code",
    cell: ({ row }) => row.original.code || row.original.hsnCode || row.original.sacCode || "-",
  },
  { accessorKey: "description", header: "Description" },
  {
    id: "type",
    header: "Type",
    cell: ({ row }) => row.original.type || (row.original.hsnCode ? "HSN" : row.original.sacCode ? "SAC" : "-"),
  },
];


function getSummary(data: unknown): HsnSacImportSummary | null {
  const summary = (data as { data?: HsnSacImportSummary })?.data ?? data;
  if (!summary || typeof summary !== "object") return null;
  const values = summary as Partial<HsnSacImportSummary>;
  return {
    created: Number(values.created ?? 0),
    updated: Number(values.updated ?? 0),
    skipped: Number(values.skipped ?? 0),
    failed: Number(values.failed ?? 0),
    total: values.total === undefined ? undefined : Number(values.total),
  };
}

export default function HsnSacMaster() {
  const [activeTab, setActiveTab] = useState("product");
  const activeType: HsnSac["type"] = activeTab === "service" ? "SAC" : "HSN";
  const { records, loading, page, totalPages, totalRecords, search, refetch, setPage, changePage, setSearch } = useHsnSac(activeType);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (nextTab: string) => {
    const nextType = nextTab === "service" ? "SAC" : "HSN";
    setActiveTab(nextTab);
    setPage(1);
    void refetch(1, nextType);
  };

  async function handleImport(file?: File) {
    if (!file) return;
    const validationError = await validateHsnSacWorkbook(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setImporting(true);
      const response = await hsnSacService.importExcel(file);
      const summary = getSummary(response?.data);
      toast.success(summary
        ? `Import complete: ${summary.created} created, ${summary.updated} updated, ${summary.skipped} skipped, ${summary.failed} failed.`
        : "HSN/SAC Excel imported successfully.");
      await refetch(page);
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "The HSN/SAC Excel could not be imported.");
    } finally {
      setImporting(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleExport() {
    try {
      setExporting(true);
      const response = await hsnSacService.exportExcel();
      const blob = new Blob([response?.data], {
        type:
          typeof response?.headers?.["content-type"] === "string"
            ? response.headers["content-type"]
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "hsn-sac.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("HSN/SAC exported successfully.");
    } catch {
      toast.error("Failed to export HSN/SAC Excel.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">HSN/SAC Master</h1>
          <p className="text-gray-500">Maintain official HSN and SAC codes from the GST portal.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" disabled={exporting} onClick={handleExport}>
            {exporting ? <RefreshCw className="animate-spin" /> : <FileSpreadsheet />}
            {exporting ? "Exporting..." : "Export Excel"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(event) => void handleImport(event.target.files?.[0])}
          />
          <Button type="button" disabled={importing} onClick={() => inputRef.current?.click()}>
            {importing ? <RefreshCw className="animate-spin" /> : <Upload />}
            {importing ? "Importing..." : "Import Excel"}
          </Button>
        </div>
      </div>

      <TableToolbar>
        <div className="flex items-center gap-4 w-full">
          <Search placeholder="Search HSN/SAC code or description..." value={search} onChange={setSearch} debounceMs={400} />
          <div className="flex-1" />
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <FileSpreadsheet className="size-4" /> Official Excel source only
          </div>
        </div>
        <div className="mt-3">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="rounded-lg border bg-slate-100 p-[3px]">
              <TabsTrigger value="product" className="data-[active]:bg-white data-[active]:text-foreground">Products</TabsTrigger>
              <TabsTrigger value="service" className="data-[active]:bg-white data-[active]:text-foreground">Services</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </TableToolbar>

      <DataTable columns={columns} data={records} loading={loading || importing} emptyMessage="No HSN/SAC records found." page={page} pageSize={10} />
      <Pagination page={page} totalPages={totalPages} totalRecords={totalRecords} onPageChange={changePage} />
    </div>
  );
}
