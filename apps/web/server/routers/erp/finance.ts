import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, companyProcedure } from "../../trpc";
import { financeService } from "@biogrow/erp-core";
import { Permissions, can } from "@biogrow/permissions";

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  productId: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const financeRouter = router({
  // ─── Invoices ──────────────────────────────────────────────────────────────

  listInvoices: companyProcedure
    .input(z.object({
      companyId: z.string(),
      status: z.enum(["DRAFT","ISSUED","SENT","PARTIALLY_PAID","PAID","OVERDUE","VOID"]).optional(),
      accountId: z.string().optional(),
      from: z.date().optional(),
      to: z.date().optional(),
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(25),
    }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_INVOICES_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return financeService.listInvoices(input);
    }),

  getInvoiceById: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_INVOICES_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const inv = await financeService.getInvoiceById(input.id, input.companyId);
      if (!inv) throw new TRPCError({ code: "NOT_FOUND" });
      return inv;
    }),

  createInvoice: companyProcedure
    .input(z.object({
      companyId: z.string(),
      salesOrderId: z.string().optional(),
      accountId: z.string().optional(),
      currency: z.string().length(3).default("USD"),
      taxPct: z.number().min(0).max(100).default(0),
      dueDate: z.date().optional(),
      notes: z.string().optional(),
      lineItems: z.array(lineItemSchema).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_INVOICES_CREATE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return financeService.createInvoice({ ...input, ownerId: ctx.userId });
    }),

  issueInvoice: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_INVOICES_APPROVE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return financeService.issueInvoice(input.id, input.companyId);
    }),

  recordPayment: companyProcedure
    .input(z.object({
      companyId: z.string(),
      id: z.string(),
      amount: z.number().positive(),
      reference: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_RECEIVABLES_MANAGE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return financeService.recordPayment(input.id, input.companyId, input.amount, input.reference);
    }),

  voidInvoice: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_INVOICES_VOID, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return financeService.voidInvoice(input.id, input.companyId);
    }),

  // ─── AR/AP ─────────────────────────────────────────────────────────────────

  arSummary: companyProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_RECEIVABLES_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return financeService.getARSummary(input.companyId);
    }),

  apSummary: companyProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_PAYABLES_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return financeService.getAPSummary(input.companyId);
    }),

  // ─── Cash Flow ─────────────────────────────────────────────────────────────

  listCashFlow: companyProcedure
    .input(z.object({
      companyId: z.string(),
      from: z.date().optional(),
      to: z.date().optional(),
      type: z.enum(["INFLOW","OUTFLOW"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_TREASURY_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return financeService.listCashFlow(input);
    }),

  cashFlowSummary: companyProcedure
    .input(z.object({ companyId: z.string(), months: z.number().int().min(1).max(24).default(6) }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_TREASURY_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return financeService.getCashFlowSummary(input.companyId, input.months);
    }),

  createCashFlowEntry: companyProcedure
    .input(z.object({
      companyId: z.string(),
      type: z.enum(["INFLOW","OUTFLOW"]),
      category: z.string().min(1),
      description: z.string().min(1),
      amount: z.number().positive(),
      currency: z.string().length(3).default("USD"),
      entryDate: z.date(),
      reference: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_TREASURY_MANAGE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return financeService.createCashFlowEntry(input);
    }),
});
