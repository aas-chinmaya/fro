import { Pencil, Trash2 } from "lucide-react";
import type { Feature } from "@/modules/masters/types";

interface FeatureTableRowProps {
  feature: Feature;
  onEdit: (feature: Feature) => void;
  onDelete: (id: string | number | undefined) => void;
}

export default function FeatureTableRow({ feature, onEdit, onDelete }: FeatureTableRowProps) {
  return (
    <tr className="border-b border-gray-200 transition hover:bg-gray-50">
      <td className="px-6 py-4 text-sm text-gray-900">{feature.name}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{feature.route}</td>
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center gap-2">
          <button
            onClick={() => onEdit(feature)}
            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => onDelete(feature.id)}
            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}
