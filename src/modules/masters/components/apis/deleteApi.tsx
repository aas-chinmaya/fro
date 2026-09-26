import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface DeleteApiDialogProps {
  open: boolean;
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteApiDialog({ open, name, onConfirm, onCancel }: DeleteApiDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete API"
      description={`Are you sure you want to delete ${name}?`}
      confirmLabel="Delete"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
