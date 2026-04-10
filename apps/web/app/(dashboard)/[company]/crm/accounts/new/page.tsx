import { redirect } from "next/navigation";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { AccountForm } from "@/components/crm/account-form";

export default async function NewAccountPage({ params }: { params: { company: string } }) {
  const { company, permissions } = await resolveCompany(params.company);

  if (!hasPermission(permissions, Permissions.CRM_ACCOUNTS_CREATE)) {
    redirect(`/${params.company}/crm/accounts`);
  }

  return (
    <div className="p-6">
      <AccountForm companyId={company.id} companySlug={params.company} mode="create" />
    </div>
  );
}