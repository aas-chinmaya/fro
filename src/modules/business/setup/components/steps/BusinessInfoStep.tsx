"use client";

import { useFormContext } from "react-hook-form";
import {
  Building2,
  Tags,
  Phone,
  ShieldCheck,
  SlidersHorizontal,
  ImageIcon,
  Sparkles,
} from "lucide-react";

import {
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui";
import { FormField, ImageUpload } from "@/components/form";

import SectionHeader from "../SectionHeader";
import OptionCardGroup from "../OptionCardGroup";
import { useMasterData } from "../../hooks/useMasterData";
import {
  businessTypeIcons,
  businessCategoryIcons,
  industryIcons,
  getOptionIcon,
} from "../../data/optionIcons";
import { BusinessSetupData } from "../../validation";
import LucideIconRenderer from "@/components/common/LucideIconRenderer";

const CARD =
  "overflow-hidden rounded-2xl border border-slate-200/80 bg-white rounded-2xl";

export default function BusinessInfoStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<BusinessSetupData>();

  const {
    businessTypes,
    businessCategories,
    businessSubCategories,
    industries,
    registrationTypes,
    licenseTypes,
    currencies,
    timezones,
    financialYears,
    loading,
  } = useMasterData();

  const e = errors.info;
  const businessType = watch("info.businessType");
  const category = watch("info.businessCategoryId");
  const subCategory = watch("info.businessSubCategoryId");
  const industry = watch("info.industryId");
  const licenseType = watch("info.licenseTypeId");
  const logo = watch("info.logo");
  const availableSubCategories = businessSubCategories.filter(
    (option) => !option.parentId || option.parentId === category
  );

  return (
    <div className="space-y-6">
      {/* Identity */}
      <section className={CARD}>
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <SectionHeader
            icon={Building2}
            tint="blue"
            title="Business Identity"
            subtitle="The names your customers and your ERP will use"
          />
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          <FormField label="Legal Name" required error={e?.legalName?.message}>
            <Input
              {...register("info.legalName")}
              placeholder="Enter your business legal name"
            />
          </FormField>

          <FormField label="Trade Name" error={e?.tradeName?.message}>
            <Input
              {...register("info.tradeName")}
              placeholder="Enter your business trade name"
            />
          </FormField>

          <FormField
            label="Display Name"
            required
            error={e?.displayName?.message}
          >
            <Input
              {...register("info.displayName")}
              placeholder="Enter the name shown across Biznex"

            />
          </FormField>
        </div>
      </section>

      {/* Classification */}
      <section className={CARD}>
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <SectionHeader
            icon={Tags}
            tint="blue"
            title="Business Classification"
            subtitle="Select the options that best describe your business"
          />
        </div>

        <div className="space-y-7 p-5 sm:p-6">
          <FormField label="Business Type" required error={e?.businessType?.message}>
            <OptionCardGroup
              name="Business Type"
              options={businessTypes}
              value={businessType}
              onChange={(v) =>
                setValue("info.businessType", v, { shouldValidate: true })
              }
              getIcon={(id) => getOptionIcon(businessTypeIcons, id)}
              hasError={!!e?.businessType}
            />
          </FormField>

          <FormField label="Industry" required error={e?.industryId?.message}>
            <Select
              value={industry}
              onValueChange={(v) =>
                setValue("info.industryId", v, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="h-10 w-full">
                {(() => {
                  const selectedIndustry = industries.find(
                    (option) => option.id === industry
                  );
                  const FallbackIcon = selectedIndustry
                    ? getOptionIcon(industryIcons, selectedIndustry.id)
                    : null;

                  return selectedIndustry ? (
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                        {selectedIndustry.icon ? (
                          <LucideIconRenderer
                            name={selectedIndustry.icon}
                            className="h-4 w-4"
                            strokeWidth={1.8}
                          />
                        ) : FallbackIcon ? (
                          <FallbackIcon className="h-4 w-4" strokeWidth={1.8} />
                        ) : null}
                      </span>
                      <span>{selectedIndustry.name}</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select industry" />
                  );
                })()}
              </SelectTrigger>

              <SelectContent>
                {industries.map((option) => {
                  const Icon = getOptionIcon(industryIcons, option.id);

                  return (
                    <SelectItem key={option.id} value={option.id}>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                          {option.icon ? (
                            <LucideIconRenderer
                              name={option.icon}
                              className="h-4 w-4"
                              strokeWidth={1.8}
                            />
                          ) : (
                            <Icon className="h-4 w-4" strokeWidth={1.8} />
                          )}
                        </span>

                        <span>{option.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </FormField>

          <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
            <FormField
              label="Business Category"
              required
              error={e?.businessCategoryId?.message}
            >
              <Select
                value={category}
                onValueChange={(v) => {
                  setValue("info.businessCategoryId", v, { shouldValidate: true });
                  if (
                    subCategory &&
                    !businessSubCategories.some(
                      (item) => item.id === subCategory && item.parentId === v
                    )
                  ) {
                    setValue("info.businessSubCategoryId", "", { shouldValidate: true });
                  }
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  {category ? (
                    (() => {
                      const selectedCategory = businessCategories.find(
                        (item) => item.id === category
                      );

                      if (!selectedCategory) {
                        return (
                          <SelectValue placeholder="Select business category" />
                        );
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                            <LucideIconRenderer
                              name={selectedCategory.icon || selectedCategory.meta}
                              className="h-4 w-4"
                              strokeWidth={1.8}
                            />
                          </span>

                          <span>{selectedCategory.name}</span>
                        </div>
                      );
                    })()
                  ) : (
                    <SelectValue placeholder="Select business category" />
                  )}
                </SelectTrigger>

                <SelectContent>
                  {businessCategories.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                          <LucideIconRenderer
                            name={option.icon || option.meta}
                            className="h-4 w-4"
                            strokeWidth={1.8}
                          />
                        </span>

                        <span>{option.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField
              label="Business Sub Category"
              required
              error={e?.businessSubCategoryId?.message}
            >
              <Select
                value={subCategory}
                onValueChange={(v) =>
                  setValue("info.businessSubCategoryId", v, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="h-10 w-full">
                  {subCategory ? (
                    (() => {
                      const selectedSubCategory = businessSubCategories.find(
                        (item) => item.id === subCategory
                      );

                      if (!selectedSubCategory) {
                        return (
                          <SelectValue placeholder="Select business sub-category" />
                        );
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                            <LucideIconRenderer
                              name={selectedSubCategory.icon || "Layers"}
                              className="h-4 w-4"
                              strokeWidth={1.8}
                            />
                          </span>
                          <span>{selectedSubCategory.name}</span>
                        </div>
                      );
                    })()
                  ) : (
                    <SelectValue placeholder="Select business sub-category" />
                  )}
                </SelectTrigger>

                <SelectContent>
                  {availableSubCategories.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                          <LucideIconRenderer
                            name={option.icon || "Layers"}
                            className="h-4 w-4"
                            strokeWidth={1.8}
                          />
                        </span>
                        <span>{option.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className={CARD}>
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <SectionHeader
            icon={Phone}
            tint="blue"
            title="Contact Details"
            subtitle="Primary contact information for invoices and support"
          />
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          <FormField label="Email" required error={e?.email?.message}>
            <Input
              type="email"
              {...register("info.email")}
              placeholder="Your Email"

            />
          </FormField>

          <FormField label="Phone" required error={e?.phone?.message}>
            <Input
              {...register("info.phone")}
              placeholder="Your Phone No."

            />
          </FormField>

          <FormField label="Website" error={e?.websiteLink?.message}>
            <Input
              {...register("info.websiteLink")}
              placeholder="Your Website"

            />
          </FormField>
        </div>
      </section>

      {/* Registration */}
      <section className={CARD}>
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <SectionHeader
            icon={ShieldCheck}
            tint="blue"
            title="Tax & Registration"
            subtitle="Government registration and statutory identifiers"
          />
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          <FormField
            label="GST Registration Type"
            error={e?.registrationType?.message}
          >
            <Select
              value={watch("info.registrationType")}
              onValueChange={(v) =>
                setValue("info.registrationType", v, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger >
                {(() => {
                  const selectedRegistrationType = registrationTypes.find(
                    (registrationType) => registrationType.id === watch("info.registrationType")
                  );

                  return selectedRegistrationType ? (
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                        <LucideIconRenderer
                          name={selectedRegistrationType.icon || "FileText"}
                          className="h-4 w-4"
                          strokeWidth={1.8}
                        />
                      </span>
                      <span>{selectedRegistrationType.name}</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select registration type" />
                  );
                })()}
              </SelectTrigger>
              <SelectContent>
                {registrationTypes.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                        <LucideIconRenderer
                          name={r.icon || "FileText"}
                          className="h-4 w-4"
                          strokeWidth={1.8}
                        />
                      </span>
                      <span>{r.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="GSTIN" required error={e?.gstin?.message}>
            <Input
              {...register("info.gstin")}
              placeholder="Enter your 15 digit GSTIN No."
              className={`uppercase`}
              maxLength={15}
            />
          </FormField>

          <FormField label="PAN" required error={e?.pan?.message}>
            <Input
              {...register("info.pan")}
              placeholder="Enter your PAN Number"
              className={`uppercase`}
              maxLength={10}
            />
          </FormField>

          <FormField
            label="License Type"
            required
            error={e?.licenseTypeId?.message}
          >
            <Select
              value={licenseType}
              onValueChange={(v) =>
                setValue("info.licenseTypeId", v, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="h-10 w-full">
                {(() => {
                  const selectedLicenseType = licenseTypes.find(
                    (option) => option.id === licenseType
                  );

                  return selectedLicenseType ? (
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                        <LucideIconRenderer
                          name={selectedLicenseType.icon || "BadgeCheck"}
                          className="h-4 w-4"
                          strokeWidth={1.8}
                        />
                      </span>
                      <span>{selectedLicenseType.name}</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select license type" />
                  );
                })()}
              </SelectTrigger>
              <SelectContent>
                {licenseTypes.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                        <LucideIconRenderer
                          name={o.icon || "BadgeCheck"}
                          className="h-4 w-4"
                          strokeWidth={1.8}
                        />
                      </span>
                      <span>{o.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Registration / Licence Number"
            error={e?.registrationNumber?.message}
          >
            <Input
              {...register("info.registrationNumber")}
              placeholder="Enter Registration / Licence Number"

            />
          </FormField>

          <FormField label="TAN" error={e?.tan?.message}>
            <Input
              {...register("info.tan")}
              placeholder="Enter your TAN Number"
              className={`uppercase`}
            />
          </FormField>

          <FormField label="MSME / UDYAM" error={e?.msme?.message}>
            <Input
              {...register("info.msme")}
              placeholder="Enter your MSME / UDYAM Registration No."

            />
          </FormField>
        </div>
      </section>

      {/* Preferences */}
      <section className={CARD}>
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <SectionHeader
            icon={SlidersHorizontal}
            tint="blue"
            title="Business Preferences"
            subtitle="Defaults used throughout your business account"
          />
        </div>

        <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
          <FormField label="Currency" required error={e?.currencyId?.message}>
            <Select
              value={watch("info.currencyId")}
              onValueChange={(v) =>
                setValue("info.currencyId", v, { shouldValidate: true })
              }
            >
              <SelectTrigger className="h-10 w-full">
                {(() => {
                  const selectedCurrency = currencies.find(
                    (currency) => currency.id === watch("info.currencyId")
                  );

                  return selectedCurrency ? (
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
                        <LucideIconRenderer
                          name={selectedCurrency.icon || "Coins"}
                          className="h-4 w-4"
                          strokeWidth={1.8}
                        />
                      </span>
                      <span>{selectedCurrency.name}</span>
                    </div>
                  ) : (
                    <SelectValue placeholder="Select currency" />
                  );
                })()}
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600">
                        <LucideIconRenderer
                          name={c.icon || "Coins"}
                          className="h-4 w-4"
                          strokeWidth={1.8}
                        />
                      </span>
                      <span>{c.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Timezone" required error={e?.timezone?.message}>
            <Select
              value={watch("info.timezone")}
              onValueChange={(v) =>
                setValue("info.timezone", v, { shouldValidate: true })
              }
            >
              <SelectTrigger >
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {timezones.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Financial Year"
            required
            error={e?.financialYear?.message}
          >
            <Select
              value={watch("info.financialYear")}
              onValueChange={(v) =>
                setValue("info.financialYear", v, { shouldValidate: true })
              }
            >
              <SelectTrigger >
                <SelectValue placeholder="Select financial year" />
              </SelectTrigger>
              <SelectContent>
                {financialYears.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </section>

      {/* Branding */}
      <section className={CARD}>
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <SectionHeader
            icon={ImageIcon}
            tint="blue"
            title="Branding"
            subtitle="Add your logo and a short business description"
          />
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[0.8fr_1.2fr]">
          <FormField label="Business Logo">
            <div>
              <ImageUpload
                value={logo}
                onChange={(file) =>
                  setValue("info.logo", file, { shouldValidate: true })
                }
              />
              <p className="mt-3 text-xs leading-5 text-slate-400">
                Square PNG or JPG, up to 2 MB. Optional.
              </p>
            </div>
          </FormField>

          <FormField label="Description" error={e?.description?.message}>
            <Textarea
              rows={7}
              {...register("info.description")}
              placeholder="A short description of what the business does"
            />
          </FormField>
        </div>
      </section>
    </div>
  );
}