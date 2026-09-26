import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DeleteFeatureDialogProps {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteFeatureDialog({ open, name, onConfirm, onCancel }: DeleteFeatureDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete Feature"
      description={`Are you sure you want to delete ${name}?`}
      confirmLabel="Delete"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
