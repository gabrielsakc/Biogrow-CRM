import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, companyProcedure } from "../../trpc";
import { inventoryService } from "@biogrow/erp-core";
import { Permissions, can } from "@biogrow/permissions";

export const inventoryRouter = router({
  listWarehouses: companyProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_WAREHOUSES_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return inventoryService.listWarehouses(input.companyId);
    }),

  createWarehouse: companyProcedure
    .input(z.object({
      companyId: z.string(),
      name: z.string().min(1),
      code: z.string().optional(),
      address: z.string().optional(),
      isDefault: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_WAREHOUSES_MANAGE, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const { companyId, ...rest } = input;
      return inventoryService.createWarehouse({ companyId, ...rest });
    }),

  getStock: companyProcedure
    .input(z.object({ companyId: z.string(), warehouseId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_INVENTORY_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return inventoryService.getStockByWarehouse(input.warehouseId);
    }),

  getStockSummary: companyProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_INVENTORY_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return inventoryService.getStockSummary(input.companyId);
    }),

  listMovements: companyProcedure
    .input(z.object({
      companyId: z.string(),
      warehouseId: z.string().optional(),
      productId: z.string().optional(),
      from: z.date().optional(),
      to: z.date().optional(),
      limit: z.number().int().positive().max(200).default(50),
    }))
    .query(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_INVENTORY_VIEW, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return inventoryService.listMovements(input);
    }),

  recordMovement: companyProcedure
    .input(z.object({
      companyId: z.string(),
      warehouseId: z.string(),
      productId: z.string(),
      type: z.enum(["ADJUSTMENT_IN", "ADJUSTMENT_OUT", "TRANSFER_IN", "TRANSFER_OUT", "RETURN_IN", "RETURN_OUT"]),
      quantity: z.number().positive(),
      unitCost: z.number().nonnegative().optional(),
      reference: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!can(ctx.resolvedUser, Permissions.ERP_INVENTORY_ADJUST, input.companyId).allowed) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return inventoryService.recordMovement({ ...input, userId: ctx.userId });
    }),
});
