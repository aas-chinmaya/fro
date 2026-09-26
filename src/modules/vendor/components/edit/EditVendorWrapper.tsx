"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import VendorForm from "@/modules/vendor/components/VendorsForm/VendorForm";
import { vendorApi } from "@/modules/vendor/api/vendor.api";
import { buildVendorPayload } from "@/modules/vendor/hooks/usevendor";
import { notify } from "@/lib/toast";

import { mapVendorToFormValues } from "@/modules/vendor/lib/map-vendor-to-form";

/* =========================================================
   Edit Vendor Page
========================================================= */

interface EditVendorWrapperProps {
  vendorId: string;
}

export default function EditVendorWrapper({
  vendorId,
}: EditVendorWrapperProps) {
  const router = useRouter();

  const [vendor, setVendor] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  /* =======================================================
     Load Vendor
  ======================================================= */

  useEffect(() => {
    if (!vendorId) return;

    const loadVendor =
      async () => {
        try {
          setLoading(true);
          setError(null);

          const response =
            await vendorApi.getById(
              vendorId,
            );

          const rawVendor =
            response?.data?.data ??
            null;

          setVendor(
            rawVendor
              ? mapVendorToFormValues(
                  rawVendor,
                )
              : null,
          );
        } catch (err: any) {
          console.error(
            "Failed to load vendor",
            err,
          );

          setError(
            err?.response?.data
              ?.message ??
              "Unable to load vendor details.",
          );
        } finally {
          setLoading(false);
        }
      };

    loadVendor();
  }, [vendorId]);

  /* =======================================================
     Submit Update
  ======================================================= */

  const handleSubmit = async (
    data: any,
  ) => {
    if (!vendorId) return;

    setSaving(true);

    try {
      const payload =
        buildVendorPayload(data);

      await vendorApi.update(
        vendorId,
        payload,
      );

      notify.success(
        "Vendor updated successfully",
      );

      router.replace(
        `/vendors/${vendorId}`,
      );
    } catch (err: any) {
      console.error(
        "Vendor update failed",
        err,
      );

      notify.error(
        err?.response?.data
          ?.message ??
          "Failed to update vendor",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     Loading
  ======================================================= */

  if (loading) {
    return (
      <div className="p-6">
        Loading vendor...
      </div>
    );
  }

  /* =======================================================
     Error
  ======================================================= */

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    );
  }

  /* =======================================================
     Not Found
  ======================================================= */

  if (!vendor) {
    return (
      <div className="p-6">
        Vendor not found.
      </div>
    );
  }

  /* =======================================================
     Form
  ======================================================= */

  return (
    <div className="p-6">
      <VendorForm
        loading={saving}
        mode="edit"
        onCancel={() =>
          router.replace(
            `/vendors/${vendorId}`,
          )
        }
        onSubmit={handleSubmit}
        onComplete={() =>
          router.replace(
            `/vendors/${vendorId}`,
          )
        }
        defaultValues={vendor}
      />
    </div>
  );
}
