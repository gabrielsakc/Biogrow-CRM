"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/trpc/client";
import { Button } from "@biogrow/ui/components/button";
import { Input } from "@biogrow/ui/components/input";
import { Label } from "@biogrow/ui/components/label";
import { Textarea } from "@biogrow/ui/components/textarea";
import { Select } from "@biogrow/ui/components/select";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["PROSPECT", "CUSTOMER", "PARTNER", "VENDOR", "CHURNED"]),
  industry: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  annualRevenue: z.number().positive().optional().or(z.literal(undefined)),
  employeeCount: z.number().int().positive().optional().or(z.literal(undefined)),
  description: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ACCOUNT_TYPE_OPTIONS = [
  { value: "PROSPECT", label: "Prospect" },
  { value: "CUSTOMER", label: "Customer" },
  { value: "PARTNER", label: "Partner" },
  { value: "VENDOR", label: "Vendor" },
  { value: "CHURNED", label: "Churned" },
];

const INDUSTRY_OPTIONS = [
  { value: "Construction", label: "Construction" },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Technology", label: "Technology" },
  { value: "Agriculture", label: "Agriculture" },
  { value: "Logistics", label: "Logistics" },
  { value: "Mining & Materials", label: "Mining & Materials" },
  { value: "Finance", label: "Finance" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Retail", label: "Retail" },
  { value: "Other", label: "Other" },
];

interface AccountFormProps {
  companyId: string;
  companySlug: string;
  initialData?: {
    id: string;
    name: string;
    type: string;
    industry?: string | null;
    website?: string | null;
    phone?: string | null;
    email?: string | null;
    annualRevenue?: number | null;
    employeeCount?: number | null;
    description?: string | null;
    street?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    zip?: string | null;
  };
  mode: "create" | "edit";
}

export function AccountForm({ companyId, companySlug, initialData, mode }: AccountFormProps) {
  const router = useRouter();

  const createMutation = api.accounts.create.useMutation({
    onSuccess: (account) => {
      router.push(`/${companySlug}/crm/accounts/${account.id}`);
    },
  });

  const updateMutation = api.accounts.update.useMutation({
    onSuccess: (account) => {
      router.push(`/${companySlug}/crm/accounts/${account.id}`);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          type: initialData.type as FormValues["type"],
          industry: initialData.industry ?? "",
          website: initialData.website ?? "",
          phone: initialData.phone ?? "",
          email: initialData.email ?? "",
          annualRevenue: initialData.annualRevenue ?? undefined,
          employeeCount: initialData.employeeCount ?? undefined,
          description: initialData.description ?? "",
          street: initialData.street ?? "",
          city: initialData.city ?? "",
          state: initialData.state ?? "",
          country: initialData.country ?? "",
          zip: initialData.zip ?? "",
        }
      : {
          name: "",
          type: "PROSPECT",
        },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  async function onSubmit(values: FormValues) {
    const data = {
      companyId,
      ...values,
      annualRevenue: values.annualRevenue ? Number(values.annualRevenue) : undefined,
      employeeCount: values.employeeCount ? Number(values.employeeCount) : undefined,
    };

    if (mode === "create") {
      await createMutation.mutateAsync(data);
    } else if (initialData) {
      await updateMutation.mutateAsync({
        ...data,
        id: initialData.id,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/${companySlug}/crm/accounts`}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {mode === "create" ? "New Account" : "Edit Account"}
            </h1>
            <p className="text-sm text-gray-500">
              {mode === "create"
                ? "Add a new customer, prospect, or partner"
                : "Update account information"}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/${companySlug}/crm/accounts`}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </Link>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : mode === "create" ? "Create Account" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Basic Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Account Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Company name"
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <Select id="type" {...register("type")} options={ACCOUNT_TYPE_OPTIONS} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="industry">Industry</Label>
            <Select
              id="industry"
              {...register("industry")}
              options={[{ value: "", label: "Select industry" }, ...INDUSTRY_OPTIONS]}
              placeholder="Select industry"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="website">Website</Label>
            <Input id="website" {...register("website")} placeholder="https://example.com" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} placeholder="+1 (555) 000-0000" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="contact@company.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Brief description of this account..."
            rows={3}
          />
        </div>
      </div>

      {/* Financial Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Financial Information</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="annualRevenue">Annual Revenue (USD)</Label>
            <Input
              id="annualRevenue"
              type="number"
              {...register("annualRevenue", { valueAsNumber: true })}
              placeholder="0"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="employeeCount">Employee Count</Label>
            <Input
              id="employeeCount"
              type="number"
              {...register("employeeCount", { valueAsNumber: true })}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Address</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="street">Street</Label>
            <Input id="street" {...register("street")} placeholder="123 Main St, Suite 100" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} placeholder="Miami" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="state">State / Province</Label>
            <Input id="state" {...register("state")} placeholder="FL" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register("country")} placeholder="USA" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="zip">ZIP / Postal Code</Label>
            <Input id="zip" {...register("zip")} placeholder="33101" />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      )}
    </form>
  );
}