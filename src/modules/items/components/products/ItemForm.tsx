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

import { FormError, FormField, ImageUpload, PaginatedHsnSacSelect } from "@/components/form";
import { RichTextEditor } from "@/components/editor";
import { notify } from "@/lib/toast";

import {
  productSchema,
  ProductFormData,
} from "@/modules/items/validation";

import { categoryservice } from "@/modules/items/services/category.service";
import { subCategoryservice } from "@/modules/items/services/sub-category.service";
import { brandservice } from "@/modules/items/services/brand.service";
import { unitservice } from "@/modules/items/services/unit.service";
import { taxMasterservice } from "@/modules/items/services/tax-master.service";
import { productservice } from "@/modules/items/services/product.service";

import type {
  CategoryMasterRow,
  SubCategoryMasterRow,
  BrandMasterRow,
  UnitMasterRow,
  TaxMasterRow,
} from "@/modules/items/types";

interface ProductFormProps {
  productId?: string;
}

const MAX_IMAGE_SIZE_BYTES = 60 * 1024;
const TENANT_ID = "23443221";

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(productId);

  const [loading, setLoading] = useState(isEdit);

  const [categories, setCategories] = useState<CategoryMasterRow[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryMasterRow[]>(
    []
  );
  const [brands, setBrands] = useState<BrandMasterRow[]>([]);
  const [units, setUnits] = useState<UnitMasterRow[]>([]);
  const [taxes, setTaxes] = useState<TaxMasterRow[]>([]);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),

    defaultValues: {
      itemCode: "",
      barcode: "",
      itemName: "",
      description: "",
      categoryId: "",
      subCategoryId: "",
      brandId: "",
      inventoryUnitId: "",
      taxId: "",
      hsnCode: "",
      minimumStock: 0,
      maximumStock: 0,
      imageFile: null,
    },
  });

  const selectedCategoryId = watch("categoryId");
  const currentSubCategoryId = watch("subCategoryId");
  /*
   * Filter sub-categories according to selected category.
   */
  const visibleSubCategories = selectedCategoryId
    ? subCategories.filter(
      (subCategory) =>
        String(subCategory.categoryId) === String(selectedCategoryId)
    )
    : [];

  /*
   * Clear invalid sub-category when category changes.
   */
  useEffect(() => {
    if (!selectedCategoryId) {
      if (currentSubCategoryId) {
        setValue("subCategoryId", "");
      }

      return;
    }

    const subCategoryExists = visibleSubCategories.some(
      (subCategory) =>
        String(subCategory.id) === String(currentSubCategoryId)
    );

    if (currentSubCategoryId && !subCategoryExists) {
      setValue("subCategoryId", "");
    }
  }, [
    selectedCategoryId,
    currentSubCategoryId,
    visibleSubCategories,
    setValue,
  ]);

  /*
   * Load all dropdown/master data.
   */
  useEffect(() => {
    let mounted = true;

    async function loadLookups() {
      try {
        const [
          categoryResponse,
          subCategoryResponse,
          brandResponse,
          unitResponse,
          taxResponse,
        ] = await Promise.all([
          categoryservice.getCategories({
            page: 1,
            limit: 1000,
          }),
          subCategoryservice.getSubCategories({
            page: 1,
            limit: 1000,
          }),
          brandservice.getBrands({
            page: 1,
            limit: 1000,
          }),
          unitservice.getUnits({
            page: 1,
            limit: 10000,
          }),
          taxMasterservice.getTaxMasters({
            page: 1,
            limit: 1000,
          }),
        ]);

        if (!mounted) {
          return;
        }

        const allCategories: CategoryMasterRow[] =
          categoryResponse?.data?.data?.data ??
          categoryResponse?.data?.data ??
          [];

        /*
         * Only PRODUCT categories should be displayed.
         */
        setCategories(
          allCategories.filter(
            (category) => category.categoryType === "PRODUCT"
          )
        );

        setSubCategories(
          subCategoryResponse?.data?.data?.data ??
          subCategoryResponse?.data?.data ??
          []
        );

        setBrands(
          brandResponse?.data?.data?.data ??
          brandResponse?.data?.data ??
          []
        );

        setUnits(
          unitResponse?.data?.data?.data ??
          unitResponse?.data?.data ??
          []
        );

        setTaxes(
          taxResponse?.data?.data?.data ??
          taxResponse?.data?.data ??
          []
        );

      } catch (error) {
        if (!mounted) {
          return;
        }

        setCategories([]);
        setSubCategories([]);
        setBrands([]);
        setUnits([]);
        setTaxes([]);
        notify.error("Unable to load product master data.");
      }
    }

    loadLookups();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Load product when editing.
   */
  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);

        const response = await productservice.getProductById(productId);

        if (!mounted) {
          return;
        }

        const product = response?.data?.data;

        if (!product) {
          notify.error("Product details not found.");
          return;
        }

        /*
         * Keep existing image URL separately.
         *
         * We DO NOT convert this URL to Base64.
         *
         * If the user selects a new image, the new File will be
         * sent as binary through FormData.
         */
        setExistingImageUrl(product?.image ?? "");

        reset({
          itemCode: product?.itemCode ?? "",
          barcode: product?.barcode ?? "",
          itemName: product?.itemName ?? "",
          description: product?.description ?? "",

          categoryId: product?.categoryId
            ? String(product.categoryId)
            : "",

          subCategoryId: product?.subCategoryId
            ? String(product.subCategoryId)
            : "",

          brandId: product?.brandId
            ? String(product.brandId)
            : "",

          inventoryUnitId: product?.inventoryUnitId
            ? String(product.inventoryUnitId)
            : "",

          taxId: product?.taxId
            ? String(product.taxId)
            : "",

          hsnCode: product?.hsnCode ?? "",

          minimumStock: Number(product?.minimumStock ?? 0),

          maximumStock: Number(product?.maximumStock ?? 0),

          /*
           * Existing image is NOT placed into imageFile.
           * imageFile must contain only a newly selected File.
           */
          imageFile: null,
        });
      } catch (error) {
        if (mounted) {
          notify.error("Unable to load product details.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [productId, reset]);

  /*
   * Submit product.
   *
   * IMPORTANT:
   * Image is sent as a real File/binary through FormData.
   * There is NO Base64 conversion here.
   */
  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmittingAction(true);

      /*
       * Create multipart/form-data payload.
       */
      const formData = new FormData();

      /*
       * Basic information
       */
      formData.append("tenantId", TENANT_ID);

      formData.append(
        "itemCode",
        data.itemCode?.trim() ?? ""
      );

      formData.append(
        "barcode",
        data.barcode?.trim() ?? ""
      );

      formData.append(
        "itemName",
        data.itemName?.trim() ?? ""
      );

      formData.append(
        "description",
        data.description?.trim() ?? ""
      );

      /*
       * Category / classification
       */
      formData.append(
        "categoryId",
        String(data.categoryId ?? "")
      );

      formData.append(
        "subCategoryId",
        String(data.subCategoryId ?? "")
      );

      formData.append(
        "brandId",
        String(data.brandId ?? "")
      );

      formData.append(
        "inventoryUnitId",
        String(data.inventoryUnitId ?? "")
      );

      formData.append(
        "taxId",
        String(data.taxId ?? "")
      );

      formData.append(
        "hsnCode",
        data.hsnCode?.trim() ?? ""
      );

      /*
       * Stock
       */

      formData.append(
        "minimumStock",
        String(Number(data.minimumStock ?? 0))
      );

      formData.append(
        "maximumStock",
        String(Number(data.maximumStock ?? 0))
      );

      /*
       * Image
       *
       * THIS IS THE IMPORTANT PART.
       *
       * Do NOT use FileReader.
       * Do NOT convert to Base64.
       * Append the File object directly.
       */
      if (data.imageFile instanceof File) {
        formData.append(
          "image",
          data.imageFile,
          data.imageFile.name
        );
      } else if (isEdit) {
        /*
         * On edit, if the user did not select a new image,
        * send the existing image reference. An empty value means
        * the user explicitly removed the existing image.
         *
         * Your backend can decide to keep the existing image.
         */
        formData.append("existingImage", existingImageUrl);
      }

      /*
       * Audit fields
       */
      formData.append("createdBy", "admin");
      formData.append("updatedBy", "admin");

      /*
       * Send FormData to service.
       */
      if (isEdit && productId) {
        await productservice.updateProduct(
          productId,
          formData
        );

        notify.success("Product updated successfully.");
      } else {
        await productservice.createProduct(formData);

        notify.success("Product created successfully.");
      }

      router.push("/items/products");
    } catch (error: any) {
      console.error("Product save error:", error);

      notify.error(
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong."
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  /*
   * Loading state.
   */
  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">
          Loading product...
        </p>
      </Card>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <Card className="p-6">
        <div className="space-y-6">

          {/* =========================
              BASIC INFORMATION
          ========================== */}
          <div className="rounded-xl">
            <h2 className="text-xl font-semibold text-primary">
              Basic information
            </h2>

            <div className="mt-4 grid gap-5 md:grid-cols-2">

              {/* Item Code */}
              <FormField>
                <Label htmlFor="itemCode">
                  Item Code
                </Label>

                <Input
                  id="itemCode"
                  placeholder="Enter item code"
                  {...register("itemCode")}
                />

                <FormError
                  message={errors.itemCode?.message}
                />
              </FormField>

              {/* Item Name */}
              <FormField>
                <Label htmlFor="itemName">
                  Item Name
                </Label>

                <Input
                  id="itemName"
                  placeholder="Enter item name"
                  {...register("itemName")}
                />

                <FormError
                  message={errors.itemName?.message}
                />
              </FormField>

              {/* Barcode */}
              <FormField>
                <Label htmlFor="barcode">
                  Barcode
                </Label>

                <Input
                  id="barcode"
                  placeholder="Enter barcode"
                  {...register("barcode")}
                />

                <FormError
                  message={errors.barcode?.message}
                />
              </FormField>

              {/* Description */}
              <FormField className="sm:col-span-2">
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
                      placeholder="Enter product description..."
                    />
                  )}
                />

                <FormError
                  message={errors.description?.message}
                />
              </FormField>
            </div>
          </div>

          {/* =========================
              CATEGORY & CLASSIFICATION
          ========================== */}
          <div className="rounded-xl">
            <h2 className="text-xl font-semibold text-primary">
              Category & classification
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">

              {/* Category */}
              <FormField>
                <Label htmlFor="categoryId">
                  Category
                </Label>

                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="categoryId">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>

                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id)}
                          >
                            {category.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                <FormError
                  message={errors.categoryId?.message}
                />
              </FormField>

              {/* Sub Category */}
              <FormField>
                <Label htmlFor="subCategoryId">
                  Sub Category
                </Label>

                <Controller
                  name="subCategoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      disabled={!selectedCategoryId}
                    >
                      <SelectTrigger id="subCategoryId">
                        <SelectValue
                          placeholder={
                            selectedCategoryId
                              ? "Select sub category"
                              : "Select a category first"
                          }
                        />
                      </SelectTrigger>

                      <SelectContent>
                        {visibleSubCategories.map(
                          (subCategory) => (
                            <SelectItem
                              key={subCategory.id}
                              value={String(subCategory.id)}
                            >
                              {subCategory.subCategoryName}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />

                <FormError
                  message={errors.subCategoryId?.message}
                />
              </FormField>

              {/* Brand */}
              <FormField>
                <Label htmlFor="brandId">
                  Brand
                </Label>

                <Controller
                  name="brandId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="brandId">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>

                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem
                            key={brand.id}
                            value={String(brand.id)}
                          >
                            {brand.brandName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                <FormError
                  message={errors.brandId?.message}
                />
              </FormField>

              {/* Inventory Unit */}
              <FormField>
                <Label htmlFor="inventoryUnitId">
                  Inventory Unit
                </Label>

                <Controller
                  name="inventoryUnitId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="inventoryUnitId">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>

                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem
                            key={unit.id}
                            value={String(unit.id)}
                          >
                            {unit.unitName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                <FormError
                  message={errors.inventoryUnitId?.message}
                />
              </FormField>

              {/* Tax */}
              <FormField>
                <Label htmlFor="taxId">
                  Tax
                </Label>

                <Controller
                  name="taxId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="taxId">
                        <SelectValue placeholder="Select tax master" />
                      </SelectTrigger>

                      <SelectContent>
                        {taxes.map((tax) => (
                          <SelectItem
                            key={tax.id}
                            value={String(tax.id)}
                            className="whitespace-normal py-3"
                          >
                            GST {tax.gstRate}% | CGST {tax.cgst}% | SGST {tax.sgst}% | IGST {tax.igst}% | UGST {tax.ugst}% | CESS {tax.cess}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                <FormError
                  message={errors.taxId?.message}
                />
              </FormField>

              {/* HSN Code */}
              <FormField>
                <Label htmlFor="hsnCode">
                  HSN Code
                </Label>

                <Controller
                  name="hsnCode"
                  control={control}
                  render={({ field }) => (
                    <PaginatedHsnSacSelect
                      id="hsnCode"
                      type="HSN"
                      value={field.value ?? ""}
                      onValueChange={field.onChange}
                      placeholder="Select HSN code"
                    />
                  )}
                />

                <FormError
                  message={errors.hsnCode?.message}
                />
              </FormField>

            </div>
          </div>

          {/* =========================
              STOCK & MEDIA
          ========================== */}
          <div className="rounded-xl">
            <h2 className="text-xl font-semibold text-primary">
              Stock & media
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">

              {/* Minimum Stock */}
              <FormField>
                <Label htmlFor="minimumStock">
                  Minimum Stock
                </Label>

                <Input
                  id="minimumStock"
                  type="number"
                  placeholder="0"
                  {...register("minimumStock", {
                    valueAsNumber: true,
                  })}
                />

                <FormError
                  message={errors.minimumStock?.message}
                />
              </FormField>

              {/* Maximum Stock */}
              <FormField>
                <Label htmlFor="maximumStock">
                  Maximum Stock
                </Label>

                <Input
                  id="maximumStock"
                  type="number"
                  placeholder="0"
                  {...register("maximumStock", {
                    valueAsNumber: true,
                  })}
                />

                <FormError
                  message={errors.maximumStock?.message}
                />
              </FormField>

              {/* Product Image */}
              <FormField className="sm:col-span-2">
                <Label htmlFor="imageFile">
                  Product Image
                </Label>

                <p className="mb-2 text-sm text-gray-500">
                  Upload a JPG or PNG image up to 60 KB.
                </p>

                <Controller
                  name="imageFile"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value ?? null}
                      existingImageUrl={existingImageUrl}
                      onChange={(file) => {
                        clearErrors("imageFile");
                        field.onChange(file);
                      }}
                      onExistingImageClear={() => setExistingImageUrl("")}
                      onError={(message) => {
                        field.onChange(null);
                        setError("imageFile", {
                          type: "manual",
                          message,
                        });
                      }}
                      maxSize={MAX_IMAGE_SIZE_BYTES}
                    />
                  )}
                />

                <FormError
                  message={errors.imageFile?.message as string}
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* =========================
            ACTION BUTTONS
        ========================== */}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push("/items/products")
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
                ? "Update Product"
                : "Create Product"}
          </Button>
        </div>
      </Card>
    </form>
  );
}


