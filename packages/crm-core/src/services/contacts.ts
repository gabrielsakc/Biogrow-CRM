import { db } from "@biogrow/database";
import type { ContactListParams, CreateContactParams } from "../types";

const OWNER_SELECT = { select: { id: true, name: true, email: true, avatarUrl: true } };

export const contactsService = {
  async list(params: ContactListParams) {
    const { companyId, accountId, ownerId, search, page = 1, pageSize = 25 } = params;
    const skip = (page - 1) * pageSize;

    const where = {
      companyId,
      ...(accountId && { accountId }),
      ...(ownerId && { ownerId }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { jobTitle: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [total, contacts] = await Promise.all([
      db.contact.count({ where }),
      db.contact.findMany({
        where,
        include: {
          owner: OWNER_SELECT,
          account: { select: { id: true, name: true } },
        },
        orderBy: [{ isPrimary: "desc" }, { lastName: "asc" }],
        skip,
        take: pageSize,
      }),
    ]);

    return { contacts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async getById(id: string, companyId: string) {
    return db.contact.findFirst({
      where: { id, companyId },
      include: {
        owner: OWNER_SELECT,
        account: { select: { id: true, name: true, type: true } },
        activities: { include: { user: OWNER_SELECT }, orderBy: { occurredAt: "desc" } },
        tasks: { include: { assignee: OWNER_SELECT }, orderBy: { createdAt: "desc" } },
      },
    });
  },

  async create(params: CreateContactParams) {
    return db.contact.create({
      data: {
        companyId: params.companyId,
        ownerId: params.ownerId,
        accountId: params.accountId,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        phone: params.phone,
        jobTitle: params.jobTitle,
        department: params.department,
        isPrimary: params.isPrimary ?? false,
      },
      include: { owner: OWNER_SELECT, account: { select: { id: true, name: true } } },
    });
  },

  async update(id: string, data: Partial<CreateContactParams>) {
    return db.contact.update({
      where: { id },
      data: {
        accountId: data.accountId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        jobTitle: data.jobTitle,
        department: data.department,
        isPrimary: data.isPrimary,
        ...(data.ownerId && { ownerId: data.ownerId }),
      },
      include: { owner: OWNER_SELECT, account: { select: { id: true, name: true } } },
    });
  },

  async delete(id: string) {
    return db.contact.delete({ where: { id } });
  },
};
