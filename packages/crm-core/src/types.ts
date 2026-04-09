import type {
  Lead, Account, Contact, Opportunity, Activity, Task, Quote, QuoteLineItem,
  PipelineStage, User,
  LeadStatus, LeadSource, AccountType, ForecastCategory,
  ActivityType, TaskStatus, TaskPriority, QuoteStatus,
} from "@biogrow/database";

// ─── Re-exports ───────────────────────────────────────────────────────────────
export type {
  Lead, Account, Contact, Opportunity, Activity, Task, Quote, QuoteLineItem,
  PipelineStage,
  LeadStatus, LeadSource, AccountType, ForecastCategory,
  ActivityType, TaskStatus, TaskPriority, QuoteStatus,
};

// ─── Minimal User reference (for owner fields) ────────────────────────────────
export type UserRef = Pick<User, "id" | "name" | "email" | "avatarUrl">;

// ─── List params ──────────────────────────────────────────────────────────────
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface LeadListParams extends PaginationParams {
  companyId: string;
  status?: LeadStatus;
  source?: LeadSource;
  ownerId?: string;
  search?: string;
  from?: Date;
  to?: Date;
}

export interface AccountListParams extends PaginationParams {
  companyId: string;
  type?: AccountType;
  ownerId?: string;
  search?: string;
}

export interface ContactListParams extends PaginationParams {
  companyId: string;
  accountId?: string;
  ownerId?: string;
  search?: string;
}

export interface OpportunityListParams extends PaginationParams {
  companyId: string;
  stageId?: string;
  ownerId?: string;
  forecastCategory?: ForecastCategory;
  from?: Date;
  to?: Date;
  search?: string;
}

export interface ActivityListParams {
  companyId: string;
  leadId?: string;
  accountId?: string;
  contactId?: string;
  opportunityId?: string;
  limit?: number;
}

export interface TaskListParams extends PaginationParams {
  companyId: string;
  ownerId?: string;
  status?: TaskStatus;
  leadId?: string;
  accountId?: string;
  contactId?: string;
  opportunityId?: string;
}

// ─── Create params ────────────────────────────────────────────────────────────
export interface CreateLeadParams {
  companyId: string;
  ownerId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  companyName?: string;
  jobTitle?: string;
  source?: LeadSource;
  description?: string;
}

export interface CreateAccountParams {
  companyId: string;
  ownerId: string;
  name: string;
  type?: AccountType;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  annualRevenue?: number;
  employeeCount?: number;
  description?: string;
}

export interface CreateContactParams {
  companyId: string;
  ownerId: string;
  accountId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  isPrimary?: boolean;
}

export interface CreateOpportunityParams {
  companyId: string;
  ownerId: string;
  stageId: string;
  accountId?: string;
  contactId?: string;
  name: string;
  amount?: number;
  currency?: string;
  forecastCategory?: ForecastCategory;
  expectedCloseDate?: Date;
  description?: string;
  nextStep?: string;
}

export interface CreateActivityParams {
  companyId: string;
  userId: string;
  type: ActivityType;
  subject: string;
  body?: string;
  outcome?: string;
  occurredAt?: Date;
  durationMin?: number;
  leadId?: string;
  accountId?: string;
  contactId?: string;
  opportunityId?: string;
}

export interface CreateTaskParams {
  companyId: string;
  ownerId: string;
  assigneeId?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  leadId?: string;
  accountId?: string;
  contactId?: string;
  opportunityId?: string;
}

export interface ConvertLeadParams {
  leadId: string;
  companyId: string;
  userId: string;
  // New account or link to existing
  createAccount: boolean;
  accountId?: string;
  accountName?: string;
  // New contact
  createContact: boolean;
  // New opportunity
  createOpportunity: boolean;
  opportunityName?: string;
  opportunityAmount?: number;
  stageId?: string;
  expectedCloseDate?: Date;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface CRMKPIs {
  newLeadsThisMonth: number;
  newLeadsLastMonth: number;
  pipelineValue: number;
  pipelineWeightedValue: number;
  closedWonThisMonth: number;
  closedWonLastMonth: number;
  conversionRate: number;
  activitiesThisWeek: number;
  openOpportunities: number;
  openTasks: number;
}

export interface PipelineByStage {
  stageId: string;
  stageName: string;
  stageColor: string;
  order: number;
  count: number;
  totalValue: number;
  weightedValue: number;
}

export interface RevenueByMonth {
  month: string;   // "2024-01"
  closed: number;
  pipeline: number;
}

export interface RepPerformance {
  userId: string;
  userName: string;
  avatarUrl: string | null;
  openOpportunities: number;
  pipelineValue: number;
  closedWonThisMonth: number;
  activitiesThisWeek: number;
}
