import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, companyProcedure } from "../../trpc";
import { investmentService } from "@biogrow/erp-core";
import { Permissions, can } from "@biogrow/permissions";

const investmentStatusSchema = z.enum(["PLANNED", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED", "WRITTEN_OFF"]);
const investmentTypeSchema = z.enum(["EQUIPMENT", "PROPERTY", "TECHNOLOGY", "RESEARCH", "INVENTORY_EXPANSION", "MARKETING", "TRAINING", "OTHER"]);
const investmentRiskSchema = z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]);
const transactionTypeSchema = z.enum(["DISBURSEMENT", "RETURN", "ADJUSTMENT"]);

export const investmentsRouter = router({
  // ─── List Investments ──────────────────────────────────────────────────────

  list: companyProcedure
    .input(z.object({
      companyId: z.string(),
      status: investmentStatusSchema.optional(),
      type: investmentTypeSchema.optional(),
      riskLevel: investmentRiskSchema.optional(),
      from: z.date().optional(),
      to: z.date().optional(),
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(25),
    }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_INVESTMENTS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return investmentService.list(input);
    }),

  // ─── Get Investment by ID ───────────────────────────────────────────────────

  getById: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_INVESTMENTS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const investment = await investmentService.getById(input.id, input.companyId);
      if (!investment) throw new TRPCError({ code: "NOT_FOUND" });
      return investment;
    }),

  // ─── Create Investment ──────────────────────────────────────────────────────

  create: companyProcedure
    .input(z.object({
      companyId: z.string(),
      name: z.string().min(1).max(200),
      type: investmentTypeSchema,
      description: z.string().optional(),
      amount: z.number().positive(),
      currency: z.string().length(3).default("USD"),
      investedAt: z.date(),
      expectedReturn: z.number().nonnegative().optional(),
      expectedRoiPct: z.number().min(0).max(1000).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      maturityDate: z.date().optional(),
      status: investmentStatusSchema.optional(),
      riskLevel: investmentRiskSchema.optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_INVESTMENTS_CREATE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return investmentService.create({
        ...input,
        ownerId: ctx.userId,
      });
    }),

  // ─── Update Investment ──────────────────────────────────────────────────────

  update: companyProcedure
    .input(z.object({
      companyId: z.string(),
      id: z.string(),
      name: z.string().min(1).max(200).optional(),
      type: investmentTypeSchema.optional(),
      description: z.string().optional(),
      amount: z.number().positive().optional(),
      currency: z.string().length(3).optional(),
      investedAt: z.date().optional(),
      expectedReturn: z.number().nonnegative().optional(),
      expectedRoiPct: z.number().min(0).max(1000).optional(),
      actualReturn: z.number().nonnegative().optional(),
      actualRoiPct: z.number().min(0).max(1000).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      maturityDate: z.date().optional(),
      status: investmentStatusSchema.optional(),
      riskLevel: investmentRiskSchema.optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_INVESTMENTS_EDIT, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const { id, companyId, ...data } = input;
      return investmentService.update({ id, companyId, ...data });
    }),

  // ─── Delete Investment ──────────────────────────────────────────────────────

  delete: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_INVESTMENTS_DELETE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return investmentService.delete(input.id, input.companyId);
    }),

  // ─── Change Status ──────────────────────────────────────────────────────────

  changeStatus: companyProcedure
    .input(z.object({
      companyId: z.string(),
      id: z.string(),
      status: investmentStatusSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_INVESTMENTS_APPROVE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return investmentService.changeStatus(input.id, input.companyId, input.status);
    }),

  // ─── Record Actual Return ────────────────────────────────────────────────────

  recordReturn: companyProcedure
    .input(z.object({
      companyId: z.string(),
      id: z.string(),
      actualReturn: z.number().nonnegative(),
      actualRoiPct: z.number().min(0).max(1000),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_INVESTMENTS_EDIT, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return investmentService.recordActualReturn(input.id, input.companyId, input.actualReturn, input.actualRoiPct);
    }),

  // ─── Add Transaction ────────────────────────────────────────────────────────

  addTransaction: companyProcedure
    .input(z.object({
      investmentId: z.string(),
      type: transactionTypeSchema,
      amount: z.number().positive(),
      currency: z.string().length(3).default("USD"),
      description: z.string().optional(),
      transactionDate: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify access to the investment's company
      const investment = await investmentService.getById(input.investmentId, ctx.companyId);
      if (!investment) throw new TRPCError({ code: "NOT_FOUND" });

      if (!can(ctx.resolvedUser, Permissions.ERP_INVESTMENTS_EDIT, investment.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return investmentService.addTransaction(input);
    }),

  // ─── Get Summary ────────────────────────────────────────────────────────────

  summary: companyProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_INVESTMENTS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return investmentService.getSummary(input.companyId);
    }),

  // ─── Get Types ──────────────────────────────────────────────────────────────

  types: companyProcedure
    .query(() => {
      return investmentService.getTypes();
    }),

  // ─── Get Risk Levels ────────────────────────────────────────────────────────

  riskLevels: companyProcedure
    .query(() => {
      return investmentService.getRiskLevels();
    }),

  // ─── Get Statuses ────────────────────────────────────────────────────────────

  statuses: companyProcedure
    .query(() => {
      return investmentService.getStatuses();
    }),
});