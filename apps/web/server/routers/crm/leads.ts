import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, companyProcedure } from "../../trpc";
import { leadsService } from "@biogrow/crm-core";
import { Permissions, can } from "@biogrow/permissions";

const leadInputSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  source: z.enum(["WEBSITE","REFERRAL","COLD_OUTREACH","EVENT","SOCIAL_MEDIA","PAID_ADS","EMAIL_CAMPAIGN","PARTNER","OTHER"]).optional(),
  description: z.string().optional(),
});

export const leadsRouter = router({
  list: companyProcedure
    .input(z.object({
      companyId: z.string(),
      status: z.enum(["NEW","CONTACTED","QUALIFIED","UNQUALIFIED","CONVERTED"]).optional(),
      source: z.enum(["WEBSITE","REFERRAL","COLD_OUTREACH","EVENT","SOCIAL_MEDIA","PAID_ADS","EMAIL_CAMPAIGN","PARTNER","OTHER"]).optional(),
      ownerId: z.string().optional(),
      search: z.string().optional(),
      from: z.date().optional(),
      to: z.date().optional(),
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(25),
    }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_LEADS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return leadsService.list(input);
    }),

  getById: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_LEADS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const lead = await leadsService.getById(input.id, input.companyId);
      if (!lead) throw new TRPCError({ code: "NOT_FOUND" });
      return lead;
    }),

  create: companyProcedure
    .input(z.object({ companyId: z.string() }).merge(leadInputSchema))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_LEADS_CREATE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return leadsService.create({ ...input, ownerId: ctx.userId });
    }),

  update: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }).merge(leadInputSchema.partial()))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_LEADS_EDIT, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return leadsService.update(input.id, input.companyId, input);
    }),

  delete: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_LEADS_DELETE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return leadsService.delete(input.id, input.companyId);
    }),

  convert: companyProcedure
    .input(z.object({
      companyId: z.string(),
      leadId: z.string(),
      createAccount: z.boolean(),
      accountId: z.string().optional(),
      accountName: z.string().optional(),
      createContact: z.boolean().default(true),
      createOpportunity: z.boolean().default(true),
      opportunityName: z.string().optional(),
      opportunityAmount: z.number().optional(),
      stageId: z.string().optional(),
      expectedCloseDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_LEADS_CONVERT, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return leadsService.convert({ ...input, userId: ctx.userId });
    }),

  getStats: companyProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_LEADS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return leadsService.getStats(input.companyId);
    }),
});
