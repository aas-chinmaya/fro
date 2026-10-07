import { Boxes } from "lucide-react";

export interface WarehouseTableRow {
  id: string;
  number: string;
  parent?: string;
  status: unknown;
}

interface WarehouseRecordTableProps {
  rows: WarehouseTableRow[];
  loading: boolean;
  name: string;
  parentColumn?: string;
}

function isActive(status: unknown) {
  return status === true || String(status).toLowerCase() === "active" || String(status).toLowerCase() === "true";
}

export default function WarehouseRecordTable({ rows, loading, name, parentColumn }: WarehouseRecordTableProps) {
  const columnCount = parentColumn ? 4 : 3;

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="w-20 px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">{name} No</th>
              {parentColumn && <th className="px-5 py-3 font-medium">{parentColumn}</th>}
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={columnCount} className="px-5 py-12 text-center text-slate-500">Loading {name.toLowerCase()}...</td></tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="px-5 py-14 text-center">
                  <Boxes className="mx-auto mb-3 text-slate-300" size={28} aria-hidden="true" />
                  <p className="font-medium text-slate-700">No {name.toLowerCase()} found</p>
                  <p className="mt-1 text-sm text-slate-500">Add a {name.toLowerCase()} to get started.</p>
                </td>
              </tr>
            ) : rows.map((row, index) => (
              <tr key={row.id} className="text-slate-700">
                <td className="px-5 py-3.5 text-slate-500">{index + 1}</td>
                <td className="px-5 py-3.5 font-medium text-slate-900">{row.number}</td>
                {parentColumn && <td className="px-5 py-3.5">{row.parent || "-"}</td>}
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-2 ${isActive(row.status) ? "text-emerald-700" : "text-slate-500"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive(row.status) ? "bg-emerald-500" : "bg-slate-400"}`} />
                    {isActive(row.status) ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}