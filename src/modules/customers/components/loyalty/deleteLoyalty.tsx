"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import { CustomerRewardConfig } from "../../types";

interface DeleteLoyaltyProps {
  value: CustomerRewardConfig;
  onDelete?: (payload: CustomerRewardConfig) => void;
}

export default function DeleteLoyalty({ value, onDelete }: DeleteLoyaltyProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button type="button" variant="ghost" size="icon" title="Delete" onClick={() => setOpen(true)}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </Button>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle>Delete Loyalty Configuration</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete the loyalty config for <span className="font-semibold">{value.businessId}</span> / <span className="font-semibold">{value.branchId || "all"}</span>?
            </p>
          </ModalBody>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                onDelete?.(value);
                setOpen(false);
              }}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
