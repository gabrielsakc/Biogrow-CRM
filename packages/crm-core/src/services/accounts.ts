import { db } from "@biogrow/database";
import type { AccountListParams, CreateAccountParams } from "../types";

const OWNER_SELECT = { select: { id: true, name: true, email: true, avatarUrl: true } };

export const accountsService = {
  async list(params: AccountListParams) {
    const { companyId, type, ownerId, search, page = 1, pageSize = 25 } = params;
    const skip = (page - 1) * pageSize;

    const where = {
      companyId,
      ...(type && { type }),
      ...(ownerId && { ownerId }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { industry: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [total, accounts] = await Promise.all([
      db.account.count({ where }),
      db.account.findMany({
        where,
        include: {
          owner: OWNER_SELECT,
          _count: { select: { contacts: true, opportunities: true } },
        },
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
      }),
    ]);

    return { accounts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async getById(id: string, companyId: string) {
    return db.account.findFirst({
      where: { id, companyId },
      include: {
        owner: OWNER_SELECT,
        contacts: { include: { owner: OWNER_SELECT }, orderBy: { isPrimary: "desc" } },
        opportunities: {
          include: { stage: true, owner: OWNER_SELECT },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        activities: {
          include: { user: OWNER_SELECT },
          orderBy: { occurredAt: "desc" },
          take: 20,
        },
        tasks: {
          where: { status: { not: "COMPLETED" } },
          include: { assignee: OWNER_SELECT },
          orderBy: { dueDate: "asc" },
        },
        _count: { select: { contacts: true, opportunities: true, quotes: true } },
      },
    });
  },

  async create(params: CreateAccountParams) {
    return db.account.create({
      data: {
        companyId: params.companyId,
        ownerId: params.ownerId,
        name: params.name,
        type: params.type ?? "PROSPECT",
        industry: params.industry,
        website: params.website,
        phone: params.phone,
        email: params.email,
        annualRevenue: params.annualRevenue,
        employeeCount: params.employeeCount,
        description: params.description,
      },
      include: { owner: OWNER_SELECT },
    });
  },

  async update(id: string, companyId: string, data: Partial<CreateAccountParams>) {
    return db.account.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        industry: data.industry,
        website: data.website,
        phone: data.phone,
        email: data.email,
        annualRevenue: data.annualRevenue,
        employeeCount: data.employeeCount,
        description: data.description,
        ...(data.ownerId && { ownerId: data.ownerId }),
      },
      include: { owner: OWNER_SELECT },
    });
  },

  async delete(id: string) {
    return db.account.delete({ where: { id } });
  },
};
