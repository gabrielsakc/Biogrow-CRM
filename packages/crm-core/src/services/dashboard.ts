import { db } from "@biogrow/database";
import type { CRMKPIs, PipelineByStage, RevenueByMonth, RepPerformance } from "../types";

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function startOfLastMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, 1);
}
function endOfLastMonth() {
  return new Date(new Date().getFullYear(), new Date().getMonth(), 0, 23, 59, 59);
}
function startOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff));
}

export const dashboardService = {
  async getKPIs(companyId: string): Promise<CRMKPIs> {
    const som = startOfMonth();
    const solm = startOfLastMonth();
    const eolm = endOfLastMonth();
    const sow = startOfWeek();

    const [
      newLeadsThisMonth,
      newLeadsLastMonth,
      openOpportunities,
      closedWonThisMonth,
      closedWonLastMonth,
      convertedLeadsThisMonth,
      totalLeadsThisMonth,
      activitiesThisWeek,
      openTasks,
    ] = await Promise.all([
      db.lead.count({ where: { companyId, createdAt: { gte: som } } }),
      db.lead.count({ where: { companyId, createdAt: { gte: solm, lte: eolm } } }),
      db.opportunity.findMany({
        where: { companyId, stage: { isWon: false, isLost: false } },
        select: { amount: true, probability: true },
      }),
      db.opportunity.aggregate({
        where: { companyId, forecastCategory: "CLOSED_WON", closedAt: { gte: som } },
        _sum: { amount: true },
      }),
      db.opportunity.aggregate({
        where: { companyId, forecastCategory: "CLOSED_WON", closedAt: { gte: solm, lte: eolm } },
        _sum: { amount: true },
      }),
      db.lead.count({ where: { companyId, status: "CONVERTED", convertedAt: { gte: som } } }),
      db.lead.count({ where: { companyId, createdAt: { gte: som } } }),
      db.activity.count({ where: { companyId, occurredAt: { gte: sow } } }),
      db.task.count({ where: { companyId, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
    ]);

    const pipelineValue = openOpportunities.reduce((s, o) => s + o.amount, 0);
    const pipelineWeightedValue = openOpportunities.reduce((s, o) => s + o.amount * (o.probability / 100), 0);
    const conversionRate = totalLeadsThisMonth > 0
      ? Math.round((convertedLeadsThisMonth / totalLeadsThisMonth) * 100)
      : 0;

    return {
      newLeadsThisMonth,
      newLeadsLastMonth,
      pipelineValue,
      pipelineWeightedValue,
      closedWonThisMonth: closedWonThisMonth._sum.amount ?? 0,
      closedWonLastMonth: closedWonLastMonth._sum.amount ?? 0,
      conversionRate,
      activitiesThisWeek,
      openOpportunities: openOpportunities.length,
      openTasks,
    };
  },

  async getPipelineByStage(companyId: string): Promise<PipelineByStage[]> {
    const stages = await db.pipelineStage.findMany({
      where: { companyId },
      orderBy: { order: "asc" },
    });

    const oppsByStage = await db.opportunity.groupBy({
      by: ["stageId"],
      where: { companyId, stage: { isWon: false, isLost: false } },
      _count: true,
      _sum: { amount: true },
    });

    const oppMap = Object.fromEntries(oppsByStage.map((o) => [o.stageId, o]));

    return stages
      .filter((s) => !s.isWon && !s.isLost)
      .map((stage) => {
        const data = oppMap[stage.id];
        const totalValue = data?._sum.amount ?? 0;
        return {
          stageId: stage.id,
          stageName: stage.name,
          stageColor: stage.color,
          order: stage.order,
          count: data?._count ?? 0,
          totalValue,
          weightedValue: totalValue * (stage.probability / 100),
        };
      });
  },

  async getRevenueByMonth(companyId: string, months = 6): Promise<RevenueByMonth[]> {
    const result: RevenueByMonth[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthKey = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}`;

      const [closed, pipeline] = await Promise.all([
        db.opportunity.aggregate({
          where: { companyId, forecastCategory: "CLOSED_WON", closedAt: { gte: from, lte: to } },
          _sum: { amount: true },
        }),
        db.opportunity.aggregate({
          where: { companyId, stage: { isWon: false, isLost: false }, expectedCloseDate: { gte: from, lte: to } },
          _sum: { amount: true },
        }),
      ]);

      result.push({
        month: monthKey,
        closed: closed._sum.amount ?? 0,
        pipeline: pipeline._sum.amount ?? 0,
      });
    }

    return result;
  },

  async getForecast(companyId: string) {
    const categories = ["PIPELINE", "BEST_CASE", "COMMIT", "CLOSED_WON"] as const;

    const [byCategory, openOpps] = await Promise.all([
      db.opportunity.groupBy({
        by: ["forecastCategory"],
        where: { companyId, forecastCategory: { in: [...categories] } },
        _count: true,
        _sum: { amount: true },
      }),
      db.opportunity.findMany({
        where: { companyId, stage: { isWon: false, isLost: false } },
        include: {
          stage: { select: { id: true, name: true, probability: true } },
          owner: { select: { id: true, name: true, avatarUrl: true } },
          account: { select: { id: true, name: true } },
        },
        orderBy: [{ forecastCategory: "asc" }, { amount: "desc" }],
      }),
    ]);

    const summary = categories.map((cat) => {
      const row = byCategory.find((r) => r.forecastCategory === cat);
      return {
        category: cat,
        count: row?._count ?? 0,
        totalAmount: row?._sum.amount ?? 0,
      };
    });

    return { summary, opportunities: openOpps };
  },

  async getRepPerformance(companyId: string): Promise<RepPerformance[]> {
    const som = startOfMonth();
    const sow = startOfWeek();

    const reps = await db.userCompanyMembership.findMany({
      where: { companyId, isActive: true },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    const results = await Promise.all(
      reps.map(async ({ user }) => {
        const [openOpps, closedWonThisMonth, activitiesThisWeek] = await Promise.all([
          db.opportunity.findMany({
            where: { companyId, ownerId: user.id, stage: { isWon: false, isLost: false } },
            select: { amount: true },
          }),
          db.opportunity.aggregate({
            where: { companyId, ownerId: user.id, forecastCategory: "CLOSED_WON", closedAt: { gte: som } },
            _sum: { amount: true },
          }),
          db.activity.count({ where: { companyId, userId: user.id, occurredAt: { gte: sow } } }),
        ]);

        return {
          userId: user.id,
          userName: user.name,
          avatarUrl: user.avatarUrl,
          openOpportunities: openOpps.length,
          pipelineValue: openOpps.reduce((s, o) => s + o.amount, 0),
          closedWonThisMonth: closedWonThisMonth._sum.amount ?? 0,
          activitiesThisWeek,
        };
      })
    );

    return results.filter((r) => r.pipelineValue > 0 || r.activitiesThisWeek > 0);
  },
};
