/**
 * All platform permission keys.
 * Format: module.entity.action
 *
 * Import these constants instead of using raw strings to prevent typos
 * and enable IDE autocomplete.
 */

export const Permissions = {
  // ─── CRM — Leads ─────────────────────────────────────────────────────────
  CRM_LEADS_VIEW: "crm.leads.view",
  CRM_LEADS_CREATE: "crm.leads.create",
  CRM_LEADS_EDIT: "crm.leads.edit",
  CRM_LEADS_DELETE: "crm.leads.delete",
  CRM_LEADS_ASSIGN: "crm.leads.assign",
  CRM_LEADS_CONVERT: "crm.leads.convert",

  // ─── CRM — Accounts ──────────────────────────────────────────────────────
  CRM_ACCOUNTS_VIEW: "crm.accounts.view",
  CRM_ACCOUNTS_CREATE: "crm.accounts.create",
  CRM_ACCOUNTS_EDIT: "crm.accounts.edit",
  CRM_ACCOUNTS_DELETE: "crm.accounts.delete",

  // ─── CRM — Contacts ──────────────────────────────────────────────────────
  CRM_CONTACTS_VIEW: "crm.contacts.view",
  CRM_CONTACTS_CREATE: "crm.contacts.create",
  CRM_CONTACTS_EDIT: "crm.contacts.edit",
  CRM_CONTACTS_DELETE: "crm.contacts.delete",

  // ─── CRM — Opportunities ─────────────────────────────────────────────────
  CRM_OPPORTUNITIES_VIEW: "crm.opportunities.view",
  CRM_OPPORTUNITIES_CREATE: "crm.opportunities.create",
  CRM_OPPORTUNITIES_EDIT: "crm.opportunities.edit",
  CRM_OPPORTUNITIES_DELETE: "crm.opportunities.delete",
  CRM_OPPORTUNITIES_CLOSE_WON: "crm.opportunities.close_won",
  CRM_OPPORTUNITIES_CLOSE_LOST: "crm.opportunities.close_lost",

  // ─── CRM — Activities ────────────────────────────────────────────────────
  CRM_ACTIVITIES_VIEW: "crm.activities.view",
  CRM_ACTIVITIES_CREATE: "crm.activities.create",
  CRM_ACTIVITIES_EDIT: "crm.activities.edit",

  // ─── CRM — Tasks ─────────────────────────────────────────────────────────
  CRM_TASKS_VIEW: "crm.tasks.view",
  CRM_TASKS_CREATE: "crm.tasks.create",
  CRM_TASKS_EDIT: "crm.tasks.edit",
  CRM_TASKS_DELETE: "crm.tasks.delete",
  CRM_TASKS_ASSIGN: "crm.tasks.assign",

  // ─── CRM — Pipeline ──────────────────────────────────────────────────────
  CRM_PIPELINE_VIEW: "crm.pipeline.view",
  CRM_PIPELINE_CONFIGURE: "crm.pipeline.configure",

  // ─── CRM — Forecast ──────────────────────────────────────────────────────
  CRM_FORECAST_VIEW: "crm.forecast.view",
  CRM_FORECAST_EDIT: "crm.forecast.edit",

  // ─── CRM — Quotations ────────────────────────────────────────────────────
  CRM_QUOTES_VIEW: "crm.quotes.view",
  CRM_QUOTES_CREATE: "crm.quotes.create",
  CRM_QUOTES_EDIT: "crm.quotes.edit",
  CRM_QUOTES_APPROVE: "crm.quotes.approve",
  CRM_QUOTES_SEND: "crm.quotes.send",

  // ─── ERP — Products ──────────────────────────────────────────────────────
  ERP_PRODUCTS_VIEW: "erp.products.view",
  ERP_PRODUCTS_CREATE: "erp.products.create",
  ERP_PRODUCTS_EDIT: "erp.products.edit",
  ERP_PRODUCTS_DELETE: "erp.products.delete",

  // ─── ERP — Price Lists ───────────────────────────────────────────────────
  ERP_PRICE_LISTS_VIEW: "erp.price_lists.view",
  ERP_PRICE_LISTS_MANAGE: "erp.price_lists.manage",

  // ─── ERP — Vendors ───────────────────────────────────────────────────────
  ERP_VENDORS_VIEW: "erp.vendors.view",
  ERP_VENDORS_CREATE: "erp.vendors.create",
  ERP_VENDORS_EDIT: "erp.vendors.edit",
  ERP_VENDORS_DELETE: "erp.vendors.delete",

  // ─── ERP — Inventory / Warehouses ────────────────────────────────────────
  ERP_INVENTORY_VIEW: "erp.inventory.view",
  ERP_INVENTORY_ADJUST: "erp.inventory.adjust",
  ERP_WAREHOUSES_VIEW: "erp.warehouses.view",
  ERP_WAREHOUSES_MANAGE: "erp.warehouses.manage",

  // ─── ERP — Purchase Orders ───────────────────────────────────────────────
  ERP_PURCHASE_ORDERS_VIEW: "erp.purchase_orders.view",
  ERP_PURCHASE_ORDERS_CREATE: "erp.purchase_orders.create",
  ERP_PURCHASE_ORDERS_EDIT: "erp.purchase_orders.edit",
  ERP_PURCHASE_ORDERS_APPROVE: "erp.purchase_orders.approve",
  ERP_PURCHASE_ORDERS_RECEIVE: "erp.purchase_orders.receive",

  // ─── ERP — Sales Orders ──────────────────────────────────────────────────
  ERP_SALES_ORDERS_VIEW: "erp.sales_orders.view",
  ERP_SALES_ORDERS_CREATE: "erp.sales_orders.create",
  ERP_SALES_ORDERS_EDIT: "erp.sales_orders.edit",
  ERP_SALES_ORDERS_CANCEL: "erp.sales_orders.cancel",

  // ─── ERP — Invoices ──────────────────────────────────────────────────────
  ERP_INVOICES_VIEW: "erp.invoices.view",
  ERP_INVOICES_CREATE: "erp.invoices.create",
  ERP_INVOICES_APPROVE: "erp.invoices.approve",
  ERP_INVOICES_VOID: "erp.invoices.void",

  // ─── ERP — AR/AP/Treasury ────────────────────────────────────────────────
  ERP_RECEIVABLES_VIEW: "erp.receivables.view",
  ERP_RECEIVABLES_MANAGE: "erp.receivables.manage",
  ERP_PAYABLES_VIEW: "erp.payables.view",
  ERP_PAYABLES_MANAGE: "erp.payables.manage",
  ERP_TREASURY_VIEW: "erp.treasury.view",
  ERP_TREASURY_MANAGE: "erp.treasury.manage",

  // ─── ERP — Investments ────────────────────────────────────────────────────
  ERP_INVESTMENTS_VIEW: "erp.investments.view",
  ERP_INVESTMENTS_CREATE: "erp.investments.create",
  ERP_INVESTMENTS_EDIT: "erp.investments.edit",
  ERP_INVESTMENTS_DELETE: "erp.investments.delete",
  ERP_INVESTMENTS_APPROVE: "erp.investments.approve",

  // ─── Holding ─────────────────────────────────────────────────────────────
  HOLDING_DASHBOARD_VIEW: "holding.dashboard.view",
  HOLDING_REPORTS_VIEW: "holding.reports.view",
  HOLDING_FINANCIALS_VIEW: "holding.financials.view",
  HOLDING_PIPELINE_VIEW: "holding.pipeline.view",
  HOLDING_COMPANIES_VIEW: "holding.companies.view",

  // ─── Admin ───────────────────────────────────────────────────────────────
  ADMIN_USERS_VIEW: "admin.users.view",
  ADMIN_USERS_MANAGE: "admin.users.manage",
  ADMIN_ROLES_MANAGE: "admin.roles.manage",
  ADMIN_COMPANY_CONFIGURE: "admin.company.configure",
  ADMIN_AUDIT_VIEW: "admin.audit.view",
} as const;

export type PermissionKey = (typeof Permissions)[keyof typeof Permissions];
