import type { HalCollection, HalResource } from "../types/hal.js";
import type { HttpClient } from "../http.js";

export interface Status extends HalResource {
  _type: "Status";
  id: number;
  name: string;
  isClosed: boolean;
  color?: string;
  isDefault?: boolean;
  isReadonly?: boolean;
  excludedFromTotals?: boolean;
  defaultDoneRatio?: number;
  position?: number;
}

export interface Type extends HalResource {
  _type: "Type";
  id: number;
  name: string;
  isMilestone?: boolean;
  isDefault?: boolean;
  position?: number;
}

export interface Priority extends HalResource {
  _type: "Priority";
  id: number;
  name: string;
  isDefault?: boolean;
  position?: number;
}

export class StatusesResource {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<HalCollection<Status>> {
    return this.http.get<HalCollection<Status>>("/api/v3/statuses");
  }

  get(id: number): Promise<Status> {
    return this.http.get<Status>(`/api/v3/statuses/${id}`);
  }
}

export class TypesResource {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<HalCollection<Type>> {
    return this.http.get<HalCollection<Type>>("/api/v3/types");
  }

  get(id: number): Promise<Type> {
    return this.http.get<Type>(`/api/v3/types/${id}`);
  }
}

export class PrioritiesResource {
  constructor(private readonly http: HttpClient) {}

  list(): Promise<HalCollection<Priority>> {
    return this.http.get<HalCollection<Priority>>("/api/v3/priorities");
  }

  get(id: number): Promise<Priority> {
    return this.http.get<Priority>(`/api/v3/priorities/${id}`);
  }
}
