import { db } from "@biogrow/database";

const DEFAULT_STAGES = [
  { name: "Prospect",     order: 1, probability: 10,  color: "#94a3b8" },
  { name: "Qualified",    order: 2, probability: 25,  color: "#60a5fa" },
  { name: "Proposal",     order: 3, probability: 50,  color: "#f59e0b", isDefault: true },
  { name: "Negotiation",  order: 4, probability: 75,  color: "#f97316" },
  { name: "Won",          order: 5, probability: 100, color: "#22c55e", isWon: true },
  { name: "Lost",         order: 6, probability: 0,   color: "#ef4444", isLost: true },
];

export const pipelineService = {
  async getStages(companyId: string) {
    return db.pipelineStage.findMany({
      where: { companyId },
      orderBy: { order: "asc" },
    });
  },

  async seedDefaultStages(companyId: string) {
    const existing = await db.pipelineStage.count({ where: { companyId } });
    if (existing > 0) return;

    await db.pipelineStage.createMany({
      data: DEFAULT_STAGES.map((s) => ({ ...s, companyId })),
    });
  },

  /** Returns all opportunities grouped by stage — used for Kanban */
  async getBoard(companyId: string, ownerId?: string) {
    const stages = await db.pipelineStage.findMany({
      where: { companyId },
      orderBy: { order: "asc" },
    });

    const opportunities = await db.opportunity.findMany({
      where: {
        companyId,
        ...(ownerId && { ownerId }),
        // Only show open opportunities in the kanban
        stage: { isWon: false, isLost: false },
      },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        account: { select: { id: true, name: true } },
      },
      orderBy: { amount: "desc" },
    });

    return stages.map((stage) => ({
      ...stage,
      opportunities: opportunities.filter((o) => o.stageId === stage.id),
      totalValue: opportunities
        .filter((o) => o.stageId === stage.id)
        .reduce((sum, o) => sum + o.amount, 0),
    }));
  },
};
