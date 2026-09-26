// "use client";

// import { useMemo, useState } from "react";
// import { useRouter } from "next/navigation";

// import { notify } from "@/lib/toast";

// import { vendorApi } from "@/modules/vendor/api/vendor.api";
// import VendorForm from "@/modules/vendor/components/VendorsForm/VendorForm";

// import {
//   selectBusinessRecords,
// } from "@/modules/business/store/businessSlice";

// import { useAppSelector } from "@/store/hooks";

// export default function CreateVendorWrapper() {
//   const router = useRouter();

//   /**
//    * Get business records from Redux
//    */
//   const businessRecords = useAppSelector(
//     selectBusinessRecords
//   );

//   /**
//    * Current business
//    *
//    * Do NOT cast this to Business.
//    * selectBusinessRecords already has its own type.
//    */
//   const business = businessRecords?.[0];

//   const [loading, setLoading] = useState(false);

//   /**
//    * Resolve Business Category
//    *
//    * Supported API structures:
//    *
//    * 1. category.categoryName
//    * 2. businessCategory.categoryName
//    * 3. businessCategory as string
//    * 4. businessCategoryName
//    */
//   const businessCategory = useMemo(() => {
//     if (!business) {
//       return "";
//     }

//     /**
//      * Normal category relation
//      *
//      * Example:
//      *
//      * category: {
//      *   id: "...",
//      *   categoryName: "Grocery & Supermarket"
//      * }
//      */
//     if (
//       business.category &&
//       typeof business.category === "object" &&
//       "categoryName" in business.category
//     ) {
//       return (
//         business.category.categoryName ?? ""
//       );
//     }

//     /**
//      * Backward-compatible businessCategory
//      *
//      * It can be either:
//      *
//      * BusinessCategory object
//      * OR
//      * string
//      */
//     if (
//       business.businessCategory &&
//       typeof business.businessCategory === "object" &&
//       "categoryName" in business.businessCategory
//     ) {
//       return (
//         business.businessCategory.categoryName ??
//         ""
//       );
//     }

//     if (
//       typeof business.businessCategory ===
//       "string"
//     ) {
//       return business.businessCategory;
//     }

//     /**
//      * Fallback
//      */
//     if (
//       typeof business.businessCategoryName ===
//       "string"
//     ) {
//       return business.businessCategoryName;
//     }

//     return "";
//   }, [business]);

//   /**
//    * Vendor form default values
//    */
//   const vendorDefaults = useMemo(
//     () => ({
//       tenantId: business?.tenantId
//         ? String(business.tenantId)
//         : "",

//       businessCategory,
//     }),
//     [
//       business?.tenantId,
//       businessCategory,
//     ]
//   );

//   /**
//    * Submit Vendor
//    */
//   const handleSubmit = async (
//     data: any
//   ) => {
//     /**
//      * Make sure business is available
//      */
//     if (!business) {
//       notify.error(
//         "Business information is not available"
//       );
//       return;
//     }

//     /**
//      * Tenant ID is required
//      */
//     if (!data?.tenantId) {
//       notify.error(
//         "Complete business onboarding before adding a vendor"
//       );
//       return;
//     }

//     setLoading(true);

//     try {
//       /**
//        * Build vendor payload
//        */
//       const payload: Record<
//         string,
//         any
//       > = {
//         tenantId: String(
//           data.tenantId
//         ),

//         createdBy:
//           data.createdBy ??
//           business.createdBy ??
//           "user001",

//         vendorType:
//           data.vendorType ??
//           null,

//         vendorName:
//           data.vendorName ??
//           "",

//         legalName:
//           data.legalName ??
//           "",

//         displayName:
//           data.displayName ??
//           data.vendorName ??
//           "",

//         businessCategory:
//           data.businessCategory ??
//           businessCategory ??
//           "",

//         status:
//           data.status ??
//           "ACTIVE",

//         remarks:
//           data.remarks ??
//           "",

//         /**
//          * Contact information
//          */
//         vendorEmail:
//           data.email ??
//           data.vendorEmail ??
//           undefined,

//         vendorPhone:
//           data.phone ??
//           data.vendorPhone ??
//           undefined,

//         websiteLink:
//           data.websiteLink ??
//           undefined,

//         /**
//          * Currency
//          */
//         currencyId:
//           data.currencyId ??
//           business.currencyId ??
//           undefined,
//       };

//       /**
//        * Add logo only if supplied
//        */
//       if (data.logo) {
//         payload.logo = data.logo;
//       }

//       console.log(
//         "Create Vendor Payload:",
//         payload
//       );

//       /**
//        * Create vendor
//        */
//       const response =
//         await vendorApi.createBasicInformation(
//           payload
//         );

//       /**
//        * Get created vendor ID
//        */
//       const createdVendorId =
//         response?.data?.data?.id ??
//         response?.data?.id ??
//         undefined;

//       console.log(
//         "Created Vendor ID:",
//         createdVendorId
//       );

//       notify.success(
//         "Vendor saved successfully"
//       );

