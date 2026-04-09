import { db } from "@biogrow/database";
import type { VendorListParams, CreateVendorParams, UpdateVendorParams } from "../types";

export const vendorsService = {
  async list(params: VendorListParams) {
    const { companyId, status, search, page = 1, pageSize = 25 } = params;
    const skip = (page - 1) * pageSize;

    const where = {
      companyId,
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { legalName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { taxId: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [total, vendors] = await Promise.all([
      db.vendor.count({ where }),
      db.vendor.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
      }),
    ]);

    return { vendors, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async getById(id: string, companyId: string) {
    return db.vendor.findFirst({
      where: { id, companyId },
    });
  },

  async create(params: CreateVendorParams) {
    return db.vendor.create({
      data: {
        companyId: params.companyId,
        name: params.name,
        legalName: params.legalName,
        taxId: params.taxId,
        email: params.email,
        phone: params.phone,
        website: params.website,
        contactName: params.contactName,
        contactEmail: params.contactEmail,
        contactPhone: params.contactPhone,
        street: params.street,
        city: params.city,
        state: params.state,
        country: params.country,
        zip: params.zip,
        paymentTermsDays: params.paymentTermsDays ?? 30,
        currency: params.currency ?? "USD",
        notes: params.notes,
      },
    });
  },

  async update(params: UpdateVendorParams) {
    const { id, companyId, ...data } = params;
    // Verify ownership
    const vendor = await db.vendor.findFirst({ where: { id, companyId } });
    if (!vendor) throw new Error("Vendor not found");
    return db.vendor.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
  },

  async delete(id: string, companyId: string) {
    const vendor = await db.vendor.findFirst({ where: { id, companyId } });
    if (!vendor) throw new Error("Vendor not found");
    return db.vendor.delete({ where: { id } });
  },

  async getStats(companyId: string) {
    const [total, active, inactive] = await Promise.all([
      db.vendor.count({ where: { companyId } }),
      db.vendor.count({ where: { companyId, status: "ACTIVE" } }),
      db.vendor.count({ where: { companyId, status: "INACTIVE" } }),
    ]);
    return { total, active, inactive };
  },
};
