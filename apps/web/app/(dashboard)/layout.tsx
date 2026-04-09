import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { company: string };
}) {
  const cookieStore = cookies();
  const session = cookieStore.get("biogrow_session")?.value;

  if (session !== "authenticated") {
    redirect("/sign-in");
  }

  // TODO: Verify user has access to this company

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar companySlug={params.company} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}