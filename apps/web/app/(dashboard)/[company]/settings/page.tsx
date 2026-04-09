import { redirect } from "next/navigation";
import { Building2, Users, Shield, Bell, Globe, Palette } from "lucide-react";
import { resolveCompany } from "@/lib/company";
import { hasPermission } from "@/lib/permissions";
import { Permissions } from "@biogrow/permissions";

const SETTINGS_SECTIONS = [
  {
    title: "Company Profile",
    description: "Name, logo, address, and contact information.",
    icon: Building2,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Team & Members",
    description: "Invite team members and manage access.",
    icon: Users,
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    title: "Roles & Permissions",
    description: "Configure role-based access control for your team.",
    icon: Shield,
    color: "bg-amber-50 text-amber-600",
  },
  {
    title: "Notifications",
    description: "Email and in-app notification preferences.",
    icon: Bell,
    color: "bg-rose-50 text-rose-600",
  },
  {
    title: "Localization",
    description: "Currency, timezone, and date format preferences.",
    icon: Globe,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Branding",
    description: "Customize your company colors and logo.",
    icon: Palette,
    color: "bg-purple-50 text-purple-600",
  },
];

export default async function SettingsPage({ params }: { params: { company: string } }) {

  const { company, permissions } = await resolveCompany(params.company);
  if (!hasPermission(permissions, Permissions.ADMIN_COMPANY_CONFIGURE)) {
    redirect(`/${params.company}/dashboard`);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">{company.name} — company configuration</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_SECTIONS.map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-gray-200 bg-white p-5 opacity-75 cursor-not-allowed"
          >
            <div className="flex items-start gap-4">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${section.color}`}>
                <section.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{section.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{section.description}</p>
                <span className="inline-block mt-2 text-xs text-gray-300 font-medium">Coming soon</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
