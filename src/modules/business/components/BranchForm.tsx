"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";

import {
  Button,
  Input,
  Card,
  CardHeader,
  CardContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Textarea,
} from "@/components/ui";

import { FormField } from "@/components/form";
import { fetchRoles } from "@/modules/masters/store/masterSlice";
import type { AppDispatch, RootState } from "@/store/store";

const branchUserSchema = z.object({
  fullName: z.string().min(2, "User name is required"),
  email: z.string().email("Enter a valid user email"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  contact: z.string().optional(),
  roleId: z.string().min(1, "User role is required"),
});

const branchSchema = z.object({
  // Basic
  branchName: z
    .string()
    .min(2, "Branch name is required"),

  branchCode: z.string().optional(),

  status: z.string(),

  // Address
  address1: z
    .string()
    .min(3, "Address is required"),

  country: z.string(),

  state: z.string(),

  city: z.string(),

  pincode: z.string(),

  // Contact
  phone: z.string(),
  email: z.string().email(),
  GSTIN: z.string().optional(),
  PAN: z.string().optional(),
  licenseNumber: z.string().optional(),

  // Other
  openingDate: z.string().optional(),

  note: z.string().optional(),

  users: z.array(branchUserSchema).min(1, "Add at least one branch user"),
});

export type BranchUserFormData = z.infer<typeof branchUserSchema>;
export type BranchFormData = z.infer<typeof branchSchema>;

interface BranchFormProps {
  loading?: boolean;
  initialValues?: BranchFormData;
  onCancel: () => void;
  onSubmit: (
    data: BranchFormData
  ) => void | Promise<void>;
}

export default function BranchForm({
  loading,
  initialValues,
  onCancel,
  onSubmit,
}: BranchFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { roles, rolesLoading } = useSelector((state: RootState) => state.masters);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    control,
    formState: { errors },
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),

    defaultValues: {
      status: "Active",
      country: "India",
      users: [{
        fullName: "",
        email: "",
        password: "",
        contact: "",
        roleId: "",
      }],
      ...initialValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "users",
  });

  useEffect(() => {
    if (roles.length === 0 && !rolesLoading) {
      void dispatch(fetchRoles({ search: "" }));
    }
  }, [dispatch, roles.length, rolesLoading]);

  useEffect(() => {
    if (initialValues) {
      reset(initialValues);
    }
  }, [initialValues, reset]);

  const submitForm = (data: BranchFormData) => {
    if (!initialValues) {
      const invalidUserIndex = data.users.findIndex(
        (user) => !user.fullName || !user.email || !user.roleId || !user.password
      );

      if (invalidUserIndex >= 0) {
        setError("users", {
          type: "manual",
          message: "Each user must include name, email, password and role.",
        });
        return;
      }
    }

    return onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className="space-y-6 mt-6"
    >

      {/* Basic Information */}

      <Card>

        <CardHeader>

          <h3 className="text-lg font-semibold">
            Basic Information
          </h3>

          <p className="text-sm text-muted">
            Enter branch details.
          </p>

        </CardHeader>

        <CardContent className="grid gap-5 md:grid-cols-2">

          <FormField
            label="Branch Name"
            required
            error={errors.branchName?.message}
          >
            <Input
              placeholder="Main Branch"
              {...register("branchName")}
            />
          </FormField>

          <FormField
            label="Branch Code"
            error={errors.branchCode?.message}
          >
            <Input
              placeholder="BR001"
              {...register("branchCode")}
            />
          </FormField>

          <FormField
            label="Status"
            error={errors.status?.message}
          >
            <Select
              value={watch("status")}
              onValueChange={(value) =>
                setValue(
                  "status",
                  value
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="Active">
                  Active
                </SelectItem>

                <SelectItem value="Inactive">
                  Inactive
                </SelectItem>

              </SelectContent>

            </Select>

          </FormField>

        </CardContent>

      </Card>

            {/* Address Information */}

      <Card>

        <CardHeader>

          <h3 className="text-lg font-semibold">
            Address Information
          </h3>

          <p className="text-sm text-muted">
            Enter the complete branch address.
          </p>

        </CardHeader>

        <CardContent className="grid gap-5 md:grid-cols-2">

          <div className="md:col-span-2">

            <FormField
              label="Address "
              required
              error={errors.address1?.message}
            >
              <Input
                placeholder="Street, Area, Building"
                {...register("address1")}
              />
            </FormField>

          </div>

          {/* <div className="md:col-span-2">

            <FormField
              label="Address Line 2"
              error={errors.address2?.message}
            >
              <Input
                placeholder="Landmark (Optional)"
                {...register("address2")}
              />
            </FormField>

          </div> */}

          {/* Country */}

          <FormField
            label="Country"
            error={errors.country?.message}
          >
            <Select
              value={watch("country")}
              onValueChange={(value) =>
                setValue("country", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>

                <SelectItem value="India">
                  India
                </SelectItem>

                <SelectItem value="UAE">
                  UAE
                </SelectItem>

                <SelectItem value="USA">
                  USA
                </SelectItem>

                <SelectItem value="United Kingdom">
                  United Kingdom
                </SelectItem>

                <SelectItem value="Canada">
                  Canada
                </SelectItem>

                <SelectItem value="Australia">
                  Australia
                </SelectItem>

              </SelectContent>

            </Select>

          </FormField>

          {/* State */}

          <FormField
            label="State"
            error={errors.state?.message}
          >
            <Input
              placeholder="Odisha"
              {...register("state")}
            />
          </FormField>

          {/* City */}

          <FormField
            label="City"
            error={errors.city?.message}
          >
            <Input
              placeholder="Bhubaneswar"
              {...register("city")}
            />
          </FormField>

          {/* Pincode */}

          <FormField
            label="Pincode"
            error={errors.pincode?.message}
          >
            <Input
              placeholder="751024"
              {...register("pincode")}
            />
          </FormField>

        </CardContent>

      </Card>

            {/* Contact Information */}

      <Card>

        <CardHeader>

          <h3 className="text-lg font-semibold">
            Contact Information
          </h3>

          <p className="text-sm text-muted">
            Branch communication details.
          </p>

        </CardHeader>

        <CardContent className="grid gap-5 md:grid-cols-2">

          <FormField
            label="Phone Number"
            error={errors.phone?.message}
          >
            <Input
              placeholder="0674-1234567"
              {...register("phone")}
            />
          </FormField>

          <FormField
            label="Email Address"
            error={errors.email?.message}
          >
            <Input
              type="email"
              placeholder="branch@company.com"
              {...register("email")}
            />
          </FormField>

        </CardContent>

      </Card>

      {/* Tax & Licence Information */}

      <Card>

        <CardHeader>

          <h3 className="text-lg font-semibold">
            Tax & Licence Information
          </h3>

          <p className="text-sm text-muted">
            Branch registration and tax details.
          </p>

        </CardHeader>

        <CardContent className="grid gap-5 md:grid-cols-2">

          <FormField
            label="GSTIN"
            error={errors.GSTIN?.message}
          >
            <Input
              placeholder="22AAAAA0000A1Z5"
              {...register("GSTIN")}
            />
          </FormField>

          <FormField
            label="PAN Number"
            error={errors.PAN?.message}
          >
            <Input
              placeholder="ABCDE1234F"
              {...register("PAN")}
            />
          </FormField>

          <div className="md:col-span-2">

            <FormField
              label="Licence Number"
              error={errors.licenseNumber?.message}
            >
              <Input
                placeholder="Trade / Shop / FSSAI Licence"
                {...register("licenseNumber")}
              />
            </FormField>

          </div>

        </CardContent>

      </Card>

            {/* Additional Information */}

      <Card>

        <CardHeader>

          <h3 className="text-lg font-semibold">
            Additional Information
          </h3>

          <p className="text-sm text-muted">
            Optional branch information.
          </p>

        </CardHeader>

        <CardContent className="grid gap-5 md:grid-cols-2">

          <FormField
            label="Opening Date"
            error={errors.openingDate?.message}
          >
            <Input
              type="date"
              {...register("openingDate")}
            />
          </FormField>

          <div />

          <div className="md:col-span-2">

            <FormField
              label="Notes"
              error={errors.note?.message}
            >
              <Textarea
                rows={5}
                placeholder="Additional information about this branch..."
                {...register("note")}
              />
            </FormField>

          </div>

        </CardContent>

      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Branch Users</h3>
              <p className="text-sm text-muted">Add one or more users for this branch.</p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  fullName: "",
                  email: "",
                  password: "",
                  contact: "",
                  roleId: "",
                })
              }
            >
              + Add User
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-2xl border border-border p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-text">User {index + 1}</h4>

                {fields.length > 1 && (
                  <Button type="button" variant="outline" onClick={() => remove(index)}>
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Full Name" required={!initialValues} error={errors.users?.[index]?.fullName?.message}>
                  <Input placeholder="John Doe" {...register(`users.${index}.fullName`)} />
                </FormField>

                <FormField label="Email Address" required={!initialValues} error={errors.users?.[index]?.email?.message}>
                  <Input type="email" placeholder="user@company.com" {...register(`users.${index}.email`)} />
                </FormField>

                <FormField label="Password" required={!initialValues} error={errors.users?.[index]?.password?.message}>
                  <Input type="password" placeholder="Create a password" {...register(`users.${index}.password`)} />
                </FormField>

                <FormField label="Contact Number" error={errors.users?.[index]?.contact?.message}>
                  <Input placeholder="9876543210" {...register(`users.${index}.contact`)} />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Role" required={!initialValues} error={errors.users?.[index]?.roleId?.message}>
                    <Select
                      value={watch(`users.${index}.roleId`)}
                      onValueChange={(value) => setValue(`users.${index}.roleId`, value)}
                      disabled={rolesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select a role"} />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={String(role.id)} value={String(role.id)}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </div>
            </div>
          ))}

          {errors.users && (
            <p className="text-sm text-red-600">{errors.users.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Footer */}

      <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : initialValues
            ? "Save Branch"
            : "Create Branch"}
        </Button>

      </div>

    </form>
  );
}