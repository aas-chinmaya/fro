"use client";

import Image from "next/image";
import { Edit, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Card, Badge, Button, Switch } from "@/components/ui";
import Container from "@/components/common/Container";
import { notify } from "@/lib/toast";
import { serviceservice } from "@/modules/items/services/service.service";
import { ServiceRow } from "@/modules/items/types";

interface ServiceCardProps {
  service?: ServiceRow;
  serviceId: string;
}

export default function ServiceCard({ service, serviceId }: ServiceCardProps) {
  const router = useRouter();
  const [currentService, setCurrentService] = useState<ServiceRow | null>(service ?? null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [loadingService, setLoadingService] = useState(false);

  useEffect(() => {
    async function loadService() {
      try {
        setLoadingService(true);
        const response = await serviceservice.getServiceById(serviceId);
        const fetchedService = response?.data?.data ?? response?.data?.data?.data ?? response?.data;

        if (fetchedService) {
          setCurrentService(fetchedService);
        }
      } catch (error: any) {
        notify.error(error?.response?.data?.message || "Unable to load service details.");
      } finally {
        setLoadingService(false);
      }
    }

    loadService();
  }, [serviceId]);

  async function handleStatusChange(nextStatus: boolean) {
    if (!currentService?.id) {
      return;
    }

    try {
      setSavingStatus(true);
      await serviceservice.updateServiceStatus(String(currentService.id), nextStatus);
      setCurrentService({ ...currentService, status: nextStatus });
      notify.success(nextStatus ? "Service activated." : "Service inactivated.");
    } catch (error: any) {
      notify.error(error?.response?.data?.message || "Unable to update service status.");
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <div className="space-y-6">
      <Container>
        <Card className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="relative h-56 w-full overflow-hidden rounded-xl border lg:w-64 object-contain">
              <div className="flex h-full items-center justify-center bg-violet-50">
                <Wrench className="h-16 w-16 text-violet-500" />
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold">{currentService?.serviceName ?? "-"}</h1>
                  <Badge variant={currentService?.status ? "success" : "secondary"}>
                    {currentService?.status ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <p className="mt-3 text-gray-500">Service Code : {currentService?.serviceCode ?? "-"}</p>
                <p className="text-gray-500">Category : {currentService?.category?.categoryName ?? "-"}</p>
                <p className="text-gray-500">Sub Category : {currentService?.subCategory?.subCategoryName ?? "-"}</p>
                <p className="text-gray-500">Tax : {currentService?.tax?.hsnCode ?? "-"}</p>
                <p className="text-gray-500">SAC Code : {currentService?.sacCode ?? "-"}</p>
                <p className="text-gray-500">Service Charge : {currentService?.serviceCharge ?? 0}</p>
                <p className="text-gray-500">GST Rate : {currentService?.gstRate ?? 0}%</p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button type="button" onClick={() => router.push(`/items/services/${currentService?.id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>

                <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                  <span className="text-sm font-medium text-slate-700">{currentService?.status ? "Active" : "Inactive"}</span>
                  <Switch
                    checked={currentService?.status ?? false}
                    onCheckedChange={handleStatusChange}
                    disabled={savingStatus}
                    aria-label="Toggle service status"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Description</h2>
          <div className="text-gray-600">
            {currentService?.description ? <div dangerouslySetInnerHTML={{ __html: currentService.description }} /> : "No description available."}
          </div>
        </Card>
      </Container>
    </div>
  );
}
