import { useCallback, useEffect, useState } from "react";
import { productservice } from "@/modules/items/services/product.service";
import { serviceservice } from "@/modules/items/services/service.service";

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string | null;

  rate: number;
  unit: string;

  taxRate: number;

  hsnSacCode?: string | null;

  stock?: number | null;

  cgstRate?: number | null;
  sgstRate?: number | null;
  igstRate?: number | null;
  cessRate?: number | null;
}

const getNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const getTaxRates = (tax: any) => {
  if (!tax) {
    return {
      taxRate: 0,
      cgstRate: null,
      sgstRate: null,
      igstRate: null,
      cessRate: null,
    };
  }

  const cgstRate = getNumber(
    tax.cgstRate ?? tax.cgst ?? tax.centralTaxRate ?? tax.centralTax,
  );

  const sgstRate = getNumber(
    tax.sgstRate ?? tax.sgst ?? tax.stateTaxRate ?? tax.stateTax,
  );

  const igstRate = getNumber(
    tax.igstRate ?? tax.igst ?? tax.integratedTaxRate ?? tax.integratedTax,
  );

  const cessRate = getNumber(
    tax.cessRate ?? tax.cess ?? tax.cessPercentage,
  );

  const directTaxRate = getNumber(
    tax.taxRate ??
      tax.rate ??
      tax.gstRate ??
      tax.percentage ??
      tax.taxPercentage,
  );

  const taxRate =
    directTaxRate ??
    (cgstRate != null && sgstRate != null
      ? cgstRate + sgstRate
      : igstRate ?? 0);

  return {
    taxRate,
    cgstRate,
    sgstRate,
    igstRate,
    cessRate,
  };
};

const getStock = (item: any): number | null => {
  return getNumber(
    item.stock ??
      item.currentStock ??
      item.availableStock ??
      item.quantity,
  );
};

export const useInvoiceItems = () => {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getInvoiceItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [productResponse, serviceResponse] = await Promise.all([
        productservice.getProducts(1, 1000),
        serviceservice.getServices(1, 1000),
      ]);

      const products =
        productResponse?.data?.data?.data ??
        productResponse?.data?.data ??
        productResponse?.data ??
        [];

      const services =
        serviceResponse?.data?.data?.data ??
        serviceResponse?.data?.data ??
        serviceResponse?.data ??
        [];

      const normalizedProducts: InvoiceItem[] = Array.isArray(products)
        ? products.map((product: any) => {
            const tax = getTaxRates(product.tax);

            return {
              id: product.id,
              name: product.itemName,
              description: product.description ?? null,
              rate: Number(product.salePrice ?? 0),
              unit: product.inventoryUnit?.shortName ?? "PCS",
              taxRate: tax.taxRate,
              hsnSacCode: product.hsnCode ?? null,
              stock: getStock(product),
              cgstRate: tax.cgstRate,
              sgstRate: tax.sgstRate,
              igstRate: tax.igstRate,
              cessRate: tax.cessRate,
            };
          })
        : [];

      const normalizedServices: InvoiceItem[] = Array.isArray(services)
        ? services.map((service: any) => {
            const tax = getTaxRates(service.tax);

            return {
              id: service.id,
              name: service.serviceName,
              description: service.description ?? null,
              rate: Number(service.serviceCharge ?? 0),
              unit: service.unit ?? "NOS",
              taxRate: tax.taxRate,
              hsnSacCode: service.sacCode ?? null,
              stock: null,
              cgstRate: tax.cgstRate,
              sgstRate: tax.sgstRate,
              igstRate: tax.igstRate,
              cessRate: tax.cessRate,
            };
          })
        : [];

      setItems([...normalizedProducts, ...normalizedServices]);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch invoice items",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void getInvoiceItems();
  }, [getInvoiceItems]);

  return {
    items,
    loading,
    error,
    refetch: getInvoiceItems,
  };
};