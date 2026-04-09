import { db } from "@biogrow/database";
import type { OpportunityListParams, CreateOpportunityParams } from "../types";

const OWNER_SELECT = { select: { id: true, name: true, email: true, avatarUrl: true } };

export const opportunitiesService = {
  async list(params: OpportunityListParams) {
    const { companyId, stageId, ownerId, forecastCategory, from, to, search, page = 1, pageSize = 25 } = params;
    const skip = (page - 1) * pageSize;

    const where = {
      companyId,
      ...(stageId && { stageId }),
      ...(ownerId && { ownerId }),
      ...(forecastCategory && { forecastCategory }),
      ...(from || to ? { expectedCloseDate: { ...(from && { gte: from }), ...(to && { lte: to }) } } : {}),
      ...(search && { name: { contains: search, mode: "insensitive" as const } }),
    };

    const [total, opportunities] = await Promise.all([
      db.opportunity.count({ where }),
      db.opportunity.findMany({
        where,
        include: {
          owner: OWNER_SELECT,
          stage: { select: { id: true, name: true, color: true, order: true, isWon: true, isLost: true } },
          account: { select: { id: true, name: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: [{ stage: { order: "asc" } }, { amount: "desc" }],
        skip,
        take: pageSize,
      }),
    ]);

    return { opportunities, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async getById(id: string, companyId: string) {
    return db.opportunity.findFirst({
      where: { id, companyId },
      include: {
        owner: OWNER_SELECT,
        stage: true,
        account: { select: { id: true, name: true, type: true, healthScore: true } },
        contact: { select: { id: true, firstName: true, lastName: true, email: true, jobTitle: true } },
        activities: { include: { user: OWNER_SELECT }, orderBy: { occurredAt: "desc" } },
        tasks: { include: { assignee: OWNER_SELECT }, orderBy: { dueDate: "asc" }, where: { status: { not: "COMPLETED" } } },
        quotes: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
  },

  async create(params: CreateOpportunityParams) {
    const stage = await db.pipelineStage.findUniqueOrThrow({ where: { id: params.stageId } });
    return db.opportunity.create({
      data: {
        companyId: params.companyId,
        ownerId: params.ownerId,
        stageId: params.stageId,
        accountId: params.accountId,
        contactId: params.contactId,
        name: params.name,
        amount: params.amount ?? 0,
        currency: params.currency ?? "USD",
        probability: stage.probability,
        forecastCategory: params.forecastCategory ?? "PIPELINE",
        expectedCloseDate: params.expectedCloseDate,
        description: params.description,
        nextStep: params.nextStep,
      },
      include: { owner: OWNER_SELECT, stage: true, account: { select: { id: true, name: true } } },
    });
  },

  async update(id: string, data: Partial<CreateOpportunityParams & { probability?: number; nextStep?: string; lostReason?: string }>) {
    return db.opportunity.update({
      where: { id },
      data: {
        ...(data.stageId && { stageId: data.stageId }),
        ...(data.accountId !== undefined && { accountId: data.accountId }),
        ...(data.contactId !== undefined && { contactId: data.contactId }),
        ...(data.name && { name: data.name }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.forecastCategory && { forecastCategory: data.forecastCategory }),
        ...(data.expectedCloseDate && { expectedCloseDate: data.expectedCloseDate }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.nextStep !== undefined && { nextStep: data.nextStep }),
        ...(data.probability !== undefined && { probability: data.probability }),
        ...(data.lostReason !== undefined && { lostReason: data.lostReason }),
        ...(data.ownerId && { ownerId: data.ownerId }),
      },
      include: { owner: OWNER_SELECT, stage: true },
    });
  },

  async moveStage(id: string, companyId: string, newStageId: string, userId: string) {
    const [opp, newStage] = await Promise.all([
      db.opportunity.findUniqueOrThrow({ where: { id }, include: { stage: true } }),
      db.pipelineStage.findUniqueOrThrow({ where: { id: newStageId } }),
    ]);

    const updated = await db.opportunity.update({
      where: { id },
      data: {
        stageId: newStageId,
        probability: newStage.probability,
        forecastCategory: newStage.isWon ? "CLOSED_WON" : newStage.isLost ? "CLOSED_LOST" : undefined,
        ...(newStage.isWon || newStage.isLost ? { closedAt: new Date() } : {}),
      },
    });

    await db.activity.create({
      data: {
        companyId,
        userId,
        type: "STAGE_CHANGE",
        subject: `Etapa cambiada a "${newStage.name}"`,
        body: `De "${opp.stage.name}" → "${newStage.name}"`,
        opportunityId: id,
      },
    });

    return updated;
  },

  async closeWon(id: string, companyId: string, userId: string) {
    const wonStage = await db.pipelineStage.findFirst({ where: { companyId, isWon: true } });
    if (!wonStage) throw new Error("No won stage configured for this company");

    return db.$transaction([
      db.opportunity.update({
        where: { id },
        data: { stageId: wonStage.id, forecastCategory: "CLOSED_WON", closedAt: new Date(), probability: 100 },
      }),
      db.activity.create({
        data: { companyId, userId, type: "NOTE", subject: "Opportunity won 🎉", opportunityId: id },
      }),
    ]);
  },

  async closeLost(id: string, companyId: string, userId: string, lostReason?: string) {
    const lostStage = await db.pipelineStage.findFirst({ where: { companyId, isLost: true } });
    if (!lostStage) throw new Error("No lost stage configured");

    return db.$transaction([
      db.opportunity.update({
        where: { id },
        data: {
          stageId: lostStage.id,
          forecastCategory: "CLOSED_LOST",
          closedAt: new Date(),
          probability: 0,
          lostReason,
        },
      }),
      db.activity.create({
        data: {
          companyId,
          userId,
          type: "NOTE",
          subject: "Opportunity lost",
          body: lostReason,
          opportunityId: id,
        },
      }),
    ]);
  },

  async delete(id: string) {
    return db.opportunity.delete({ where: { id } });
  },
};
