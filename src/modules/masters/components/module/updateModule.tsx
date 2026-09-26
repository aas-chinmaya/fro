import { Pencil, Trash2 } from "lucide-react";
import type { Module } from "@/modules/masters/types";

interface ModuleTableRowProps {
  module: Module;
  selectedModuleId?: string | number | null;
  onSelect: (module: Module) => void;
  onEdit: (module: Module) => void;
  onDelete: (id: string | number | undefined) => void;
}

export default function ModuleTableRow({
  module,
  selectedModuleId,
  onSelect,
  onEdit,
  onDelete,
}: ModuleTableRowProps) {
  return (
    <tr
      onClick={() => onSelect(module)}
      className={`cursor-pointer border-b border-gray-200 transition ${selectedModuleId === module.id ? "bg-indigo-50" : "hover:bg-gray-50"}`}
    >
      <td className="px-6 py-4 text-sm text-black">{module.name}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{module.priority}</td>
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(module);
            }}
            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(module.id);
            }}
            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
