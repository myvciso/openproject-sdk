import type { Formattable, HalCollection, HalResource } from "../types/hal.js";
import type { ListQuery } from "../types/filters.js";
import type { HttpClient } from "../http.js";
import { collectAll, iterateCollection } from "../utils/pagination.js";
import { linkTo } from "../utils/links.js";

export interface Project extends HalResource {
  _type: "Project";
  id: number;
  identifier: string;
  name: string;
  active: boolean;
  public: boolean;
  description?: Formattable;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectInput {
  name: string;
  identifier: string;
  description?: string;
  public?: boolean;
  active?: boolean;
  status?: string;
  parent?: number;
}

export interface UpdateProjectInput {
  name?: string;
  identifier?: string;
  description?: string;
  public?: boolean;
  active?: boolean;
  status?: string;
  parent?: number;
  lockVersion?: number;
}

export class ProjectsResource {
  constructor(private readonly http: HttpClient) {}

  list(query?: ListQuery): Promise<HalCollection<Project>> {
    return this.http.get<HalCollection<Project>>(
      "/api/v3/projects",
      this.http.listQueryToParams(query),
    );
  }

  listAll(query?: ListQuery): Promise<Project[]> {
    return collectAll<Project>(
      this.http,
      "/api/v3/projects",
      this.http.listQueryToParams(query),
    );
  }

  iterate(query?: ListQuery): AsyncGenerator<Project> {
    return iterateCollection<Project>(
      this.http,
      "/api/v3/projects",
      this.http.listQueryToParams(query),
    );
  }

  get(id: number): Promise<Project> {
    return this.http.get<Project>(`/api/v3/projects/${id}`);
  }

  create(input: CreateProjectInput): Promise<Project> {
    const body: Record<string, unknown> = {
      name: input.name,
      identifier: input.identifier,
    };

    if (input.description !== undefined) {
      body.description = { raw: input.description };
    }
    if (input.public !== undefined) {
      body.public = input.public;
    }
    if (input.active !== undefined) {
      body.active = input.active;
    }

    const links: Record<string, unknown> = {};
    if (input.status !== undefined) {
      links.status = linkTo("project_statuses", input.status);
    }
    if (input.parent !== undefined) {
      links.parent = linkTo("projects", input.parent);
    }
    if (Object.keys(links).length > 0) {
      body._links = links;
    }

    return this.http.post<Project>("/api/v3/projects", body);
  }

  update(id: number, input: UpdateProjectInput): Promise<Project> {
    const { status, parent, description, ...rest } = input;
    const payload: Record<string, unknown> = { ...rest };

    if (description !== undefined) {
      payload.description = { raw: description };
    }

    const links: Record<string, unknown> = {};
    if (status !== undefined) {
      links.status = linkTo("project_statuses", status);
    }
    if (parent !== undefined) {
      links.parent = linkTo("projects", parent);
    }
    if (Object.keys(links).length > 0) {
      payload._links = links;
    }

    return this.http.patch<Project>(`/api/v3/projects/${id}`, payload);
  }

  delete(id: number): Promise<void> {
    return this.http.delete(`/api/v3/projects/${id}`);
  }
}
