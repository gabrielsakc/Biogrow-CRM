import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, companyProcedure } from "../../trpc";
import { pipelineService } from "@biogrow/crm-core";
import { Permissions, can } from "@biogrow/permissions";

export const pipelineRouter = router({
  getStages: companyProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_PIPELINE_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return pipelineService.getStages(input.companyId);
    }),

  getBoard: companyProcedure
    .input(z.object({ companyId: z.string(), ownerId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_PIPELINE_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return pipelineService.getBoard(input.companyId, input.ownerId);
    }),

  seedDefaultStages: companyProcedure
    .input(z.object({ companyId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_PIPELINE_CONFIGURE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return pipelineService.seedDefaultStages(input.companyId);
    }),
});