//       /**
//        * Navigate to vendor list
//        */
//       router.push("/vendors");
//     } catch (error: any) {
//       console.error(
//         "Vendor basic-information failed:",
//         error
//       );

//       notify.error(
//         error?.response?.data?.message ??
//           "Failed to save vendor basic information"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   /**
//    * No business found
//    */
//   if (!business) {
//     return (
//       <div className="p-6">
//         <div className="rounded-lg border p-6">
//           <h2 className="text-lg font-semibold">
//             Business information not found
//           </h2>

//           <p className="mt-2 text-sm text-muted-foreground">
//             Please complete your business
//             onboarding before adding a vendor.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   /**
//    * Vendor Form
//    */
//   return (
//     <VendorForm
//       loading={loading}
//       mode="add"
//       onCancel={() =>
//         router.push("/vendors")
//       }
//       onSubmit={handleSubmit}
//       onComplete={() =>
//         router.push("/vendors")
//       }
//       defaultValues={vendorDefaults}
//     />
//   );
// }


"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { notify } from "@/lib/toast";

import { vendorApi } from "@/modules/vendor/api/vendor.api";
import VendorForm from "@/modules/vendor/components/VendorsForm/VendorForm";

import { selectBusinessRecords } from "@/modules/business/store/businessSlice";
import { useAppSelector } from "@/store/hooks";

/**
 * CREATE VENDOR WRAPPER
 * Same behaviour as original create page.
 * Form is always shown; business / tenantId is checked on submit.
 */
export default function CreateVendorWrapper() {
  const router = useRouter();

  const businessRecords = useAppSelector(selectBusinessRecords);

  /**
   * Current business from Redux.
   * selectBusinessRecords may be an array or a single record depending on store shape.
   */
  const business = useMemo(() => {
    if (!businessRecords) return null;

    if (Array.isArray(businessRecords)) {
      return businessRecords[0] ?? null;
    }

    // Some apps store the active business as a single object
    return businessRecords as any;
  }, [businessRecords]);

  const [loading, setLoading] = useState(false);

  /**
   * Resolve Business Category
   *
   * Supported API structures:
   * 1. category.categoryName
   * 2. businessCategory.categoryName
   * 3. businessCategory as string
   * 4. businessCategoryName
   */
  const businessCategory = useMemo(() => {
    if (!business) return "";

    if (
      business.category &&
      typeof business.category === "object" &&
      "categoryName" in business.category
    ) {
      return business.category.categoryName ?? "";
    }

    if (
      business.businessCategory &&
      typeof business.businessCategory === "object" &&
      "categoryName" in business.businessCategory
    ) {
      return business.businessCategory.categoryName ?? "";
    }

    if (typeof business.businessCategory === "string") {
      return business.businessCategory;
    }

    if (typeof business.businessCategoryName === "string") {
      return business.businessCategoryName;
    }

    return "";
  }, [business]);

  const vendorDefaults = useMemo(
    () => ({
      tenantId: business?.tenantId ? String(business.tenantId) : "",
      businessCategory,
      createdBy: business?.createdBy ?? "",
      currencyId: business?.currencyId
        ? String(business.currencyId)
        : business?.currency?.id
          ? String(business.currency.id)
          : "",
    }),
    [business, businessCategory]
  );

  const handleSubmit = async (data: any) => {
    const tenantId =
      data?.tenantId ||
      (business?.tenantId ? String(business.tenantId) : "");

    if (!tenantId) {
      notify.error(
        "Complete business onboarding before adding a vendor"
      );
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, any> = {
        tenantId: String(tenantId),

        createdBy:
          data.createdBy ??
          business?.createdBy ??
          "user001",

        vendorType: data.vendorType ?? null,

        vendorName: data.vendorName ?? "",

        legalName: data.legalName ?? "",

        displayName:
          data.displayName ?? data.vendorName ?? "",

        businessCategory:
          data.businessCategory ?? businessCategory ?? "",

        status: data.status ?? "ACTIVE",

        remarks: data.remarks ?? "",

        vendorEmail:
          data.email ?? data.vendorEmail ?? undefined,

        vendorPhone:
          data.phone ?? data.vendorPhone ?? undefined,

        websiteLink: data.websiteLink ?? undefined,

        currencyId:
          data.currencyId ??
          business?.currencyId ??
          undefined,
      };

      if (data.logo) {
        payload.logo = data.logo;
      }

      console.log("Create Vendor Payload:", payload);

      const response =
        await vendorApi.createBasicInformation(payload);

      const createdVendorId =
        response?.data?.data?.id ??
        response?.data?.id ??
        undefined;

      console.log("Created Vendor ID:", createdVendorId);

      notify.success("Vendor saved successfully");
      router.push("/vendors");
    } catch (error: any) {
      console.error("Vendor basic-information failed:", error);
      notify.error(
        error?.response?.data?.message ??
          "Failed to save vendor basic information"
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <VendorForm
      loading={loading}
      mode="add"
      onCancel={() => router.push("/vendors")}
      onSubmit={handleSubmit}
      onComplete={() => router.push("/vendors")}
      defaultValues={vendorDefaults}
    />
  );
}
