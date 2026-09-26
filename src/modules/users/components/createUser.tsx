"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/modal";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FormField } from "@/components/form";

import type { CreateUserPayload } from "@/modules/users/types";

import {
  createUserSchema,
  type CreateUserFormData,
} from "@/modules/users/validation";

import { fetchRoles } from "@/modules/masters/store/masterSlice";

import type {
  AppDispatch,
  RootState,
} from "@/store/store";

interface CreateUserProps {
  open: boolean;

  onClose: () => void;

  onSubmit: (
    payload: CreateUserPayload
  ) => Promise<void>;

  loading?: boolean;
}

/* =========================================================
   Default Form Values
========================================================= */

const defaultValues: CreateUserFormData = {
  fullName: "",
  email: "",
  password: "",
  role: "",
  contact: "",
};

/* =========================================================
   Component
========================================================= */

export default function CreateUser({
  open,
  onClose,
  onSubmit,
  loading = false,
}: CreateUserProps) {
  const dispatch = useDispatch<AppDispatch>();

  const {
    roles,
    rolesLoading,
  } = useSelector(
    (state: RootState) => state.masters
  );

  /* =======================================================
     Form
  ======================================================= */

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues,
    mode: "onBlur",
  });

  /* =======================================================
     Load Roles
  ======================================================= */

  useEffect(() => {
    if (
      open &&
      roles.length === 0 &&
      !rolesLoading
    ) {
      dispatch(
        fetchRoles({
          search: "",
        })
      );
    }
  }, [
    dispatch,
    open,
    roles.length,
    rolesLoading,
  ]);

  /* =======================================================
     Reset Form
  ======================================================= */

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, reset]);

  /* =======================================================
     Submit
  ======================================================= */

  const handleFormSubmit = async (
    data: CreateUserFormData
  ) => {
    /*
     * Form data has already been validated by Zod.
     *
     * Convert it to the API payload here.
     */
    const payload: CreateUserPayload = {
      fullName: data.fullName.trim(),

      email: data.email.trim(),

      password: data.password,

      role: data.role,

      contact: data.contact.trim(),
    };

    await onSubmit(payload);
  };

  /* =======================================================
     Render
  ======================================================= */

  return (
    <Modal
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
    >
      <ModalContent className="max-w-xl">
        {/* =================================================
            Header
        ================================================= */}

        <ModalHeader>
          <ModalTitle>
            Add User
          </ModalTitle>
        </ModalHeader>

        {/* =================================================
            Body
        ================================================= */}

        <ModalBody>
          <form
            id="create-user-form"
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            {/* =============================================
                Full Name
            ============================================= */}

            <FormField
              label="Full Name"
              required
              error={errors.fullName?.message}
            >
              <Input
                id="fullName"
                placeholder="Enter full name"
                autoComplete="name"
                {...register("fullName")}
              />
            </FormField>

            {/* =============================================
                Email
            ============================================= */}

            <FormField
              label="Email"
              required
              error={errors.email?.message}
            >
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                {...register("email")}
              />
            </FormField>

            {/* =============================================
                Contact
            ============================================= */}

            <FormField
              label="Contact"
              required
              error={errors.contact?.message}
            >
              <Input
                id="contact"
                type="tel"
                placeholder="Enter contact number"
                autoComplete="tel"
                {...register("contact")}
              />
            </FormField>

            {/* =============================================
                Role
            ============================================= */}

            <FormField
              label="Role"
              required
              error={errors.role?.message}
            >
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={rolesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          rolesLoading
                            ? "Loading roles..."
                            : "Select role"
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      {roles.length > 0 ? (
                        roles.map((role) => (
                          <SelectItem
                            key={role.id}
                            value={role.name}
                          >
                            {role.name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          {rolesLoading
                            ? "Loading roles..."
                            : "No roles found"}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            {/* =============================================
                Password
            ============================================= */}

            <FormField
              label="Password"
              required
              error={errors.password?.message}
            >
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                autoComplete="new-password"
                {...register("password")}
              />
            </FormField>
          </form>
        </ModalBody>

        {/* =================================================
            Footer
        ================================================= */}

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={onClose}
            type="button"
            disabled={loading || isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="create-user-form"
            disabled={
              loading ||
              isSubmitting
            }
          >
            {loading || isSubmitting
              ? "Saving..."
              : "Create User"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}









// "use client";

// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { Controller, useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalTitle } from "@/components/ui/modal";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { FormField } from "@/components/form";
// import type { CreateUserPayload } from "@/modules/users/types";
// import { createUserSchema } from "@/modules/users/validation";
// import { fetchRoles } from "@/modules/masters/store/masterSlice";
// import type { AppDispatch, RootState } from "@/store/store";

// interface CreateUserProps {
//   open: boolean;
//   onClose: () => void;
//   onSubmit: (payload: CreateUserPayload) => Promise<void>;
//   loading?: boolean;
// }

// const defaultValues: CreateUserPayload = {
//   fullName: "",
//   email: "",
//   password: "",
//   role: "",
//   contact: "",
// };

// export default function CreateUser({ open, onClose, onSubmit, loading = false }: CreateUserProps) {
//   const dispatch = useDispatch<AppDispatch>();
//   const { roles, rolesLoading } = useSelector((state: RootState) => state.masters);

//   const {
//     register,
//     control,
//     handleSubmit,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm<CreateUserPayload>({
//     resolver: zodResolver(createUserSchema),
//     defaultValues,
//   });

//   useEffect(() => {
//     if (open && roles.length === 0) {
//       dispatch(fetchRoles({ search: "" }));
//     }
//   }, [dispatch, open, roles.length]);

//   useEffect(() => {
//     reset(defaultValues);
//   }, [open, reset]);

//   const handleFormSubmit = async (data: CreateUserPayload) => {
//     await onSubmit(data);
//   };

//   return (
//     <Modal open={open} onOpenChange={(value) => !value && onClose()}>
//       <ModalContent className="max-w-xl">
//         <ModalHeader>
//           <ModalTitle>Add User</ModalTitle>
//         </ModalHeader>

//         <ModalBody>
//           <form id="create-user-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
//             <FormField label="Full Name" required error={errors.fullName?.message}>
//               <Input id="fullName" placeholder="Enter full name" {...register("fullName")} />
//             </FormField>

//             <FormField label="Email" required error={errors.email?.message}>
//               <Input id="email" type="email" placeholder="name@example.com" {...register("email")} />
//             </FormField>

//             <FormField label="Contact" required error={errors.contact?.message}>
//               <Input id="contact" placeholder="Enter contact number" {...register("contact")} />
//             </FormField>

//             <FormField label="Role" required error={errors.role?.message}>
//               <Controller
//                 name="role"
//                 control={control}
//                 render={({ field }) => (
//                   <Select value={field.value || ""} onValueChange={field.onChange} disabled={rolesLoading}>
//                     <SelectTrigger>
//                       <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select role"} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {roles.length > 0 ? (
//                         roles.map((role) => (
//                           <SelectItem key={role.id} value={role.name}>
//                             {role.name}
//                           </SelectItem>
//                         ))
//                       ) : (
//                         <div className="px-3 py-2 text-sm text-gray-500">
//                           {rolesLoading ? "Loading roles..." : "No roles found"}
//                         </div>
//                       )}
//                     </SelectContent>
//                   </Select>
//                 )}
//               />
//             </FormField>

//             <FormField label="Password" required error={errors.password?.message}>
//               <Input id="password" type="password" placeholder="Enter password" {...register("password")} />
//             </FormField>
//           </form>
//         </ModalBody>

//         <ModalFooter>
//           <Button variant="secondary" onClick={onClose} type="button">
//             Cancel
//           </Button>
//           <Button type="submit" form="create-user-form" disabled={loading || isSubmitting}>
//             {loading || isSubmitting ? "Saving..." : "Create User"}
//           </Button>
//         </ModalFooter>
//       </ModalContent>
//     </Modal>
//   );
// }
