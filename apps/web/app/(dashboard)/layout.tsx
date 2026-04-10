import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ company: string }>;
}

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { company } = await params;
  const cookieStore = cookies();
  const session = cookieStore.get("biogrow_session")?.value;

  if (session !== "authenticated") {
    redirect("/sign-in");
  }

  // TODO: Verify user has access to this company

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar companySlug={company} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}