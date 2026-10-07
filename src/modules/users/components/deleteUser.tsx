"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { User } from "@/modules/users/types";

interface DeleteUserProps {
  user: User;
  onDelete: () => Promise<void> | void;
}

export default function DeleteUser({ user, onDelete }: DeleteUserProps) {
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onDelete();
      setIsConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 hover:text-red-600"
        title="Delete user"
        aria-label={`Delete ${user.fullName}`}
        onClick={() => setIsConfirmOpen(true)}
        disabled={loading}
      >
        <Trash2 className="h-5 w-5" />
      </Button>

      <ConfirmDialog
        open={isConfirmOpen}
        title="Delete user?"
        description={`Are you sure you want to delete ${user.fullName}?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}
