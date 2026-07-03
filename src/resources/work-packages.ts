import type { Formattable, HalCollection, HalResource } from "../types/hal.js";
import type { ListQuery } from "../types/filters.js";
import type { HttpClient } from "../http.js";
import { collectAll, iterateCollection } from "../utils/pagination.js";
import { linkTo } from "../utils/links.js";

export interface WorkPackage extends HalResource {
  _type: "WorkPackage";
  id: number;
  lockVersion?: number;
  subject: string;
  description?: Formattable;
  scheduleManually?: boolean;
  startDate?: string | null;
  dueDate?: string | null;
  date?: string | null;
  estimatedTime?: string | null;
  remainingTime?: string | null;
  percentageDone?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWorkPackageInput {
  project: number;
  subject: string;
  type: number;
  description?: string;
  assignee?: number;
  responsible?: number;
  status?: number;
  priority?: number;
  parent?: number;
  startDate?: string;
  dueDate?: string;
  estimatedTime?: string;
}

export interface UpdateWorkPackageInput {
  subject?: string;
  description?: string;
  assignee?: number | null;
  responsible?: number | null;
  status?: number;
  priority?: number;
  parent?: number | null;
  startDate?: string | null;
  dueDate?: string | null;
  estimatedTime?: string | null;
  remainingTime?: string | null;
  lockVersion?: number;
}

interface WorkPackageLinkInput {
  project?: number;
  type?: number;
  assignee?: number | null;
  responsible?: number | null;
  status?: number;
  priority?: number;
  parent?: number | null;
}

function buildWorkPackageLinks(
  input: WorkPackageLinkInput,
): Record<string, unknown> | undefined {
  const links: Record<string, unknown> = {};

  if (input.project !== undefined) {
    links.project = linkTo("projects", input.project);
  }
  if (input.type !== undefined) {
    links.type = linkTo("types", input.type);
  }
  if (input.assignee !== undefined) {
    links.assignee =
      input.assignee === null ? { href: null } : linkTo("users", input.assignee);
  }
  if (input.responsible !== undefined) {
    links.responsible =
      input.responsible === null
        ? { href: null }
        : linkTo("users", input.responsible);
  }
  if (input.status !== undefined) {
    links.status = linkTo("statuses", input.status);
  }
  if (input.priority !== undefined) {
    links.priority = linkTo("priorities", input.priority);
  }
  if (input.parent !== undefined) {
    links.parent =
      input.parent === null ? { href: null } : linkTo("work_packages", input.parent);
  }

  return Object.keys(links).length > 0 ? links : undefined;
}

export class WorkPackagesResource {
  constructor(private readonly http: HttpClient) {}

  list(query?: ListQuery): Promise<HalCollection<WorkPackage>> {
    return this.http.get<HalCollection<WorkPackage>>(
      "/api/v3/work_packages",
      this.http.listQueryToParams(query),
    );
  }

  listAll(query?: ListQuery): Promise<WorkPackage[]> {
    return collectAll<WorkPackage>(
      this.http,
      "/api/v3/work_packages",
      this.http.listQueryToParams(query),
    );
  }

  iterate(query?: ListQuery): AsyncGenerator<WorkPackage> {
    return iterateCollection<WorkPackage>(
      this.http,
      "/api/v3/work_packages",
      this.http.listQueryToParams(query),
    );
  }

  get(id: number): Promise<WorkPackage> {
    return this.http.get<WorkPackage>(`/api/v3/work_packages/${id}`);
  }

  create(input: CreateWorkPackageInput): Promise<WorkPackage> {
    const body: Record<string, unknown> = {
      subject: input.subject,
    };

    if (input.description !== undefined) {
      body.description = { raw: input.description };
    }
    if (input.startDate !== undefined) {
      body.startDate = input.startDate;
    }
    if (input.dueDate !== undefined) {
      body.dueDate = input.dueDate;
    }
    if (input.estimatedTime !== undefined) {
      body.estimatedTime = input.estimatedTime;
    }

    const links = buildWorkPackageLinks(input);
    if (links) {
      body._links = links;
    }

    return this.http.post<WorkPackage>("/api/v3/work_packages", body);
  }

  update(id: number, input: UpdateWorkPackageInput): Promise<WorkPackage> {
    const {
      description,
      assignee,
      responsible,
      status,
      priority,
      parent,
      ...rest
    } = input;
    const body: Record<string, unknown> = { ...rest };

    if (description !== undefined) {
      body.description = { raw: description };
    }

    const links = buildWorkPackageLinks({
      assignee,
      responsible,
      status,
      priority,
      parent,
    });
    if (links) {
      body._links = links;
    }

    return this.http.patch<WorkPackage>(`/api/v3/work_packages/${id}`, body);
  }

  delete(id: number): Promise<void> {
    return this.http.delete(`/api/v3/work_packages/${id}`);
  }

  listForProject(
    projectId: number,
    query?: ListQuery,
  ): Promise<HalCollection<WorkPackage>> {
    return this.list({
      ...query,
      filters: [
        ...(query?.filters ?? []),
        { project: { operator: "=", values: [String(projectId)] } },
      ],
    });
  }
}
