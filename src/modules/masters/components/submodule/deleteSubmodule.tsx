import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DeleteSubmoduleDialogProps {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteSubmoduleDialog({ open, name, onConfirm, onCancel }: DeleteSubmoduleDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete Submodule"
      description={`Are you sure you want to delete ${name}?`}
      confirmLabel="Delete"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
