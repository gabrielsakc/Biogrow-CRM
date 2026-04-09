import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, companyProcedure } from "../../trpc";
import { salesOrdersService } from "@biogrow/erp-core";
import { Permissions, can } from "@biogrow/permissions";

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  discountPct: z.number().min(0).max(100).default(0),
  productId: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const salesOrdersRouter = router({
  list: companyProcedure
    .input(z.object({
      companyId: z.string(),
      status: z.enum(["DRAFT","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"]).optional(),
      ownerId: z.string().optional(),
      accountId: z.string().optional(),
      search: z.string().optional(),
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(25),
    }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_SALES_ORDERS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return salesOrdersService.list(input);
    }),

  getById: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_SALES_ORDERS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const order = await salesOrdersService.getById(input.id, input.companyId);
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      return order;
    }),

  createFromQuote: companyProcedure
    .input(z.object({ companyId: z.string(), quoteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_SALES_ORDERS_CREATE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return salesOrdersService.createFromQuote(input.quoteId, input.companyId, ctx.userId);
    }),

  create: companyProcedure
    .input(z.object({
      companyId: z.string(),
      accountId: z.string().optional(),
      currency: z.string().length(3).default("USD"),
      discountPct: z.number().min(0).max(100).default(0),
      taxPct: z.number().min(0).max(100).default(0),
      shippingAddress: z.string().optional(),
      requestedDate: z.date().optional(),
      notes: z.string().optional(),
      lineItems: z.array(lineItemSchema).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_SALES_ORDERS_CREATE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return salesOrdersService.create({ ...input, ownerId: ctx.userId });
    }),

  updateStatus: companyProcedure
    .input(z.object({
      companyId: z.string(),
      id: z.string(),
      status: z.enum(["CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"]),
      shippedAt: z.date().optional(),
      deliveredAt: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_SALES_ORDERS_EDIT, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return salesOrdersService.updateStatus(input.id, input.companyId, input.status, {
        shippedAt: input.shippedAt,
        deliveredAt: input.deliveredAt,
      });
    }),

  stats: companyProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_SALES_ORDERS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return salesOrdersService.getStats(input.companyId);
    }),
});
