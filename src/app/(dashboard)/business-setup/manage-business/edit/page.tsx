"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import Container from "@/components/common/Container";
import BusinessSetupWizard from "@/modules/business/setup/components/BusinessSetupWizard";
import { BusinessSetupData } from "@/modules/business/setup/validation";
import {
  fetchBusinesses,
  selectBusinessRecords,
  selectBusinessStatus,
} from "@/modules/business/store/businessSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function EditBusinessPage() {
  const search = useSearchParams();
  const id = search.get("id");
  const dispatch = useAppDispatch();
  const businessRecords = useAppSelector(selectBusinessRecords);
  const businessStatus = useAppSelector(selectBusinessStatus);

  const [initialValues, setInitialValues] = useState<BusinessSetupData | null>(null);
  const [initialTenantId, setInitialTenantId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    void dispatch(fetchBusinesses());
  }, [dispatch]);

  useEffect(() => {
    if (!id) return;
    if (businessStatus === "idle" || businessStatus === "loading") return;

    const payload = businessRecords.find((record) => String(record.id) === id);

    if (!payload) {
      setInitialValues(null);
      setInitialTenantId(null);
      setNotFound(true);
      return;
    }

    const mapToForm = (): BusinessSetupData => {
      const info = {
        businessType: payload.businessType ?? "retail",
        gstin: payload.gstin ?? "",
        pan: payload.pan ?? "",
        legalName: payload.legalName ?? payload.displayName ?? "",
        tradeName: payload.tradeName ?? "",
        displayName: payload.displayName ?? payload.legalName ?? "",
        email: payload.email ?? "",
        phone: payload.phone ?? "",
        websiteLink: payload.websiteLink ?? "",
        businessCategoryId: String((payload as any).businessCategoryId ?? ""),
        businessSubCategoryId: String((payload as any).businessSubCategoryId ?? ""),
        industryId: String((payload as any).industryId ?? ""),
        registrationType: (payload as any).registrationTypeId ?? (payload as any).registrationType ?? "",
        registrationNumber: (payload as any).registrationNumber ?? "",
        licenseTypeId: (payload as any).licenseTypeId ?? "",
        tan: (payload as any).tan ?? "",
        msme: (payload as any).msme ?? "",
        currencyId: (payload as any).currencyId ?? "inr",
        timezone: (payload as any).timezone ?? "Asia/Kolkata",
        financialYear: (payload as any).financialYear ?? "2025-2026",
        description: (payload as any).description ?? "",
        logo: (payload as any).logo ?? "",
      };

      const addressObj = (payload.addresses && payload.addresses[0]) || {};
      const address = {
        addressLine1: addressObj.addressLine1 ?? "",
        addressLine2: addressObj.addressLine2 ?? "",
        pincode: addressObj.pincode ?? addressObj.pincode ?? "",
        countryId: addressObj.country ?? (payload as any).countryId ?? "in",
        stateId: addressObj.state ?? (payload as any).stateId ?? "",
        cityId: addressObj.city ?? (payload as any).cityId ?? "",
        isPrimary: true,
      };

      const branches = (payload.branches || []).map((b: any) => ({
        id: b.id ?? "",
        branchCode: b.branchCode ?? b.code ?? "",
        branchName: b.branchName ?? b.name ?? "",
        managerId: b.userId ?? b.managerId ?? "",
        phone: b.phone ?? "",
        email: b.email ?? "",
        pincode: b.pincode ?? "",
        countryId: b.country ?? b.countryId ?? "in",
        stateId: b.state ?? b.stateId ?? "",
        cityId: b.city ?? b.cityId ?? "",
        status: b.status ?? "active",
      }));

      const bankObj = (payload as any).banks?.[0] || {};
      const bank = {
        accountHolderName: bankObj.accountHolderName ?? bankObj.holderName ?? "",
        bankName: bankObj.bankName ?? "",
        accountNumber: bankObj.accountNumber ?? "",
        ifscCode: bankObj.ifscCode ?? "",
        branch: bankObj.branch ?? "",
        upiId: bankObj.upiId ?? "",
      };

      const documents = ((payload as any).documents || []).map((d: any) => ({
        globalDocumentTypeId: d.globalDocumentTypeId ?? d.globalDocumentTypeID ?? d.documentType ?? d.type ?? "",
        file: d.fileUrl ?? null,
        fileName: d.fileName ?? d.name ?? "",
        fileUrl: d.fileUrl ?? d.url ?? "",
      }));

      return {
        info,
        address,
        branches,
        bank,
        documents,
      };
    };

    setInitialValues(mapToForm());
    setInitialTenantId(payload.tenantId ? String(payload.tenantId) : null);
    setNotFound(false);
  }, [id, businessRecords, businessStatus]);

  if (!id) {
    return (
      <Container className="py-8">
        <div className="text-center text-muted">Business id is missing in the URL.</div>
      </Container>
    );
  }

  const isLoading = businessStatus === "idle" || businessStatus === "loading" || (!initialValues && !notFound);

  return (
    <Container className="py-8">
      {notFound ? (
        <div className="text-center text-muted">Business not found.</div>
      ) : isLoading ? (
        <div className="flex h-56 items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : initialValues ? (
        <BusinessSetupWizard
          initialValues={initialValues}
          initialBusinessId={id}
          initialTenantId={initialTenantId ?? undefined}
        />
      ) : null}
    </Container>
  );
}
