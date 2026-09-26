import type { z } from "zod";
import type { Quotation } from "./quotation.types";
import { quotationCreateSchema } from "../schemas/quotation.schema";

export type QuotationFormMode = "create" | "edit";

export interface QuotationFormProps {
  mode: QuotationFormMode;
  quotation?: Quotation | null;
  onSuccess?: (quotation: Quotation) => void;
  onCancel?: () => void;
}

export type QuotationFormValues = z.infer<typeof quotationCreateSchema>;
