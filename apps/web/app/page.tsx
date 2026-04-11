import { redirect } from "next/navigation";
import { cookies } from "next/headers";

// Set to false to bypass auth for local/demo use
const REQUIRE_AUTH = false;

export default function Home() {
  // If auth is disabled, go directly to select-company
  if (!REQUIRE_AUTH) {
    redirect("/select-company");
  }

  const cookieStore = cookies();
  const session = cookieStore.get("biogrow_session")?.value;

  if (!session || session !== "authenticated") {
    redirect("/sign-in");
  }

  redirect("/select-company");
}
