import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, UserCircle } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";
import { contactsService } from "@biogrow/crm-core";
import { Button } from "@biogrow/ui/components/button";
import { Badge } from "@biogrow/ui/components/badge";
import { EmptyState } from "@biogrow/ui/feedback/empty-state";
import { Avatar } from "@biogrow/ui/components/avatar";

export default async function ContactsPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.CRM_CONTACTS_VIEW)) {
    redirect(`/${params.company}/dashboard`);
  }

  const { contacts, total } = await contactsService.list({ companyId: company.id, pageSize: 50 });
  const canCreate = hasPermission(permissions, Permissions.CRM_CONTACTS_CREATE);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} contacts</p>
        </div>
        {canCreate && (
          <Button size="sm"><Plus className="h-4 w-4" />New Contact</Button>
        )}
      </div>

      {contacts.length === 0 ? (
        <EmptyState
          icon={<UserCircle className="h-7 w-7" />}
          title="No contacts yet"
          description="Contacts are the people associated with your customer accounts."
          action={canCreate ? <Button size="sm"><Plus className="h-4 w-4" />Create contact</Button> : undefined}
        />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Account</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar
                        name={`${contact.firstName} ${contact.lastName}`}
                        size="sm"
                      />
                      <div>
                        <Link
                          href={`/${params.company}/crm/contacts/${contact.id}`}
                          className="font-medium text-gray-900 hover:text-emerald-600 transition-colors"
                        >
                          {contact.firstName} {contact.lastName}
                        </Link>
                        {contact.isPrimary && (
                          <Badge variant="primary" className="ml-2 text-[10px] py-0">Primary</Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{contact.jobTitle ?? "—"}</td>
                  <td className="px-4 py-3">
                    {(contact as any).account ? (
                      <Link
                        href={`/${params.company}/crm/accounts/${(contact as any).account.id}`}
                        className="text-gray-600 hover:text-emerald-600 text-xs transition-colors"
                      >
                        {(contact as any).account.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{contact.email ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{contact.phone ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
