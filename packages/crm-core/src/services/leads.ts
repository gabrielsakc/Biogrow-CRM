import { db } from "@biogrow/database";
import type { LeadListParams, CreateLeadParams, ConvertLeadParams } from "../types";

const OWNER_SELECT = { select: { id: true, name: true, email: true, avatarUrl: true } };

export const leadsService = {
  async list(params: LeadListParams) {
    const { companyId, status, source, ownerId, search, from, to, page = 1, pageSize = 25 } = params;
    const skip = (page - 1) * pageSize;

    const where = {
      companyId,
      ...(status && { status }),
      ...(source && { source }),
      ...(ownerId && { ownerId }),
      ...(from || to ? { createdAt: { ...(from && { gte: from }), ...(to && { lte: to }) } } : {}),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { companyName: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const [total, leads] = await Promise.all([
      db.lead.count({ where }),
      db.lead.findMany({
        where,
        include: { owner: OWNER_SELECT },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
    ]);

    return { leads, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async getById(id: string, companyId: string) {
    return db.lead.findFirst({
      where: { id, companyId },
      include: {
        owner: OWNER_SELECT,
        activities: { include: { user: OWNER_SELECT }, orderBy: { occurredAt: "desc" } },
        tasks: { include: { assignee: OWNER_SELECT }, orderBy: { createdAt: "desc" } },
      },
    });
  },

  async create(params: CreateLeadParams) {
    return db.lead.create({
      data: {
        companyId: params.companyId,
        ownerId: params.ownerId,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        phone: params.phone,
        companyName: params.companyName,
        jobTitle: params.jobTitle,
        source: params.source ?? "OTHER",
        description: params.description,
      },
      include: { owner: OWNER_SELECT },
    });
  },

  async update(id: string, companyId: string, data: Partial<CreateLeadParams>) {
    return db.lead.update({
      where: { id },
      data: {
        ...(data.firstName && { firstName: data.firstName }),
        ...(data.lastName && { lastName: data.lastName }),
        email: data.email,
        phone: data.phone,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        source: data.source,
        description: data.description,
        ...(data.ownerId && { ownerId: data.ownerId }),
      },
      include: { owner: OWNER_SELECT },
    });
  },

  async delete(id: string, companyId: string) {
    return db.lead.delete({ where: { id } });
  },

  async convert(params: ConvertLeadParams) {
    const lead = await db.lead.findUniqueOrThrow({ where: { id: params.leadId } });

    return db.$transaction(async (tx) => {
      let accountId = params.accountId ?? null;
      let contactId: string | null = null;
      let opportunityId: string | null = null;

      // 1. Create or reuse Account
      if (params.createAccount && !accountId) {
        const account = await tx.account.create({
          data: {
            companyId: params.companyId,
            ownerId: params.userId,
            name: params.accountName ?? `${lead.firstName} ${lead.lastName}`,
            type: "CUSTOMER",
            phone: lead.phone ?? undefined,
            email: lead.email ?? undefined,
          },
        });
        accountId = account.id;
      }

      // 2. Create Contact
      if (params.createContact) {
        const contact = await tx.contact.create({
          data: {
            companyId: params.companyId,
            ownerId: params.userId,
            accountId,
            firstName: lead.firstName,
            lastName: lead.lastName,
            email: lead.email ?? undefined,
            phone: lead.phone ?? undefined,
            jobTitle: lead.jobTitle ?? undefined,
            isPrimary: true,
          },
        });
        contactId = contact.id;
      }

      // 3. Create Opportunity
      if (params.createOpportunity && params.stageId) {
        const opp = await tx.opportunity.create({
          data: {
            companyId: params.companyId,
            ownerId: params.userId,
            stageId: params.stageId,
            accountId,
            contactId,
            name: params.opportunityName ?? `${lead.firstName} ${lead.lastName} — Opportunity`,
            amount: params.opportunityAmount ?? 0,
            expectedCloseDate: params.expectedCloseDate,
          },
        });
        opportunityId = opp.id;
      }

      // 4. Mark lead as converted
      const updatedLead = await tx.lead.update({
        where: { id: params.leadId },
        data: {
          status: "CONVERTED",
          convertedAt: new Date(),
          convertedToAccountId: accountId,
          convertedToContactId: contactId,
          convertedToOpportunityId: opportunityId,
        },
      });

      // 5. Log activity
      await tx.activity.create({
        data: {
          companyId: params.companyId,
          userId: params.userId,
          type: "NOTE",
          subject: "Lead convertido",
          body: `Lead convertido a cuenta${accountId ? ` (${params.accountName ?? "nueva cuenta"})` : ""}`,
          leadId: params.leadId,
        },
      });

      return { lead: updatedLead, accountId, contactId, opportunityId };
    });
  },

  async getStats(companyId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, newThisMonth, byStatus] = await Promise.all([
      db.lead.count({ where: { companyId } }),
      db.lead.count({ where: { companyId, createdAt: { gte: startOfMonth } } }),
      db.lead.groupBy({ by: ["status"], where: { companyId }, _count: true }),
    ]);

    return { total, newThisMonth, byStatus };
  },
};
