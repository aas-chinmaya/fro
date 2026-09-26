import { useCallback, useEffect, useState } from "react";
import { productservice } from "../services/product.service";
import { serviceservice } from "../services/service.service";

export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;

  type: "PRODUCT" | "SERVICE";
  classification: "GOODS" | "SERVICES";

  itemCode?: string;
  salePrice: number;

  unit?: string;
  hsnSacCode?: string;

  tax?: any;

  categoryName?: string;
  brandName?: string;

  rawItem: any;
}

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
        ? products.map((product: any) => ({
            id: product.id,
            name: product.itemName,
            description: product.description,

            type: "PRODUCT",
            classification: "GOODS",

            itemCode: product.itemCode,
            salePrice: Number(product.salePrice ?? 0),

            unit: product.inventoryUnit?.shortName,
            hsnSacCode: product.hsnCode,

            tax: product.tax,

            categoryName: product.category?.categoryName,
            brandName: product.brand?.brandName,

            rawItem: product,
          }))
        : [];

      const normalizedServices: InvoiceItem[] = Array.isArray(services)
        ? services.map((service: any) => ({
            id: service.id,
            name: service.serviceName,
            description: service.description,

            type: "SERVICE",
            classification: "SERVICES",

            itemCode: service.serviceCode,
            salePrice: Number(service.serviceCharge ?? 0),

            unit: service.unit,
            hsnSacCode: service.sacCode,

            tax: service.tax,

            categoryName: service.category?.categoryName,
            brandName: service.brand?.brandName,

            rawItem: service,
          }))
        : [];

      setItems([
        ...normalizedProducts,
        ...normalizedServices,
      ]);
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch invoice items"
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












// import { useEffect, useState } from "react";
// import { productservice } from "../services/product.service";
// import { serviceservice } from "../services/service.service";

// export const useInvoiceItems = () => {
//   const [items, setItems] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const getInvoiceItems = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const [productResponse, serviceResponse] = await Promise.all([
//         productservice.getAllProducts(),
//         serviceservice.getAllServices(),
//       ]);

//       const products =
//         productResponse?.data?.data?.data ??
//         productResponse?.data?.data ??
//         productResponse?.data ??
//         productResponse ??
//         [];

//       const services =
//         serviceResponse?.data?.data?.data ??
//         serviceResponse?.data?.data ??
//         serviceResponse?.data ??
//         serviceResponse ??
//         [];

//       const normalizedProducts = products.map((product: any) => ({
//         id: product.id,
//         name: product.itemName,
//         description: product.description,

//         type: "PRODUCT" as const,
//         classification: "GOODS" as const,

//         itemCode: product.itemCode,
//         salePrice: product.salePrice ?? 100,

//         unit: product.inventoryUnit?.shortName,
//         hsnSacCode: product.hsnCode,

//         tax: product.tax,

//         categoryName: product.category?.categoryName,
//         brandName: product.brand?.brandName,

//         rawItem: product,
//       }));

//       const normalizedServices = services.map((service: any) => ({
//         id: service.id,
//         name: service.serviceName,
//         description: service.description,

//         type: "SERVICE" as const,
//         classification: "SERVICES" as const,

//         itemCode: service.serviceCode,
//         salePrice: service.serviceCharge ?? 0,

//         unit: service.unit,
//         hsnSacCode: service.sacCode,

//         tax: service.tax,

//         categoryName: service.category?.categoryName,
//         brandName: service.brand?.brandName,

//         rawItem: service,
//       }));

//       setItems([
//         ...normalizedProducts,
//         ...normalizedServices,
//       ]);
//     } catch (error: any) {
//       setError(error?.message || "Failed to fetch invoice items");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getInvoiceItems();
//   }, []);

//   return {
//     items,
//     loading,
//     error,
//     refetch: getInvoiceItems,
//   };
// };