export type HsnSacType = "HSN" | "SAC";

export interface HsnSac {
  id: string | number;
  code: string;
  description: string;
  type: HsnSacType;
  status?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  hsnCode?: string | null;
  sacCode?: string | null;
}

export interface HsnSacImportSummary {
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  total?: number;
}
