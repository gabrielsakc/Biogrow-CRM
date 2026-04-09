import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, companyProcedure } from "../../trpc";
import { accountsService } from "@biogrow/crm-core";
import { Permissions, can } from "@biogrow/permissions";

const accountInputSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["PROSPECT","CUSTOMER","PARTNER","VENDOR","CHURNED"]).optional(),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  annualRevenue: z.number().positive().optional(),
  employeeCount: z.number().int().positive().optional(),
  description: z.string().optional(),
});

export const accountsRouter = router({
  list: companyProcedure
    .input(z.object({
      companyId: z.string(),
      type: z.enum(["PROSPECT","CUSTOMER","PARTNER","VENDOR","CHURNED"]).optional(),
      ownerId: z.string().optional(),
      search: z.string().optional(),
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(25),
    }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_ACCOUNTS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return accountsService.list(input);
    }),

  getById: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_ACCOUNTS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const account = await accountsService.getById(input.id, input.companyId);
      if (!account) throw new TRPCError({ code: "NOT_FOUND" });
      return account;
    }),

  create: companyProcedure
    .input(z.object({ companyId: z.string() }).merge(accountInputSchema))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_ACCOUNTS_CREATE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return accountsService.create({ ...input, ownerId: ctx.userId });
    }),

  update: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }).merge(accountInputSchema.partial()))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_ACCOUNTS_EDIT, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return accountsService.update(input.id, input.companyId, input);
    }),

  delete: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_ACCOUNTS_DELETE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return accountsService.delete(input.id);
    }),
});
