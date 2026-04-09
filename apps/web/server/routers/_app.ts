import { router } from "../trpc";
import { leadsRouter } from "./crm/leads";
import { accountsRouter } from "./crm/accounts";
import { contactsRouter } from "./crm/contacts";
import { opportunitiesRouter } from "./crm/opportunities";
import { pipelineRouter } from "./crm/pipeline";
import { activitiesRouter } from "./crm/activities";
import { tasksRouter } from "./crm/tasks";
import { quotesRouter } from "./crm/quotes";
import { crmDashboardRouter } from "./crm/dashboard";
import { productsRouter } from "./erp/products";
import { vendorsRouter } from "./erp/vendors";
import { inventoryRouter } from "./erp/inventory";
import { salesOrdersRouter } from "./erp/sales-orders";
import { purchaseOrdersRouter } from "./erp/purchase-orders";
import { financeRouter } from "./erp/finance";

export const appRouter = router({
  // CRM
  leads: leadsRouter,
  accounts: accountsRouter,
  contacts: contactsRouter,
  opportunities: opportunitiesRouter,
  pipeline: pipelineRouter,
  activities: activitiesRouter,
  tasks: tasksRouter,
  quotes: quotesRouter,
  crmDashboard: crmDashboardRouter,
  // ERP
  products: productsRouter,
  vendors: vendorsRouter,
  inventory: inventoryRouter,
  salesOrders: salesOrdersRouter,
  purchaseOrders: purchaseOrdersRouter,
  finance: financeRouter,
});

export type AppRouter = typeof appRouter;
