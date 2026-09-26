import { Pencil, Trash2 } from "lucide-react";
import type { API } from "@/modules/masters/types";

interface ApiTableRowProps {
  api: API;
  onEdit: (api: API) => void;
  onDelete: (id: string | number | undefined) => void;
}

export default function ApiTableRow({ api, onEdit, onDelete }: ApiTableRowProps) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-4 text-sm text-gray-900">{api.name}</td>
      <td className="px-6 py-4 text-sm">
        <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
          {api.method}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600">{api.route}</td>
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center gap-2">
          <button
            onClick={() => onEdit(api)}
            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onDelete(api.id)}
            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
