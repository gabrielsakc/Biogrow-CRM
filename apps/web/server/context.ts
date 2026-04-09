import { db } from "@biogrow/database";
import { cookies } from "next/headers";

export async function createTRPCContext(opts: { headers: Headers }) {
  const cookieStore = cookies();
  const session = cookieStore.get("biogrow_session")?.value;
  const isAuthenticated = session === "authenticated";

  return {
    userId: isAuthenticated ? "local-user" : null,
    isAuthenticated,
    db,
    headers: opts.headers,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;