import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, companyProcedure } from "../../trpc";
import { tasksService } from "@biogrow/crm-core";
import { Permissions, can } from "@biogrow/permissions";

export const tasksRouter = router({
  list: companyProcedure
    .input(z.object({
      companyId: z.string(),
      ownerId: z.string().optional(),
      status: z.enum(["OPEN","IN_PROGRESS","COMPLETED","CANCELLED"]).optional(),
      leadId: z.string().optional(),
      accountId: z.string().optional(),
      contactId: z.string().optional(),
      opportunityId: z.string().optional(),
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(25),
    }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_ACTIVITIES_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return tasksService.list(input);
    }),

  create: companyProcedure
    .input(z.object({
      companyId: z.string(),
      title: z.string().min(1),
      description: z.string().optional(),
      priority: z.enum(["LOW","MEDIUM","HIGH","URGENT"]).optional(),
      dueDate: z.date().optional(),
      assigneeId: z.string().optional(),
      leadId: z.string().optional(),
      accountId: z.string().optional(),
      contactId: z.string().optional(),
      opportunityId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_ACTIVITIES_CREATE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return tasksService.create({ ...input, ownerId: ctx.userId });
    }),

  complete: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_ACTIVITIES_EDIT, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return tasksService.complete(input.id);
    }),

  delete: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_ACTIVITIES_EDIT, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return tasksService.delete(input.id);
    }),
});
