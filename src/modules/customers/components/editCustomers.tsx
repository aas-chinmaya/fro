"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Button,
  Card,
  CardHeader,
  CardContent,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Textarea,
} from "@/components/ui";

import { FormField } from "@/components/form";
import { notify } from "@/lib/toast";
import { useAppSelector } from "@/store/hooks";
import { customerSchema, CustomerFormData } from "../validation";
import { customersService } from "../services/customers.service";

const emptyAddress = {
  type: "BILLING",
  label: "",
  contactPerson: "",
  contactNumber: "",
  addressLine1: "",
  addressLine2: "",
  landmark: "",
  city: "",
  district: "",
  state: "",
  stateCode: "",
  country: "",
  pincode: "",
  isDefault: true,
  isActive: true,
};

function getCustomerAddresses(data: any) {
  const source = data?.customer || data;
  const addresses = source?.addresses || source?.customerAddresses || source?.address;
  const addressList = Array.isArray(addresses) ? addresses : addresses ? [addresses] : [];

  return (addressList.length ? addressList : [emptyAddress]).map((address: any) => ({
    id: address.id,
    type: address.type || "BILLING",
    label: address.label || "",
    contactPerson: address.contactPerson || "",
    contactNumber: address.contactNumber || "",
    addressLine1: address.addressLine1 || address.line1 || "",
    addressLine2: address.addressLine2 || address.line2 || "",
    landmark: address.landmark || "",
    city: address.city || "",
    district: address.district || "",
    state: address.state || "",
    stateCode: address.stateCode || "",
    country: address.country || "",
    pincode: address.pincode || address.pinCode || "",
    isDefault: address.isDefault !== false,
    isActive: address.isActive !== false,
  }));
}

