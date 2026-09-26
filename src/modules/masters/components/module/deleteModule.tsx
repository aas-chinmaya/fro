import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DeleteModuleDialogProps {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModuleDialog({ open, name, onConfirm, onCancel }: DeleteModuleDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete Module"
      description={`Are you sure you want to delete ${name}?`}
      confirmLabel="Delete"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
