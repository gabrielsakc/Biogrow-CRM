import { notFound, redirect } from "next/navigation";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { accountsService } from "@biogrow/crm-core";
import { AccountForm } from "@/components/crm/account-form";

export default async function EditAccountPage({
  params,
}: {
  params: { company: string; id: string };
}) {
  const { company, permissions } = await resolveCompany(params.company);

  if (!hasPermission(permissions, Permissions.CRM_ACCOUNTS_EDIT)) {
    redirect(`/${params.company}/crm/accounts/${params.id}`);
  }

  const account = await accountsService.getById(params.id, company.id);
  if (!account) notFound();

  return (
    <div className="p-6">
      <AccountForm
        companyId={company.id}
        companySlug={params.company}
        initialData={{
          id: account.id,
          name: account.name,
          type: account.type,
          industry: account.industry,
          website: account.website,
          phone: account.phone,
          email: account.email,
          annualRevenue: account.annualRevenue,
          employeeCount: account.employeeCount,
          description: account.description,
          street: account.street,
          city: account.city,
          state: account.state,
          country: account.country,
          zip: account.zip,
        }}
        mode="edit"
      />
    </div>
  );
}