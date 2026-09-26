"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { FormError, FormField, PaginatedHsnSacSelect } from "@/components/form";
import { RichTextEditor } from "@/components/editor";
import { notify } from "@/lib/toast";
import { serviceSchema, ServiceFormData } from "@/modules/items/validation";
import { categoryservice } from "@/modules/items/services/category.service";
import { subCategoryservice } from "@/modules/items/services/sub-category.service";
import { taxMasterservice } from "@/modules/items/services/tax-master.service";
import { serviceservice } from "@/modules/items/services/service.service";
import { CategoryMasterRow, SubCategoryMasterRow, TaxMasterRow } from "@/modules/items/types";

interface ServiceFormProps {
  serviceId?: string;
}

export default function ServiceForm({ serviceId }: ServiceFormProps) {
  const router = useRouter();
  const isEdit = Boolean(serviceId);

  const [loading, setLoading] = useState(isEdit);
  const [categories, setCategories] = useState<CategoryMasterRow[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryMasterRow[]>([]);
  const [taxes, setTaxes] = useState<TaxMasterRow[]>([]);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      serviceCode: "",
      serviceName: "",
      categoryId: "",
      subCategoryId: "",
      taxId: "",
      sacCode: "",
      description: "",
      serviceCharge: 0,
    },
  });

  const selectedCategoryId = watch("categoryId");
  const currentSubCategoryId = watch("subCategoryId");

  const visibleSubCategories = selectedCategoryId
    ? subCategories.filter((subCategory) => String(subCategory.categoryId) === String(selectedCategoryId))
    : subCategories;

  useEffect(() => {
    if (!selectedCategoryId) {
      if (currentSubCategoryId) {
        setValue("subCategoryId", "");
      }
      return;
    }

    if (currentSubCategoryId && !visibleSubCategories.some((subCategory) => String(subCategory.id) === String(currentSubCategoryId))) {
      setValue("subCategoryId", "");
    }
  }, [selectedCategoryId, currentSubCategoryId, visibleSubCategories, setValue]);

  useEffect(() => {
    async function loadLookups() {
      try {
        const [categoryResponse, subCategoryResponse, taxResponse] = await Promise.all([
          categoryservice.getCategories({
            page: 1,
            limit: 100,
          }),
          subCategoryservice.getSubCategories({
            page: 1,
            limit: 100,
          }),
          taxMasterservice.getTaxMasters({
            page: 1,
            limit: 100,
          }),
        ]);

        const allCategories: CategoryMasterRow[] =
          categoryResponse?.data?.data?.data ??
          categoryResponse?.data?.data ??
          [];

        setCategories(allCategories.filter((category) => category.categoryType === "SERVICE"));
        setSubCategories(subCategoryResponse?.data?.data?.data ?? subCategoryResponse?.data?.data ?? []);
        setTaxes(taxResponse?.data?.data?.data ?? taxResponse?.data?.data ?? []);
      } catch {
        setCategories([]);
        setSubCategories([]);
        setTaxes([]);
      }
    }

    loadLookups();
  }, []);

  useEffect(() => {
    if (!serviceId) {
      setLoading(false);
      return;
    }

    const loadService = async () => {
      try {
        setLoading(true);
        const response = await serviceservice.getServiceById(serviceId);
        const service = response?.data?.data;

        reset({
          serviceCode: service?.serviceCode ?? "",
          serviceName: service?.serviceName ?? "",
          categoryId: service?.categoryId ? String(service.categoryId) : "",
          subCategoryId: service?.subCategoryId ? String(service.subCategoryId) : "",
          taxId: service?.taxId ? String(service.taxId) : "",
          sacCode: service?.sacCode ?? "",
          description: service?.description ?? "",
          serviceCharge: Number(service?.serviceCharge ?? 0),
        });
      } catch {
        notify.error("Unable to load service details.");
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [serviceId, reset]);

  const onSubmit = async (data: ServiceFormData) => {
    try {
      setIsSubmittingAction(true);

      const payload = {
        serviceCode: data.serviceCode.trim(),
        serviceName: data.serviceName.trim(),
        categoryId: String(data.categoryId),
        subCategoryId: String(data.subCategoryId),
        taxId: String(data.taxId),
        sacCode: data.sacCode?.trim() || null,
        description: data.description?.trim() || "",
        serviceCharge: Number(data.serviceCharge),
        status: true,
      };

      if (isEdit && serviceId) {
        await serviceservice.updateService(serviceId, payload);
        notify.success("Service updated successfully.");
      } else {
        await serviceservice.createService(payload);
        notify.success("Service created successfully.");
      }

      router.push("/items/services");
    } catch {
      notify.error("Something went wrong.");
    } finally {
      setIsSubmittingAction(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">Loading service...</p>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="rounded-xl">
            <h2 className="text-xl font-semibold text-primary">Basic information</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <FormField>
                <Label htmlFor="serviceCode">Service Code</Label>
                <Input id="serviceCode" placeholder="Enter service code" {...register("serviceCode")} />
                <FormError message={errors.serviceCode?.message} />
              </FormField>

              <FormField>
                <Label htmlFor="serviceName">Service Name</Label>
                <Input id="serviceName" placeholder="Enter service name" {...register("serviceName")} />
                <FormError message={errors.serviceName?.message} />
              </FormField>

              <FormField>
                <Label htmlFor="categoryId">Category</Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="categoryId">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormError message={errors.categoryId?.message} />
              </FormField>

              <FormField>
                <Label htmlFor="subCategoryId">Sub Category</Label>
                <Controller
                  name="subCategoryId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="subCategoryId">
                        <SelectValue placeholder={selectedCategoryId ? "Select sub category" : "Select a category first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {visibleSubCategories.map((subCategory) => (
                          <SelectItem key={subCategory.id} value={String(subCategory.id)}>
                            {subCategory.subCategoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormError message={errors.subCategoryId?.message} />
              </FormField>

              <FormField>
                <Label htmlFor="sacCode">SAC Code</Label>
                <Controller
                  name="sacCode"
                  control={control}
                  render={({ field }) => (
                    <PaginatedHsnSacSelect
                      id="sacCode"
                      type="SAC"
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      placeholder="Select SAC code"
                    />
                  )}
                />
                <FormError message={errors.sacCode?.message} />
              </FormField>

              <FormField>
                <Label htmlFor="serviceCharge">Service Charge</Label>
                <Input id="serviceCharge" type="number" step="0.01" placeholder="0.00" {...register("serviceCharge", { valueAsNumber: true })} />
                <FormError message={errors.serviceCharge?.message} />
              </FormField>

              <FormField className="sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor value={field.value || ""} onChange={field.onChange} placeholder="Enter service description..." />
                  )}
                />
                <FormError message={errors.description?.message} />
              </FormField>
            </div>
          </div>

          <div className="rounded-xl">
            <h2 className="text-xl font-semibold text-primary">Category & tax</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormField>
                <Label htmlFor="taxId">Tax</Label>
                <Controller
                  name="taxId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="taxId">
                        <SelectValue placeholder="Select tax master" />
                      </SelectTrigger>
                      <SelectContent>
                        {taxes.map((tax) => (
                          <SelectItem key={tax.id} value={String(tax.id)}>
                            GST {tax.gstRate}% | CGST {tax.cgst}% | SGST {tax.sgst}% | IGST {tax.igst}% | UGST {tax.ugst}% | CESS {tax.cess}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormError message={errors.taxId?.message} />
              </FormField>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => router.push("/items/services")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isSubmittingAction}>
            {isSubmitting || isSubmittingAction ? "Saving..." : isEdit ? "Update Service" : "Create Service"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
