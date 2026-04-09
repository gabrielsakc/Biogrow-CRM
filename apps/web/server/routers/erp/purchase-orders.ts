import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, companyProcedure } from "../../trpc";
import { purchaseOrdersService } from "@biogrow/erp-core";
import { Permissions, can } from "@biogrow/permissions";

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitCost: z.number().nonnegative(),
  productId: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const purchaseOrdersRouter = router({
  list: companyProcedure
    .input(z.object({
      companyId: z.string(),
      status: z.enum(["DRAFT","SUBMITTED","APPROVED","PARTIALLY_RECEIVED","RECEIVED","CANCELLED"]).optional(),
      vendorId: z.string().optional(),
      search: z.string().optional(),
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(25),
    }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_PURCHASE_ORDERS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return purchaseOrdersService.list(input);
    }),

  getById: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_PURCHASE_ORDERS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const po = await purchaseOrdersService.getById(input.id, input.companyId);
      if (!po) throw new TRPCError({ code: "NOT_FOUND" });
      return po;
    }),

  create: companyProcedure
    .input(z.object({
      companyId: z.string(),
      vendorId: z.string(),
      currency: z.string().length(3).default("USD"),
      taxPct: z.number().min(0).max(100).default(0),
      expectedDate: z.date().optional(),
      notes: z.string().optional(),
      lineItems: z.array(lineItemSchema).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_PURCHASE_ORDERS_CREATE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return purchaseOrdersService.create({ ...input, ownerId: ctx.userId });
    }),

  submit: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_PURCHASE_ORDERS_EDIT, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return purchaseOrdersService.submit(input.id, input.companyId);
    }),

  approve: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_PURCHASE_ORDERS_APPROVE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return purchaseOrdersService.approve(input.id, input.companyId, ctx.userId);
    }),

  receive: companyProcedure
    .input(z.object({
      companyId: z.string(),
      id: z.string(),
      lineReceived: z.array(z.object({
        lineItemId: z.string(),
        receivedQty: z.number().positive(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_PURCHASE_ORDERS_RECEIVE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return purchaseOrdersService.receive(input.id, input.companyId, ctx.userId, input.lineReceived);
    }),

  stats: companyProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_PURCHASE_ORDERS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return purchaseOrdersService.getStats(input.companyId);
    }),
});
