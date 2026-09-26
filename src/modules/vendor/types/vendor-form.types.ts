import type { z } from "zod";
import type { vendorFormSchema } from "../validation";

export type VendorFormValues = z.infer<typeof vendorFormSchema>;

export type VendorFormMode = "add" | "edit";
