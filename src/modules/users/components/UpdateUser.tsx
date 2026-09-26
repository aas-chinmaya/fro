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

import type {
  UpdateUserPayload,
  User,
} from "@/modules/users/types";

import {
  updateUserSchema,
  UpdateUserFormData,
} from "@/modules/users/validation";

import { fetchRoles } from "@/modules/masters/store/masterSlice";

import type {
  AppDispatch,
  RootState,
} from "@/store/store";


// ============================================================
// PROPS
// ============================================================

interface UpdateUserProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSubmit: (payload: UpdateUserPayload) => Promise<void>;
  loading?: boolean;
}


// ============================================================
// DEFAULT VALUES
// ============================================================

const defaultValues: UpdateUserFormData = {
  fullName: "",
  email: "",
  role: "",
  contact: "",
  password: "",
};


// ============================================================
// COMPONENT
// ============================================================

export default function UpdateUser({
  open,
  user,
  onClose,
  onSubmit,
  loading = false,
}: UpdateUserProps) {
  const dispatch = useDispatch<AppDispatch>();

  const {
    roles,
    rolesLoading,
  } = useSelector(
    (state: RootState) => state.masters
  );

  // ==========================================================
  // FORM
  // ==========================================================

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),

    defaultValues,
  });


  // ==========================================================
  // LOAD ROLES
  // ==========================================================

  useEffect(() => {
    if (open && roles.length === 0) {
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
  ]);


  // ==========================================================
  // LOAD USER DATA
  // ==========================================================

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!user) {
      reset(defaultValues);
      return;
    }

    reset({
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      role: user.role?.name ?? "",
      contact: user.contact ?? "",
      password: "",
    });
  }, [
    open,
    user,
    reset,
  ]);


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleFormSubmit = async (
    data: UpdateUserFormData
  ) => {
    const payload: UpdateUserPayload = {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      role: data.role,
      contact: data.contact.trim(),
    };

    // Only send password if user entered one
    if (data.password?.trim()) {
      payload.password = data.password.trim();
    }

    await onSubmit(payload);
  };


  // ==========================================================
  // RENDER
  // ==========================================================

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

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <ModalHeader>
          <ModalTitle>
            Edit User
          </ModalTitle>
        </ModalHeader>


        {/* ================================================== */}
        {/* BODY */}
        {/* ================================================== */}

        <ModalBody>

          <form
            id="edit-user-form"
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >

            {/* ============================================== */}
            {/* FULL NAME */}
            {/* ============================================== */}

            <FormField
              label="Full Name"
              required
              error={errors.fullName?.message}
            >
              <Input
                id="edit-fullName"
                placeholder="Enter full name"
                {...register("fullName")}
              />
            </FormField>


            {/* ============================================== */}
            {/* EMAIL */}
            {/* ============================================== */}

            <FormField
              label="Email"
              required
              error={errors.email?.message}
            >
              <Input
                id="edit-email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
              />
            </FormField>


            {/* ============================================== */}
            {/* CONTACT */}
            {/* ============================================== */}

            <FormField
              label="Contact"
              required
              error={errors.contact?.message}
            >
              <Input
                id="edit-contact"
                placeholder="Enter contact number"
                {...register("contact")}
              />
            </FormField>


            {/* ============================================== */}
            {/* ROLE */}
            {/* ============================================== */}

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
                    value={field.value || ""}
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


            {/* ============================================== */}
            {/* PASSWORD */}
            {/* ============================================== */}

            <FormField
              label="Password"
              error={errors.password?.message}
            >
              <Input
                id="edit-password"
                type="password"
                placeholder="Leave blank to keep current password"
                {...register("password")}
              />

              <p className="mt-1 text-xs text-gray-500">
                Leave blank if you do not want to change the password.
              </p>
            </FormField>

          </form>

        </ModalBody>


        {/* ================================================== */}
        {/* FOOTER */}
        {/* ================================================== */}

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
            form="edit-user-form"
            disabled={loading || isSubmitting}
          >
            {loading || isSubmitting
              ? "Saving..."
              : "Update User"}
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
// import type { UpdateUserPayload, User } from "@/modules/users/types";
// import { updateUserSchema } from "@/modules/users/validation";
// import { fetchRoles } from "@/modules/masters/store/masterSlice";
// import type { AppDispatch, RootState } from "@/store/store";

// interface UpdateUserProps {
//   open: boolean;
//   user: User | null;
//   onClose: () => void;
//   onSubmit: (payload: UpdateUserPayload) => Promise<void>;
//   loading?: boolean;
// }

// const defaultValues: UpdateUserPayload = {
//   fullName: "",
//   email: "",
//   role: "",
//   contact: "",
// };

// export default function UpdateUser({ open, user, onClose, onSubmit, loading = false }: UpdateUserProps) {
//   const dispatch = useDispatch<AppDispatch>();
//   const { roles, rolesLoading } = useSelector((state: RootState) => state.masters);

//   const {
//     register,
//     control,
//     handleSubmit,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm<UpdateUserPayload>({
//     resolver: zodResolver(updateUserSchema),
//     defaultValues,
//   });

//   useEffect(() => {
//     if (open && roles.length === 0) {
//       dispatch(fetchRoles({ search: "" }));
//     }
//   }, [dispatch, open, roles.length]);

//   useEffect(() => {
//     reset(
//       user
//         ? {
//             fullName: user.fullName || "",
//             email: user.email || "",
//             role: user.role?.name || "",
//             contact: user.contact || "",
//           }
//         : defaultValues
//     );
//   }, [open, user, reset]);

//   const handleFormSubmit = async (data: UpdateUserPayload) => {
//     await onSubmit(data);
//   };

//   return (
//     <Modal open={open} onOpenChange={(value) => !value && onClose()}>
//       <ModalContent className="max-w-xl">
//         <ModalHeader>
//           <ModalTitle>Edit User</ModalTitle>
//         </ModalHeader>

//         <ModalBody>
//           <form id="edit-user-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
//             <FormField label="Full Name" required error={errors.fullName?.message}>
//               <Input id="edit-fullName" placeholder="Enter full name" {...register("fullName")} />
//             </FormField>

//             <FormField label="Email" required error={errors.email?.message}>
//               <Input id="edit-email" type="email" placeholder="name@example.com" {...register("email")} />
//             </FormField>

//             <FormField label="Contact" required error={errors.contact?.message}>
//               <Input id="edit-contact" placeholder="Enter contact number" {...register("contact")} />
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
//           </form>
//         </ModalBody>

//         <ModalFooter>
//           <Button variant="secondary" onClick={onClose} type="button">
//             Cancel
//           </Button>
//           <Button type="submit" form="edit-user-form" disabled={loading || isSubmitting}>
//             {loading || isSubmitting ? "Saving..." : "Update User"}
//           </Button>
//         </ModalFooter>
//       </ModalContent>
//     </Modal>
//   );
// }
