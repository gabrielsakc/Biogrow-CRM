import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, companyProcedure } from "../../trpc";
import { opportunitiesService } from "@biogrow/crm-core";
import { Permissions, can } from "@biogrow/permissions";

const oppInputSchema = z.object({
  stageId: z.string(),
  name: z.string().min(1),
  amount: z.number().nonnegative().optional(),
  currency: z.string().optional(),
  accountId: z.string().optional(),
  contactId: z.string().optional(),
  forecastCategory: z.enum(["PIPELINE","BEST_CASE","COMMIT","CLOSED_WON","CLOSED_LOST","OMITTED"]).optional(),
  expectedCloseDate: z.date().optional(),
  description: z.string().optional(),
  nextStep: z.string().optional(),
});

export const opportunitiesRouter = router({
  list: companyProcedure
    .input(z.object({
      companyId: z.string(),
      stageId: z.string().optional(),
      ownerId: z.string().optional(),
      forecastCategory: z.enum(["PIPELINE","BEST_CASE","COMMIT","CLOSED_WON","CLOSED_LOST","OMITTED"]).optional(),
      from: z.date().optional(),
      to: z.date().optional(),
      search: z.string().optional(),
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(25),
    }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_OPPORTUNITIES_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return opportunitiesService.list(input);
    }),

  getById: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_OPPORTUNITIES_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const opp = await opportunitiesService.getById(input.id, input.companyId);
      if (!opp) throw new TRPCError({ code: "NOT_FOUND" });
      return opp;
    }),

  create: companyProcedure
    .input(z.object({ companyId: z.string() }).merge(oppInputSchema))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_OPPORTUNITIES_CREATE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return opportunitiesService.create({ ...input, ownerId: ctx.userId });
    }),

  update: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string(), probability: z.number().optional(), lostReason: z.string().optional() }).merge(oppInputSchema.partial()))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_OPPORTUNITIES_EDIT, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return opportunitiesService.update(input.id, input);
    }),

  moveStage: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string(), newStageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_OPPORTUNITIES_EDIT, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return opportunitiesService.moveStage(input.id, input.companyId, input.newStageId, ctx.userId);
    }),

  closeWon: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_OPPORTUNITIES_CLOSE_WON, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return opportunitiesService.closeWon(input.id, input.companyId, ctx.userId);
    }),

  closeLost: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string(), lostReason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_OPPORTUNITIES_CLOSE_LOST, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return opportunitiesService.closeLost(input.id, input.companyId, ctx.userId, input.lostReason);
    }),

  delete: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_OPPORTUNITIES_DELETE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return opportunitiesService.delete(input.id);
    }),
});
