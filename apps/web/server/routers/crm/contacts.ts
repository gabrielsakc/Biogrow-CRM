import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, companyProcedure } from "../../trpc";
import { contactsService } from "@biogrow/crm-core";
import { Permissions, can } from "@biogrow/permissions";

const contactInputSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  accountId: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

export const contactsRouter = router({
  list: companyProcedure
    .input(z.object({
      companyId: z.string(),
      accountId: z.string().optional(),
      ownerId: z.string().optional(),
      search: z.string().optional(),
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(25),
    }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_CONTACTS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return contactsService.list(input);
    }),

  getById: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_CONTACTS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const contact = await contactsService.getById(input.id, input.companyId);
      if (!contact) throw new TRPCError({ code: "NOT_FOUND" });
      return contact;
    }),

  create: companyProcedure
    .input(z.object({ companyId: z.string() }).merge(contactInputSchema))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_CONTACTS_CREATE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return contactsService.create({ ...input, ownerId: ctx.userId });
    }),

  update: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }).merge(contactInputSchema.partial()))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_CONTACTS_EDIT, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return contactsService.update(input.id, input);
    }),

  delete: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.CRM_CONTACTS_DELETE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return contactsService.delete(input.id);
    }),
});
