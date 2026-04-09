import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, companyProcedure } from "../../trpc";
import { vendorsService } from "@biogrow/erp-core";
import { Permissions, can } from "@biogrow/permissions";

const vendorBaseSchema = z.object({
  name: z.string().min(1),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional(),
  paymentTermsDays: z.number().int().nonnegative().default(30),
  currency: z.string().length(3).default("USD"),
  notes: z.string().optional(),
});

export const vendorsRouter = router({
  list: companyProcedure
    .input(z.object({
      companyId: z.string(),
      status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional(),
      search: z.string().optional(),
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(25),
    }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_VENDORS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return vendorsService.list(input);
    }),

  getById: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_VENDORS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const vendor = await vendorsService.getById(input.id, input.companyId);
      if (!vendor) throw new TRPCError({ code: "NOT_FOUND" });
      return vendor;
    }),

  create: companyProcedure
    .input(z.object({ companyId: z.string(), ...vendorBaseSchema.shape }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_VENDORS_CREATE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return vendorsService.create(input);
    }),

  update: companyProcedure
    .input(z.object({
      companyId: z.string(),
      id: z.string(),
      status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional(),
      ...vendorBaseSchema.partial().shape,
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_VENDORS_EDIT, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return vendorsService.update(input);
    }),

  delete: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_VENDORS_DELETE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return vendorsService.delete(input.id, input.companyId);
    }),

  stats: companyProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_VENDORS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return vendorsService.getStats(input.companyId);
    }),
});
