import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function Home() {
  const cookieStore = cookies();
  const session = cookieStore.get("biogrow_session")?.value;

  if (!session || session !== "authenticated") {
    redirect("/sign-in");
  }

  redirect("/select-company");
}
