import { HttpClient, type AuthMode, type HttpClientOptions } from "./http.js";
import { ProjectsResource } from "./resources/projects.js";
import { WorkPackagesResource } from "./resources/work-packages.js";
import { UsersResource } from "./resources/users.js";
import { TimeEntriesResource } from "./resources/time-entries.js";
import {
  PrioritiesResource,
  StatusesResource,
  TypesResource,
} from "./resources/metadata.js";

export interface OpenProjectClientOptions {
  /** Base URL of your OpenProject instance, e.g. https://openproject.example.com */
  baseUrl: string;
  /** API key from My account → Access tokens */
  apiKey: string;
  /** Authentication mode. Defaults to bearer token. */
  auth?: AuthMode;
  /** Custom fetch implementation (for testing or proxies). */
  fetch?: typeof fetch;
  /** Additional headers sent with every request. */
  headers?: Record<string, string>;
}

export class OpenProjectClient {
  readonly http: HttpClient;
  readonly projects: ProjectsResource;
  readonly workPackages: WorkPackagesResource;
  readonly users: UsersResource;
  readonly timeEntries: TimeEntriesResource;
  readonly statuses: StatusesResource;
  readonly types: TypesResource;
  readonly priorities: PrioritiesResource;

  constructor(options: OpenProjectClientOptions) {
    const httpOptions: HttpClientOptions = {
      baseUrl: options.baseUrl,
      apiKey: options.apiKey,
      auth: options.auth,
      fetch: options.fetch,
      headers: options.headers,
    };

    this.http = new HttpClient(httpOptions);
    this.projects = new ProjectsResource(this.http);
    this.workPackages = new WorkPackagesResource(this.http);
    this.users = new UsersResource(this.http);
    this.timeEntries = new TimeEntriesResource(this.http);
    this.statuses = new StatusesResource(this.http);
    this.types = new TypesResource(this.http);
    this.priorities = new PrioritiesResource(this.http);
  }

  /** Low-level GET for any API path. */
  get<T>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.http.get<T>(path, query);
  }

  /** Low-level POST for any API path. */
  post<T>(path: string, body?: unknown): Promise<T> {
    return this.http.post<T>(path, body);
  }

  /** Low-level PATCH for any API path. */
  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.http.patch<T>(path, body);
  }

  /** Low-level DELETE for any API path. */
  delete(path: string): Promise<void> {
    return this.http.delete(path);
  }
}
