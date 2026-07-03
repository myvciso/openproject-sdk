import type { HalCollection, HalResource } from "../types/hal.js";
import type { ListQuery } from "../types/filters.js";
import type { HttpClient } from "../http.js";
import { collectAll, iterateCollection } from "../utils/pagination.js";
import { linkTo } from "../utils/links.js";

export interface TimeEntry extends HalResource {
  _type: "TimeEntry";
  id: number;
  comment?: { raw: string };
  spentOn: string;
  hours: string;
  ongoing?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTimeEntryInput {
  project: number;
  workPackage?: number;
  activity: number;
  hours: string;
  spentOn: string;
  comment?: string;
  ongoing?: boolean;
}

export interface UpdateTimeEntryInput {
  project?: number;
  workPackage?: number | null;
  activity?: number;
  hours?: string;
  spentOn?: string;
  comment?: string;
  ongoing?: boolean;
}

interface TimeEntryLinkInput {
  project?: number;
  workPackage?: number | null;
  activity?: number;
}

function buildTimeEntryLinks(
  input: TimeEntryLinkInput,
): Record<string, unknown> | undefined {
  const links: Record<string, unknown> = {};

  if (input.project !== undefined) {
    links.project = linkTo("projects", input.project);
  }
  if (input.workPackage !== undefined) {
    links.workPackage =
      input.workPackage === null
        ? { href: null }
        : linkTo("work_packages", input.workPackage);
  }
  if (input.activity !== undefined) {
    links.activity = linkTo("time_entries/activities", input.activity);
  }

  return Object.keys(links).length > 0 ? links : undefined;
}

export class TimeEntriesResource {
  constructor(private readonly http: HttpClient) {}

  list(query?: ListQuery): Promise<HalCollection<TimeEntry>> {
    return this.http.get<HalCollection<TimeEntry>>(
      "/api/v3/time_entries",
      this.http.listQueryToParams(query),
    );
  }

  listAll(query?: ListQuery): Promise<TimeEntry[]> {
    return collectAll<TimeEntry>(
      this.http,
      "/api/v3/time_entries",
      this.http.listQueryToParams(query),
    );
  }

  iterate(query?: ListQuery): AsyncGenerator<TimeEntry> {
    return iterateCollection<TimeEntry>(
      this.http,
      "/api/v3/time_entries",
      this.http.listQueryToParams(query),
    );
  }

  get(id: number): Promise<TimeEntry> {
    return this.http.get<TimeEntry>(`/api/v3/time_entries/${id}`);
  }

  create(input: CreateTimeEntryInput): Promise<TimeEntry> {
    const body: Record<string, unknown> = {
      hours: input.hours,
      spentOn: input.spentOn,
    };

    if (input.comment !== undefined) {
      body.comment = { raw: input.comment };
    }
    if (input.ongoing !== undefined) {
      body.ongoing = input.ongoing;
    }

    const links = buildTimeEntryLinks(input);
    if (links) {
      body._links = links;
    }

    return this.http.post<TimeEntry>("/api/v3/time_entries", body);
  }

  update(id: number, input: UpdateTimeEntryInput): Promise<TimeEntry> {
    const { comment, project, workPackage, activity, ...rest } = input;
    const body: Record<string, unknown> = { ...rest };

    if (comment !== undefined) {
      body.comment = { raw: comment };
    }

    const links = buildTimeEntryLinks({ project, workPackage, activity });
    if (links) {
      body._links = links;
    }

    return this.http.patch<TimeEntry>(`/api/v3/time_entries/${id}`, body);
  }

  delete(id: number): Promise<void> {
    return this.http.delete(`/api/v3/time_entries/${id}`);
  }
}
