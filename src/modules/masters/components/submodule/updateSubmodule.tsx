import { Pencil, Trash2 } from "lucide-react";
import type { Submodule } from "@/modules/masters/types";

interface SubmoduleTableRowProps {
  submodule: Submodule;
  onEdit: (submodule: Submodule) => void;
  onDelete: (id: string | number | undefined) => void;
}

export default function SubmoduleTableRow({ submodule, onEdit, onDelete }: SubmoduleTableRowProps) {
  return (
    <tr className="border-b border-gray-200 transition hover:bg-gray-50">
      <td className="px-6 py-4 text-sm text-gray-900">{submodule.name}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{submodule.priority}</td>
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center gap-2">
          <button
            onClick={() => onEdit(submodule)}
            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onDelete(submodule.id)}
            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
