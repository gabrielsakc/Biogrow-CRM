import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, companyProcedure } from "../../trpc";
import { activitiesService } from "@biogrow/crm-core";
import { Permissions, can } from "@biogrow/permissions";

export const activitiesRouter = router({
  list: companyProcedure
    .input(z.object({
      companyId: z.string(),
      leadId: z.string().optional(),
      accountId: z.string().optional(),
      contactId: z.string().optional(),
      opportunityId: z.string().optional(),
      limit: z.number().int().positive().max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_ACTIVITIES_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return activitiesService.list(input);
    }),

  listRecent: companyProcedure
    .input(z.object({ companyId: z.string(), limit: z.number().int().positive().default(20) }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_ACTIVITIES_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return activitiesService.listRecent(input.companyId, input.limit);
    }),

  create: companyProcedure
    .input(z.object({
      companyId: z.string(),
      type: z.enum(["CALL","EMAIL","MEETING","NOTE","TASK_COMPLETED","STAGE_CHANGE"]),
      subject: z.string().min(1),
      body: z.string().optional(),
      outcome: z.string().optional(),
      occurredAt: z.date().optional(),
      durationMin: z.number().int().positive().optional(),
      leadId: z.string().optional(),
      accountId: z.string().optional(),
      contactId: z.string().optional(),
      opportunityId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_ACTIVITIES_CREATE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return activitiesService.create({ ...input, userId: ctx.userId });
    }),

  delete: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_ACTIVITIES_EDIT, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return activitiesService.delete(input.id);
    }),
});
