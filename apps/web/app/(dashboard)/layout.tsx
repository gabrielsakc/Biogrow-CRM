import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

// Set to false to bypass authentication for internal use
const REQUIRE_AUTH = false;

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { company: string };
}) {
  // If auth is disabled (local use), skip session check
  if (!REQUIRE_AUTH) {
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

  // Auth enabled - verify session
  const { cookies } = await import("next/headers");
  const cookieStore = cookies();
  const session = cookieStore.get("biogrow_session")?.value;

  if (session !== "authenticated") {
    redirect("/sign-in");
  }

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