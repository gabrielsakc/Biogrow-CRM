import { db } from "@biogrow/database";
import type { ActivityListParams, CreateActivityParams } from "../types";

export const activitiesService = {
  async list(params: ActivityListParams) {
    const { companyId, leadId, accountId, contactId, opportunityId, limit = 50 } = params;

    return db.activity.findMany({
      where: {
        companyId,
        ...(leadId && { leadId }),
        ...(accountId && { accountId }),
        ...(contactId && { contactId }),
        ...(opportunityId && { opportunityId }),
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { occurredAt: "desc" },
      take: limit,
    });
  },

  async listRecent(companyId: string, limit = 20) {
    return db.activity.findMany({
      where: { companyId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        lead: { select: { id: true, firstName: true, lastName: true } },
        account: { select: { id: true, name: true } },
        opportunity: { select: { id: true, name: true } },
      },
      orderBy: { occurredAt: "desc" },
      take: limit,
    });
  },

  async create(params: CreateActivityParams) {
    return db.activity.create({
      data: {
        companyId: params.companyId,
        userId: params.userId,
        type: params.type,
        subject: params.subject,
        body: params.body,
        outcome: params.outcome,
        occurredAt: params.occurredAt ?? new Date(),
        durationMin: params.durationMin,
        leadId: params.leadId,
        accountId: params.accountId,
        contactId: params.contactId,
        opportunityId: params.opportunityId,
      },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
  },

  async delete(id: string) {
    return db.activity.delete({ where: { id } });
  },
};
