/**
 * Helpers to map API vendor response → form values
 * Exact logic extracted from original edit page — no functional changes.
 */

export const resolveWebsiteLink = (
  value?: string,
) => {
  if (!value) return "";

  try {
    new URL(value);
    return value;
  } catch {
    return "";
  }
};

export const normalizeStatus = (
  value?: string,
) => {
  const normalized = String(
    value ?? "",
  )
    .trim()
    .toUpperCase();

  return [
    "ACTIVE",
    "INACTIVE",
    "BLOCKED",
  ].includes(normalized)
    ? normalized
    : "ACTIVE";
};

export const normalizeDocumentUrl = (
  value: any,
) => {
  if (!value) return "";

  if (typeof value === "string") {
    const normalized = value.replace(
      /\/uploads\/\/uploads\//g,
      "/uploads/",
    );

    if (
      /^https?:\/\//i.test(
        normalized,
      )
    ) {
      return normalized;
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(
        /\/$/,
        "",
      );

    return baseUrl
      ? `${baseUrl}${
          normalized.startsWith("/")
            ? normalized
            : `/${normalized}`
        }`
      : normalized;
  }

  return (
    value?.view ??
    value?.download ??
    ""
  );
};

/* =========================================================
   Vendor → Form Values
========================================================= */

export const mapVendorToFormValues = (
  vendor: any,
) => {
  const addressSource =
    vendor.addresses?.[0] ??
    vendor.address ??
    {};

  const shippingSource =
    vendor.shippingAddress ?? {};

  const contactSource =
    vendor.contacts?.[0] ??
    vendor.contact ??
    {};

  const bankSource =
    vendor.banks?.[0] ??
    vendor.bank ??
    {};

  const purchaseSource =
    vendor.purchase ?? {};

  const taxSource =
    vendor.tax ?? {};

  /* =======================================================
     Contact
  ======================================================= */

  const phoneValue =
    contactSource.vendorPhone ??
    contactSource.mobile ??
    vendor.phone ??
    vendor.vendorPhone ??
    "";

  const emailValue =
    contactSource.contactemail ??
    contactSource.email ??
    vendor.email ??
    vendor.vendorEmail ??
    "";

  /* =======================================================
     Form Object
  ======================================================= */

  return {
    ...vendor,

    /* Basic information */
    vendorCode:
      vendor.vendorCode ?? "",

    tenantId:
      vendor.tenantId ?? "tenant001",

    vendorName:
      vendor.vendorName ?? "",

    legalName:
      vendor.legalName ?? "",

    displayName:
      vendor.displayName ?? "",

    vendorType:
      vendor.vendorType ?? "",

    businessCategory:
      vendor.businessCategory ?? "",

    status: normalizeStatus(
      vendor.status,
    ),

    remarks:
      vendor.remarks ?? "",

    logo:
      normalizeDocumentUrl(
        vendor.logo ??
          vendor.logoUrl,
      ) || null,

    createdBy:
      vendor.createdBy ?? "user001",

    /* =====================================================
       Tax
    ===================================================== */

    gstin:
      taxSource.gstin ?? "",

    pan:
      taxSource.pan ?? "",

    /* =====================================================
       Contact
    ===================================================== */

    email: emailValue,

    phone: phoneValue,

    alternatevendorPhone:
      vendor.alternatevendorPhone ??
      contactSource.alternatevendorPhone ??
      "",

    websiteLink:
      resolveWebsiteLink(
        vendor.websiteLink,
      ) ||
      resolveWebsiteLink(
        contactSource.website,
      ),

    /* =====================================================
       Purchase
    ===================================================== */

    currencyId:
      purchaseSource.currencyId?.id ??
      purchaseSource.currencyId ??
      purchaseSource.currency?.id ??
      purchaseSource.currency ??
      "INR",

    paymentTerm:
      purchaseSource.paymentTerms ?? "",

    paymentMode:
      purchaseSource.paymentMode ?? "",

    creditLimit: Number(
      purchaseSource.creditLimit ?? 0,
    ),

    openingBalance: Number(
      purchaseSource.openingBalance ?? 0,
    ),

    /* =====================================================
       Address
    ===================================================== */

    sameAsBilling:
      typeof addressSource.isShippingSameAsBilling ===
      "boolean"
        ? addressSource.isShippingSameAsBilling
        : true,

    addresses: [
      {
        addressLine1:
          addressSource.billingAddressLine1 ??
          addressSource.addressLine1 ??
          "",

        addressLine2:
          addressSource.billingAddressLine2 ??
          addressSource.addressLine2 ??
          "",

        landmark:
          addressSource.billingLandmark ??
          addressSource.landmark ??
          "",

        district:
          addressSource.billingDistrict ??
          addressSource.district ??
          "",

        countryId:
          addressSource.billingCountry ??
          addressSource.countryId ??
          "",

        stateId:
          addressSource.billingState ??
          addressSource.stateId ??
          "",

        cityId:
          addressSource.billingCity ??
          addressSource.cityId ??
          "",

        pincode:
          addressSource.billingPincode ??
          addressSource.pincode ??
          "",

        status:
          addressSource.status ??
          "Active",

        isBilling: true,

        isShipping:
          typeof addressSource.isShippingSameAsBilling ===
          "boolean"
            ? addressSource.isShippingSameAsBilling
            : true,

        shippingAddressLine1:
          addressSource.shippingAddressLine1 ??
          shippingSource.addressLine1 ??
          "",

        shippingAddressLine2:
          addressSource.shippingAddressLine2 ??
          shippingSource.addressLine2 ??
          "",
      },
    ],

    /* =====================================================
       Shipping Address
    ===================================================== */

    shippingAddress: {
      addressLine1:
        shippingSource.addressLine1 ??
        addressSource.shippingAddressLine1 ??
        "",

      addressLine2:
        shippingSource.addressLine2 ??
        addressSource.shippingAddressLine2 ??
        "",

      landmark:
        shippingSource.landmark ??
        addressSource.shippingLandmark ??
        "",

      district:
        shippingSource.district ??
        addressSource.shippingDistrict ??
        "",

      countryId:
        shippingSource.countryId ??
        addressSource.shippingCountry ??
        "",

      stateId:
        shippingSource.stateId ??
        addressSource.shippingState ??
        "",

      cityId:
        shippingSource.cityId ??
        addressSource.shippingCity ??
        "",

      pincode:
        shippingSource.pincode ??
        addressSource.shippingPincode ??
        "",

      status:
        shippingSource.status ??
        "Active",

      isBilling: false,

      isShipping: true,
    },

    /* =====================================================
       Contacts
    ===================================================== */

    contacts: [
      {
        name:
          contactSource.contactPerson ??
          contactSource.name ??
          "",

        designation:
          contactSource.designation ??
          "",

        mobile:
          contactSource.mobile ??
          contactSource.vendorPhone ??
          phoneValue ??
          "",

        vendorPhone:
          contactSource.vendorPhone ??
          contactSource.mobile ??
          phoneValue ??
          "",

        email:
          contactSource.email ??
          contactSource.contactemail ??
          emailValue ??
          "",

        contactemail:
          emailValue,

        alternateMobile:
          contactSource.alternateMobile ??
          "",

        alternatevendorPhone:
          contactSource.alternatevendorPhone ??
          "",

        website:
          contactSource.website ??
          "",
      },
    ],

    /* =====================================================
       Banks
    ===================================================== */

    banks: [
      {
        accountHolder:
          bankSource.accountHolder ??
          "",

        bankName:
          bankSource.bankName ??
          "",

        accountNumber:
          bankSource.accountNumber ??
          "",

        ifscCode:
          bankSource.ifsc ??
          bankSource.ifscCode ??
          "",

        branch:
          bankSource.branch ??
          "",

        upiId:
          bankSource.upiId ??
          "",

        accountType:
          bankSource.accountType ??
          "",

        cancelledCheque:
          bankSource.cancelledCheque ??
          bankSource.cancelledChequeRef ??
          "",

        isPrimary:
          bankSource.isPrimary ??
          true,
      },
    ],

    /* =====================================================
       Documents
    ===================================================== */

    documents:
      vendor.documents?.map(
        (doc: any) => ({
          globalDocumentTypeID:
            doc.globalDocumentTypeID ??
            doc.globalDocumentTypeId ??
            doc.documentType?.id ??
            doc.documentType ??
            doc.type ??
            "",

          fileUrl:
            normalizeDocumentUrl(
              doc.fileUrl ??
                doc.url,
            ),

          id: doc.id,

          originalName:
            doc.originalName ??
            doc.fileName ??
            "",
        }),
      ) ?? [],
  };
};
