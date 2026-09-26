"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Controller,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { RichTextEditor } from "@/components/editor";
import {
  Button,
  Card,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { FormError, FormField } from "@/components/form";
import { notify } from "@/lib/toast";

import { unitSchema, UnitFormData } from "../../../validation";
import { unitservice } from "../../../services/unit.service";

interface UnitFormProps {
  unitId?: string;
}

export default function UnitForm({ unitId }: UnitFormProps) {
  const router = useRouter();
  const isEdit = Boolean(unitId);

  const [loading, setLoading] = useState(isEdit);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),

    defaultValues: {
      unitName: "",
      shortName: "",
      unitType: undefined,
      description: "",
    },
  });

  useEffect(() => {
    if (!unitId) {
      return;
    }

    const loadUnit = async () => {
      try {
        setLoading(true);

        const response = await unitservice.getUnitById(unitId);
        const unit = response?.data?.data;

        reset({
          unitName: unit?.unitName ?? "",
          shortName: unit?.shortName ?? "",
          unitType: unit?.unitType ?? undefined,
          description: unit?.description ?? "",
        });
      } catch (error) {
        console.error("Failed to load unit:", error);
        notify.error("Unable to load unit details.");
      } finally {
        setLoading(false);
      }
    };

    void loadUnit();
  }, [unitId, reset]);

  const onSubmit: SubmitHandler<UnitFormData> = async (data) => {
    try {
      setIsSubmittingAction(true);

      const payload = {
        unitName: data.unitName.trim(),
        shortName: data.shortName.trim(),
        unitType: data.unitType,
        description: data.description?.trim() || "",
      };

      if (isEdit && unitId) {
        await unitservice.updateUnit(unitId, payload);

        notify.success("Unit updated successfully.");
        router.back();
        return;
      }

      await unitservice.createUnit(payload);

      notify.success("Unit created successfully.");
      router.push("/items/units");
    } catch (error: unknown) {
      console.error("Unit save failed:", error);

      const message =
        typeof error === "object" && error !== null && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      notify.error(
        message || "Something went wrong while saving the unit."
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">
          Loading unit...
        </p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="p-6">
        {/* Form */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Unit Name */}
          <FormField>
            <Label htmlFor="unitName">
              Unit Name
            </Label>

            <Input
              id="unitName"
              placeholder="Enter unit name"
              {...register("unitName")}
            />

            <FormError
              message={errors.unitName?.message}
            />
          </FormField>

          {/* Short Name */}
          <FormField>
            <Label htmlFor="shortName">
              Short Name
            </Label>

            <Input
              id="shortName"
              placeholder="Enter short name"
              {...register("shortName")}
            />

            <FormError
              message={errors.shortName?.message}
            />
          </FormField>

          {/* Unit Type */}
          <FormField>
            <Label htmlFor="unitType">
              Unit Type
            </Label>

            <Controller
              name="unitType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="unitType">
                    <SelectValue placeholder="Select unit type" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="WEIGHT">
                      WEIGHT
                    </SelectItem>

                    <SelectItem value="LENGTH">
                      LENGTH
                    </SelectItem>

                    <SelectItem value="VOLUME">
                      VOLUME
                    </SelectItem>

                    <SelectItem value="COUNT">
                      COUNT
                    </SelectItem>

                    <SelectItem value="AREA">
                      AREA
                    </SelectItem>

                    <SelectItem value="TIME">
                      TIME
                    </SelectItem>

                    <SelectItem value="PACKAGING">
                      PACKAGING
                    </SelectItem>

                    <SelectItem value="CUSTOM">
                      CUSTOM
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            <FormError
              message={errors.unitType?.message}
            />
          </FormField>

          {/* Description */}
          <FormField className="md:col-span-2">
            <Label htmlFor="description">
              Description
            </Label>

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <RichTextEditor
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Enter unit description..."
                />
              )}
            />

            <FormError
              message={errors.description?.message}
            />
          </FormField>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push("/items/units")
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              isSubmittingAction
            }
          >
            {isSubmitting || isSubmittingAction
              ? "Saving..."
              : isEdit
                ? "Update Unit"
                : "Create Unit"}
          </Button>
        </div>
      </Card>
    </form>
  );
}