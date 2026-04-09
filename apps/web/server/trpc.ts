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

// ─── Protected procedure (requires auth) ─────────────────────────────────────────────
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

// ─── Company-scoped procedure ─────────────────────────────────────────────────
// Use this for procedures that need companyId in the input.
// It validates auth and resolves user permissions for the company.
export const companyProcedure = t.procedure
  .use(({ ctx, next }) => {
    if (!ctx.userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, userId: ctx.userId } });
  })
  .use(async ({ ctx, input, next }) => {
    const typedInput = input as { companyId?: string };
    const companyId = typedInput?.companyId;

    if (!companyId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "companyId is required" });
    }

    // Resolve user permissions for this company
    const resolvedUser = await resolveUserPermissions(ctx.userId);

    return next({ ctx: { ...ctx, companyId, resolvedUser } });
  });