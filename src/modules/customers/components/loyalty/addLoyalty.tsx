"use client";

import React, { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";
import FormField from "@/components/form/FormField";
import { CustomerRewardConfig } from "../../types";

interface AddLoyaltyProps {
  onCreate?: (payload: CustomerRewardConfig) => void;
}

const emptyReward = (): CustomerRewardConfig => ({
  businessId: "",
  branchId: "",
  isEnabled: false,
  pointsPerCurrency: 1,
  currencyPerPoint: 100,
  minimumInvoiceAmount: 0,
  redemptionEnabled: false,
  pointValue: 1,
  minimumRedeemPoints: 0,
  maximumRedeemPoints: 0,
  maximumRedeemPercentage: 100,
  expiryEnabled: false,
  expiryDays: 0,
  createdBy: "",
  updatedBy: null,
});

export default function AddLoyalty({ onCreate }: AddLoyaltyProps) {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<CustomerRewardConfig>(emptyReward());

  function updateField(field: keyof CustomerRewardConfig, value: string | number | boolean | null | undefined) {
    setPayload((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!payload.businessId.trim() || !payload.createdBy.trim()) {
      return;
    }

    const normalized: CustomerRewardConfig = {
      ...payload,
      branchId: payload.branchId || null,
      isEnabled: payload.isEnabled ?? false,
      pointsPerCurrency: payload.pointsPerCurrency ?? 1,
      currencyPerPoint: payload.currencyPerPoint ?? 100,
      minimumInvoiceAmount: payload.minimumInvoiceAmount ?? 0,
      redemptionEnabled: payload.redemptionEnabled ?? false,
      pointValue: payload.pointValue ?? 1,
      minimumRedeemPoints: payload.minimumRedeemPoints ?? 0,
      maximumRedeemPoints: payload.maximumRedeemPoints ?? null,
      maximumRedeemPercentage: payload.maximumRedeemPercentage ?? 100,
      expiryEnabled: payload.expiryEnabled ?? false,
      expiryDays: payload.expiryDays ?? null,
      createdBy: payload.createdBy,
      updatedBy: payload.updatedBy ?? null,
    };

    onCreate?.(normalized);
    setPayload(emptyReward());
    setOpen(false);
  }

  return (
    <>
      <Button type="button" variant="primary" onClick={() => setOpen(true)}>
        + Add Loyalty
      </Button>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent className="max-w-3xl">
          <ModalHeader>
            <ModalTitle>Add Loyalty Configuration</ModalTitle>
          </ModalHeader>

          <form onSubmit={handleSubmit}>
            <ModalBody className="max-h-[70vh] overflow-y-auto">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Business Id" required>
                  <Input value={payload.businessId} onChange={(e) => updateField("businessId", e.target.value)} placeholder="businessId" />
                </FormField>

                <FormField label="Branch Id">
                  <Input value={payload.branchId || ""} onChange={(e) => updateField("branchId", e.target.value)} placeholder="branchId" />
                </FormField>

                <FormField label="Created By" required>
                  <Input value={payload.createdBy} onChange={(e) => updateField("createdBy", e.target.value)} placeholder="createdBy" />
                </FormField>

                <FormField label="Is Enabled">
                  <div className="flex items-center gap-3 rounded-lg border px-4 py-2">
                    <Switch checked={payload.isEnabled} onCheckedChange={(value) => updateField("isEnabled", Boolean(value))} />
                    <span className="text-sm text-gray-600">{payload.isEnabled ? "Enabled" : "Disabled"}</span>
                  </div>
                </FormField>

                <FormField label="Points Per Currency">
                  <Input type="number" min={0} value={payload.pointsPerCurrency} onChange={(e) => updateField("pointsPerCurrency", Number(e.target.value))} />
                </FormField>

                <FormField label="Currency Per Point">
                  <Input type="number" min={0} value={payload.currencyPerPoint} onChange={(e) => updateField("currencyPerPoint", Number(e.target.value))} />
                </FormField>

                <FormField label="Minimum Invoice Amount">
                  <Input type="number" min={0} value={payload.minimumInvoiceAmount} onChange={(e) => updateField("minimumInvoiceAmount", Number(e.target.value))} />
                </FormField>

                <FormField label="Redemption Enabled">
                  <div className="flex items-center gap-3 rounded-lg border px-4 py-2">
                    <Switch checked={payload.redemptionEnabled} onCheckedChange={(value) => updateField("redemptionEnabled", Boolean(value))} />
                    <span className="text-sm text-gray-600">{payload.redemptionEnabled ? "Enabled" : "Disabled"}</span>
                  </div>
                </FormField>

                <FormField label="Point Value">
                  <Input type="number" min={0} value={payload.pointValue} onChange={(e) => updateField("pointValue", Number(e.target.value))} />
                </FormField>

                <FormField label="Minimum Redeem Points">
                  <Input type="number" min={0} value={payload.minimumRedeemPoints} onChange={(e) => updateField("minimumRedeemPoints", Number(e.target.value))} />
                </FormField>

                <FormField label="Maximum Redeem Points">
                  <Input type="number" min={0} value={payload.maximumRedeemPoints ?? 0} onChange={(e) => updateField("maximumRedeemPoints", Number(e.target.value))} />
                </FormField>

                <FormField label="Maximum Redeem Percentage">
                  <Input type="number" min={0} value={payload.maximumRedeemPercentage} onChange={(e) => updateField("maximumRedeemPercentage", Number(e.target.value))} />
                </FormField>

                <FormField label="Expiry Enabled">
                  <div className="flex items-center gap-3 rounded-lg border px-4 py-2">
                    <Switch checked={payload.expiryEnabled} onCheckedChange={(value) => updateField("expiryEnabled", Boolean(value))} />
                    <span className="text-sm text-gray-600">{payload.expiryEnabled ? "Enabled" : "Disabled"}</span>
                  </div>
                </FormField>

                <FormField label="Expiry Days">
                  <Input type="number" min={0} value={payload.expiryDays ?? 0} onChange={(e) => updateField("expiryDays", Number(e.target.value))} />
                </FormField>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Loyalty
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
