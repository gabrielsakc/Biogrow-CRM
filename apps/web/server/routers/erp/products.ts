import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, companyProcedure } from "../../trpc";
import { productsService } from "@biogrow/erp-core";
import { Permissions, can } from "@biogrow/permissions";

const productBaseSchema = z.object({
  categoryId: z.string().optional(),
  sku: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(["PHYSICAL", "SERVICE", "DIGITAL"]).default("SERVICE"),
  unit: z.string().default("unit"),
  basePrice: z.number().nonnegative().default(0),
  currency: z.string().length(3).default("USD"),
  taxPct: z.number().min(0).max(100).default(0),
  imageUrl: z.string().url().optional(),
});

export const productsRouter = router({
  listCategories: companyProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_PRODUCTS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return productsService.listCategories(input.companyId);
    }),

  createCategory: companyProcedure
    .input(z.object({
      companyId: z.string(),
      name: z.string().min(1),
      description: z.string().optional(),
      parentId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_PRODUCTS_CREATE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return productsService.createCategory(input);
    }),

  list: companyProcedure
    .input(z.object({
      companyId: z.string(),
      categoryId: z.string().optional(),
      type: z.enum(["PHYSICAL", "SERVICE", "DIGITAL"]).optional(),
      isActive: z.boolean().optional(),
      search: z.string().optional(),
      page: z.number().int().positive().default(1),
      pageSize: z.number().int().positive().max(100).default(25),
    }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_PRODUCTS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return productsService.list(input);
    }),

  getById: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_PRODUCTS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const product = await productsService.getById(input.id, input.companyId);
      if (!product) throw new TRPCError({ code: "NOT_FOUND" });
      return product;
    }),

  create: companyProcedure
    .input(z.object({ companyId: z.string(), ...productBaseSchema.shape }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_PRODUCTS_CREATE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return productsService.create(input);
    }),

  update: companyProcedure
    .input(z.object({
      companyId: z.string(),
      id: z.string(),
      isActive: z.boolean().optional(),
      ...productBaseSchema.partial().shape,
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_PRODUCTS_EDIT, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return productsService.update(input);
    }),

  delete: companyProcedure
    .input(z.object({ companyId: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_PRODUCTS_DELETE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return productsService.delete(input.id, input.companyId);
    }),

  // ─── Price Lists ─────────────────────────────────────────────────────────

  listPriceLists: companyProcedure
    .input(z.object({ companyId: z.string(), isActive: z.boolean().optional() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_PRICE_LISTS_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return productsService.listPriceLists(input);
    }),

  createPriceList: companyProcedure
    .input(z.object({
      companyId: z.string(),
      name: z.string().min(1),
      description: z.string().optional(),
      currency: z.string().length(3).default("USD"),
      isDefault: z.boolean().default(false),
      validFrom: z.date().optional(),
      validTo: z.date().optional(),
      items: z.array(z.object({
        productId: z.string(),
        price: z.number().nonnegative(),
        minQuantity: z.number().positive().default(1),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_PRICE_LISTS_MANAGE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return productsService.createPriceList(input);
    }),
});
