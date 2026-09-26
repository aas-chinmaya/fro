export enum CategoryType {
  PRODUCT = "PRODUCT",
  SERVICE = "SERVICE",
}

export interface item {
  id: string;

  name: string;

  sku: string;

  category: string;

  unit: string;

  purchasePrice: number;

  sellingPrice: number;

  stock: number;

  gst: number;

  createdAt: string;

  image?: string;

  document?: string;

  description?: string;
}

export interface CategoryMasterRow {
  id: string;
  categoryType: CategoryType;
  categoryName: string;
  description: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubCategoryMasterRow {
  id: string;
  categoryId: string;
  subCategoryName: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
    category: {
    id: string;
    categoryName: string;
    categoryType: CategoryType;
  };
}

export interface BrandMasterRow {
  id: string;
  brandName: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnitMasterRow {
  id: string;
  unitName: string;
  shortName: string;
  unitType: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface VariantTypeMasterRow {
  id: string;
  subCategoryId: string;
  variantTypeCode: string;
  variantTypeName: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;

  subCategory?: {
    id: string;
    subCategoryName: string;
  };
}

export interface VariantValueMasterRow {
  id: string;
  variantTypeId: number;
  value: string;
  shortName: string;
  displayOrder: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  variantType?: {
    id: string;
    variantTypeName: string;
  };
}

export interface TaxMasterRow {
  id: string;
  
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  ugst: number;
  cess: number;
  effectiveFrom: string;
  effectiveTo: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRow {
  id: string;
  tenantId?: string;
  itemCode: string;
  barcode?: string | null;
  itemName: string;
  description?: string;
  categoryId: number;
  subCategoryId: number;
  brandId: number;
  inventoryUnitId: number;
  taxId: number;
  hsnCode: string;
  minimumStock: number;
  maximumStock: number;
  image?: string | null;
  variantTypeId?: number | null;
  variantValueId?: number | null;
  status: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  category?: {
    id: string;
    categoryName: string;
  };

  subCategory?: {
    id: string;
    subCategoryName: string;
  };

  brand?: {
    id: string;
    brandName: string;
  };

  inventoryUnit?: {
    id: string;
    unitName: string;
    shortName?: string;
    unitType?: string;
  };

  tax?: {
    id: string;
    gstRate: number;
  };

  variantType?: {
    id: string;
    variantTypeName: string;
  };

  variantValue?: {
    id: string;
    value: string;
  };
}

export interface ServiceRow {
  id: string;
  serviceCode: string;
  serviceName: string;
  categoryId: number;
  subCategoryId?: number | null;
  taxId: number;
  sacCode?: string | null;
  description?: string | null;
  serviceCharge: number;
  gstRate: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  category?: {
    id: string;
    categoryName: string;
    categoryType?: CategoryType;
  };

  subCategory?: {
    id: string;
    subCategoryName: string;
  };

  tax?: {
    id: string;
    hsnCode: string;
    sacCode?: string | null;
  };
}

export interface CreateCategoryPayload {
  categoryType: CategoryType;
  categoryName: string;
  description?: string;
 
}

export interface UpdateCategoryPayload {
  categoryType?: CategoryType;
  categoryName?: string;
  description?: string;
   
}

export interface CreateSubCategoryPayload {
  categoryId: string;
  subCategoryName: string;
  description?: string;
 
}

export interface UpdateSubCategoryPayload {
  categoryId?: string;
  subCategoryName?: string;
  description?: string;
 
}

export interface CreateBrandPayload {
  brandName: string;
  description?: string;
  
}

export interface UpdateBrandPayload {
  brandName?: string;
  description?: string;
  
}

export interface CreateUnitPayload {
  unitName: string;
  shortName: string;
  unitType: string;
  description?: string; 
}

export interface UpdateUnitPayload {
  unitName?: string;
  shortName?: string;
  unitType?: string;
  description?: string;
 
}

export interface CreateVariantTypePayload {
  subCategoryId: string;
  variantTypeCode: string;
  variantTypeName: string;
  description?: string;
 
}

export interface UpdateVariantTypePayload {
  subCategoryId?: string;
  variantTypeCode?: string;
  variantTypeName?: string;
  description?: string;
 
}

export interface CreateVariantValuePayload {
  variantTypeId: number;
  value: string;
  shortName: string;
  displayOrder: number;
 
}

export interface UpdateVariantValuePayload {
  variantTypeId?: number;
  value?: string;
  shortName?: string;
  displayOrder?: number;
 
}

export interface CreateTaxMasterPayload {
  hsnCode: string;
  sacCode: string;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  ugst: number;
  cess: number;
  effectiveFrom: string;
  effectiveTo: string;
   
}

export interface UpdateTaxMasterPayload {
  hsnCode?: string;
  sacCode?: string;
  gstRate?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  ugst?: number;
  cess?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  
}

export interface CreateitemPayload {

  name:string;

  sku:string;

  barcode?:string;

  category:string;

  unit:string;

  purchasePrice:number;

  sellingPrice:number;

  gst:number;

}

export interface CreateProductPayload {
  tenantId?: number | string;
  itemCode: string;
  barcode?: string | null;
  itemName: string;
  description?: string;
  categoryId: number;
  subCategoryId: number;
  brandId: number;
  inventoryUnitId: number;
  taxId: number;
  hsnCode: string;
  minimumStock: number;
  maximumStock: number;
  image?: string;
  variantTypeId?: number | null;
  variantValueId?: number | null;
  createdBy?: string;
  updatedBy?: string;
}

export interface UpdateProductPayload {
  tenantId?: number | string;
  itemCode?: string;
  barcode?: string | null;
  itemName?: string;
  description?: string;
  categoryId?: number;
  subCategoryId?: number;
  brandId?: number;
  inventoryUnitId?: number;
  taxId?: number;
  hsnCode?: string;
  minimumStock?: number;
  maximumStock?: number;
  image?: string;
  variantTypeId?: number | null;
  variantValueId?: number | null;
  createdBy?: string;
  updatedBy?: string;
}