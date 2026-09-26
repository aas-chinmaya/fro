"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import type { User } from "@/modules/users/types";

interface DeleteUserProps {
  user: User;
  onDelete: () => Promise<void> | void;
}

export default function DeleteUser({
  user,
  onDelete,
}: DeleteUserProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const openConfirmDialog = () => {
    setIsConfirmOpen(true);
  };

  const closeConfirmDialog = () => {
    if (!loading) {
      setIsConfirmOpen(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);

    try {
      await onDelete();
      setIsConfirmOpen(false);
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="danger"
        size="sm"
        onClick={openConfirmDialog}
        disabled={loading}
      >
        Delete
      </Button>

      {isConfirmOpen && (
        <ConfirmDialog
          open={isConfirmOpen}
          title="Delete user?"
          description={`Are you sure you want to delete ${user.fullName}?`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          loading={loading}
          onConfirm={handleDelete}
          onCancel={closeConfirmDialog}
        />
      )}
    </>
  );
}













// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import type { User } from "@/modules/users/types";

// interface DeleteUserProps {
//   user: User;
//   onDelete: () => Promise<void> | void;
// }

// export default function DeleteUser({ user, onDelete }: DeleteUserProps) {
//   const [loading, setLoading] = useState(false);

//   const handleDelete = async () => {
//     if (!window.confirm(`Delete ${user.fullName}?`)) return;

//     try {
//       setLoading(true);
//       await onDelete();
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Button variant="danger" size="sm" onClick={handleDelete} disabled={loading}>
//       {loading ? "Deleting..." : "Delete"}
//     </Button>
//   );
// }
