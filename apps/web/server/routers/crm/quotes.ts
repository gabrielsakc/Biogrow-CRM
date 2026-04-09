import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, companyProcedure } from "../../trpc";
import { quotesService } from "@biogrow/crm-core";
import { Permissions, can } from "@biogrow/permissions";

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  discountPct: z.number().min(0).max(100).default(0),
  sortOrder: z.number().int().optional(),
});

const quoteBaseSchema = z.object({
  currency: z.string().length(3).default("USD"),
  discountPct: z.number().min(0).max(100).default(0),
  taxPct: z.number().min(0).max(100).default(0),
  validUntil: z.date().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  accountId: z.string().optional(),
  opportunityId: z.string().optional(),
});

export const quotesRouter = router({
  list: companyProcedure
    .input(z.object({
      companyId: z.string(),
      ownerId: z.string().optional(),
      accountId: z.string().optional(),
      opportunityId: z.string().optional(),
      status: z.enum(["DRAFT","SENT","VIEWED","ACCEPTED","REJECTED","EXPIRED"]).optional(),
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(25),
    }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_QUOTES_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return quotesService.list(input);
    }),

  getById: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_QUOTES_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const quote = await quotesService.getById(input.id);
      if (!quote || quote.companyId !== input.companyId) throw new TRPCError({ code: "NOT_FOUND" });
      return quote;
    }),

  create: companyProcedure
    .input(z.object({ companyId: z.string(), lineItems: z.array(lineItemSchema).min(1) }).merge(quoteBaseSchema))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_QUOTES_CREATE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return quotesService.create({ ...input, ownerId: ctx.userId });
    }),

  update: companyProcedure
    .input(z.object({
      companyId: z.string(),
      id: z.string(),
      lineItems: z.array(lineItemSchema).min(1).optional(),
    }).merge(quoteBaseSchema.partial()))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_QUOTES_EDIT, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const { id, companyId: _c, ...rest } = input;
      return quotesService.update(id, rest);
    }),

  send: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_QUOTES_SEND, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return quotesService.send(input.id);
    }),

  markAccepted: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_QUOTES_APPROVE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return quotesService.markAccepted(input.id);
    }),

  markRejected: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_QUOTES_APPROVE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return quotesService.markRejected(input.id);
    }),

  delete: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_QUOTES_EDIT, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return quotesService.delete(input.id);
    }),
});