export default function EditCustomers() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;
  const { user } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      businessId: "",
      branchId: "",
      customerCode: "",
      customerType: "WALK_IN",
      name: "",
      companyName: "",
      mobile: "",
      alternateMobile: "",
      email: "",
      gstin: "",
      pan: "",
      creditLimit: 0,
      creditDays: 0,
      openingBalance: 0,
      outstandingBalance: 0,
      rewardPoints: 0,
      isActive: true,
      notes: "",
      addresses: [{
        type: "BILLING", label: "", contactPerson: "", contactNumber: "",
        addressLine1: "", addressLine2: "", landmark: "", city: "", district: "",
        state: "", stateCode: "", country: "", pincode: "", isDefault: true, isActive: true,
      }],
    },
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      if (!customerId) return;

      try {
        const customer = await customersService.getCustomer(customerId);
        const data = customer?.data || customer;

        if (!data) return;

        reset({
          businessId: data.businessId || "",
          branchId: data.branchId || "",
          customerCode: data.customerCode || "",
          customerType: data.customerType || "WALK_IN",
          name: data.name || "",
          companyName: data.companyName || "",
          mobile: data.mobile || "",
          alternateMobile: data.alternateMobile || "",
          email: data.email || "",
          gstin: data.gstin || "",
          pan: data.pan || "",
          creditLimit: Number(data.creditLimit ?? 0),
          creditDays: Number(data.creditDays ?? 0),
          openingBalance: Number(data.openingBalance ?? 0),
          outstandingBalance: Number(data.outstandingBalance ?? 0),
          rewardPoints: Number(data.rewardPoints ?? 0),
          isActive: Boolean(data.isActive),
          notes: data.notes || "",
          addresses: getCustomerAddresses(data),
        });
      } catch (error) {
        notify.error("Failed to fetch customer details.");
      }
    };

    fetchCustomer();
  }, [customerId, reset]);

  async function onSubmit(data: CustomerFormData) {
    try {
      const payload = {
        ...data,
        updatedBy: user?.id || "",
        addresses: data.addresses.map((address) => ({
          businessId: data.businessId,
          customerId,
          ...address,
        })),
      };

      if (!payload.updatedBy) {
        notify.error("User session is missing. Please login again.");
        return;
      }

      await customersService.updateCustomer(customerId, payload);
      notify.success("Customer updated successfully.");
      router.push("/customers");
    } catch (error) {
      notify.error("Failed to update customer. Please try again.");
    }
  }

  const handleDelete = async () => {
    if (!customerId) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this customer?");
    if (!confirmDelete) return;

    try {
      await customersService.deleteCustomer(customerId);
      notify.success("Customer deleted successfully.");
      router.push("/customers");
    } catch (error) {
      notify.error("Failed to delete customer. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Business & Branch</h3>
          <p className="text-sm text-muted">Required business and branch details.</p>
        </CardHeader>

        <CardContent className="grid gap-5 md:grid-cols-2">
          <FormField label="Business ID" required error={errors.businessId?.message}>
            <Input placeholder="Enter Business ID" {...register("businessId")} />
          </FormField>

          <FormField label="Branch ID" required error={errors.branchId?.message}>
            <Input placeholder="Enter Branch ID" {...register("branchId")} />
          </FormField>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Address</h3>
          <p className="text-sm text-muted">
            Add the customer&apos;s contact and location details.
          </p>
        </CardHeader>

        <CardContent className="grid gap-5">
          {/* Address Line 1 */}
          <FormField
            label="Address Line 1"
            error={errors.addresses?.[0]?.addressLine1?.message}
          >
            <Input
              placeholder="Street / building"
              {...register("addresses.0.addressLine1")}
            />
          </FormField>

          {/* Address Line 2 */}
          <FormField
            label="Address Line 2"
            error={errors.addresses?.[0]?.addressLine2?.message}
          >
            <Input
              placeholder="Area / locality"
              {...register("addresses.0.addressLine2")}
            />
          </FormField>

          {/* Landmark + City */}
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="Landmark"
              error={errors.addresses?.[0]?.landmark?.message}
            >
              <Input
                placeholder="Nearby landmark"
                {...register("addresses.0.landmark")}
              />
            </FormField>

            <FormField
              label="City"
              error={errors.addresses?.[0]?.city?.message}
            >
              <Input
                placeholder="City"
                {...register("addresses.0.city")}
              />
            </FormField>
          </div>

          {/* District + State + Pincode */}
          <div className="grid gap-5 md:grid-cols-3">
            <FormField
              label="District"
              error={errors.addresses?.[0]?.district?.message}
            >
              <Input
                placeholder="District"
                {...register("addresses.0.district")}
              />
            </FormField>

            <FormField
              label="State"
              error={errors.addresses?.[0]?.state?.message}
            >
              <Input
                placeholder="State"
                {...register("addresses.0.state")}
              />
            </FormField>

            <FormField
              label="Pincode"
              error={errors.addresses?.[0]?.pincode?.message}
            >
              <Input
                placeholder="751024"
                {...register("addresses.0.pincode")}
              />
            </FormField>
          </div>

          {/* Country + Default Address */}
          <div className="grid gap-5 md:grid-cols-2">
            <FormField
              label="Country"
              error={errors.addresses?.[0]?.country?.message}
            >
              <Input
                placeholder="India"
                {...register("addresses.0.country")}
              />
            </FormField>

            <FormField label="Default Address">
              <div className="flex h-10 items-center gap-6">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="defaultAddress"
                    value="YES"
                    checked={watch("addresses.0.isDefault") === true}
                    onChange={() =>
                      setValue("addresses.0.isDefault", true, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    className="h-4 w-4 accent-primary"
                  />
                  Yes
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="defaultAddress"
                    value="NO"
                    checked={watch("addresses.0.isDefault") === false}
                    onChange={() =>
                      setValue("addresses.0.isDefault", false, {
                        shouldValidate: true,
                        shouldDirty: true,
                      })
                    }
                    className="h-4 w-4 accent-primary"
                  />
                  No
                </label>
              </div>
            </FormField>
          </div>
        
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <p className="text-sm text-muted">Update customer identity and profile details.</p>
        </CardHeader>

        <CardContent className="grid gap-5 md:grid-cols-2">
          <FormField label="Customer Code" error={errors.customerCode?.message}>
            <Input placeholder="CUST001" {...register("customerCode")} />
          </FormField>

          <FormField label="Customer Type" error={errors.customerType?.message}>
            <Select
              value={watch("customerType")}
              onValueChange={(value) => setValue("customerType", value as "WALK_IN" | "REGULAR" | "WHOLESALE")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WALK_IN">WALK_IN</SelectItem>
                <SelectItem value="REGULAR">REGULAR</SelectItem>
                <SelectItem value="WHOLESALE">WHOLESALE</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Customer Name" required error={errors.name?.message}>
            <Input placeholder="John Doe" {...register("name")} />
          </FormField>

          <FormField label="Company Name" error={errors.companyName?.message}>
            <Input placeholder="Acme Traders" {...register("companyName")} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Contact & Tax</h3>
          <p className="text-sm text-muted">Update phone, email and GST information.</p>
        </CardHeader>

        <CardContent className="grid gap-5 md:grid-cols-2">
          <FormField label="Mobile" required error={errors.mobile?.message}>
            <Input placeholder="9876543210" {...register("mobile")} />
          </FormField>

          <FormField label="Alternate Mobile" error={errors.alternateMobile?.message}>
            <Input placeholder="Optional" {...register("alternateMobile")} />
          </FormField>

          <FormField label="Email" error={errors.email?.message}>
            <Input placeholder="name@example.com" {...register("email")} />
          </FormField>

          <FormField label="GSTIN" error={errors.gstin?.message}>
            <Input placeholder="22AAAAA0000A1Z5" {...register("gstin")} />
          </FormField>

          <FormField label="PAN" error={errors.pan?.message}>
            <Input placeholder="ABCDE1234F" {...register("pan")} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Credit & Status</h3>
          <p className="text-sm text-muted">Update credit limits, balances and customer status.</p>
        </CardHeader>

        <CardContent className="grid gap-5 md:grid-cols-3">
          <FormField label="Credit Limit" error={errors.creditLimit?.message}>
            <Input type="number" step="0.01" {...register("creditLimit", { valueAsNumber: true })} />
          </FormField>

          <FormField label="Credit Days" error={errors.creditDays?.message}>
            <Input type="number" {...register("creditDays", { valueAsNumber: true })} />
          </FormField>

          <FormField label="Opening Balance" error={errors.openingBalance?.message}>
            <Input type="number" step="0.01" {...register("openingBalance", { valueAsNumber: true })} />
          </FormField>

          <FormField label="Outstanding Balance" error={errors.outstandingBalance?.message}>
            <Input type="number" step="0.01" {...register("outstandingBalance", { valueAsNumber: true })} />
          </FormField>

          <FormField label="Reward Points" error={errors.rewardPoints?.message}>
            <Input type="number" {...register("rewardPoints", { valueAsNumber: true })} />
          </FormField>

          <FormField label="Status" error={errors.isActive?.message}>
            <Select
              value={watch("isActive") ? "ACTIVE" : "INACTIVE"}
              onValueChange={(value) => setValue("isActive", value === "ACTIVE")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Notes</h3>
          <p className="text-sm text-muted">Update internal notes for this customer.</p>
        </CardHeader>

        <CardContent>
          <FormField label="Notes" error={errors.notes?.message}>
            <Textarea placeholder="Enter notes" {...register("notes")} />
          </FormField>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button type="button" variant="secondary" onClick={() => router.push("/customers")}>
          Cancel
        </Button>
        {/* <Button type="button" variant="danger" onClick={handleDelete}>
          Delete
        </Button> */}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update Customer"}
        </Button>
      </div>
    </form>
  );
}
