import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().trim().min(2, "Role name is required"),
  description: z.string().trim().min(3, "Description is required"),
});

export const featureSchema = z.object({
  name: z.string().trim().min(2, "Feature name is required"),
  route: z.string().trim().min(2, "Route is required"),
  description: z.string().trim().min(3, "Description is required"),
  priority: z.coerce.number().min(1, "Priority must be at least 1"),
  moduleId: z.union([z.string(), z.number()]).refine((value) => String(value).trim() !== "", {
    message: "Module is required",
  }),
  subModuleId: z.union([z.string(), z.number()]).optional()
});

export const apiSchema = z.object({
  name: z.string().trim().min(2, "API name is required"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"], {
    error: "Select a valid method",
  }),
  route: z.string().trim().min(2, "Route is required"),
  description: z.string().trim().min(3, "Description is required"),
  priority: z.coerce.number().min(1, "Priority must be at least 1"),
  moduleId: z.union([z.string(), z.number()]).refine((value) => String(value).trim() !== "", {
    message: "Module is required",
  }),

  subModuleId: z.union([z.string(), z.number()]).optional(),
  featureId: z.union([z.string(), z.number()]).optional(),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
export type FeatureFormValues = z.infer<typeof featureSchema>;
export type ApiFormValues = z.input<typeof apiSchema>;
export type ApiFormOutput = z.output<typeof apiSchema>;
