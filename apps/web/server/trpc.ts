import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { resolveUserPermissions } from "@biogrow/permissions";
import type { TRPCContext } from "./context";

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const mergeRouters = t.mergeRouters;

// ─── Public procedure (no auth) ───────────────────────────────────────────────
export const publicProcedure = t.procedure;

// ─── Protected procedure (requires Clerk auth + DB user) ─────────────────────
const enforceIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.clerkId || !ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, clerkId: ctx.clerkId, userId: ctx.userId } });
});

export const protectedProcedure = t.procedure.use(enforceIsAuthed);

// ─── Company-scoped procedure ─────────────────────────────────────────────────
// Resolves the user's permissions for a given companyId (passed in input).
// The router must include `companyId: z.string()` in its input.
const enforceCompanyAccess = enforceIsAuthed.unstable_pipe(
  async ({ ctx, rawInput, next }) => {
    const input = rawInput as { companyId?: string };
    const companyId = input?.companyId;

    if (!companyId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "companyId is required" });
    }

    // Resolve user permissions for this company (cached per-request via closure)
    const resolvedUser = await resolveUserPermissions(ctx.userId);

    return next({ ctx: { ...ctx, companyId, resolvedUser } });
  }
);

export const companyProcedure = t.procedure.use(enforceCompanyAccess);
