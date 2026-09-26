import { z } from "zod";

/* =========================================================
   Create User
========================================================= */

export const createUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),

  role: z
    .string()
    .min(1, "Role is required"),

  contact: z
    .string()
    .trim()
    .min(7, "Enter a valid contact number"),
});

export type CreateUserFormData =
  z.infer<typeof createUserSchema>;


/* =========================================================
   Update User
========================================================= */

export const updateUserSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email"),

  contact: z
    .string()
    .trim()
    .min(7, "Enter a valid contact number"),

  role: z
    .string()
    .min(1, "Role is required"),

  /*
   * Password is optional while updating.
   *
   * Empty string means:
   * "Don't change the existing password."
   */
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),
});

export type UpdateUserFormData =
  z.infer<typeof updateUserSchema>;





// import { z } from "zod";

// export const createUserSchema = z.object({
//   fullName: z.string().trim().min(2, "Full name is required"),
//   email: z.string().trim().email("Enter a valid email"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
//   role: z.string().trim().min(1, "Role is required"),
//   contact: z.string().trim().min(7, "Contact is required"),
// });

// export const updateUserSchema = z.object({
//   fullName: z.string().trim().min(2, "Full name is required").optional(),
//   email: z.string().trim().email("Enter a valid email").optional(),
//   role: z.string().trim().min(1, "Role is required").optional(),
//   contact: z.string().trim().min(7, "Contact is required").optional(),
// });
