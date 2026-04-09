import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, companyProcedure } from "../../trpc";
import { dashboardService } from "@biogrow/crm-core";
import { Permissions, can } from "@biogrow/permissions";

export const crmDashboardRouter = router({
  getKPIs: companyProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_PIPELINE_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return dashboardService.getKPIs(input.companyId);
    }),

  getPipelineByStage: companyProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_PIPELINE_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return dashboardService.getPipelineByStage(input.companyId);
    }),

  getRevenueByMonth: companyProcedure
    .input(z.object({ companyId: z.string(), months: z.number().int().positive().max(24).default(6) }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_FORECAST_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return dashboardService.getRevenueByMonth(input.companyId, input.months);
    }),

  getRepPerformance: companyProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_PIPELINE_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return dashboardService.getRepPerformance(input.companyId);
    }),
});
