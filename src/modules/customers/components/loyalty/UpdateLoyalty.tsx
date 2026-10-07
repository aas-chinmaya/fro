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

interface UpdateLoyaltyProps {
  value: CustomerRewardConfig;
  onUpdate?: (payload: CustomerRewardConfig) => void;
}

export default function UpdateLoyalty({ value, onUpdate }: UpdateLoyaltyProps) {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<CustomerRewardConfig>(value);

  function updateField(field: keyof CustomerRewardConfig, value: string | number | boolean | null | undefined) {
    setPayload((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onUpdate?.(payload);
    setOpen(false);
  }

  return (
    <>
      <Button type="button" variant="ghost" size="icon" title="Edit" onClick={() => setOpen(true)}>
        <span className="sr-only">Edit</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-6-7l7-7 3 3-7 7H11v-3z" /></svg>
      </Button>

      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent className="max-w-3xl">
          <ModalHeader>
            <ModalTitle>Update Loyalty Configuration</ModalTitle>
          </ModalHeader>

          <form onSubmit={handleSubmit}>
            <ModalBody className="max-h-[70vh] overflow-y-auto">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Business Id">
                  <Input value={payload.businessId} onChange={(e) => updateField("businessId", e.target.value)} />
                </FormField>

                <FormField label="Branch Id">
                  <Input value={payload.branchId || ""} onChange={(e) => updateField("branchId", e.target.value)} />
                </FormField>

                <FormField label="Created By">
                  <Input value={payload.createdBy} onChange={(e) => updateField("createdBy", e.target.value)} />
                </FormField>

                <FormField label="Enabled">
                  <div className="flex items-center gap-3 rounded-lg border px-4 py-2">
                    <Switch checked={payload.isEnabled} onCheckedChange={(checked) => updateField("isEnabled", Boolean(checked))} />
                    <span>{payload.isEnabled ? "Enabled" : "Disabled"}</span>
                  </div>
                </FormField>

                <FormField label="Points Per Currency">
                  <Input type="number" value={payload.pointsPerCurrency} onChange={(e) => updateField("pointsPerCurrency", Number(e.target.value))} />
                </FormField>

                <FormField label="Currency Per Point">
                  <Input type="number" value={payload.currencyPerPoint} onChange={(e) => updateField("currencyPerPoint", Number(e.target.value))} />
                </FormField>

                <FormField label="Minimum Invoice Amount">
                  <Input type="number" value={payload.minimumInvoiceAmount} onChange={(e) => updateField("minimumInvoiceAmount", Number(e.target.value))} />
                </FormField>

                <FormField label="Redemption Enabled">
                  <div className="flex items-center gap-3 rounded-lg border px-4 py-2">
                    <Switch checked={payload.redemptionEnabled} onCheckedChange={(checked) => updateField("redemptionEnabled", Boolean(checked))} />
                    <span>{payload.redemptionEnabled ? "Enabled" : "Disabled"}</span>
                  </div>
                </FormField>

                <FormField label="Point Value">
                  <Input type="number" value={payload.pointValue} onChange={(e) => updateField("pointValue", Number(e.target.value))} />
                </FormField>

                <FormField label="Minimum Redeem Points">
                  <Input type="number" value={payload.minimumRedeemPoints} onChange={(e) => updateField("minimumRedeemPoints", Number(e.target.value))} />
                </FormField>

                <FormField label="Maximum Redeem Points">
                  <Input type="number" value={payload.maximumRedeemPoints ?? 0} onChange={(e) => updateField("maximumRedeemPoints", Number(e.target.value))} />
                </FormField>

                <FormField label="Maximum Redeem Percentage">
                  <Input type="number" value={payload.maximumRedeemPercentage} onChange={(e) => updateField("maximumRedeemPercentage", Number(e.target.value))} />
                </FormField>

                <FormField label="Expiry Enabled">
                  <div className="flex items-center gap-3 rounded-lg border px-4 py-2">
                    <Switch checked={payload.expiryEnabled} onCheckedChange={(checked) => updateField("expiryEnabled", Boolean(checked))} />
                    <span>{payload.expiryEnabled ? "Enabled" : "Disabled"}</span>
                  </div>
                </FormField>

                <FormField label="Expiry Days">
                  <Input type="number" value={payload.expiryDays ?? 0} onChange={(e) => updateField("expiryDays", Number(e.target.value))} />
                </FormField>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Update
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
