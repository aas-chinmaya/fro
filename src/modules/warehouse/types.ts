export type WarehouseResource = "racks" | "shelves" | "bins";

export type WarehouseStatus = "active" | "inactive";

export interface RackRecord {
  id: string;
  rackNo: string;
  rackCode?: string;
  binLocationId?: string | null;

  status?: WarehouseStatus | string | boolean;
  isActive?: boolean;

  occupancyStatus?: string | null;

  tenantId?: string | null;
  branchId?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;

  createdAt?: string;
  updatedAt?: string;

  shelves?: ShelfRecord[];
}

export interface ShelfRecord {
  id: string;
  rackId: string;
  shelfNo: string;
  shelfCode?: string;
  binLocationId?: string | null;

  status?: WarehouseStatus | string | boolean;
  isActive?: boolean;

  occupancyStatus?: string | null;

  createdAt?: string;
  updatedAt?: string;

  bins?: BinRecord[];

  rack?: Pick<RackRecord, "id" | "rackNo">;
}

export interface BinRecord {
  id: string;
  shelfId: string;
  binNo: string;

  binCode?: string;
  binLocationId?: string | null;

  status?: WarehouseStatus | string | boolean;
  isActive?: boolean;

  occupancyStatus?: string | null;

  createdAt?: string;
  updatedAt?: string;

  shelf?: Pick<ShelfRecord, "id" | "shelfNo"> & {
    rack?: Pick<RackRecord, "id" | "rackNo">;
  };
}

export type WarehouseRecord = RackRecord | ShelfRecord | BinRecord;

export interface RackInput {
  rackNo: string;
  status: WarehouseStatus;
}

export interface ShelfInput {
  rackId: string;
  shelfNo: string;
  status: WarehouseStatus;
}

export interface ShelfUpdateInput extends ShelfInput {
  shelfId: string;
  binNo: number;
  isActive: boolean | string;
}

export interface RackShelfUpdateInput {
  rackId: string;
  shelfNo: string;
  isActive: boolean | string;
}

export interface BinInput {
  shelfId: string;
  binNo: string;
  status: WarehouseStatus;
}

