import { db } from "@biogrow/database";
import type { TaskListParams, CreateTaskParams } from "../types";

export const tasksService = {
  async getById(id: string, companyId: string) {
    return db.task.findFirst({
      where: { id, companyId },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        lead: { select: { id: true, firstName: true, lastName: true } },
        account: { select: { id: true, name: true } },
        opportunity: { select: { id: true, name: true } },
      },
    });
  },

  async list(params: TaskListParams) {
    const { companyId, ownerId, status, leadId, accountId, contactId, opportunityId, page = 1, pageSize = 25 } = params;
    const skip = (page - 1) * pageSize;

    const where = {
      companyId,
      ...(ownerId && { ownerId }),
      ...(status && { status }),
      ...(leadId && { leadId }),
      ...(accountId && { accountId }),
      ...(contactId && { contactId }),
      ...(opportunityId && { opportunityId }),
    };

    const [total, tasks] = await Promise.all([
      db.task.count({ where }),
      db.task.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, avatarUrl: true } },
          assignee: { select: { id: true, name: true, avatarUrl: true } },
        },
        orderBy: [{ dueDate: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
        skip,
        take: pageSize,
      }),
    ]);

    return { tasks, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  async create(params: CreateTaskParams) {
    return db.task.create({
      data: {
        companyId: params.companyId,
        ownerId: params.ownerId,
        assigneeId: params.assigneeId,
        title: params.title,
        description: params.description,
        priority: params.priority ?? "MEDIUM",
        dueDate: params.dueDate,
        leadId: params.leadId,
        accountId: params.accountId,
        contactId: params.contactId,
        opportunityId: params.opportunityId,
      },
    });
  },

  async complete(id: string) {
    return db.task.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  },

  async update(id: string, data: Partial<Pick<CreateTaskParams, "title" | "description" | "priority" | "dueDate" | "assigneeId">>) {
    return db.task.update({ where: { id }, data });
  },

  async delete(id: string) {
    return db.task.delete({ where: { id } });
  },
};
