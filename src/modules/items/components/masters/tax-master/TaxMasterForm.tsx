"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Input, Label } from "@/components/ui";
import { FormError, FormField } from "@/components/form";
import { notify } from "@/lib/toast";
import { taxMasterSchema, TaxMasterFormData } from "../../../validation";
import { taxMasterservice } from "../../../services/tax-master.service";

interface TaxMasterFormProps {
  taxMasterId?: string;
}

export default function TaxMasterForm({ taxMasterId }: TaxMasterFormProps) {
  const router = useRouter();
  const isEdit = Boolean(taxMasterId);

  const [loading, setLoading] = useState(isEdit);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaxMasterFormData>({
    resolver: zodResolver(taxMasterSchema),
    defaultValues: {
     
      gstRate: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      ugst: 0,
      cess: 0,
      effectiveFrom: "",
      effectiveTo: "",
     
    },
  });

  useEffect(() => {
    if (!taxMasterId) {
      return;
    }

    const loadTaxMaster = async () => {
      try {
        setLoading(true);
        const response = await taxMasterservice.getTaxMasterById(taxMasterId);
        const taxMaster = response?.data?.data;

        reset({
        
          gstRate: Number(taxMaster?.gstRate ?? 0),
          cgst: Number(taxMaster?.cgst ?? 0),
          sgst: Number(taxMaster?.sgst ?? 0),
          igst: Number(taxMaster?.igst ?? 0),
          ugst: Number(taxMaster?.ugst ?? 0),
          cess: Number(taxMaster?.cess ?? 0),
          effectiveFrom: taxMaster?.effectiveFrom ?? "",
          effectiveTo: taxMaster?.effectiveTo ?? "",
         
        });
      } catch {
        notify.error("Unable to load tax master details.");
      } finally {
        setLoading(false);
      }
    };

    void loadTaxMaster();
  }, [taxMasterId, reset]);

  const onSubmit = async (data: TaxMasterFormData) => {
    try {
      setIsSubmittingAction(true);

      const payload = {
       
        gstRate: Number(data.gstRate),
        cgst: Number(data.cgst),
        sgst: Number(data.sgst),
        igst: Number(data.igst),
        ugst: Number(data.ugst),
        cess: Number(data.cess),
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        
      };

      if (isEdit && taxMasterId) {
        await taxMasterservice.updateTaxMaster(taxMasterId, payload);
        notify.success("Tax master updated successfully.");
        router.back();
        return;
      } else {
        await taxMasterservice.createTaxMaster(payload);
        notify.success("Tax master created successfully.");
      }

      router.push("/items/tax-master");
    } catch (error: unknown) {
      const message = typeof error === "object" && error !== null && "response" in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      notify.error(message || "Something went wrong.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">Loading tax master...</p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <FormField>
            <Label htmlFor="gstRate">GST Rate (%)</Label>
            <Input id="gstRate" type="number" step="0.01" placeholder="Enter GST rate" {...register("gstRate", { valueAsNumber: true })} />
            <FormError message={errors.gstRate?.message} />
          </FormField>

          <FormField>
            <Label htmlFor="cgst">CGST (%)</Label>
            <Input id="cgst" type="number" step="0.01" placeholder="Enter CGST" {...register("cgst", { valueAsNumber: true })} />
            <FormError message={errors.cgst?.message} />
          </FormField>

          <FormField>
            <Label htmlFor="sgst">SGST (%)</Label>
            <Input id="sgst" type="number" step="0.01" placeholder="Enter SGST" {...register("sgst", { valueAsNumber: true })} />
            <FormError message={errors.sgst?.message} />
          </FormField>

          <FormField>
            <Label htmlFor="igst">IGST (%)</Label>
            <Input id="igst" type="number" step="0.01" placeholder="Enter IGST" {...register("igst", { valueAsNumber: true })} />
            <FormError message={errors.igst?.message} />
          </FormField>

          <FormField>
            <Label htmlFor="ugst">UGST (%)</Label>
            <Input id="ugst" type="number" step="0.01" placeholder="Enter UGST" {...register("ugst", { valueAsNumber: true })} />
            <FormError message={errors.ugst?.message} />
          </FormField>

          <FormField>
            <Label htmlFor="cess">CESS (%)</Label>
            <Input id="cess" type="number" step="0.01" placeholder="Enter CESS" {...register("cess", { valueAsNumber: true })} />
            <FormError message={errors.cess?.message} />
          </FormField>

          <FormField>
            <Label htmlFor="effectiveFrom">Effective From</Label>
            <Input id="effectiveFrom" type="date" {...register("effectiveFrom")} />
            <FormError message={errors.effectiveFrom?.message} />
          </FormField>

          <FormField>
            <Label htmlFor="effectiveTo">Effective To</Label>
            <Input id="effectiveTo" type="date" {...register("effectiveTo")} />
            <FormError message={errors.effectiveTo?.message} />
          </FormField>

        
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/items/tax-master")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isSubmittingAction}>
            {isSubmitting || isSubmittingAction ? "Saving..." : isEdit ? "Update Tax Master" : "Create Tax Master"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
