"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  Building2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Store,
  FileText,
  Phone,
  Mail,
  Globe,
  Eye,
} from "lucide-react";

import BranchList from "./BranchList";
import BusinessStats from "./BusinessStats";

import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Badge,
} from "@/components/ui";

import { cn } from "@/components/ui/utils";

import type {
  Business,
  Branch,
} from "../types";

interface BusinessCardProps {
  business: Business;

  rawRecord?: Record<string, unknown>;

  onAddBranch?: () => void;

  onAddVendor?: () => void;

  onEdit?: () => void;

  onDelete?: () => void;

  onEditBranch?: (branch: Branch) => void;

  onDeleteBranch?: (branch: Branch) => void;
}

export default function BusinessCard({
  business,
  rawRecord,
  onAddBranch,
  onAddVendor,
  onEdit,
  onDelete,
  onEditBranch,
  onDeleteBranch,
}: BusinessCardProps) {
  const router = useRouter();

  const [expanded, setExpanded] = useState(true);

  const [logoFailed, setLogoFailed] = useState(false);

  /*
   * Your current business object already contains:
   *
   * name
   * legalName
   * businessType
   * industry
   * city
   * state
   * country
   * website
   * branches
   * vendors
   * employees
   *
   * So use those fields directly.
   */

  const branches = business.branches ?? [];

  const vendors = business.vendors ?? 0;

  const employees = business.employees ?? 0;

  /*
   * Industry can be either:
   *
   * "FMCG & Consumer Goods"
   *
   * OR
   *
   * {
   *   industryName: "FMCG & Consumer Goods"
   * }
   */

  const industryName =
    typeof business.industry === "string"
      ? business.industry
      : business.industry?.industryName ?? "";

  /*
   * Status from your current BusinessCard data is:
   *
   * "Active"
   *
   * But API may return:
   *
   * "ACTIVE"
   */

  const isActive =
    business.status === "Active" ||
    business.status === "ACTIVE";

  /*
   * Website compatibility.
   *
   * Your current mapped object uses:
   *
   * website
   *
   * API object uses:
   *
   * websiteLink
   */

  const website =
    business.website ??
    business.websiteLink ??
    "";

  /*
   * Business name compatibility.
   *
   * Current mapped object:
   *
   * name
   *
   * API object:
   *
   * displayName
   */

  const businessName =
    business.name ??
    business.displayName ??
    business.legalName ??
    "Business";

  return (
    <Card className="overflow-hidden border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* =====================================================
          ACCENT BAR
      ===================================================== */}

      <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/60 to-primary/20" />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          {/* =================================================
              BUSINESS HEADER LINK
          ================================================= */}

          <Link
            href={`/dashboard?businessId=${business.id}`}
            className="flex flex-1 gap-4 rounded-xl transition hover:bg-primary/5"
          >
            {/* =================================================
                LOGO
            ================================================= */}

            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary/10">
              {business.logo && !logoFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={business.logo}
                  alt={`${businessName} logo`}
                  className="h-full w-full object-cover"
                  onError={() => setLogoFailed(true)}
                />
              ) : (
                <Building2
                  size={28}
                  className="text-primary"
                />
              )}
            </div>

            {/* =================================================
                BUSINESS INFORMATION
            ================================================= */}

            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-text">
                {businessName}
              </h2>

              <p className="mt-1 truncate text-sm text-muted">
                {business.legalName || "—"}
              </p>

              {/* =================================================
                  BADGES
              ================================================= */}

              <div className="mt-3 flex flex-wrap gap-2">
                {/* Business Type */}

                {business.businessType && (
                  <Badge>
                    {business.businessType}
                  </Badge>
                )}

                {/* Status */}

                <Badge
                  variant={
                    isActive
                      ? "success"
                      : "secondary"
                  }
                >
                  {business.status}
                </Badge>

                {/* Industry */}

                {industryName && (
                  <Badge variant="secondary">
                    {industryName}
                  </Badge>
                )}
              </div>
            </div>
          </Link>

          {/* =================================================
              EXPAND / COLLAPSE
          ================================================= */}

          <button
            type="button"
            aria-label={
              expanded
                ? "Collapse business details"
                : "Expand business details"
            }
            onClick={() =>
              setExpanded((previous) => !previous)
            }
            className="shrink-0 rounded-lg p-2 transition hover:bg-primary/10"
          >
            {expanded ? (
              <ChevronUp
                size={20}
                className="text-primary"
              />
            ) : (
              <ChevronDown
                size={20}
                className="text-primary"
              />
            )}
          </button>
        </div>

        {/* =====================================================
            QUICK CONTACT STRIP
        ===================================================== */}

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-100 pt-4 text-xs text-muted">
          {/* Phone */}

          {business.phone && (
            <span className="flex items-center gap-1.5">
              <Phone
                size={13}
                className="text-primary"
              />

              {business.phone}
            </span>
          )}

          {/* Email */}

          {business.email && (
            <span className="flex items-center gap-1.5">
              <Mail
                size={13}
                className="text-primary"
              />

              {business.email}
            </span>
          )}

          {/* Website */}

          {website && (
            <span className="flex items-center gap-1.5">
              <Globe
                size={13}
                className="text-primary"
              />

              {website.replace(
                /^https?:\/\//,
                "",
              )}
            </span>
          )}
        </div>
      </CardHeader>

      {/* =======================================================
          CONTENT
      ======================================================= */}

      <CardContent className="space-y-6">
        {/* =====================================================
            BUSINESS DETAILS
        ===================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* GSTIN */}

          <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300  hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
            <div className="flex items-center gap-2">
              <FileText
                size={16}
                className="text-primary"
              />

              <span className="text-xs uppercase tracking-wide text-muted">
                GSTIN
              </span>
            </div>

            <p className="mt-2 truncate text-sm font-medium">
              {business.gstin || "—"}
            </p>
          </div>

          {/* LOCATION */}

          <div className="rounded-xl border border-gray-200 bg-white p-4 transition-all duration-300  hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
            <div className="flex items-center gap-2">
              <MapPin
                size={16}
                className="text-primary"
              />

              <span className="text-xs uppercase tracking-wide text-muted">
                Location
              </span>
            </div>

            <p className="mt-2 truncate text-sm font-medium">
              {[
                business.city,
                business.state,
                business.country,
              ]
                .filter(Boolean)
                .join(", ") || "—"}
            </p>
          </div>
        </div>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <BusinessStats
          branches={branches.length}
          vendors={vendors}
          employees={employees}
        />

        {/* =====================================================
            EXPANDABLE BRANCH SECTION
        ===================================================== */}

        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            expanded
              ? "max-h-[800px] opacity-100"
              : "max-h-0 opacity-0",
          )}
        >
          <BranchList
            branches={branches}
            onEdit={onEditBranch}
            onDelete={onDeleteBranch}
          />
        </div>

        {/* =====================================================
            DEBUG DETAILS
        ===================================================== */}

        {rawRecord && false && (
          <div className="rounded-md border bg-background p-4">
            <pre className="max-h-60 overflow-auto text-xs">
              {JSON.stringify(
                rawRecord,
                null,
                2,
              )}
            </pre>
          </div>
        )}

        {/* =====================================================
            ACTIONS
        ===================================================== */}

        <div className="flex flex-wrap items-center gap-3 border-t pt-5">
          {/* ADD BRANCH */}

          <Button
            size="sm"
            onClick={() => {
              onAddBranch?.();
            }}
            className="gap-2"
          >
            <Store size={16} />

            Add Branch
          </Button>

          {/* EDIT */}

          <Button
            variant="secondary"
            size="sm"
            onClick={onEdit}
            className="gap-2"
          >
            Edit
          </Button>

          {/* DELETE */}

          <Button
            variant="danger"
            size="sm"
            onClick={onDelete}
            className="gap-2"
          >
            Delete
          </Button>

          {/* VIEW DETAILS */}

          <Button
            size="sm"
            variant="outline"
            className="ml-auto gap-2"
            onClick={() =>
              router.push(
                `/business-setup/manage-business/view?id=${business.id}`,
              )
            }
          >
            <Eye size={16} />

            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}