import { db } from "@biogrow/database";

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

export const holdingDashboardService = {
  /**
   * Returns cross-company KPIs aggregated from all active companies.
   * Designed for HOLDING_ADMIN / HOLDING_EXEC / SUPERADMIN users only.
   * All data is already multi-tenant safe since we aggregate by companyId.
   */
  async getConsolidatedKPIs() {
    const som = startOfMonth();
    const solm = startOfLastMonth();
    const eolm = endOfLastMonth();

    const companies = await db.company.findMany({
      where: { type: "COMPANY", isActive: true },
      select: { id: true, slug: true, name: true, currency: true, primaryColor: true },
    });

    const companyIds = companies.map((c) => c.id);

    const [
      totalUsers,
      totalLeadsThisMonth,
      totalLeadsLastMonth,
      openOpportunities,
      closedWonThisMonth,
      closedWonLastMonth,
      openTasks,
      openSalesOrders,
      pendingInvoices,
    ] = await Promise.all([
      db.userCompanyMembership.count({ where: { companyId: { in: companyIds }, isActive: true } }),
      db.lead.count({ where: { companyId: { in: companyIds }, createdAt: { gte: som } } }),
      db.lead.count({ where: { companyId: { in: companyIds }, createdAt: { gte: solm, lte: eolm } } }),
      db.opportunity.findMany({
        where: { companyId: { in: companyIds }, stage: { isWon: false, isLost: false } },
        select: { amount: true },
      }),
      db.opportunity.aggregate({
        where: { companyId: { in: companyIds }, forecastCategory: "CLOSED_WON", closedAt: { gte: som } },
        _sum: { amount: true },
      }),
      db.opportunity.aggregate({
        where: { companyId: { in: companyIds }, forecastCategory: "CLOSED_WON", closedAt: { gte: solm, lte: eolm } },
        _sum: { amount: true },
      }),
      db.task.count({ where: { companyId: { in: companyIds }, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
      db.salesOrder.count({ where: { companyId: { in: companyIds }, status: { in: ["CONFIRMED", "PROCESSING"] } } }),
      db.invoice.aggregate({
        where: { companyId: { in: companyIds }, status: { in: ["ISSUED", "SENT", "PARTIALLY_PAID", "OVERDUE"] } },
        _sum: { total: true, paidAmount: true },
      }),
    ]);

    const pipelineTotal = openOpportunities.reduce((s, o) => s + o.amount, 0);
    const arPending = (pendingInvoices._sum.total ?? 0) - (pendingInvoices._sum.paidAmount ?? 0);

    return {
      companies: companies.length,
      totalUsers,
      totalLeadsThisMonth,
      totalLeadsLastMonth,
      pipelineTotal,
      closedWonThisMonth: closedWonThisMonth._sum.amount ?? 0,
      closedWonLastMonth: closedWonLastMonth._sum.amount ?? 0,
      openOpportunities: openOpportunities.length,
      openTasks,
      openSalesOrders,
      arPending,
    };
  },

  /**
   * Per-company CRM performance breakdown for the holding view.
   */
  async getCompanyBreakdown() {
    const som = startOfMonth();
    const companies = await db.company.findMany({
      where: { type: "COMPANY", isActive: true },
      select: { id: true, slug: true, name: true, currency: true, primaryColor: true },
      orderBy: { name: "asc" },
    });

    const breakdown = await Promise.all(
      companies.map(async (company) => {
        const [
          leadsThisMonth,
          openOpps,
          closedWonThisMonth,
          openTasks,
          salesOrdersOpen,
          arPending,
        ] = await Promise.all([
          db.lead.count({ where: { companyId: company.id, createdAt: { gte: som } } }),
          db.opportunity.findMany({
            where: { companyId: company.id, stage: { isWon: false, isLost: false } },
            select: { amount: true },
          }),
          db.opportunity.aggregate({
            where: { companyId: company.id, forecastCategory: "CLOSED_WON", closedAt: { gte: som } },
            _sum: { amount: true },
          }),
          db.task.count({ where: { companyId: company.id, status: { in: ["OPEN", "IN_PROGRESS"] } } }),
          db.salesOrder.count({ where: { companyId: company.id, status: { in: ["CONFIRMED", "PROCESSING"] } } }),
          db.invoice.aggregate({
            where: { companyId: company.id, status: { in: ["ISSUED", "SENT", "PARTIALLY_PAID", "OVERDUE"] } },
            _sum: { total: true, paidAmount: true },
          }),
        ]);

        return {
          ...company,
          leadsThisMonth,
          openOpportunities: openOpps.length,
          pipelineValue: openOpps.reduce((s, o) => s + o.amount, 0),
          closedWonThisMonth: closedWonThisMonth._sum.amount ?? 0,
          openTasks,
          salesOrdersOpen,
          arPending: (arPending._sum.total ?? 0) - (arPending._sum.paidAmount ?? 0),
        };
      })
    );

    return breakdown;
  },

  /**
   * Monthly revenue trend across all companies (last 6 months).
   */
  async getConsolidatedRevenueTrend(months = 6) {
    const companies = await db.company.findMany({
      where: { type: "COMPANY", isActive: true },
      select: { id: true, name: true, primaryColor: true },
    });

    const now = new Date();
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const from = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const to = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthKey = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}`;

      const closed = await db.opportunity.aggregate({
        where: {
          companyId: { in: companies.map((c) => c.id) },
          forecastCategory: "CLOSED_WON",
          closedAt: { gte: from, lte: to },
        },
        _sum: { amount: true },
      });

      result.push({
        month: monthKey,
        revenue: closed._sum.amount ?? 0,
      });
    }

    return result;
  },

  /**
   * Top opportunities across all companies.
   */
  async getTopOpportunities(limit = 10) {
    return db.opportunity.findMany({
      where: { stage: { isWon: false, isLost: false } },
      include: {
        company: { select: { name: true, slug: true, primaryColor: true } },
        owner: { select: { name: true, avatarUrl: true } },
        account: { select: { name: true } },
        stage: { select: { name: true } },
      },
      orderBy: { amount: "desc" },
      take: limit,
    });
  },
};
